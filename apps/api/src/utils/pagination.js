import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'

export const DEFAULT_CURSOR_LIMIT = 20
export const MAX_CURSOR_LIMIT = 50

export function toCursorPage(rows, limit, serialize = (row) => row) {
  if (rows === null) {
    throw AppError.from(ERROR_CODES.VALIDATION_ERROR, [
      { field: 'cursor', reason: '더 이상 유효하지 않은 커서입니다.' },
    ])
  }

  const hasNext = rows.length > limit
  const page = hasNext ? rows.slice(0, limit) : rows

  return {
    data: page.map(serialize),
    meta: {
      nextCursor: hasNext ? String(page.at(-1).id) : null,
      hasNext,
    },
  }
}
