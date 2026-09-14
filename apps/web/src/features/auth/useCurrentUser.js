import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from './api'

export const CURRENT_USER_QUERY_KEY = ['currentUser']

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
