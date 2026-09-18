import { rateLimit } from 'express-rate-limit'

import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'

const ONE_MINUTE_MS = 60 * 1000

function createRateLimit(options) {
  return rateLimit({
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: (_request, _response, next) =>
      next(AppError.from(ERROR_CODES.TOO_MANY_REQUESTS)),
    ...options,
  })
}

export const apiRateLimit = createRateLimit({
  windowMs: ONE_MINUTE_MS,
  limit: 300,
})

export const loginRateLimit = createRateLimit({
  windowMs: 15 * ONE_MINUTE_MS,
  limit: 30,
  skipSuccessfulRequests: true,
  requestWasSuccessful: (_request, response) => response.statusCode !== 401,
})

export const signupRateLimit = createRateLimit({
  windowMs: 60 * ONE_MINUTE_MS,
  limit: 30,
  skipFailedRequests: true,
})

export const randomBoxClaimRateLimit = createRateLimit({
  windowMs: ONE_MINUTE_MS,
  limit: 10,
  keyGenerator: (request) => String(request.userId),
})
