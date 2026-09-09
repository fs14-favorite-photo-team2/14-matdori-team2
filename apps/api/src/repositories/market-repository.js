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
      imageUrls: true,
      ingredients: true,
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
    deletedAt: null,
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

// 판매중인 레시피 중 id값으로 단일 레시피 가져오기
export function findMarketListingById(listingId) {
  return prisma.marketListing.findUnique({
    where: {
      id: listingId,
      deletedAt: null,
    },
    select: marketListingSelect,
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
      recipe: {
        select: {
          creatorId: true,
        },
      },
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

// 판매글 수정
export function updateMarketListingById(listingId, data) {
  return prisma.marketListing.update({
    where: {
      id: listingId,
    },
    data,
    select: marketListingSelect,
  })
}

// 판매글 내리기 + 판매글에 달린 사본 복구
export function withdrawMarketListingRecord(listingId) {
  return prisma.$transaction(async (transaction) => {
    await transaction.marketListing.update({
      where: {
        id: listingId,
      },
      data: {
        status: 'WITHDRAWN',
      },
    })

    await transaction.recipeCopy.updateMany({
      where: {
        listingId,
        state: 'LISTED',
      },
      data: {
        listingId: null,
        state: 'OWNED',
      },
    })
  })
}

// 판매글 삭제 (soft):데이터는 남기기
export function deleteMarketListingRecord(listingId) {
  return prisma.marketListing.update({
    where: {
      id: listingId,
    },
    data: {
      deletedAt: new Date(),
    },
  })
}

export function findMarketListingForPurchase(listingId) {
  return prisma.marketListing.findFirst({
    where: {
      id: listingId,
      deletedAt: null,
    },
    select: {
      id: true,
      sellerId: true,
      listingType: true,
      price: true,
      status: true,
      copies: {
        where: {
          state: 'LISTED',
        },
        select: {
          id: true,
        },
        orderBy: {
          id: 'asc',
        },
        take: 1,
      },
    },
  })
}

// 구매자 포인트 조회
export function findUserPoints(userId) {
  return prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      points: true,
    },
  })
}

// 포인트 결제, 사본 이전, 구매 기록 생성을 하나의 트랜잭션으로 처리
export function purchaseMarketListingRecord({
  listingId,
  recipeCopyId,
  buyerId,
  sellerId,
  price,
}) {
  return prisma.$transaction(async (transaction) => {
    // 구매자 포인트 차감
    const buyerUpdate = await transaction.user.updateMany({
      where: {
        id: buyerId,
        points: {
          gte: price,
        },
      },
      data: {
        points: {
          decrement: price,
        },
      },
    })

    if (buyerUpdate.count !== 1) {
      const error = new Error('구매자의 포인트가 부족합니다.')
      error.code = 'INSUFFICIENT_POINTS'
      throw error
    }

    // 사본 상태가 그대로 LISTED일 때만 구매자에게 이전
    const copyUpdate = await transaction.recipeCopy.updateMany({
      where: {
        id: recipeCopyId,
        listingId,
        ownerId: sellerId,
        state: 'LISTED',
      },
      data: {
        ownerId: buyerId,
        listingId: null,
        state: 'OWNED',
        everPurchased: true,
      },
    })

    if (copyUpdate.count !== 1) {
      const error = new Error('구매 가능한 사본이 없습니다.')
      error.code = 'RECIPE_COPY_PURCHASE_FAILED'
      throw error
    }

    // 판매자 포인트 증가
    await transaction.user.update({
      where: {
        id: sellerId,
      },
      data: {
        points: {
          increment: price,
        },
      },
    })

    // 구매 기록 생성
    const purchase = await transaction.purchase.create({
      data: {
        listingId,
        recipeCopyId,
        buyerId,
        sellerId,
        price,
      },
      select: {
        id: true,
        listingId: true,
        recipeCopyId: true,
        buyerId: true,
        sellerId: true,
        price: true,
        createdAt: true,
      },
    })

    // 현재 판매글에 남은 사본 수 확인
    const remainingQuantity = await transaction.recipeCopy.count({
      where: {
        listingId,
        state: 'LISTED',
      },
    })

    // 마지막 사본이 판매된 경우 품절 처리
    if (remainingQuantity === 0) {
      await transaction.marketListing.update({
        where: {
          id: listingId,
        },
        data: {
          status: 'SOLD_OUT',
        },
      })
    }

    // 차감 후 구매자 잔여 포인트 조회
    const buyer = await transaction.user.findUnique({
      where: {
        id: buyerId,
      },
      select: {
        points: true,
      },
    })

    return {
      ...purchase,
      remainingPoints: buyer.points,
    }
  })
}
