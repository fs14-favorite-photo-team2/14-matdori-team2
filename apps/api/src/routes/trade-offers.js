import { Router } from 'express'

import {
  acceptTradeOfferController,
  cancelTradeOfferController,
  rejectTradeOfferController,
} from '../controllers/trade-offer-controller.js'
import { requireAuthentication } from '../middlewares/require-authentication.js'
import { validateRequest } from '../middlewares/validate-request.js'
import { tradeOfferRequest } from '../validators/trade-offer-validator.js'

const tradeOffersRouter = Router()

tradeOffersRouter.use(requireAuthentication)

tradeOffersRouter.post(
  '/:tradeOfferId/accept',
  validateRequest(tradeOfferRequest),
  acceptTradeOfferController,
)
tradeOffersRouter.post(
  '/:tradeOfferId/reject',
  validateRequest(tradeOfferRequest),
  rejectTradeOfferController,
)
tradeOffersRouter.delete(
  '/:tradeOfferId',
  validateRequest(tradeOfferRequest),
  cancelTradeOfferController,
)

export default tradeOffersRouter
