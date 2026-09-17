import api from '@/lib/api'

export async function getSentTradeOffers({ cursor, limit, status, sort } = {}) {
  const response = await api.get('/users/me/trade-offers', {
    params: {
      cursor: cursor ?? undefined,
      limit: limit ?? undefined,
      status: status || undefined,
      sort: sort || undefined,
    },
  })

  return response.data
}

export async function getListingTradeOffers(
  listingId,
  { cursor, limit, status, sort } = {},
) {
  const response = await api.get(`/market-listings/${listingId}/trade-offers`, {
    params: {
      cursor: cursor ?? undefined,
      limit: limit ?? undefined,
      status: status || undefined,
      sort: sort || undefined,
    },
  })

  return response.data
}

export async function createTradeOffer(listingId, data) {
  const response = await api.post(
    `/market-listings/${listingId}/trade-offers`,
    data,
  )

  return response.data.data
}

export async function acceptTradeOffer(tradeOfferId) {
  const response = await api.post(`/trade-offers/${tradeOfferId}/accept`)
  return response.data.data
}

export async function rejectTradeOffer(tradeOfferId) {
  const response = await api.post(`/trade-offers/${tradeOfferId}/reject`)
  return response.data.data
}

export async function cancelTradeOffer(tradeOfferId) {
  await api.delete(`/trade-offers/${tradeOfferId}`)
}
