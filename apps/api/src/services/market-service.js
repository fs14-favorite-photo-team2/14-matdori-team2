import { ERROR_CODES } from '../constants/error-codes.js'
import { PRISMA_ERROR_CODES } from '../constants/prisma-error-codes.js'
import { AppError } from '../errors/app-error.js'
import {
  findMarketListingById,
  findMarketListings,
  findRecipeCopiesByIds,
  createMarketListingRecord,
  updateMarketListingRecord,
  findMarketListingQuantityInfo,
  withdrawMarketListingRecord,
  deleteMarketListingRecord,
  findMarketListingForPurchase,
  purchaseMarketListingRecord,
} from '../repositories/market-repository.js'

// DB 조회 결과를 API 응답 형태로 변경
function formatMarketListing({ _count, recipe, ...listing }) {
  return {
    ...listing,
    recipe: {
      ...recipe,
      imageUrl: recipe.imageUrls[0],
      ingredients: Array.isArray(recipe.ingredients)
        ? recipe.ingredients.filter((ingredient) => ingredient.isHighlight)
        : [],
    },
    remainingQuantity: _count.copies,
  }
}

export async function getMarketListings(query) {
  try {
    // 필터링한 판매레시피들 디비 조회
    const listings = await findMarketListings(query)

    // 다음 페이지 확인
    const hasNext = listings.length > query.limit

    // 다음 페이지 유무에 따른 데이터 컷팅
    const items = hasNext ? listings.slice(0, query.limit) : listings

    // 판매 레시피 사본 키값 재설정
    const data = items.map(formatMarketListing)

    // 다음페이지 커서 생성
    const nextCursor =
      hasNext && data.length > 0 ? String(data[data.length - 1].id) : null

    return {
      data,
      meta: {
        nextCursor,
        hasNext,
      },
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    // 예상치 못한 > 미들웨어로 넘기기
    throw error
  }
}

export async function getMarketListing(userId, listingId) {
  const listing = await findMarketListingById(listingId)

  if (!listing) {
    throw AppError.from(ERROR_CODES.RESOURCE_NOT_FOUND)
  }

  const formattedListing = formatMarketListing(listing)

  if (listing.seller.id !== userId) {
    return formattedListing
  }

  const quantityInfo = await findMarketListingQuantityInfo(listingId, userId)

  return {
    ...formattedListing,
    ...quantityInfo,
  }
}

export async function createMarketListing(userId, input) {
  const {
    recipeCopyIds,
    listingType,
    price,
    wantedDifficulty,
    wantedCategory,
    wantedDescription,
  } = input

  const copies = await findRecipeCopiesByIds(recipeCopyIds)

  // 요청한 사본 중 존재하지 않는 것이 있는지 확인
  if (copies.length !== recipeCopyIds.length) {
    throw AppError.from(ERROR_CODES.CONFLICT, [
      {
        field: 'recipeCopyIds',
        reason: '존재하지 않는 레시피 사본이 포함되어 있습니다.',
      },
    ])
  }

  // 모든 사본이 현재 사용자 소유인지 확인
  if (copies.some((copy) => copy.ownerId !== userId)) {
    throw AppError.from(ERROR_CODES.FORBIDDEN, [
      {
        field: 'recipeCopyIds',
        reason: '본인이 소유한 레시피 사본만 등록할 수 있습니다.',
      },
    ])
  }

  // 모든 사본이 같은 레시피인지 확인
  const recipeId = copies[0].recipeId

  if (copies.some((copy) => copy.recipeId !== recipeId)) {
    throw AppError.from(ERROR_CODES.CONFLICT, [
      {
        field: 'recipeCopyIds',
        reason: '동일한 레시피의 사본만 함께 등록할 수 있습니다.',
      },
    ])
  }

  // 판매 가능한 상태인지 확인
  if (
    copies.some((copy) => copy.state !== 'OWNED' || copy.listingId !== null)
  ) {
    throw AppError.from(ERROR_CODES.CONFLICT, [
      {
        field: 'recipeCopyIds',
        reason: '이미 판매 또는 교환에 사용 중인 사본이 포함되어 있습니다.',
      },
    ])
  }

  // 구매한 레시피는 재판매할 수 없음
  if (
    (listingType === 'SALE' || listingType === 'BOTH') &&
    copies.some((copy) => copy.recipe.creatorId !== userId)
  ) {
    throw AppError.from(ERROR_CODES.FORBIDDEN, [
      {
        field: 'recipeCopyIds',
        reason: '직접 생성한 레시피의 사본만 판매할 수 있습니다.',
      },
    ])
  }

  try {
    const listing = await createMarketListingRecord({
      sellerId: userId,
      recipeId,
      recipeCopyIds,
      listingType,
      price,
      wantedDifficulty,
      wantedCategory,
      wantedDescription,
    })

    return formatMarketListing(listing)
  } catch (error) {
    if (error.code === 'RECIPE_COPY_RESERVATION_FAILED') {
      throw AppError.from(ERROR_CODES.CONFLICT, [
        {
          field: 'recipeCopyIds',
          reason: '사본 상태가 변경되어 판매글을 등록할 수 없습니다.',
        },
      ])
    }

    throw error
  }
}

export async function updateMarketListing(userId, listingId, input) {
  const { remainingQuantity, ...listingInput } = input

  const listing = await findMarketListingById(listingId)

  if (!listing) {
    throw AppError.from(ERROR_CODES.RESOURCE_NOT_FOUND)
  }

  if (listing.seller.id !== userId) {
    throw AppError.from(ERROR_CODES.FORBIDDEN)
  }

  if (listing.status !== 'ON_SALE') {
    throw AppError.from(ERROR_CODES.CONFLICT)
  }

  const nextListingType = listingInput.listingType ?? listing.listingType

  const nextPrice =
    listingInput.price !== undefined ? listingInput.price : listing.price

  if (
    (nextListingType === 'SALE' || nextListingType === 'BOTH') &&
    nextPrice === null
  ) {
    throw AppError.from(ERROR_CODES.VALIDATION_ERROR, [
      {
        field: 'price',
        reason: 'SALE 또는 BOTH 방식에서는 price가 필요합니다.',
      },
    ])
  }

  const data = {
    ...listingInput,
    listingType: nextListingType,
  }

  if (nextListingType === 'EXCHANGE') {
    data.price = null
  } else {
    data.price = nextPrice
  }

  if (nextListingType === 'SALE') {
    data.wantedDifficulty = null
    data.wantedCategory = null
    data.wantedDescription = null
  }

  try {
    const updatedListing = await updateMarketListingRecord({
      listingId,
      sellerId: userId,
      expectedUpdatedAt: listing.updatedAt,
      remainingQuantity,
      data,
    })

    return formatMarketListing(updatedListing)
  } catch (error) {
    // repository에서 발생시킨 권한·수량·상태 오류 처리
    if (
      error.code === 'MARKET_LISTING_UPDATE_CONFLICT' ||
      error.code === 'MARKET_LISTING_UPDATE_FORBIDDEN'
    ) {
      const errorCode =
        error.code === 'MARKET_LISTING_UPDATE_FORBIDDEN'
          ? ERROR_CODES.FORBIDDEN
          : ERROR_CODES.CONFLICT

      throw AppError.from(errorCode, [
        {
          field: error.field,
          reason: error.message,
        },
      ])
    }

    // 동시에 실행된 거래와 충돌한 경우
    if (
      error.code === 'P2034' ||
      (error.code === 'P2010' && ['40P01', '40001'].includes(error.meta?.code))
    ) {
      throw AppError.from(ERROR_CODES.CONFLICT, [
        {
          field: 'listingId',
          reason:
            '다른 거래와 요청이 겹쳤습니다. 새로고침 후 다시 시도해 주세요.',
        },
      ])
    }

    throw error
  }
}

export async function withdrawMarketListing(userId, listingId) {
  const listing = await findMarketListingById(listingId)

  if (!listing) {
    throw AppError.from(ERROR_CODES.RESOURCE_NOT_FOUND)
  }

  if (listing.seller.id !== userId) {
    throw AppError.from(ERROR_CODES.FORBIDDEN)
  }

  if (listing.status !== 'ON_SALE') {
    throw AppError.from(ERROR_CODES.CONFLICT)
  }

  try {
    await withdrawMarketListingRecord(listingId)
  } catch (error) {
    if (error.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
      throw AppError.from(ERROR_CODES.CONFLICT)
    }

    throw error
  }
}

export async function deleteMarketListing(userId, listingId) {
  const listing = await findMarketListingById(listingId)

  if (!listing) {
    throw AppError.from(ERROR_CODES.RESOURCE_NOT_FOUND)
  }

  if (listing.seller.id !== userId) {
    throw AppError.from(ERROR_CODES.FORBIDDEN)
  }

  if (listing.status === 'ON_SALE') {
    throw AppError.from(ERROR_CODES.CONFLICT)
  }

  await deleteMarketListingRecord(listingId)
}

export async function purchaseMarketListing(userId, listingId) {
  const listing = await findMarketListingForPurchase(listingId)

  // 판매글 존재 여부
  if (!listing) {
    throw AppError.from(ERROR_CODES.RESOURCE_NOT_FOUND)
  }

  // 본인 판매글 구매 방지
  if (listing.sellerId === userId) {
    throw AppError.from(ERROR_CODES.CONFLICT, [
      {
        field: 'listingId',
        reason: '본인이 등록한 판매글은 구매할 수 없습니다.',
      },
    ])
  }

  // 판매 중인 글만 구매 가능
  if (listing.status !== 'ON_SALE') {
    throw AppError.from(ERROR_CODES.CONFLICT, [
      {
        field: 'listingId',
        reason: '현재 구매할 수 없는 판매글입니다.',
      },
    ])
  }

  // 교환 전용 판매글 구매 방지
  if (listing.listingType === 'EXCHANGE') {
    throw AppError.from(ERROR_CODES.CONFLICT, [
      {
        field: 'listingId',
        reason: '교환 전용 판매글은 구매할 수 없습니다.',
      },
    ])
  }

  // SALE 또는 BOTH인데 가격이 없는 비정상 데이터 방지
  if (listing.price === null) {
    throw AppError.from(ERROR_CODES.CONFLICT, [
      {
        field: 'listingId',
        reason: '판매 가격이 설정되지 않은 판매글입니다.',
      },
    ])
  }

  // 구매 가능한 사본 확인
  const recipeCopy = listing.copies[0]

  if (!recipeCopy) {
    throw AppError.from(ERROR_CODES.CONFLICT, [
      {
        field: 'listingId',
        reason: '구매 가능한 레시피 사본이 없습니다.',
      },
    ])
  }

  try {
    return await purchaseMarketListingRecord({
      listingId,
      recipeId: listing.recipeId,
      recipeCopyId: recipeCopy.id,
      buyerId: userId,
      sellerId: listing.sellerId,
      price: listing.price,
    })
  } catch (error) {
    if (
      error.code === 'P2034' ||
      (error.code === 'P2010' && ['40P01', '40001'].includes(error.meta?.code))
    ) {
      throw AppError.from(ERROR_CODES.CONFLICT, [
        {
          field: 'listingId',
          reason:
            '다른 거래와 요청이 겹쳤습니다. 새로고침 후 다시 시도해 주세요.',
        },
      ])
    }
    if (error.code === 'INSUFFICIENT_POINTS') {
      throw AppError.from(ERROR_CODES.CONFLICT, [
        {
          field: 'points',
          reason: '보유 포인트가 부족합니다.',
        },
      ])
    }

    if (error.code === 'RECIPE_COPY_PURCHASE_FAILED') {
      throw AppError.from(ERROR_CODES.CONFLICT, [
        {
          field: 'listingId',
          reason: '사본 상태가 변경되어 구매할 수 없습니다.',
        },
      ])
    }

    if (error.code === 'RECIPE_ALREADY_OWNED') {
      throw AppError.from(ERROR_CODES.CONFLICT, [
        {
          field: 'listingId',
          reason: '이미 보유한 레시피는 추가로 구매할 수 없습니다.',
        },
      ])
    }

    throw error
  }
}
