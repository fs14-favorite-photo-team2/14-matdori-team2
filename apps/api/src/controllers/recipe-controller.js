import { sendSuccess } from '../http/response.js'
import {
  createRecipe,
  getRecipe,
  updateRecipe,
} from '../services/recipe-service.js'

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

export async function getRecipeController(request, response, next) {
  try {
    const recipe = await getRecipe(
      request.userId,
      request.validated.params.recipeId,
    )

    return sendSuccess(response, recipe)
  } catch (error) {
    return next(error)
  }
}

export async function updateRecipeController(request, response, next) {
  try {
    const recipe = await updateRecipe(
      request.userId,
      request.validated.params.recipeId,
      request.validated.body,
      request.files,
    )

    return sendSuccess(response, recipe)
  } catch (error) {
    return next(error)
  }
}
