import { prisma } from '../db/prisma.js'
import { RECIPE_COPY_ORDER_BY } from '../utils/sort-orders.js'
import { findCursorPage } from './cursor-page.js'
import { recipeFilter, recipeSummarySelect } from './recipe-repository.js'

export const recipeCopySelect = {
  id: true,
  recipe: { select: recipeSummarySelect },
  listingId: true,
  state: true,
  everPurchased: true,
  createdAt: true,
  updatedAt: true,
}

export function findRecipeCopiesByOwner(ownerId, query) {
  const { state, sort, cursor, limit } = query

  return findCursorPage(prisma.recipeCopy, {
    where: {
      ownerId,
      ...(state ? { state } : {}),
      ...recipeFilter(query),
    },
    select: recipeCopySelect,
    orderBy: RECIPE_COPY_ORDER_BY[sort],
    cursor,
    limit,
  })
}
