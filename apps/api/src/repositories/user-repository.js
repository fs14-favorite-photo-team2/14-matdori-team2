import { prisma } from '../db/prisma.js'

export function findUsersByEmailOrNickname(email, nickname) {
  return prisma.user.findMany({
    where: { OR: [{ email }, { nickname }] },
    select: { email: true, nickname: true },
  })
}

export function createUser({ email, nickname, passwordHash }) {
  return prisma.user.create({
    data: { email, nickname, passwordHash },
    select: {
      id: true,
      email: true,
      nickname: true,
      points: true,
    },
  })
}

export function findUserByEmail(email) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      nickname: true,
      points: true,
      passwordHash: true,
    },
  })
}
