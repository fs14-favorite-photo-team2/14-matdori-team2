import { prisma } from '../db/prisma.js'
import { CREATED_AT_ORDER_BY } from '../utils/sort-orders.js'
import { findCursorPage } from './cursor-page.js'
import { recipeCopySelect, toRecipeCopy } from './recipe-copy-repository.js'
import { publicUserSelect } from './user-repository.js'

export const tradeOfferSelect = {
  id: true,
  listingId: true,
  proposer: { select: publicUserSelect },
  offeredCopy: { select: recipeCopySelect },
  receivedCopyId: true,
  message: true,
  status: true,
  createdAt: true,
  decidedAt: true,
}

export function toTradeOffer({ offeredCopy, ...tradeOffer }) {
  return { ...tradeOffer, offeredCopy: toRecipeCopy(offeredCopy) }
}

function findTradeOffers(where, { status, sort, cursor, limit }) {
  return findCursorPage(prisma.tradeOffer, {
    where: { ...where, ...(status ? { status } : {}) },
    select: tradeOfferSelect,
    orderBy: CREATED_AT_ORDER_BY[sort],
    cursor,
    limit,
  })
}

export function findTradeOffersByProposer(proposerId, query) {
  return findTradeOffers({ proposerId }, query)
}

export function findTradeOffersBySeller(sellerId, query) {
  return findTradeOffers({ listing: { sellerId } }, query)
}
