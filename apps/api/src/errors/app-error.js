import { ERROR_CATALOG } from '../constants/error-codes.js'

export class AppError extends Error {
  constructor(status, code, message, details) {
    super(message)
    this.name = 'AppError'
    this.status = status
    this.code = code
    this.details = details
  }

  static from(code, details) {
    const entry = ERROR_CATALOG[code]

    if (!entry) throw new Error(`Unknown error code: ${code}`)

    return new AppError(entry.status, code, entry.message, details)
  }
}
