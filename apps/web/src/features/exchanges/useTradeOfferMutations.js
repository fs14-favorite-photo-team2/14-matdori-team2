'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import {
  acceptTradeOffer,
  cancelTradeOffer,
  createTradeOffer,
  rejectTradeOffer,
} from './api'

function invalidateTradeOfferQueries(queryClient, listingId) {
  return Promise.all([
    queryClient.invalidateQueries({
      queryKey: queryKeys.tradeOffers.all,
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
      queryKey: queryKeys.mySales.lists(),
    }),
  ])
}

export function useCreateTradeOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ listingId, offeredCopyId, message }) =>
      createTradeOffer(listingId, {
        offeredCopyId,
        message,
      }),
    onSuccess: async (_, { listingId }) => {
      await invalidateTradeOfferQueries(queryClient, listingId)
    },
  })
}

export function useCancelTradeOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tradeOfferId }) => cancelTradeOffer(tradeOfferId),
    onSuccess: async (_, { listingId }) => {
      await invalidateTradeOfferQueries(queryClient, listingId)
    },
  })
}

export function useAcceptTradeOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tradeOfferId }) => acceptTradeOffer(tradeOfferId),
    onSuccess: async (_, { listingId }) => {
      await invalidateTradeOfferQueries(queryClient, listingId)
    },
  })
}

export function useRejectTradeOffer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ tradeOfferId }) => rejectTradeOffer(tradeOfferId),
    onSuccess: async (_, { listingId }) => {
      await invalidateTradeOfferQueries(queryClient, listingId)
    },
  })
}
