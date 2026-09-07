import { ERROR_CATALOG, ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'
import { sendError } from '../http/response.js'

export function errorHandler(error, _request, response, _next) {
  if (error instanceof AppError) {
    const { status, code, message, details } = error

    return sendError(response, status, code, message, details)
  }

  if (error.status >= 400 && error.status < 500) {
    return sendError(
      response,
      error.status,
      ERROR_CODES.BAD_REQUEST,
      error.message,
    )
  }

  console.error(error)

  const { status, message } = ERROR_CATALOG[ERROR_CODES.INTERNAL_SERVER_ERROR]

  return sendError(response, status, ERROR_CODES.INTERNAL_SERVER_ERROR, message)
}
