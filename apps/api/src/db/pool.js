import { Pool } from 'pg'

import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'

export const pool = new Pool({
  connectionString: env.databaseUrl,
})

pool.on('error', (error) => {
  logger.error({ err: error }, 'PG Pool error')
})
