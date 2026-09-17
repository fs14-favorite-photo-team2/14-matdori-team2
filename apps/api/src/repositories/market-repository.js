import { prisma } from '../db/prisma.js'
import { recipeSummarySelect } from './recipe-repository.js'
import { cancelPendingTradeOffers } from './trade-offer-repository.js'

// 공통으로 불러올 필드 부분
const marketListingSelect = {
  id: true,
  recipe: { select: recipeSummarySelect },
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

function listingUpdateError(
  field,
  message,
  code = 'MARKET_LISTING_UPDATE_CONFLICT',
) {
  const error = new Error(message)

  error.code = code
  error.field = field

  return error
}

// 추가 가능한 사본 조건 함수 추가
function getAvailableCopyWhere({ listingId, sellerId, recipeId, listingType }) {
  const sellsForPoints = listingType !== 'EXCHANGE'

  return {
    recipeId,
    ownerId: sellerId,
    state: 'OWNED',
    listingId: null,

    // 해당 판매글에서 이미 교환 완료된 사본은 다시 등록하지 않음
    receivedInTrades: {
      none: {
        listingId,
        status: 'ACCEPTED',
      },
    },

    // SALE/BOTH에서는 구매 이력이 있는 사본을 재판매할 수 없음
    // EXCHANGE에서는 해당 판매글에서 판매 완료된 사본만 제외
    purchases: {
      none: sellsForPoints ? {} : { listingId },
    },

    ...(sellsForPoints ? { everPurchased: false } : {}),
  }
}

async function loadMarketListingQuantityInfo(transaction, listingId, sellerId) {
  const listing = await transaction.marketListing.findFirst({
    where: {
      id: listingId,
      sellerId,
      deletedAt: null,
    },
    select: {
      id: true,
      recipeId: true,
      listingType: true,
      recipe: {
        select: {
          totalSupply: true,
        },
      },
    },
  })

  if (!listing) {
    return null
  }

  const availableWhere = getAvailableCopyWhere({
    listingId,
    sellerId,
    recipeId: listing.recipeId,
    listingType: listing.listingType,
  })

  const [
    soldQuantity,
    exchangedQuantity,
    currentRemainingQuantity,
    availableAdditionalQuantity,
  ] = await Promise.all([
    transaction.purchase.count({
      where: {
        listingId,
      },
    }),

    transaction.tradeOffer.count({
      where: {
        listingId,
        status: 'ACCEPTED',
        receivedCopyId: {
          not: null,
        },
      },
    }),

    transaction.recipeCopy.count({
      where: {
        listingId,
        ownerId: sellerId,
        recipeId: listing.recipeId,
        state: 'LISTED',
      },
    }),

    transaction.recipeCopy.count({
      where: availableWhere,
    }),
  ])

  const completedQuantity = soldQuantity + exchangedQuantity

  const maximumBySupply = Math.max(
    0,
    listing.recipe.totalSupply - completedQuantity,
  )

  const maximumByOwnership =
    currentRemainingQuantity + availableAdditionalQuantity

  const maximumQuantity = Math.min(maximumBySupply, maximumByOwnership)

  return {
    soldQuantity,
    exchangedQuantity,
    completedQuantity,
    availableAdditionalQuantity,
    maximumQuantity,
  }
}

export function findMarketListingQuantityInfo(listingId, sellerId) {
  return loadMarketListingQuantityInfo(prisma, listingId, sellerId)
}

// 판매글 수정
export function updateMarketListingRecord({
  listingId,
  sellerId,
  expectedUpdatedAt,
  remainingQuantity,
  data,
}) {
  return prisma.$transaction(
    async (transaction) => {
      const claimed = await transaction.marketListing.updateMany({
        where: {
          id: listingId,
          sellerId,
          status: 'ON_SALE',
          deletedAt: null,
          updatedAt: expectedUpdatedAt,
        },
        data: {
          updatedAt: new Date(),
        },
      })

      if (claimed.count !== 1) {
        throw listingUpdateError(
          'listingId',
          '판매글 상태가 변경되었습니다. 새로고침 후 다시 시도해 주세요.',
        )
      }

      const listing = await transaction.marketListing.findUniqueOrThrow({
        where: {
          id: listingId,
        },
        include: {
          recipe: {
            select: {
              creatorId: true,
              totalSupply: true,
            },
          },
        },
      })

      // 판매 중인 사본을 잠가 구매·교환과의 동시 변경을 막음
      const listedCopies = await transaction.$queryRaw`
        SELECT "id", "ownerId", "recipeId", "everPurchased"
        FROM "RecipeCopy"
        WHERE "listingId" = ${listingId}
          AND "state" = 'LISTED'
        ORDER BY "id" DESC
        FOR UPDATE
      `

      if (
        listedCopies.some(
          (copy) =>
            copy.ownerId !== sellerId || copy.recipeId !== listing.recipeId,
        )
      ) {
        throw listingUpdateError(
          'listingId',
          '판매글에 연결된 사본 정보를 확인해 주세요.',
        )
      }

      const nextListingType = data.listingType ?? listing.listingType

      const sellsForPoints = nextListingType !== 'EXCHANGE'

      // 교환 전용 글을 SALE/BOTH로 바꿀 때도 재판매 정책 검사
      if (sellsForPoints && listing.recipe.creatorId !== sellerId) {
        throw listingUpdateError(
          'listingType',
          '직접 생성한 레시피의 사본만 판매할 수 있습니다.',
          'MARKET_LISTING_UPDATE_FORBIDDEN',
        )
      }

      if (sellsForPoints && listedCopies.some((copy) => copy.everPurchased)) {
        throw listingUpdateError(
          'listingType',
          '이미 구매된 사본은 다시 포인트로 판매할 수 없습니다.',
        )
      }

      if (remainingQuantity !== undefined) {
        const [soldQuantity, exchangedQuantity] = await Promise.all([
          transaction.purchase.count({
            where: {
              listingId,
            },
          }),

          transaction.tradeOffer.count({
            where: {
              listingId,
              status: 'ACCEPTED',
              receivedCopyId: {
                not: null,
              },
            },
          }),
        ])

        const completedQuantity = soldQuantity + exchangedQuantity

        const availableWhere = getAvailableCopyWhere({
          listingId,
          sellerId,
          recipeId: listing.recipeId,
          listingType: nextListingType,
        })

        const availableCopies = await transaction.recipeCopy.findMany({
          where: availableWhere,
          select: {
            id: true,
          },
          orderBy: {
            id: 'asc',
          },
        })

        const maximumBySupply = Math.max(
          0,
          listing.recipe.totalSupply - completedQuantity,
        )

        const maximumByOwnership = listedCopies.length + availableCopies.length

        const maximumQuantity = Math.min(maximumBySupply, maximumByOwnership)

        if (remainingQuantity > maximumQuantity) {
          throw listingUpdateError(
            'remainingQuantity',
            `현재 변경 가능한 최대 판매 수량은 ${maximumQuantity}개입니다.`,
          )
        }

        const difference = remainingQuantity - listedCopies.length

        if (difference > 0) {
          const copyIds = availableCopies
            .slice(0, difference)
            .map((copy) => copy.id)

          const reserved = await transaction.recipeCopy.updateMany({
            where: {
              ...availableWhere,
              id: {
                in: copyIds,
              },
            },
            data: {
              state: 'LISTED',
              listingId,
            },
          })

          if (reserved.count !== difference) {
            throw listingUpdateError(
              'remainingQuantity',
              '사본 상태가 변경되었습니다. 다시 조회한 후 수정해 주세요.',
            )
          }
        } else if (difference < 0) {
          const copyIds = listedCopies
            .slice(0, -difference)
            .map((copy) => copy.id)

          const released = await transaction.recipeCopy.updateMany({
            where: {
              id: {
                in: copyIds,
              },
              recipeId: listing.recipeId,
              ownerId: sellerId,
              listingId,
              state: 'LISTED',
            },
            data: {
              state: 'OWNED',
              listingId: null,
            },
          })

          if (released.count !== -difference) {
            throw listingUpdateError(
              'remainingQuantity',
              '사본 상태가 변경되었습니다. 다시 조회한 후 수정해 주세요.',
            )
          }
        }
      }

      const updatedListing = await transaction.marketListing.update({
        where: {
          id: listingId,
        },
        data: {
          ...data,
          // remainingQuantity는 최소 1이므로 수정으로 SOLD_OUT 처리하지 않음
          status: 'ON_SALE',
        },
      })

      // SALE로 변경하면 기존 대기 교환 제안을 취소
      if (nextListingType === 'SALE') {
        await cancelPendingTradeOffers(transaction, updatedListing)
      }

      const [result, quantityInfo] = await Promise.all([
        transaction.marketListing.findUniqueOrThrow({
          where: {
            id: listingId,
          },
          select: marketListingSelect,
        }),

        loadMarketListingQuantityInfo(transaction, listingId, sellerId),
      ])

      return {
        ...result,
        ...quantityInfo,
      }
    },
    {
      isolationLevel: 'ReadCommitted',
    },
  )
}

// 판매글 내리기 + 판매글에 달린 사본 복구
export function withdrawMarketListingRecord(listingId) {
  return prisma.$transaction(async (transaction) => {
    const listing = await transaction.marketListing.update({
      where: {
        id: listingId,
        status: 'ON_SALE',
        deletedAt: null,
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

    await cancelPendingTradeOffers(transaction, listing)
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
      recipeId: true,
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
  recipeId,
  recipeCopyId,
  buyerId,
  sellerId,
  price,
}) {
  return prisma.$transaction(async (transaction) => {
    const ownedCopy = await transaction.recipeCopy.findFirst({
      where: {
        ownerId: buyerId,
        recipeId,
      },
      select: {
        id: true,
      },
    })

    if (ownedCopy) {
      const error = new Error('이미 보유한 레시피입니다.')
      error.code = 'RECIPE_ALREADY_OWNED'
      throw error
    }

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
