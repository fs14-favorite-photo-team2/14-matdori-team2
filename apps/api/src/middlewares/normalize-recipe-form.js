import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'

export function normalizeRecipeForm(request, _response, next) {
  try {
    const body = { ...request.body }

    if (body.totalSupply !== undefined) {
      body.totalSupply = Number(body.totalSupply)
    }

    if (body.ingredients !== undefined) {
      try {
        body.ingredients = JSON.parse(body.ingredients)
      } catch {
        return next(
          AppError.from(ERROR_CODES.VALIDATION_ERROR, [
            {
              field: 'ingredients',
              reason: '재료 정보는 올바른 JSON 형식이어야 합니다.',
            },
          ]),
        )
      }
    }

    request.body = body

    return next()
  } catch (error) {
    return next(error)
  }
}
