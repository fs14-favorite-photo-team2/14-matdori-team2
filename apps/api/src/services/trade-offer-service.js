import { ERROR_CODES } from '../constants/error-codes.js'
import { PRISMA_ERROR_CODES } from '../constants/prisma-error-codes.js'
import { AppError } from '../errors/app-error.js'
import {
  CopyState,
  ListingStatus,
  ListingType,
  TradeOfferStatus,
} from '../generated/prisma/enums.ts'
import { findListingById } from '../repositories/market-listing-repository.js'
import { findRecipeCopyById } from '../repositories/recipe-copy-repository.js'
import {
  acceptPendingTradeOffer,
  cancelPendingTradeOffer,
  createPendingTradeOffer,
  findTradeOfferById,
  findTradeOffersByListing,
  rejectPendingTradeOffer,
  toTradeOffer,
} from '../repositories/trade-offer-repository.js'
import { toCursorPage } from '../utils/pagination.js'

const CONFLICT_PRISMA_ERROR_CODES = [
  PRISMA_ERROR_CODES.RECORD_NOT_FOUND,
  PRISMA_ERROR_CODES.TRANSACTION_CONFLICT,
]

function toConflictError(error) {
  return CONFLICT_PRISMA_ERROR_CODES.includes(error.code)
    ? AppError.from(ERROR_CODES.CONFLICT)
    : error
}

async function loadListing(listingId) {
  const listing = await findListingById(listingId)

  if (!listing) {
    throw AppError.from(ERROR_CODES.RESOURCE_NOT_FOUND)
  }

  return listing
}

async function loadPendingTradeOffer(tradeOfferId, canDecide) {
  const tradeOffer = await findTradeOfferById(tradeOfferId)

  if (!tradeOffer) {
    throw AppError.from(ERROR_CODES.RESOURCE_NOT_FOUND)
  }

  if (!canDecide(tradeOffer)) {
    throw AppError.from(ERROR_CODES.FORBIDDEN)
  }

  if (tradeOffer.status !== TradeOfferStatus.PENDING) {
    throw AppError.from(ERROR_CODES.CONFLICT)
  }

  return tradeOffer
}

export async function createTradeOffer(
  userId,
  { listingId },
  { offeredCopyId, message },
) {
  const [listing, offeredCopy] = await Promise.all([
    loadListing(listingId),
    findRecipeCopyById(offeredCopyId),
  ])

  if (!offeredCopy) {
    throw AppError.from(ERROR_CODES.RESOURCE_NOT_FOUND)
  }

  if (listing.sellerId === userId || offeredCopy.ownerId !== userId) {
    throw AppError.from(ERROR_CODES.FORBIDDEN)
  }

  if (
    listing.status !== ListingStatus.ON_SALE ||
    listing.listingType === ListingType.SALE ||
    offeredCopy.state !== CopyState.OWNED
  ) {
    throw AppError.from(ERROR_CODES.CONFLICT)
  }

  try {
    const tradeOffer = await createPendingTradeOffer({
      listing,
      proposerId: userId,
      offeredCopyId,
      message: message || null,
    })

    return toTradeOffer(tradeOffer)
  } catch (error) {
    throw toConflictError(error)
  }
}

export async function getListingTradeOffers(userId, { listingId }, query) {
  const listing = await loadListing(listingId)

  if (listing.sellerId !== userId) {
    throw AppError.from(ERROR_CODES.FORBIDDEN)
  }

  const tradeOffers = await findTradeOffersByListing(listingId, query)

  return toCursorPage(tradeOffers, query.limit, toTradeOffer)
}

export async function acceptTradeOffer(userId, { tradeOfferId }) {
  const tradeOffer = await loadPendingTradeOffer(
    tradeOfferId,
    ({ listing }) => listing.sellerId === userId,
  )

  if (tradeOffer.listing.status !== ListingStatus.ON_SALE) {
    throw AppError.from(ERROR_CODES.CONFLICT)
  }

  try {
    const acceptedTradeOffer = await acceptPendingTradeOffer(tradeOffer)

    return toTradeOffer(acceptedTradeOffer)
  } catch (error) {
    throw toConflictError(error)
  }
}

export async function rejectTradeOffer(userId, { tradeOfferId }) {
  const tradeOffer = await loadPendingTradeOffer(
    tradeOfferId,
    ({ listing }) => listing.sellerId === userId,
  )

  try {
    const rejectedTradeOffer = await rejectPendingTradeOffer(tradeOffer)

    return toTradeOffer(rejectedTradeOffer)
  } catch (error) {
    throw toConflictError(error)
  }
}

export async function cancelTradeOffer(userId, { tradeOfferId }) {
  const tradeOffer = await loadPendingTradeOffer(
    tradeOfferId,
    ({ proposerId }) => proposerId === userId,
  )

  try {
    await cancelPendingTradeOffer(tradeOffer)
  } catch (error) {
    throw toConflictError(error)
  }
}
