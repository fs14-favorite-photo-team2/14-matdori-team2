import { ERROR_CODES } from '../constants/error-codes.js'
import { PRISMA_ERROR_CODES } from '../constants/prisma-error-codes.js'
import { AppError } from '../errors/app-error.js'
import {
  findListingsBySeller,
  toListingSummary,
} from '../repositories/market-listing-repository.js'
import {
  findPurchasesByBuyer,
  findPurchasesBySeller,
} from '../repositories/purchase-repository.js'
import {
  findRecipeCopiesByOwner,
  toRecipeCopy,
} from '../repositories/recipe-copy-repository.js'
import { countRecipesCreatedSince } from '../repositories/recipe-repository.js'
import {
  findTradeOffersByProposer,
  findTradeOffersBySeller,
  toTradeOffer,
} from '../repositories/trade-offer-repository.js'
import {
  findUserById,
  updateNickname,
} from '../repositories/user-repository.js'
import { getKstMonthStart } from '../utils/kst.js'
import { toCursorPage } from '../utils/pagination.js'
import { getRandomBoxStatus } from '../utils/random-box.js'
import { getRecipeCreationQuota } from '../utils/recipe-quota.js'

export async function getCurrentUser(userId) {
  const now = new Date()
  const [user, createdThisMonth] = await Promise.all([
    findUserById(userId),
    countRecipesCreatedSince({
      creatorId: userId,
      since: getKstMonthStart(now),
    }),
  ])

  if (!user) {
    throw AppError.from(ERROR_CODES.AUTHENTICATION_REQUIRED)
  }

  const { lastRandomBoxClaimedAt, ...summary } = user

  return {
    ...summary,
    recipeCreationQuota: getRecipeCreationQuota(createdThisMonth, now),
    randomBox: getRandomBoxStatus(lastRandomBoxClaimedAt, now),
  }
}

export async function updateCurrentUser(userId, { nickname }) {
  try {
    return await updateNickname(userId, nickname)
  } catch (error) {
    if (error.code === PRISMA_ERROR_CODES.UNIQUE_VIOLATION) {
      throw AppError.from(ERROR_CODES.NICKNAME_ALREADY_EXISTS)
    }

    if (error.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
      throw AppError.from(ERROR_CODES.AUTHENTICATION_REQUIRED)
    }

    throw error
  }
}

export async function getMyRecipeCopies(userId, query) {
  const copies = await findRecipeCopiesByOwner(userId, query)

  return toCursorPage(copies, query.limit, toRecipeCopy)
}

export async function getMyListings(userId, query) {
  const listings = await findListingsBySeller(userId, query)

  return toCursorPage(listings, query.limit, toListingSummary)
}

export async function getMySentTradeOffers(userId, query) {
  const tradeOffers = await findTradeOffersByProposer(userId, query)

  return toCursorPage(tradeOffers, query.limit, toTradeOffer)
}

export async function getMyReceivedTradeOffers(userId, query) {
  const tradeOffers = await findTradeOffersBySeller(userId, query)

  return toCursorPage(tradeOffers, query.limit, toTradeOffer)
}

export async function getMyPurchases(userId, query) {
  const purchases = await findPurchasesByBuyer(userId, query)

  return toCursorPage(purchases, query.limit)
}

export async function getMySales(userId, query) {
  const sales = await findPurchasesBySeller(userId, query)

  return toCursorPage(sales, query.limit)
}
