import { prisma } from '../db/prisma.js'

export const recipeSummarySelect = {
  id: true,
  title: true,
  imageUrls: true,
  difficulty: true,
  category: true,
  summary: true,
  minPrice: true,
  ingredients: true,
}

export function toRecipeSummary({ imageUrls, ingredients, ...recipe }) {
  return {
    ...recipe,
    imageUrl: imageUrls[0],
    ingredients: ingredients.filter((ingredient) => ingredient.isHighlight),
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
