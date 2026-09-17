'use client'

import { queryKeys } from '@/lib/queryKeys'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { readAllNotifications } from './api'

export default function useReadAllNotifications() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: readAllNotifications,

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.all,
      })
    },
  })
}
