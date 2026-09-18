import { checkDatabaseConnection } from '../db/prisma.js'
import { sendSuccess } from '../http/response.js'

export function getHealthController(_request, response) {
  return sendSuccess(response, { status: 'ok' })
}

export async function getReadyController(_request, response, next) {
  try {
    await checkDatabaseConnection()

    return sendSuccess(response, { status: 'ready' })
  } catch (error) {
    return next(error)
  }
}
