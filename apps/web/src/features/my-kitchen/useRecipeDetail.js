'use client'

import { useQuery } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { getRecipeDetail } from './api/recipes'

export default function useRecipeDetail(recipeId, { enabled = true } = {}) {
  const isConfigured = Boolean(process.env.NEXT_PUBLIC_API_URL)

  const query = useQuery({
    queryKey: queryKeys.recipes.detail(recipeId),
    queryFn: () => getRecipeDetail(recipeId),
    enabled: isConfigured && enabled && Boolean(recipeId),
  })

  return {
    ...query,
    isConfigured,
  }
}
