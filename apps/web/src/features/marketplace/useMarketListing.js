'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { getMarketListing } from './api'

export default function useMarketListing(listingId, { enabled = true } = {}) {
  const isConfigured = Boolean(process.env.NEXT_PUBLIC_API_URL)

  const query = useQuery({
    queryKey: queryKeys.marketplace.detail(listingId),
    queryFn: () => getMarketListing(listingId),
    enabled: isConfigured && enabled && Boolean(listingId),
  })

  return {
    ...query,
    isConfigured,
  }
}
