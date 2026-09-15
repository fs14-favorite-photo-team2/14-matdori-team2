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
