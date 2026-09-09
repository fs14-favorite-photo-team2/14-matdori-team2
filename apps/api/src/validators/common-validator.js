import {
  coerce,
  defaulted,
  define,
  object,
  optional,
  string,
} from 'superstruct'

import {
  Category,
  CopyState,
  Difficulty,
  ListingStatus,
  ListingType,
  TradeOfferStatus,
} from '../generated/prisma/enums.ts'
import { DEFAULT_CURSOR_LIMIT, MAX_CURSOR_LIMIT } from '../utils/pagination.js'

const MAX_INT_ID = 2147483647
const KEYWORD_MAX_LENGTH = 100
const NICKNAME_MIN_LENGTH = 2
const NICKNAME_MAX_LENGTH = 20
const NICKNAME_PATTERN = /^[A-Za-z0-9가-힣_-]+$/
const DATE_TIME_PATTERN =
  /^(\d{4})-(\d{2})-(\d{2})T([01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d)$/

const empty = object({})

function option(name, values, message) {
  return define(name, (value) => values.includes(value) || message)
}

function toDateTime(value) {
  const match = DATE_TIME_PATTERN.exec(value)

  if (!match) {
    return new Date(NaN)
  }

  const [, year, month, day] = match
  const calendarDate = new Date(`${year}-${month}-${day}T00:00:00Z`)

  if (
    calendarDate.getUTCMonth() + 1 !== Number(month) ||
    calendarDate.getUTCDate() !== Number(day)
  ) {
    return new Date(NaN)
  }

  return new Date(value)
}

export const nickname = define('nickname', (value) => {
  if (typeof value !== 'string') {
    return '닉네임을 입력해 주세요.'
  }

  if (
    value.length < NICKNAME_MIN_LENGTH ||
    value.length > NICKNAME_MAX_LENGTH
  ) {
    return `닉네임은 ${NICKNAME_MIN_LENGTH}자 이상 ${NICKNAME_MAX_LENGTH}자 이하여야 합니다.`
  }

  return (
    NICKNAME_PATTERN.test(value) ||
    '닉네임은 한글, 영문, 숫자와 _, -만 사용할 수 있습니다.'
  )
})

export const cursor = optional(
  coerce(
    define(
      'cursor',
      (value) =>
        (Number.isInteger(value) && value > 0 && value <= MAX_INT_ID) ||
        '커서 값이 올바르지 않습니다.',
    ),
    string(),
    (value) => Number(value),
  ),
)

export const limit = defaulted(
  coerce(
    define(
      'limit',
      (value) =>
        (Number.isInteger(value) && value >= 1 && value <= MAX_CURSOR_LIMIT) ||
        `조회 개수는 1 이상 ${MAX_CURSOR_LIMIT} 이하의 정수여야 합니다.`,
    ),
    string(),
    (value) => Number(value),
  ),
  DEFAULT_CURSOR_LIMIT,
)

export const keyword = optional(
  coerce(
    define('keyword', (value) => {
      if (typeof value !== 'string') {
        return '검색어를 입력해 주세요.'
      }

      return (
        (value.length >= 1 && value.length <= KEYWORD_MAX_LENGTH) ||
        `검색어는 1자 이상 ${KEYWORD_MAX_LENGTH}자 이하여야 합니다.`
      )
    }),
    string(),
    (value) => value.trim(),
  ),
)

export const dateTime = optional(
  coerce(
    define(
      'dateTime',
      (value) =>
        (value instanceof Date && !Number.isNaN(value.getTime())) ||
        'ISO 8601 형식의 날짜와 시각을 입력해 주세요.',
    ),
    string(),
    toDateTime,
  ),
)

export const difficulty = optional(
  option(
    'difficulty',
    Object.values(Difficulty),
    '난이도 값이 올바르지 않습니다.',
  ),
)

export const category = optional(
  option(
    'category',
    Object.values(Category),
    '카테고리 값이 올바르지 않습니다.',
  ),
)

export const copyState = optional(
  option(
    'state',
    Object.values(CopyState),
    '보유 상태 값이 올바르지 않습니다.',
  ),
)

export const listingType = optional(
  option(
    'listingType',
    Object.values(ListingType),
    '판매 방식 값이 올바르지 않습니다.',
  ),
)

export const listingStatus = optional(
  option(
    'status',
    Object.values(ListingStatus),
    '판매 상태 값이 올바르지 않습니다.',
  ),
)

export const tradeOfferStatus = optional(
  option(
    'status',
    Object.values(TradeOfferStatus),
    '교환 제안 상태 값이 올바르지 않습니다.',
  ),
)

export function sort(values) {
  return defaulted(
    option('sort', values, '정렬 값이 올바르지 않습니다.'),
    values[0],
  )
}

export function request({ body = empty, params = empty, query = empty } = {}) {
  return object({ body, params, query })
}
