'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { getMarketListings } from './api'

export default function useMarketListings({
  limit,
  keyword,
  filters,
  sort,
  enabled = true,
}) {
  const isConfigured = Boolean(process.env.NEXT_PUBLIC_API_URL)

  const query = useInfiniteQuery({
    queryKey: queryKeys.marketplace.list({
      limit,
      keyword,
      difficulty: filters.difficulty,
      category: filters.category,
      status: filters.status,
      listingType: filters.listingType,
      sort,
    }),

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

export function useMarketListingCount({ keyword, filters, enabled = true }) {
  const isConfigured = Boolean(process.env.NEXT_PUBLIC_API_URL)

  const params = {
    keyword: keyword?.trim() || undefined,
    difficulty: filters.difficulty || undefined,
    category: filters.category || undefined,
    status: filters.status || undefined,
    listingType: filters.listingType || undefined,
  }

  return useQuery({
    queryKey: queryKeys.marketplace.count(params),
    queryFn: async () => {
      const response = await getMarketListings({
        ...params,
        limit: 1,
        sort: 'newest',
      })

      return response.meta.totalCount
    },
    enabled: isConfigured && enabled,
  })
}
