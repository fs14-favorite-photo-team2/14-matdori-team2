import { PrismaPg } from '@prisma/adapter-pg'

import { PrismaClient } from '../generated/prisma/client.ts'
import { pool } from './pool.js'

const adapter = new PrismaPg(pool, { disposeExternalPool: true })

export const prisma = new PrismaClient({ adapter })

export function checkDatabaseConnection() {
  return prisma.$queryRaw`SELECT 1`
}
