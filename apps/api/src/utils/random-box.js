export const RANDOM_BOX_COOLDOWN_MS = 60 * 60 * 1000

export function getRandomBoxStatus(lastClaimedAt, now) {
  if (!lastClaimedAt) {
    return { canClaim: true, lastClaimedAt: null, nextClaimableAt: null }
  }

  const nextClaimableAt = new Date(
    lastClaimedAt.getTime() + RANDOM_BOX_COOLDOWN_MS,
  )
  const canClaim = nextClaimableAt <= now

  return {
    canClaim,
    lastClaimedAt,
    nextClaimableAt: canClaim ? null : nextClaimableAt,
  }
}
