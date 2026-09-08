import { prisma } from '../db/prisma.js'

const authUserSelect = {
  id: true,
  email: true,
  nickname: true,
  points: true,
}

export function findUsersByEmailOrNickname(email, nickname) {
  return prisma.user.findMany({
    where: { OR: [{ email }, { nickname }] },
    select: { email: true, nickname: true },
  })
}

export function createUser({ email, nickname, passwordHash }) {
  return prisma.user.create({
    data: { email, nickname, passwordHash },
    select: authUserSelect,
  })
}

export function findUserByGoogleId(googleId) {
  return prisma.user.findUnique({
    where: { googleId },
    select: authUserSelect,
  })
}

export function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
    select: { ...authUserSelect, googleId: true, passwordHash: true },
  })
}

export function connectGoogleAccount(userId, googleId) {
  return prisma.user.update({
    where: { id: userId },
    data: { googleId },
    select: authUserSelect,
  })
}

export function createGoogleUser({ email, googleId, nickname }) {
  return prisma.user.create({
    data: { email, googleId, nickname },
    select: authUserSelect,
  })
}
