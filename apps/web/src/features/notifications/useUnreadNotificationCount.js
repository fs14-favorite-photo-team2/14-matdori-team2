'use client'

import { queryKeys } from '@/lib/queryKeys'
import { useQuery } from '@tanstack/react-query'
import { getUnreadNotificationCount } from './api'

export default function useUnreadNotificationCount({ enabled = true } = {}) {
  const isConfigured = Boolean(process.env.NEXT_PUBLIC_API_URL)

  const query = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: getUnreadNotificationCount,
    enabled: isConfigured && enabled,
  })

  return {
    ...query,
    isConfigured,
  }
}
