import { object, refine } from 'superstruct'

import { CREATED_AT_SORTS, RECIPE_COPY_SORTS } from '../utils/sort-orders.js'
import {
  category,
  copyState,
  cursor,
  dateTime,
  difficulty,
  keyword,
  limit,
  listingStatus,
  listingType,
  nickname,
  request,
  sort,
  tradeOfferStatus,
} from './common-validator.js'

const cursorQuery = { cursor, limit }
const recipeQuery = { keyword, difficulty, category }

const dateRangeQuery = (query) =>
  refine(query, 'date range', ({ from, to }) =>
    !from || !to || to >= from ? true : 'to는 from 이후이거나 같아야 합니다.',
  )

export const getCurrentUserRequest = request()

export const updateCurrentUserRequest = request({
  body: object({ nickname }),
})

export const myRecipeCopiesRequest = request({
  query: object({
    ...cursorQuery,
    ...recipeQuery,
    state: copyState,
    sort: sort(RECIPE_COPY_SORTS),
  }),
})

export const myListingsRequest = request({
  query: object({
    ...cursorQuery,
    ...recipeQuery,
    listingType,
    status: listingStatus,
    sort: sort(CREATED_AT_SORTS),
  }),
})

export const myTradeOffersRequest = request({
  query: object({
    ...cursorQuery,
    status: tradeOfferStatus,
    sort: sort(CREATED_AT_SORTS),
  }),
})

export const myTradesRequest = request({
  query: dateRangeQuery(
    object({
      ...cursorQuery,
      from: dateTime,
      to: dateTime,
      sort: sort(CREATED_AT_SORTS),
    }),
  ),
})
