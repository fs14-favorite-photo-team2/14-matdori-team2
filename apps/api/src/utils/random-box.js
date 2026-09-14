import { getKstDayStart } from './kst.js'

export const FIRST_REWARD_RANGE = Object.freeze({ min: 10, max: 15 })
export const DAILY_REWARD_RANGE = Object.freeze({ min: 1, max: 5 })

export function getRandomBoxStatus(lastClaimedAt, now) {
  const canClaim = !lastClaimedAt || lastClaimedAt < getKstDayStart(now)

  return {
    canClaim,
    lastClaimedAt: lastClaimedAt ?? null,
    nextClaimableAt: canClaim ? null : getKstDayStart(now, 1),
  }
}

export function drawRewardPoints(lastClaimedAt) {
  const { min, max } = lastClaimedAt ? DAILY_REWARD_RANGE : FIRST_REWARD_RANGE

  return min + Math.floor(Math.random() * (max - min + 1))
}
