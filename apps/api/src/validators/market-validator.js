import {
  array,
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
  refine,
  size,
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

const SORT_OPTIONS = ['newest', 'oldest', 'price_asc', 'price_desc']

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

const queryInteger = coerce(min(integer(), 0), string(), (value) =>
  Number(value),
)

const cursor = optional(
  coerce(min(integer(), 1), string(), (value) => Number(value)),
)

const limit = defaulted(
  coerce(max(min(integer(), 1), 100), string(), (value) => Number(value)),
  20,
)

const minPrice = optional(queryInteger)

const maxPrice = optional(queryInteger)

const sort = defaulted(enums(SORT_OPTIONS), 'newest')

const marketListingsQuery = refine(
  object({
    keyword,
    difficulty,
    category,
    listingType,
    soldOut,
    cursor,
    limit,
    minPrice,
    maxPrice,
    sort,
  }),
  'price range',
  ({ minPrice: minimumPrice, maxPrice: maximumPrice }) => {
    if (
      minimumPrice !== undefined &&
      maximumPrice !== undefined &&
      minimumPrice > maximumPrice
    ) {
      return 'minPrice는 maxPrice보다 클 수 없습니다.'
    }

    return true
  },
)

export const getMarketListingsRequest = object({
  body: object({}),
  params: object({}),
  query: marketListingsQuery,
})

const recipeCopyIds = refine(
  size(array(min(integer(), 1)), 1, 10),
  'unique recipe copy ids',
  (values) => {
    return (
      new Set(values).size === values.length ||
      'recipeCopyIds에는 중복된 사본 ID를 넣을 수 없습니다.'
    )
  },
)

const createMarketListingBody = refine(
  object({
    recipeCopyIds,
    listingType: enums(LISTING_TYPES),
    price: optional(max(min(integer(), 0), 100_000_000)),
    wantedDifficulty: optional(enums(DIFFICULTIES)),
    wantedCategory: optional(enums(CATEGORIES)),
    wantedDescription: optional(size(string(), 0, 500)),
  }),
  'listing type requirements',
  ({ listingType, price }) => {
    if (
      (listingType === 'SALE' || listingType === 'BOTH') &&
      price === undefined
    ) {
      return 'SALE 또는 BOTH 방식에서는 price가 필요합니다.'
    }

    return true
  },
)

export const createMarketListingRequest = object({
  body: createMarketListingBody,
  params: object({}),
  query: object({}),
})
