import { prisma } from '../db/prisma.js'
import { CopyState, ListingStatus } from '../generated/prisma/enums.ts'
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

export function findListingById(id) {
  return prisma.marketListing.findUnique({
    where: { id, deletedAt: null },
    select: {
      id: true,
      sellerId: true,
      recipeId: true,
      listingType: true,
      status: true,
    },
  })
}

function sellerListingsFilter(sellerId, query) {
  return {
    sellerId,
    deletedAt: null,
    ...(query.listingType ? { listingType: query.listingType } : {}),
    status: query.status ?? { not: ListingStatus.WITHDRAWN },
    ...recipeFilter(query),
  }
}

export function countListingsBySeller(sellerId, query) {
  return prisma.marketListing.count({
    where: sellerListingsFilter(sellerId, query),
  })
}

export function findListingsBySeller(sellerId, query) {
  const { sort, cursor, limit } = query

  return findCursorPage(prisma.marketListing, {
    where: sellerListingsFilter(sellerId, query),
    select: listingSummarySelect,
    orderBy: CREATED_AT_ORDER_BY[sort],
    cursor,
    limit,
  })
}
