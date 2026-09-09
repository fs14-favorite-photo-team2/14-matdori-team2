import { sendSuccess } from '../http/response.js'
import {
  getCurrentUser,
  getMyListings,
  getMyPurchases,
  getMyRecipeCopies,
  getMyReceivedTradeOffers,
  getMySales,
  getMySentTradeOffers,
  updateCurrentUser,
} from '../services/user-service.js'

export async function getCurrentUserController(request, response, next) {
  try {
    const user = await getCurrentUser(request.userId)

    return sendSuccess(response, user)
  } catch (error) {
    return next(error)
  }
}

export async function updateCurrentUserController(request, response, next) {
  try {
    const user = await updateCurrentUser(request.userId, request.validated.body)

    return sendSuccess(response, user)
  } catch (error) {
    return next(error)
  }
}

function listController(loadPage) {
  return async (request, response, next) => {
    try {
      const { data, meta } = await loadPage(
        request.userId,
        request.validated.query,
      )

      return sendSuccess(response, data, { meta })
    } catch (error) {
      return next(error)
    }
  }
}

export const listMyRecipeCopiesController = listController(getMyRecipeCopies)
export const listMyListingsController = listController(getMyListings)
export const listMyTradeOffersController = listController(getMySentTradeOffers)
export const listReceivedTradeOffersController = listController(
  getMyReceivedTradeOffers,
)
export const listMyPurchasesController = listController(getMyPurchases)
export const listMySalesController = listController(getMySales)
