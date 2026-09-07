import { Router } from 'express'

import {
  getMarketListingController,
  getMarketListingsController,
  createMarketListingController,
  updateMarketListingController,
  withdrawMarketListingController,
} from '../controllers/market-controller.js'
import { validateRequest } from '../middlewares/validate-request.js'
import {
  getMarketListingRequest,
  getMarketListingsRequest,
  createMarketListingRequest,
  updateMarketListingRequest,
} from '../validators/market-validator.js'

const marketRouter = Router()

// 로컬 테스트용 임시 인증
function mockAuthenticate(request, _response, next) {
  request.user = {
    id: 31,
  }

  return next()
}

marketRouter.get(
  '/',
  validateRequest(getMarketListingsRequest),
  getMarketListingsController,
)

marketRouter.get(
  '/:listingId',
  mockAuthenticate,
  validateRequest(getMarketListingRequest),
  getMarketListingController,
)

marketRouter.post(
  '/',
  mockAuthenticate,
  validateRequest(createMarketListingRequest),
  createMarketListingController,
)

marketRouter.patch(
  '/:listingId',
  mockAuthenticate,
  validateRequest(updateMarketListingRequest),
  updateMarketListingController,
)

// 판매글 내리기
marketRouter.post(
  '/:listingId/withdraw',
  mockAuthenticate,
  validateRequest(getMarketListingRequest),
  withdrawMarketListingController,
)

// 판매글 삭제하기

// 포인트로 레시피 사본

export default marketRouter
