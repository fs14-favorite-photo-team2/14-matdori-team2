import {
  createMarketListing,
  getMarketListings,
} from '../services/market-service.js'
import { sendSuccess } from '../utils/response.js'

// 서비스로 요청 보내기, 나중에 응답 받기

// 판매글 목록 조회
export async function getMarketListingsController(request, response, next) {
  try {
    const { data, meta } = await getMarketListings(request.validated.query)

    return sendSuccess(response, data, { meta })
  } catch (error) {
    return next(error)
  }
}

// 판매글 등록
export async function createMarketListingController(request, response, next) {
  try {
    const listing = await createMarketListing(
      request.user.id,
      request.validated.body,
    )

    return sendSuccess(response, listing, {
      status: 201,
    })
  } catch (error) {
    return next(error)
  }
}
