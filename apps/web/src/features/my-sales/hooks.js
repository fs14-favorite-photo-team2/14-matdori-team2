'use client'

import { useInfiniteQuery, useQueries } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import {
  fetchMarketListingDetail,
  fetchMyMarketListings,
  fetchMySentTradeOffers,
} from './api'

export function useMyMarketListings({ keyword, difficulty, category } = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.mySales.list({ keyword, difficulty, category }),
    queryFn: ({ pageParam }) =>
      fetchMyMarketListings({
        cursor: pageParam,
        keyword: keyword || undefined,
        difficulty: difficulty || undefined,
        category: category || undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.nextCursor : undefined,
  })
}

export function useMySentTradeOffers({ status } = {}) {
  return useInfiniteQuery({
    queryKey: queryKeys.tradeOffers.sent({ status }),
    queryFn: ({ pageParam }) =>
      fetchMySentTradeOffers({
        cursor: pageParam,
        status: status || undefined,
      }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.nextCursor : undefined,
  })
}

export function usePendingOfferListingDetails(listingIds = []) {
  return useQueries({
    queries: listingIds.map((listingId) => ({
      queryKey: queryKeys.marketplace.detail(listingId),
      queryFn: () => fetchMarketListingDetail(listingId),
      staleTime: 5 * 60 * 1000,
    })),
  })
}
