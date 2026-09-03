import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'
import {
  createMarketListingRecord,
  findMarketListings,
  findRecipeCopiesByIds,
} from '../repositories/market-repository.js'

// DB 조회 결과를 API 응답 형태로 변경
function formatMarketListing({ _count, recipe, ...listing }) {
  const { images, ...recipeData } = recipe

  return {
    ...listing,
    recipe: {
      ...recipeData,
      imageUrls: images.map((image) => image.imageUrl),
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

    // 예상치 못한
    throw AppError.from(ERROR_CODES.INTERNAL_SERVER_ERROR)
  }
}

// 판매글 등록
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
