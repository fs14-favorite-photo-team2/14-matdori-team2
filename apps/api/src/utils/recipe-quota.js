export const RECIPE_CREATION_LIMIT = 3

const KST_OFFSET_MS = 9 * 60 * 60 * 1000

export function getKstMonthStart(now, offset = 0) {
  const kstNow = new Date(now.getTime() + KST_OFFSET_MS)
  const kstMonthStart = Date.UTC(
    kstNow.getUTCFullYear(),
    kstNow.getUTCMonth() + offset,
    1,
  )

  return new Date(kstMonthStart - KST_OFFSET_MS)
}

export function getRecipeCreationQuota(createdThisMonth, now) {
  const used = Math.min(createdThisMonth, RECIPE_CREATION_LIMIT)

  return {
    limit: RECIPE_CREATION_LIMIT,
    used,
    remaining: RECIPE_CREATION_LIMIT - used,
    resetsAt: getKstMonthStart(now, 1),
  }
}
