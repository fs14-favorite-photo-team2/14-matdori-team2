import api from '@/lib/api'

export async function getMarketListings({
  cursor,
  limit,
  keyword,
  difficulty,
  category,
  status,
  listingType,
  sort,
}) {
  const soldOut =
    status === 'SOLD_OUT' ? true : status === 'ON_SALE' ? false : undefined

  const response = await api.get('/market-listings', {
    params: {
      cursor: cursor ?? undefined,
      limit,
      keyword: keyword || undefined,
      difficulty: difficulty || undefined,
      category: category || undefined,
      soldOut,
      listingType: listingType || undefined,
      sort,
    },
  })

  return response.data
}
export async function getMarketListing(listingId) {
  const response = await api.get(`/market-listings/${listingId}`)
  return response.data.data
}

export async function createMarketListing(data) {
  const response = await api.post('/market-listings', data)
  return response.data.data
}

export async function updateMarketListing(listingId, data) {
  const response = await api.patch(`/market-listings/${listingId}`, data)
  return response.data.data
}

export async function withdrawMarketListing(listingId) {
  await api.post(`/market-listings/${listingId}/withdraw`)
}

export async function deleteMarketListing(listingId) {
  await api.delete(`/market-listings/${listingId}`)
}

export async function purchaseMarketListing(listingId) {
  const response = await api.post(`/market-listings/${listingId}/purchases`)
  return response.data.data
}
