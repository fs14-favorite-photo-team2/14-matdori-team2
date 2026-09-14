import { sendSuccess } from '../http/response.js'
import {
  acceptTradeOffer,
  cancelTradeOffer,
  createTradeOffer,
  getListingTradeOffers,
  rejectTradeOffer,
} from '../services/trade-offer-service.js'

export async function createTradeOfferController(request, response, next) {
  try {
    const tradeOffer = await createTradeOffer(
      request.userId,
      request.validated.params,
      request.validated.body,
    )

    return sendSuccess(response, tradeOffer, { status: 201 })
  } catch (error) {
    return next(error)
  }
}

export async function listListingTradeOffersController(
  request,
  response,
  next,
) {
  try {
    const { data, meta } = await getListingTradeOffers(
      request.userId,
      request.validated.params,
      request.validated.query,
    )

    return sendSuccess(response, data, { meta })
  } catch (error) {
    return next(error)
  }
}

export async function acceptTradeOfferController(request, response, next) {
  try {
    const tradeOffer = await acceptTradeOffer(
      request.userId,
      request.validated.params,
    )

    return sendSuccess(response, tradeOffer)
  } catch (error) {
    return next(error)
  }
}

export async function rejectTradeOfferController(request, response, next) {
  try {
    const tradeOffer = await rejectTradeOffer(
      request.userId,
      request.validated.params,
    )

    return sendSuccess(response, tradeOffer)
  } catch (error) {
    return next(error)
  }
}

export async function cancelTradeOfferController(request, response, next) {
  try {
    await cancelTradeOffer(request.userId, request.validated.params)

    return response.status(204).end()
  } catch (error) {
    return next(error)
  }
}
