import bcrypt from 'bcryptjs'

import { ERROR_CODES } from '../constants/error-codes.js'
import { PRISMA_ERROR_CODES } from '../constants/prisma-error-codes.js'
import { AppError } from '../errors/app-error.js'
import {
  connectGoogleAccount,
  createGoogleUser,
  createUser,
  findUserByEmail,
  findUserByGoogleId,
  findUsersByEmailOrNickname,
} from '../repositories/user-repository.js'
import { generateNickname } from '../utils/nickname.js'

const BCRYPT_SALT_ROUNDS = 12
const MAX_NICKNAME_ATTEMPTS = 20

export async function signup({ email, nickname, password }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)

  try {
    return await createUser({ email, nickname, passwordHash })
  } catch (error) {
    if (error.code !== PRISMA_ERROR_CODES.UNIQUE_VIOLATION) {
      throw error
    }

    const existingUsers = await findUsersByEmailOrNickname(email, nickname)

    if (existingUsers.some((user) => user.email === email)) {
      throw AppError.from(ERROR_CODES.EMAIL_ALREADY_EXISTS)
    }

    if (
      existingUsers.some(
        (user) => user.nickname.toLowerCase() === nickname.toLowerCase(),
      )
    ) {
      throw AppError.from(ERROR_CODES.NICKNAME_ALREADY_EXISTS)
    }

    throw error
  }
}

export async function login({ email, password }) {
  const user = await findUserByEmail(email)

  if (user && !user.passwordHash && user.googleId) {
    throw AppError.from(ERROR_CODES.GOOGLE_ACCOUNT_ONLY)
  }

  const passwordMatches =
    user?.passwordHash && (await bcrypt.compare(password, user.passwordHash))

  if (!passwordMatches) {
    throw AppError.from(ERROR_CODES.INVALID_CREDENTIALS)
  }

  return {
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    points: user.points,
  }
}

export async function authenticateWithGoogle({ googleId, email }) {
  const googleUser = await findUserByGoogleId(googleId)

  if (googleUser) {
    return googleUser
  }

  const emailUser = await findUserByEmail(email)

  if (emailUser) {
    if (emailUser.googleId && emailUser.googleId !== googleId) {
      throw AppError.from(ERROR_CODES.GOOGLE_ACCOUNT_CONFLICT)
    }

    return connectGoogleAccount(emailUser.id, googleId)
  }

  for (let attempt = 0; attempt < MAX_NICKNAME_ATTEMPTS; attempt += 1) {
    const nickname = generateNickname()

    try {
      return await createGoogleUser({ email, googleId, nickname })
    } catch (error) {
      if (error.code !== PRISMA_ERROR_CODES.UNIQUE_VIOLATION) {
        throw error
      }

      const concurrentlyCreatedUser = await findUserByGoogleId(googleId)

      if (concurrentlyCreatedUser) {
        return concurrentlyCreatedUser
      }
    }
  }

  throw AppError.from(ERROR_CODES.NICKNAME_GENERATION_FAILED)
}
