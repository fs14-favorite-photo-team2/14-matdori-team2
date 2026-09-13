import { sendSuccess } from '../http/response.js'
import { createRecipe } from '../services/recipe-service.js'

export async function createRecipeController(request, response, next) {
  try {
    const recipe = await createRecipe(
      request.userId,
      request.validated.body,
      request.files,
    )

    return sendSuccess(response, recipe, {
      status: 201,
    })
  } catch (error) {
    return next(error)
  }
}
