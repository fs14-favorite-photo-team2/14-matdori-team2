import { promisify } from 'node:util'

import { env, validateServerEnv } from './config/env.js'

validateServerEnv()

const { default: app } = await import('./app.js')
const { pool } = await import('./db/pool.js')
const { prisma } = await import('./db/prisma.js')

const SHUTDOWN_TIMEOUT_MS = 20000
const IDLE_CONNECTION_SWEEP_MS = 100

const port = env.port

const server = app.listen(port, () => {
  console.log(`API ready at http://localhost:${port}`)
  console.log(`Health check: http://localhost:${port}/health`)
  console.log(`Ready check: http://localhost:${port}/ready`)

  if (!env.isProduction) {
    console.log(`API docs: http://localhost:${port}/docs`)
  }
})

const closeServer = promisify(server.close.bind(server))

let isShuttingDown = false

async function shutdown(reason) {
  if (isShuttingDown) return
  isShuttingDown = true

  console.log(`${reason} received, shutting down`)

  const shutdownTimeout = setTimeout(() => {
    console.error('Shutdown timed out, forcing exit')
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
    console.error(error)
    process.exit(1)
  }
}

process.once('SIGTERM', shutdown)
process.once('SIGINT', shutdown)
process.on('uncaughtException', (error, origin) => {
  console.error(error)
  process.exitCode = 1
  shutdown(origin)
})
