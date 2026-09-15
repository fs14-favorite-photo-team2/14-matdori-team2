'use client'

import { queryKeys } from '@/lib/queryKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  createMarketListing,
  purchaseMarketListing,
  updateMarketListing,
  withdrawMarketListing,
} from './api'

export function useCreateMarketListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMarketListing,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.marketplace.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.myKitchen.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.mySales.lists(),
        }),
      ])
    },
  })
}

export function useUpdateMarketListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ listingId, data }) => updateMarketListing(listingId, data),
    onSuccess: async (_, { listingId }) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.marketplace.detail(listingId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.marketplace.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.mySales.lists(),
        }),
      ])
    },
  })
}

export function useWithdrawMarketListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: withdrawMarketListing,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.marketplace.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.myKitchen.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.mySales.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tradeOffers.all,
        }),
      ])
    },
  })
}

export function usePurchaseMarketListing() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: purchaseMarketListing,
    onSuccess: async (_, listingId) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: queryKeys.auth.currentUser(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.marketplace.detail(listingId),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.marketplace.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.myKitchen.lists(),
        }),
        queryClient.invalidateQueries({
          queryKey: queryKeys.tradeOffers.all,
        }),
      ])
    },
  })
}
