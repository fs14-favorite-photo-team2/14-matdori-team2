import { env } from '../config/env.js'
import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'

const SAFE_METHODS = ['GET', 'HEAD', 'OPTIONS']

export function verifyOrigin(request, _response, next) {
  const origin = request.get('origin')

  if (SAFE_METHODS.includes(request.method) || !origin) {
    return next()
  }

  const apiOrigin = `${request.protocol}://${request.get('host')}`

  if (origin !== apiOrigin && !env.clientOrigins.includes(origin)) {
    return next(AppError.from(ERROR_CODES.FORBIDDEN))
  }

  return next()
}
