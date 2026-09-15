import { Router } from 'express'

import {
  createTradeOfferController,
  listListingTradeOffersController,
} from '../controllers/trade-offer-controller.js'
import { requireAuthentication } from '../middlewares/require-authentication.js'
import { validateRequest } from '../middlewares/validate-request.js'
import {
  createTradeOfferRequest,
  listingTradeOffersRequest,
} from '../validators/trade-offer-validator.js'

const listingTradeOffersRouter = Router({ mergeParams: true })

listingTradeOffersRouter.use(requireAuthentication)

listingTradeOffersRouter.get(
  '/',
  validateRequest(listingTradeOffersRequest),
  listListingTradeOffersController,
)
listingTradeOffersRouter.post(
  '/',
  validateRequest(createTradeOfferRequest),
  createTradeOfferController,
)

export default listingTradeOffersRouter
