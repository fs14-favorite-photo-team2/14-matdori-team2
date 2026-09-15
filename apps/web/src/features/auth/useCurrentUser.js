import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { getCurrentUser } from './api'

export const CURRENT_USER_QUERY_KEY = queryKeys.auth.currentUser()

export default function useCurrentUser({ enabled = true } = {}) {
  const {
    data: user,
    isPending,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: getCurrentUser,
    enabled,
  })

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading: enabled && isPending,
    isRefetching,
    error,
    refetch,
  }
}
