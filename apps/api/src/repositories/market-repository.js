import { prisma } from '../db/prisma.js'

// 공통으로 불러올 필드 부분
const marketListingSelect = {
  id: true,
  recipe: {
    select: {
      id: true,
      title: true,
      imageUrl: true,
      difficulty: true,
      category: true,
      summary: true,
      minPrice: true,
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
