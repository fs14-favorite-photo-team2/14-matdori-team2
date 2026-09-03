import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'
import { findMarketListings } from '../repositories/market-repository.js'

export async function getMarketListings(query) {
  try {
    // 필터링한 판매레시피들 디비 조회
    const listings = await findMarketListings(query)

    // 다음 페이지 확인
    const hasNext = listings.length > query.limit

    // 다음 페이지 유무에 따른 데이터 컷팅
    const items = hasNext ? listings.slice(0, query.limit) : listings

    // 판매 레시피 사본 키값 재설정
    const data = items.map(({ _count, ...listing }) => ({
      ...listing,
      remainingQuantity: _count.copies,
    }))

    // 다음페이지 커서 생성
    const nextCursor =
      hasNext && data.length > 0 ? String(data[data.length - 1].id) : null

    return {
      data,
      meta: {
        nextCursor,
        hasNext,
      },
    }
  } catch (error) {
    if (error instanceof AppError) {
      throw error
    }

    // 예상치 못한
    throw AppError.from(ERROR_CODES.INTERNAL_SERVER_ERROR)
  }
}
