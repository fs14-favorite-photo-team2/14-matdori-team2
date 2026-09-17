'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/queryKeys'
import { updateRecipe } from './api/recipes'

export default function useUpdateRecipe(recipeId, { onSuccess, onError } = {}) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (values) => updateRecipe(recipeId, values),

    onSuccess: async (updatedRecipe) => {
      queryClient.setQueryData(
        queryKeys.recipes.detail(recipeId),
        updatedRecipe,
      )

      await queryClient.invalidateQueries({
        queryKey: queryKeys.myKitchen.all,
      })

      onSuccess?.(updatedRecipe)
    },

    onError: (error) => {
      onError?.(error)
    },
  })
}
