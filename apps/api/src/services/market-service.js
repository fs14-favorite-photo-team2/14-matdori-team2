import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'
import {
  findMarketListingById,
  findMarketListings,
  findRecipeCopiesByIds,
  createMarketListingRecord,
  updateMarketListingById,
  withdrawMarketListingRecord,
  deleteMarketListingRecord,
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

export async function getMarketListing(listingId) {
  const listing = await findMarketListingById(listingId)

  if (!listing) {
    throw AppError.from(ERROR_CODES.RESOURCE_NOT_FOUND)
  }

  return formatMarketListing(listing)
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
  const listing = await findMarketListingById(listingId)

  // 수정할 수 있는 상태 유무 검증
  if (!listing) {
    throw AppError.from(ERROR_CODES.RESOURCE_NOT_FOUND)
  }

  if (listing.seller.id !== userId) {
    throw AppError.from(ERROR_CODES.FORBIDDEN)
  }

  if (listing.status !== 'ON_SALE') {
    throw AppError.from(ERROR_CODES.CONFLICT)
  }

  // 기존 판매글과 비교 후 수정사항만 적용
  const nextListingType = input.listingType ?? listing.listingType

  const nextPrice = input.price !== undefined ? input.price : listing.price

  // 판매중상태와 가격 같이 있는지 확인
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
    ...input,
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

  const updatedListing = await updateMarketListingById(listingId, data)

  return formatMarketListing(updatedListing)
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

  await withdrawMarketListingRecord(listingId)
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
