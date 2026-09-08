import bcrypt from 'bcryptjs'

import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'
import {
  createUser,
  findUserByEmail,
  findUsersByEmailOrNickname,
} from '../repositories/user-repository.js'

const BCRYPT_SALT_ROUNDS = 12

export async function signup({ email, nickname, password }) {
  const passwordHash = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS)

  try {
    return await createUser({ email, nickname, passwordHash })
  } catch (error) {
    if (error.code !== 'P2002') {
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
