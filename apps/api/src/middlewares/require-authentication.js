import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'

export function requireAuthentication(request, _response, next) {
  const userId = request.session.userId

  if (!userId) {
    return next(AppError.from(ERROR_CODES.AUTHENTICATION_REQUIRED))
  }

  request.userId = userId

  return next()
}
