import { object } from 'superstruct'

import { CREATED_AT_SORTS } from '../utils/sort-orders.js'
import {
  cursor,
  id,
  limit,
  request,
  sort,
  tradeOfferMessage,
  tradeOfferStatus,
} from './common-validator.js'

const listingParams = object({
  listingId: id('listingId', '판매글 ID가 올바르지 않습니다.'),
})

export const createTradeOfferRequest = request({
  params: listingParams,
  body: object({
    offeredCopyId: id('offeredCopyId', '레시피 사본 ID가 올바르지 않습니다.'),
    message: tradeOfferMessage,
  }),
})

export const listingTradeOffersRequest = request({
  params: listingParams,
  query: object({
    cursor,
    limit,
    status: tradeOfferStatus,
    sort: sort(CREATED_AT_SORTS),
  }),
})

export const tradeOfferRequest = request({
  params: object({
    tradeOfferId: id('tradeOfferId', '교환 제안 ID가 올바르지 않습니다.'),
  }),
})
