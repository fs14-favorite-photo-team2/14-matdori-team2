import { prisma } from '../db/prisma.js'

// 공통으로 불러올 필드 부분
const marketListingSelect = {
  id: true,
  recipe: {
    select: {
      id: true,
      title: true,
      difficulty: true,
      category: true,
      summary: true,
      minPrice: true,
      images: {
        select: {
          imageUrl: true,
          sortOrder: true,
        },
        orderBy: {
          sortOrder: 'asc',
        },
      },
    },
  },
  seller: {
    select: {
      id: true,
      nickname: true,
    },
  },
  listingType: true,
  price: true,
  initialQuantity: true,
  wantedDifficulty: true,
  wantedCategory: true,
  wantedDescription: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      copies: {
        where: {
          state: 'LISTED',
        },
      },
    },
  },
}

// 판매중인 전체 레시피 리스트 가져오기
export function findMarketListings({
  cursor,
  limit,
  keyword,
  difficulty,
  category,
  soldOut,
  listingType,
  minPrice,
  maxPrice,
  sort,
}) {
  const where = {
    status:
      soldOut === undefined
        ? { in: ['ON_SALE', 'SOLD_OUT'] }
        : soldOut
          ? 'SOLD_OUT'
          : 'ON_SALE',
  }

  // 텍스트 검색 시 타이틀이나 한 줄 설명에서 해당 글자 있으면 가져오기
  if (keyword) {
    where.recipe = {
      OR: [
        {
          title: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
        {
          summary: {
            contains: keyword,
            mode: 'insensitive',
          },
        },
      ],
    }
  }

  // 난이도 필터 (and)
  if (difficulty) {
    where.recipe = {
      ...where.recipe,
      difficulty,
    }
  }

  // 카테고리 필터 (and)
  if (category) {
    where.recipe = {
      ...where.recipe,
      category,
    }
  }

  // 판매 상태 필터 (and)
  if (listingType) {
    where.listingType = listingType
  }

  // 가격
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {
      ...(minPrice !== undefined && { gte: minPrice }),
      ...(maxPrice !== undefined && { lte: maxPrice }),
    }
  }

  // 정렬기준
  const orderBy = {
    newest: [{ createdAt: 'desc' }, { id: 'desc' }],
    oldest: [{ createdAt: 'asc' }, { id: 'asc' }],
    price_asc: [{ price: 'asc' }, { id: 'asc' }],
    price_desc: [{ price: 'desc' }, { id: 'desc' }],
  }

  // 이때까지 거른 것들 반환
  return prisma.marketListing.findMany({
    where,
    select: marketListingSelect,
    orderBy: orderBy[sort],
    take: limit + 1,
    ...(cursor !== undefined && {
      cursor: {
        id: Number(cursor),
      },
      skip: 1,
    }),
  })
}

// 판매글에 등록할 사본 조회
export function findRecipeCopiesByIds(recipeCopyIds) {
  return prisma.recipeCopy.findMany({
    where: {
      id: {
        in: recipeCopyIds,
      },
    },
    select: {
      id: true,
      recipeId: true,
      ownerId: true,
      listingId: true,
      state: true,
    },
  })
}

// 판매글 생성 및 사본 상태 변경
// MarketListing 생성, RecipeCopy 상태를 LISTED로 변경
export function createMarketListingRecord({
  sellerId,
  recipeId,
  recipeCopyIds,
  listingType,
  price,
  wantedDifficulty,
  wantedCategory,
  wantedDescription,
}) {
  return prisma.$transaction(async (transaction) => {
    const listing = await transaction.marketListing.create({
      data: {
        sellerId,
        recipeId,
        listingType,
        initialQuantity: recipeCopyIds.length,
        price: listingType === 'EXCHANGE' ? null : price,
        wantedDifficulty: listingType === 'SALE' ? null : wantedDifficulty,
        wantedCategory: listingType === 'SALE' ? null : wantedCategory,
        wantedDescription: listingType === 'SALE' ? null : wantedDescription,
      },
    })

    const updateResult = await transaction.recipeCopy.updateMany({
      where: {
        id: {
          in: recipeCopyIds,
        },
        ownerId: sellerId,
        recipeId,
        state: 'OWNED',
        listingId: null,
      },
      data: {
        state: 'LISTED',
        listingId: listing.id,
      },
    })

    // Service에서 검사한 후 다른 요청이 먼저 사본을 등록하는 상황 방지
    if (updateResult.count !== recipeCopyIds.length) {
      const error = new Error('레시피 사본 예약에 실패했습니다.')
      error.code = 'RECIPE_COPY_RESERVATION_FAILED'

      throw error
    }

    return transaction.marketListing.findUnique({
      where: {
        id: listing.id,
      },
      select: marketListingSelect,
    })
  })
}
