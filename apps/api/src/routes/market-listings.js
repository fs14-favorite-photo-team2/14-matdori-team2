import { Router } from 'express'

import {
  createMarketListingController,
  getMarketListingsController,
} from '../controllers/market-controller.js'
import { validateRequest } from '../middlewares/validate-request.js'
import {
  createMarketListingRequest,
  getMarketListingsRequest,
} from '../validators/market-validator.js'

const marketRouter = Router()

// 로컬 테스트용 임시 인증
function mockAuthenticate(request, _response, next) {
  request.user = {
    id: 101,
  }

  return next()
}

marketRouter.get(
  '/',
  validateRequest(getMarketListingsRequest),
  getMarketListingsController,
)

// 판매글 상세 조회

marketRouter.post(
  '/',
  mockAuthenticate,
  validateRequest(createMarketListingRequest),
  createMarketListingController,
)

// 판매글 수정

// 판매글 내리기(마켓플레이스 > 마이키친)

// 포인트로 레시피 사본

export default marketRouter
