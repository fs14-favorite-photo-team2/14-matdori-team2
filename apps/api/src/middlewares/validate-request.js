import { validate } from 'superstruct'
import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'

const UNKNOWN_FIELD_MESSAGE = '허용되지 않은 필드입니다.'

export function validateRequest(struct) {
  return (request, _response, next) => {
    try {
      const [error, validated] = validate(
        {
          body: request.body ?? {},
          params: request.params,
          query: request.query,
        },
        struct,
        { coerce: true },
      )

      if (!error) {
        request.validated = validated

        return next()
      }

      const details = [...error.failures()].map((failure) => ({
        field: failure.path.slice(1).join('.') || null,
        reason:
          failure.type === 'never' ? UNKNOWN_FIELD_MESSAGE : failure.message,
      }))

      return next(AppError.from(ERROR_CODES.VALIDATION_ERROR, details))
    } catch (error) {
      return next(error)
    }
  }
}
