'use client'

import { queryKeys } from '@/lib/queryKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { readNotification } from './api'

export default function useReadNotification() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: readNotification,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      })
    },
  })
}
