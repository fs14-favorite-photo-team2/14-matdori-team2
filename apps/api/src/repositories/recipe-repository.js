import { prisma } from '../db/prisma.js'
import { publicUserSelect } from './user-repository.js'

export const recipeSummarySelect = {
  id: true,
  title: true,
  imageUrls: true,
  difficulty: true,
  category: true,
  summary: true,
  ingredients: true,
}

export function toRecipeSummary({ imageUrls, ingredients, ...recipe }) {
  return {
    ...recipe,
    imageUrl: imageUrls[0] ?? null,
    imageUrls,
    ingredients: Array.isArray(ingredients)
      ? ingredients.filter((ingredient) => ingredient.isHighlight)
      : [],
  }
}

export function recipeFilter({ keyword, difficulty, category }) {
  const filter = {
    ...(keyword ? { title: { contains: keyword, mode: 'insensitive' } } : {}),
    ...(difficulty ? { difficulty } : {}),
    ...(category ? { category } : {}),
  }

  return Object.keys(filter).length > 0 ? { recipe: filter } : {}
}

export function countRecipesCreatedSince({ creatorId, since }) {
  return prisma.recipe.count({
    where: { creatorId, createdAt: { gte: since } },
  })
}

export const recipeDetailSelect = {
  ...recipeSummarySelect,
  creator: {
    select: publicUserSelect,
  },
  content: true,
  totalSupply: true,
  createdAt: true,
  updatedAt: true,
}

// 전체 재료 반환
export function toRecipeDetail({ imageUrls, ingredients, ...recipe }) {
  return {
    ...recipe,
    imageUrl: imageUrls[0] ?? null,
    imageUrls,
    ingredients: Array.isArray(ingredients) ? ingredients : [],
  }
}

export function createRecipeRecord({
  creatorId,
  title,
  imageUrls,
  ingredients,
  difficulty,
  category,
  summary,
  content,
  totalSupply,
}) {
  return prisma.recipe.create({
    data: {
      creatorId,
      title,
      imageUrls,
      ingredients,
      difficulty,
      category,
      summary,
      content,
      totalSupply,

      // 발행 수량만큼 생성자 소유의 레시피 사본을 생성
      copies: {
        create: Array.from({ length: totalSupply }, () => ({
          ownerId: creatorId,
        })),
      },
    },
    select: recipeDetailSelect,
  })
}

// 레시피 상세 조회
export function findRecipeDetailById(recipeId, userId) {
  return prisma.recipe.findUnique({
    where: {
      id: recipeId,
    },
    select: {
      ...recipeDetailSelect,

      // 현재 사용자가 가진 사본 수
      _count: {
        select: {
          copies: {
            where: {
              ownerId: userId,
            },
          },
        },
      },

      // 판매 또는 교환이 완료된 사본이 있는지 확인
      copies: {
        where: {
          OR: [
            {
              purchases: {
                some: {},
              },
            },
            {
              offeredInTrades: {
                some: {
                  status: 'ACCEPTED',
                },
              },
            },
            {
              receivedInTrades: {
                some: {
                  status: 'ACCEPTED',
                },
              },
            },
          ],
        },
        select: {
          id: true,
        },
        take: 1,
      },
    },
  })
}

// 레시피 수정
export function updateRecipeRecord(recipeId, data) {
  return prisma.recipe.update({
    where: {
      id: recipeId,
    },
    data,
    select: recipeDetailSelect,
  })
}
