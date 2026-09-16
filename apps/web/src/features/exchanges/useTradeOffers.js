'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { getListingTradeOffers, getSentTradeOffers } from './api'

function getNextPageParam(lastPage) {
  if (!lastPage.meta?.hasNext) return undefined
  return lastPage.meta.nextCursor
}

function getTradeOffers(data) {
  return data?.pages.flatMap((page) => page.data ?? []) ?? []
}

export function useSentTradeOffers(params = {}, { enabled = true } = {}) {
  const isConfigured = Boolean(process.env.NEXT_PUBLIC_API_URL)

  const query = useInfiniteQuery({
    queryKey: queryKeys.tradeOffers.sent(params),
    queryFn: ({ pageParam }) =>
      getSentTradeOffers({
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: undefined,
    getNextPageParam,
    enabled: isConfigured && enabled,
  })

  return {
    ...query,
    tradeOffers: getTradeOffers(query.data),
    isConfigured,
  }
}

export function useListingTradeOffers(
  listingId,
  params = {},
  { enabled = true } = {},
) {
  const isConfigured = Boolean(process.env.NEXT_PUBLIC_API_URL)

  const query = useInfiniteQuery({
    queryKey: queryKeys.tradeOffers.byListing(listingId, params),
    queryFn: ({ pageParam }) =>
      getListingTradeOffers(listingId, {
        ...params,
        cursor: pageParam,
      }),
    initialPageParam: undefined,
    getNextPageParam,
    enabled: isConfigured && enabled && Boolean(listingId),
  })

  return {
    ...query,
    tradeOffers: getTradeOffers(query.data),
    isConfigured,
  }
}
