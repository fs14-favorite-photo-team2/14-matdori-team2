import { useQuery } from '@tanstack/react-query'
import { getCurrentUser } from './api'

export const CURRENT_USER_QUERY_KEY = ['currentUser']

export default function useCurrentUser() {
  const {
    data: user,
    isPending,
    isRefetching,
    error,
    refetch,
  } = useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,
    queryFn: getCurrentUser,
  })

  return {
    user,
    isAuthenticated: Boolean(user),
    isLoading: isPending,
    isRefetching,
    error,
    refetch,
  }
}
