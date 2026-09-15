import api from '@/lib/api'

export async function fetchMyMarketListings(params) {
  const { data } = await api.get('/users/me/market-listings', { params })
  return data
}

export async function fetchMySentTradeOffers(params) {
  const { data } = await api.get('/users/me/trade-offers', { params })
  return data
}

export async function fetchMarketListingDetail(listingId) {
  const { data } = await api.get(`/market-listings/${listingId}`)
  return data.data
}
