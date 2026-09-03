import {
  boolean,
  coerce,
  defaulted,
  define,
  enums,
  integer,
  max,
  min,
  object,
  optional,
  string,
} from 'superstruct'

const DIFFICULTIES = ['EASY', 'NORMAL', 'HARD', 'MASTER']

const CATEGORIES = [
  'KOREAN',
  'WESTERN',
  'CHINESE',
  'JAPANESE',
  'ASIAN',
  'HOME_BAKING',
  'BEVERAGE',
  'SAUCE',
  'CONVENIENCE',
  'FUSION',
]

const LISTING_TYPES = ['SALE', 'EXCHANGE', 'BOTH']

const keyword = optional(
  coerce(
    define('keyword', (value) => {
      if (typeof value !== 'string') {
        return '검색어는 문자열이어야 합니다.'
      }

      if (value.length > 100) {
        return '검색어는 100자를 넘을 수 없습니다.'
      }

      return true
    }),
    string(),
    (value) => value.trim(),
  ),
)

const difficulty = optional(enums(DIFFICULTIES))

const category = optional(enums(CATEGORIES))

const listingType = optional(enums(LISTING_TYPES))

const soldOutString = define('soldOut', (value) => {
  return (
    value === 'true' ||
    value === 'false' ||
    'soldOut은 true 또는 false여야 합니다.'
  )
})

const soldOut = optional(
  coerce(boolean(), soldOutString, (value) => value === 'true'),
)

const cursor = optional(
  coerce(min(integer(), 1), string(), (value) => Number(value)),
)

const limit = defaulted(
  coerce(max(min(integer(), 1), 100), string(), (value) => Number(value)),
  20,
)

export const getMarketListingsRequest = object({
  body: object({}),
  params: object({}),
  query: object({
    keyword,
    difficulty,
    category,
    listingType,
    soldOut,
    cursor,
    limit,
  }),
})
