import { promisify } from 'node:util'

import { env, validateServerEnv } from './config/env.js'

validateServerEnv()

const { logger } = await import('./utils/logger.js')
const { default: app } = await import('./app.js')
const { pool } = await import('./db/pool.js')
const { prisma } = await import('./db/prisma.js')

const SHUTDOWN_TIMEOUT_MS = 20000
const IDLE_CONNECTION_SWEEP_MS = 100

const port = env.port

const server = app.listen(port, (error) => {
  if (error) {
    logger.error({ err: error }, 'API failed to start')
    return process.exit(1)
  }

  logger.info({ port }, 'API ready')

  if (!env.isProduction) {
    logger.info({ url: `http://localhost:${port}/docs` }, 'API docs available')
  }
})

const closeServer = promisify(server.close.bind(server))

let isShuttingDown = false

async function shutdown(reason) {
  if (isShuttingDown) return
  isShuttingDown = true

  logger.info({ reason }, 'Shutdown started')

  const shutdownTimeout = setTimeout(() => {
    logger.error('Shutdown timed out, forcing exit')
    process.exit(1)
  }, SHUTDOWN_TIMEOUT_MS)
  shutdownTimeout.unref()

  const idleConnectionSweep = setInterval(
    () => server.closeIdleConnections(),
    IDLE_CONNECTION_SWEEP_MS,
  )
  idleConnectionSweep.unref()

  try {
    await closeServer()
    clearInterval(idleConnectionSweep)
    await prisma.$disconnect()
    await pool.end()
  } catch (error) {
    logger.error({ err: error }, 'Shutdown failed')
    process.exit(1)
  }
}

process.once('SIGTERM', shutdown)
process.once('SIGINT', shutdown)
process.on('uncaughtException', (error, origin) => {
  logger.fatal({ err: error, origin }, 'Uncaught exception')
  process.exitCode = 1
  shutdown(origin)
})
