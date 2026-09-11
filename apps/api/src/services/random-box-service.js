import { ERROR_CODES } from '../constants/error-codes.js'
import { PRISMA_ERROR_CODES } from '../constants/prisma-error-codes.js'
import { AppError } from '../errors/app-error.js'
import {
  claimRandomBoxReward,
  findRandomBoxState,
} from '../repositories/user-repository.js'
import { getKstDayStart } from '../utils/kst.js'
import { drawRewardPoints, getRandomBoxStatus } from '../utils/random-box.js'

async function loadLastClaimedAt(userId) {
  const user = await findRandomBoxState(userId)

  if (!user) {
    throw AppError.from(ERROR_CODES.AUTHENTICATION_REQUIRED)
  }

  return user.lastRandomBoxClaimedAt
}

export async function getRandomBox(userId) {
  const lastClaimedAt = await loadLastClaimedAt(userId)

  return getRandomBoxStatus(lastClaimedAt, new Date())
}

export async function claimRandomBox(userId) {
  const now = new Date()
  const lastClaimedAt = await loadLastClaimedAt(userId)
  const { canClaim } = getRandomBoxStatus(lastClaimedAt, now)

  if (!canClaim) {
    throw AppError.from(ERROR_CODES.RANDOM_BOX_NOT_READY)
  }

  const rewardPoints = drawRewardPoints(lastClaimedAt)

  try {
    const { points } = await claimRandomBoxReward({
      id: userId,
      claimableSince: getKstDayStart(now),
      rewardPoints,
      claimedAt: now,
    })

    return {
      rewardPoints,
      currentPoints: points,
      nextClaimableAt: getKstDayStart(now, 1),
    }
  } catch (error) {
    if (error.code === PRISMA_ERROR_CODES.RECORD_NOT_FOUND) {
      throw AppError.from(ERROR_CODES.RANDOM_BOX_NOT_READY)
    }

    throw error
  }
}
