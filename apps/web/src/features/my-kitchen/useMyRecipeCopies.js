'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchMyRecipeCopies } from './api/recipeCopies'

export default function useMyRecipeCopies({
  limit,
  keyword,
  difficulty,
  category,
  state,
  sort,
  enabled = true,
} = {}) {
  const isConfigured = Boolean(process.env.NEXT_PUBLIC_API_URL)

  const params = {
    limit,
    keyword: keyword?.trim() || undefined,
    difficulty: difficulty || undefined,
    category: category || undefined,
    state: state || undefined,
    sort: sort || undefined,
  }

  const query = useInfiniteQuery({
    queryKey: queryKeys.myKitchen.list(params),

    queryFn: ({ pageParam }) =>
      fetchMyRecipeCopies({
        ...params,
        cursor: pageParam,
      }),

    initialPageParam: undefined,

    getNextPageParam: (lastPage) =>
      lastPage.meta.hasNext ? lastPage.meta.nextCursor : undefined,

    enabled: isConfigured && enabled,
  })

  const recipeCopies =
    query.data?.pages.flatMap((page) => page.data ?? []) ?? []

  return {
    ...query,
    recipeCopies,
    isConfigured,
  }
}
