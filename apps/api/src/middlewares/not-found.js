import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'

export function notFoundHandler(_request, _response, next) {
  return next(AppError.from(ERROR_CODES.ROUTE_NOT_FOUND))
}
