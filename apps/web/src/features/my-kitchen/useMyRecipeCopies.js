'use client'

import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { fetchMyRecipeCopies } from './api/recipeCopies'

export default function useMyRecipeCopies({
  limit,
  keyword,
  difficulty,
  category,
  state,
  sort,
  createdByMe,
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
    createdByMe: createdByMe === true ? true : undefined,
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

export function useMyRecipeCount({
  keyword,
  difficulty,
  category,
  state,
  createdByMe,
  enabled = true,
} = {}) {
  const isConfigured = Boolean(process.env.NEXT_PUBLIC_API_URL)

  const params = {
    keyword: keyword?.trim() || undefined,
    difficulty: difficulty || undefined,
    category: category || undefined,
    state: state || undefined,
    createdByMe: createdByMe === true ? true : undefined,
  }

  return useQuery({
    queryKey: queryKeys.myKitchen.count(params),
    queryFn: async () => {
      const response = await fetchMyRecipeCopies({
        ...params,
        limit: 1,
      })

      return response.meta.totalRecipeCount
    },
    enabled: isConfigured && enabled,
  })
}
