'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { getMarketListings } from './api'

export const MARKET_LISTINGS_QUERY_KEY = ['market-listings']

export default function useMarketListings({
  limit,
  keyword,
  filters,
  sort,
  enabled = true,
}) {
  const isConfigured = Boolean(process.env.NEXT_PUBLIC_API_URL)

  const query = useInfiniteQuery({
    queryKey: [
      ...MARKET_LISTINGS_QUERY_KEY,
      {
        limit,
        keyword,
        difficulty: filters.difficulty,
        category: filters.category,
        status: filters.status,
        listingType: filters.listingType,
        sort,
      },
    ],
    queryFn: ({ pageParam }) =>
      getMarketListings({
        cursor: pageParam,
        limit,
        keyword,
        difficulty: filters.difficulty,
        category: filters.category,
        status: filters.status,
        listingType: filters.listingType,
        sort,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.nextCursor : undefined,
    enabled: isConfigured && enabled,
  })

  return {
    ...query,
    isConfigured,
  }
}
