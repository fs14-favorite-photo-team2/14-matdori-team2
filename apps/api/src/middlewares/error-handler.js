import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'
import { sendError } from '../utils/response.js'

function isInvalidJson(error) {
  return error instanceof SyntaxError && error.status === 400 && 'body' in error
}

function normalizeError(error) {
  if (error instanceof AppError) return error

  if (isInvalidJson(error)) {
    return AppError.from(ERROR_CODES.BAD_REQUEST)
  }

  console.error(error)

  return AppError.from(ERROR_CODES.INTERNAL_SERVER_ERROR)
}

export function errorHandler(error, _request, response, _next) {
  const { status, code, message, details } = normalizeError(error)

  return sendError(response, status, code, message, details)
}
