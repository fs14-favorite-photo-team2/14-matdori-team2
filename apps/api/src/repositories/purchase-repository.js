import { prisma } from '../db/prisma.js'
import { NotificationType } from '../generated/prisma/enums.ts'
import { CREATED_AT_ORDER_BY } from '../utils/sort-orders.js'
import { findCursorPage } from './cursor-page.js'

export const purchaseSelect = {
  id: true,
  listingId: true,
  recipeCopyId: true,
  buyerId: true,
  sellerId: true,
  price: true,
  createdAt: true,
}

function findPurchases(where, { from, to, sort, cursor, limit }) {
  const createdAt = {
    ...(from ? { gte: from } : {}),
    ...(to ? { lte: to } : {}),
  }

  return findCursorPage(prisma.purchase, {
    where: {
      ...where,
      ...(Object.keys(createdAt).length > 0 ? { createdAt } : {}),
    },
    select: purchaseSelect,
    orderBy: CREATED_AT_ORDER_BY[sort],
    cursor,
    limit,
  })
}

export function findPurchasesByBuyer(buyerId, query) {
  return findPurchases({ buyerId }, query)
}

export function findPurchasesBySeller(sellerId, query) {
  return findPurchases({ sellerId }, query)
}

export function notifyPurchase(tx, { listing, purchase }) {
  return tx.notification.create({
    data: {
      userId: listing.sellerId,
      type: NotificationType.PURCHASED,
      actorId: purchase.buyerId,
      recipeId: listing.recipeId,
      listingId: listing.id,
      purchaseId: purchase.id,
    },
  })
}
