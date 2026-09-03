import { Router } from 'express'

import { getMarketListingsController } from '../controllers/market-controller.js'
import { validateRequest } from '../middlewares/validate-request.js'
import { getMarketListingsRequest } from '../validators/market-validator.js'

const marketRouter = Router()

marketRouter.get(
  '/',
  validateRequest(getMarketListingsRequest),
  getMarketListingsController,
)

export default marketRouter
