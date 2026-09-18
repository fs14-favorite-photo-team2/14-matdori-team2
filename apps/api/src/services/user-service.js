import { ERROR_CODES } from '../constants/error-codes.js'
import { PRISMA_ERROR_CODES } from '../constants/prisma-error-codes.js'
import { AppError } from '../errors/app-error.js'
import {
  countListingsBySeller,
  findListingsBySeller,
  toListingSummary,
} from '../repositories/market-listing-repository.js'
import {
  findPurchasesByBuyer,
  findPurchasesBySeller,
} from '../repositories/purchase-repository.js'
import {
  countRecipesByOwner,
  findRecipeCopiesByOwner,
  toRecipeCopy,
} from '../repositories/recipe-copy-repository.js'
import { countRecipesCreatedSince } from '../repositories/recipe-repository.js'
import {
  countTradeOffersByProposer,
  countTradeOffersBySeller,
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
  const [copies, totalRecipeCount] = await Promise.all([
    findRecipeCopiesByOwner(userId, query),
    countRecipesByOwner(userId, query),
  ])
  const page = toCursorPage(copies, query.limit, toRecipeCopy)
  page.meta.totalRecipeCount = totalRecipeCount

  return page
}

export async function getMyListings(userId, query) {
  const [listings, totalCount] = await Promise.all([
    findListingsBySeller(userId, query),
    countListingsBySeller(userId, query),
  ])
  const page = toCursorPage(listings, query.limit, toListingSummary)
  page.meta.totalCount = totalCount

  return page
}

export async function getMySentTradeOffers(userId, query) {
  const [tradeOffers, totalCount] = await Promise.all([
    findTradeOffersByProposer(userId, query),
    countTradeOffersByProposer(userId, query),
  ])
  const page = toCursorPage(tradeOffers, query.limit, toTradeOffer)
  page.meta.totalCount = totalCount

  return page
}

export async function getMyReceivedTradeOffers(userId, query) {
  const [tradeOffers, totalCount] = await Promise.all([
    findTradeOffersBySeller(userId, query),
    countTradeOffersBySeller(userId, query),
  ])
  const page = toCursorPage(tradeOffers, query.limit, toTradeOffer)
  page.meta.totalCount = totalCount

  return page
}

export async function getMyPurchases(userId, query) {
  const purchases = await findPurchasesByBuyer(userId, query)

  return toCursorPage(purchases, query.limit)
}

export async function getMySales(userId, query) {
  const sales = await findPurchasesBySeller(userId, query)

  return toCursorPage(sales, query.limit)
}
