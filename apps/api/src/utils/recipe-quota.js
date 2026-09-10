import { getKstMonthStart } from './kst.js'

export const RECIPE_CREATION_LIMIT = 3

export function getRecipeCreationQuota(createdThisMonth, now) {
  const used = Math.min(createdThisMonth, RECIPE_CREATION_LIMIT)

  return {
    limit: RECIPE_CREATION_LIMIT,
    used,
    remaining: RECIPE_CREATION_LIMIT - used,
    resetsAt: getKstMonthStart(now, 1),
  }
}
