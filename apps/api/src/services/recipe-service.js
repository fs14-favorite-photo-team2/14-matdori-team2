import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'
import {
  createRecipeRecord,
  toRecipeDetail,
  findRecipeDetailById,
} from '../repositories/recipe-repository.js'
import {
  removeRecipeImageFiles,
  saveRecipeImages,
} from '../utils/save-recipe-images.js'

export async function createRecipe(userId, input, files) {
  // 월간 생성 제한 정책이 확정되면 이 위치에서 검사 (ex. 월 10회 생성, 5분 내 10회 이상 생성 제한 등)

  // 이미지부터 저장 (db용, 서버파일관리용)
  const { imageUrls, filePaths } = await saveRecipeImages(files)

  let recipe

  try {
    recipe = await createRecipeRecord({
      creatorId: userId,
      ...input,
      imageUrls,
    })
  } catch {
    // DB 생성에 실패하면 이미 저장된 이미지 파일 제거
    await removeRecipeImageFiles(filePaths)

    throw AppError.from(ERROR_CODES.INTERNAL_SERVER_ERROR)
  }

  return toRecipeDetail(recipe)
}

// id 상세조회
export async function getRecipe(userId, recipeId) {
  const recipe = await findRecipeDetailById(recipeId, userId)

  if (!recipe) {
    throw AppError.from(ERROR_CODES.RESOURCE_NOT_FOUND)
  }

  const { _count, ...recipeDetail } = recipe

  const isCreator = recipe.creator.id === userId
  const ownsCopy = _count.copies > 0

  if (!isCreator && !ownsCopy) {
    throw AppError.from(ERROR_CODES.FORBIDDEN)
  }

  return toRecipeDetail(recipeDetail)
}
