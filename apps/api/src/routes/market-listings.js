import { Router } from 'express'

import {
  getMarketListingController,
  getMarketListingsController,
  createMarketListingController,
  updateMarketListingController,
  withdrawMarketListingController,
  deleteMarketListingController,
  purchaseMarketListingController,
} from '../controllers/market-controller.js'
import { validateRequest } from '../middlewares/validate-request.js'
import {
  getMarketListingRequest,
  getMarketListingsRequest,
  createMarketListingRequest,
  updateMarketListingRequest,
} from '../validators/market-validator.js'
import { requireAuthentication } from '../middlewares/require-authentication.js'

const marketRouter = Router()

marketRouter.get(
  '/',
  validateRequest(getMarketListingsRequest),
  getMarketListingsController,
)

marketRouter.get(
  '/:listingId',
  requireAuthentication,
  validateRequest(getMarketListingRequest),
  getMarketListingController,
)

marketRouter.post(
  '/',
  requireAuthentication,
  validateRequest(createMarketListingRequest),
  createMarketListingController,
)

marketRouter.patch(
  '/:listingId',
  requireAuthentication,
  validateRequest(updateMarketListingRequest),
  updateMarketListingController,
)

// 판매글 내리기
marketRouter.post(
  '/:listingId/withdraw',
  requireAuthentication,
  validateRequest(getMarketListingRequest),
  withdrawMarketListingController,
)

// 판매글 삭제하기
marketRouter.delete(
  '/:listingId',
  requireAuthentication,
  validateRequest(getMarketListingRequest),
  deleteMarketListingController,
)

marketRouter.post(
  '/:listingId/purchases',
  requireAuthentication,
  validateRequest(getMarketListingRequest),
  purchaseMarketListingController,
)

export default marketRouter
