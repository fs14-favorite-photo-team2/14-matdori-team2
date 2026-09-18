import { prisma } from '../db/prisma.js'
import { RECIPE_COPY_ORDER_BY } from '../utils/sort-orders.js'
import { findCursorPage } from './cursor-page.js'
import {
  recipeFilter,
  recipeSummarySelect,
  toRecipeSummary,
} from './recipe-repository.js'

export const recipeCopySelect = {
  id: true,
  recipe: { select: recipeSummarySelect },
  listingId: true,
  state: true,
  everPurchased: true,
  createdAt: true,
  updatedAt: true,
}

export function toRecipeCopy({ recipe, ...copy }) {
  return { ...copy, recipe: toRecipeSummary(recipe) }
}

export function findRecipeCopyById(id) {
  return prisma.recipeCopy.findUnique({
    where: { id },
    select: { ownerId: true, state: true },
  })
}

function ownedCopiesFilter(ownerId, query) {
  return {
    ownerId,
    ...(query.state ? { state: query.state } : {}),
    ...recipeFilter(query),
  }
}

export function countRecipesByOwner(ownerId, query) {
  return prisma.recipe.count({
    where: { copies: { some: ownedCopiesFilter(ownerId, query) } },
  })
}

export function findRecipeCopiesByOwner(ownerId, query) {
  const { sort, cursor, limit } = query

  return findCursorPage(prisma.recipeCopy, {
    where: ownedCopiesFilter(ownerId, query),
    select: recipeCopySelect,
    orderBy: RECIPE_COPY_ORDER_BY[sort],
    cursor,
    limit,
  })
}
