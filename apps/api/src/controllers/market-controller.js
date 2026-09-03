import { getMarketListings } from '../services/market-service.js'
import { sendSuccess } from '../utils/response.js'

// 서비스로 요청 보내기, 나중에 응답 받기
export async function getMarketListingsController(request, response, next) {
  try {
    const { data, meta } = await getMarketListings(request.validated.query)

    return sendSuccess(response, data, { meta })
  } catch (error) {
    return next(error)
  }
}
