import {
  getMarketListing,
  getMarketListings,
  createMarketListing,
  updateMarketListing,
  withdrawMarketListing,
  deleteMarketListing,
} from '../services/market-service.js'
import { sendSuccess } from '../http/response.js'

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

// 판매글 상세 조회
export async function getMarketListingController(request, response, next) {
  try {
    const listing = await getMarketListing(request.validated.params.listingId)

    return sendSuccess(response, listing)
  } catch (error) {
    return next(error)
  }
}

// 판매글 등록
export async function createMarketListingController(request, response, next) {
  try {
    const listing = await createMarketListing(
      request.userId,
      request.validated.body,
    )

    return sendSuccess(response, listing, {
      status: 201,
    })
  } catch (error) {
    return next(error)
  }
}

// 판매글 수정
export async function updateMarketListingController(request, response, next) {
  try {
    const listing = await updateMarketListing(
      request.userId,
      request.validated.params.listingId,
      request.validated.body,
    )

    return sendSuccess(response, listing)
  } catch (error) {
    return next(error)
  }
}

// 판매글 내리기
export async function withdrawMarketListingController(request, response, next) {
  try {
    await withdrawMarketListing(
      request.userId,
      request.validated.params.listingId,
    )

    return response.status(204).send()
  } catch (error) {
    return next(error)
  }
}

// 판매글 삭제(마이키친)
export async function deleteMarketListingController(request, response, next) {
  try {
    await deleteMarketListing(
      request.userId,
      request.validated.params.listingId,
    )

    return response.status(204).send()
  } catch (error) {
    return next(error)
  }
}
