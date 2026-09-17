'use client'

import { queryKeys } from '@/lib/queryKeys'
import { useInfiniteQuery } from '@tanstack/react-query'
import { getNotifications } from './api'

export default function useNotifications({ limit = 20, enabled = true } = {}) {
  const isConfigured = Boolean(process.env.NEXT_PUBLIC_API_URL)

  const query = useInfiniteQuery({
    queryKey: queryKeys.notifications.list({ limit }),

    queryFn: ({ pageParam }) =>
      getNotifications({
        cursor: pageParam,
        limit,
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
