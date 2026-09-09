import { prisma } from '../db/prisma.js'
import { CopyState } from '../generated/prisma/enums.ts'
import { CREATED_AT_ORDER_BY } from '../utils/sort-orders.js'
import { findCursorPage } from './cursor-page.js'
import {
  recipeFilter,
  recipeSummarySelect,
  toRecipeSummary,
} from './recipe-repository.js'
import { publicUserSelect } from './user-repository.js'

export const listingSummarySelect = {
  id: true,
  recipe: { select: recipeSummarySelect },
  seller: { select: publicUserSelect },
  listingType: true,
  price: true,
  initialQuantity: true,
  wantedDifficulty: true,
  wantedCategory: true,
  wantedDescription: true,
  status: true,
  createdAt: true,
  updatedAt: true,
  _count: { select: { copies: { where: { state: CopyState.LISTED } } } },
}

export function toListingSummary({ _count, recipe, ...listing }) {
  return {
    ...listing,
    recipe: toRecipeSummary(recipe),
    remainingQuantity: _count.copies,
  }
}

export function findListingsBySeller(sellerId, query) {
  const { listingType, status, sort, cursor, limit } = query

  return findCursorPage(prisma.marketListing, {
    where: {
      sellerId,
      deletedAt: null,
      ...(listingType ? { listingType } : {}),
      ...(status ? { status } : {}),
      ...recipeFilter(query),
    },
    select: listingSummarySelect,
    orderBy: CREATED_AT_ORDER_BY[sort],
    cursor,
    limit,
  })
}
