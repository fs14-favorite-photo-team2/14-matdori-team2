import { prisma } from '../db/prisma.js'
import {
  CopyState,
  ListingStatus,
  ListingType,
  NotificationType,
  TradeOfferStatus,
} from '../generated/prisma/enums.ts'
import { CREATED_AT_ORDER_BY } from '../utils/sort-orders.js'
import { findCursorPage } from './cursor-page.js'
import {
  listingSummarySelect,
  toListingSummary,
} from './market-listing-repository.js'
import { recipeCopySelect, toRecipeCopy } from './recipe-copy-repository.js'
import { publicUserSelect } from './user-repository.js'

export const tradeOfferSelect = {
  id: true,
  listing: { select: listingSummarySelect },
  proposer: { select: publicUserSelect },
  offeredCopy: { select: recipeCopySelect },
  receivedCopyId: true,
  message: true,
  status: true,
  createdAt: true,
  decidedAt: true,
}

export function toTradeOffer({ listing, offeredCopy, ...tradeOffer }) {
  return {
    ...tradeOffer,
    listing: toListingSummary(listing),
    offeredCopy: toRecipeCopy(offeredCopy),
  }
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

export function findTradeOffersByListing(listingId, query) {
  return findTradeOffers({ listingId }, query)
}

export function findTradeOfferById(id) {
  return prisma.tradeOffer.findUnique({
    where: { id },
    select: {
      id: true,
      proposerId: true,
      offeredCopyId: true,
      status: true,
      listing: {
        select: { id: true, sellerId: true, recipeId: true, status: true },
      },
    },
  })
}

function notifyTradeOffer(
  tx,
  { type, userId, actorId, listing, tradeOfferId },
) {
  return tx.notification.create({
    data: {
      userId,
      type,
      actorId,
      recipeId: listing.recipeId,
      listingId: listing.id,
      tradeOfferId,
    },
  })
}

function notifyTradeOffers(tx, { type, actorId, listing, tradeOffers }) {
  return tx.notification.createMany({
    data: tradeOffers.map(({ id, proposerId }) => ({
      userId: proposerId,
      type,
      actorId,
      recipeId: listing.recipeId,
      listingId: listing.id,
      tradeOfferId: id,
    })),
  })
}

function notifySoldOut(tx, listing) {
  return tx.notification.create({
    data: {
      userId: listing.sellerId,
      type: NotificationType.SOLD_OUT,
      recipeId: listing.recipeId,
      listingId: listing.id,
    },
  })
}

function releaseOfferedCopy(tx, id) {
  return tx.recipeCopy.update({
    where: { id, state: CopyState.OFFERED },
    data: { state: CopyState.OWNED },
  })
}

function decidePendingTradeOffer(tx, id, data) {
  return tx.tradeOffer.update({
    where: { id, status: TradeOfferStatus.PENDING },
    data: { ...data, decidedAt: new Date() },
    select: tradeOfferSelect,
  })
}

function lockListing(tx, id) {
  return tx.$queryRaw`SELECT "id" FROM "MarketListing" WHERE "id" = ${id} FOR UPDATE`
}

async function lockActiveTradeListing(tx, id) {
  await lockListing(tx, id)
  await tx.marketListing.findUniqueOrThrow({
    where: {
      id,
      deletedAt: null,
      status: ListingStatus.ON_SALE,
      listingType: { not: ListingType.SALE },
    },
    select: { id: true },
  })
}

export async function cancelPendingTradeOffers(tx, listing) {
  const pendingTradeOffer = {
    listingId: listing.id,
    status: TradeOfferStatus.PENDING,
  }

  const sweptTradeOffers = await tx.tradeOffer.findMany({
    where: pendingTradeOffer,
    select: { id: true, proposerId: true },
  })

  await tx.recipeCopy.updateMany({
    where: {
      state: CopyState.OFFERED,
      offeredInTrades: { some: pendingTradeOffer },
    },
    data: { state: CopyState.OWNED },
  })
  await tx.tradeOffer.updateMany({
    where: pendingTradeOffer,
    data: { status: TradeOfferStatus.CANCELED, decidedAt: new Date() },
  })

  if (sweptTradeOffers.length > 0) {
    await notifyTradeOffers(tx, {
      type: NotificationType.TRADE_OFFER_CANCELED,
      actorId: listing.sellerId,
      listing,
      tradeOffers: sweptTradeOffers,
    })
  }
}

async function markListingAsSoldOut(tx, listing) {
  await tx.marketListing.update({
    where: { id: listing.id },
    data: { status: ListingStatus.SOLD_OUT },
  })
  await cancelPendingTradeOffers(tx, listing)
  await notifySoldOut(tx, listing)
}

export function createPendingTradeOffer({
  listing,
  proposerId,
  offeredCopyId,
  message,
}) {
  return prisma.$transaction(async (tx) => {
    await lockActiveTradeListing(tx, listing.id)

    await tx.recipeCopy.update({
      where: { id: offeredCopyId, ownerId: proposerId, state: CopyState.OWNED },
      data: { state: CopyState.OFFERED },
    })

    const tradeOffer = await tx.tradeOffer.create({
      data: { listingId: listing.id, proposerId, offeredCopyId, message },
      select: tradeOfferSelect,
    })

    await notifyTradeOffer(tx, {
      type: NotificationType.TRADE_OFFER_NEW,
      userId: listing.sellerId,
      actorId: proposerId,
      listing,
      tradeOfferId: tradeOffer.id,
    })

    return tradeOffer
  })
}

export function acceptPendingTradeOffer({
  id,
  proposerId,
  offeredCopyId,
  listing,
}) {
  return prisma.$transaction(async (tx) => {
    await lockActiveTradeListing(tx, listing.id)

    const receivedCopy = await tx.recipeCopy.findFirstOrThrow({
      where: { listingId: listing.id, state: CopyState.LISTED },
      orderBy: { id: 'asc' },
      select: { id: true },
    })

    await tx.recipeCopy.update({
      where: { id: offeredCopyId, state: CopyState.OFFERED },
      data: { ownerId: listing.sellerId, state: CopyState.OWNED },
    })
    await tx.recipeCopy.update({
      where: { id: receivedCopy.id, state: CopyState.LISTED },
      data: { ownerId: proposerId, listingId: null, state: CopyState.OWNED },
    })

    const tradeOffer = await decidePendingTradeOffer(tx, id, {
      status: TradeOfferStatus.ACCEPTED,
      receivedCopyId: receivedCopy.id,
    })

    await notifyTradeOffer(tx, {
      type: NotificationType.TRADE_OFFER_ACCEPT,
      userId: proposerId,
      actorId: listing.sellerId,
      listing,
      tradeOfferId: id,
    })

    const remainingCount = await tx.recipeCopy.count({
      where: { listingId: listing.id, state: CopyState.LISTED },
    })

    if (remainingCount === 0) {
      await markListingAsSoldOut(tx, listing)
    }

    return tradeOffer
  })
}

export function rejectPendingTradeOffer({
  id,
  proposerId,
  offeredCopyId,
  listing,
}) {
  return prisma.$transaction(async (tx) => {
    await lockListing(tx, listing.id)
    await releaseOfferedCopy(tx, offeredCopyId)

    const tradeOffer = await decidePendingTradeOffer(tx, id, {
      status: TradeOfferStatus.REFUSED,
    })

    await notifyTradeOffer(tx, {
      type: NotificationType.TRADE_OFFER_REFUSE,
      userId: proposerId,
      actorId: listing.sellerId,
      listing,
      tradeOfferId: id,
    })

    return tradeOffer
  })
}

export function cancelPendingTradeOffer({ id, offeredCopyId, listing }) {
  return prisma.$transaction(async (tx) => {
    await lockListing(tx, listing.id)
    await releaseOfferedCopy(tx, offeredCopyId)
    await decidePendingTradeOffer(tx, id, {
      status: TradeOfferStatus.CANCELED,
    })
  })
}
