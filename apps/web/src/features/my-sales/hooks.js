'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchMyMarketListings, fetchMySentTradeOffers } from './api'

export function useMyMarketListings(
  { keyword, difficulty, category, status } = {},
  { enabled = true } = {},
) {
  const params = {
    keyword: keyword?.trim() || undefined,
    difficulty: difficulty || undefined,
    category: category || undefined,
    status: status || undefined,
  }

  return useInfiniteQuery({
    queryKey: queryKeys.mySales.list(params),
    queryFn: ({ pageParam }) =>
      fetchMyMarketListings({
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.nextCursor : undefined,
    enabled,
  })
}

export function useMySentTradeOffers(
  { status, keyword, difficulty, category, listingStatus } = {},
  { enabled = true } = {},
) {
  const params = {
    status: status || undefined,
    keyword: keyword?.trim() || undefined,
    difficulty: difficulty || undefined,
    category: category || undefined,
    listingStatus: listingStatus || undefined,
  }

  return useInfiniteQuery({
    queryKey: queryKeys.tradeOffers.sent(params),
    queryFn: ({ pageParam }) =>
      fetchMySentTradeOffers({
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.nextCursor : undefined,
    enabled,
  })
}

export function useMyMarketListingCount(
  { keyword, difficulty, category, status } = {},
  { enabled = true } = {},
) {
  const params = {
    keyword: keyword?.trim() || undefined,
    difficulty: difficulty || undefined,
    category: category || undefined,
    status: status || undefined,
  }

  return useQuery({
    queryKey: queryKeys.mySales.count(params),
    queryFn: async () => {
      const response = await fetchMyMarketListings({
        ...params,
        limit: 1,
      })

      return response.meta.totalCount
    },
    enabled,
  })
}

export function useMySentTradeOfferCount(
  { status, keyword, difficulty, category, listingStatus } = {},
  { enabled = true } = {},
) {
  const params = {
    status: status || undefined,
    keyword: keyword?.trim() || undefined,
    difficulty: difficulty || undefined,
    category: category || undefined,
    listingStatus: listingStatus || undefined,
  }

  return useQuery({
    queryKey: queryKeys.tradeOffers.sentCount(params),
    queryFn: async () => {
      const response = await fetchMySentTradeOffers({
        ...params,
        limit: 1,
      })

      return response.meta.totalCount
    },
    enabled,
  })
}
