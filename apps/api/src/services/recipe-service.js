import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'
import {
  createRecipeRecord,
  toRecipeDetail,
  findRecipeDetailById,
  updateRecipeRecord,
} from '../repositories/recipe-repository.js'
import {
  getRecipeImageFilePaths,
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

// 수정
export async function updateRecipe(userId, recipeId, input, files = []) {
  const recipe = await findRecipeDetailById(recipeId, userId)

  if (!recipe) {
    throw AppError.from(ERROR_CODES.RESOURCE_NOT_FOUND)
  }

  if (recipe.creator.id !== userId) {
    throw AppError.from(ERROR_CODES.FORBIDDEN)
  }

  const hasNewImages = files.length > 0
  const hasBodyChanges = Object.keys(input).length > 0

  if (!hasNewImages && !hasBodyChanges) {
    throw AppError.from(ERROR_CODES.VALIDATION_ERROR, [
      {
        field: null,
        reason: '수정할 내용을 최소 1개 입력해 주세요.',
      },
    ])
  }

  let savedImages = null

  if (hasNewImages) {
    savedImages = await saveRecipeImages(files)
  }

  let updatedRecipe

  try {
    updatedRecipe = await updateRecipeRecord(recipeId, {
      ...input,
      ...(savedImages ? { imageUrls: savedImages.imageUrls } : {}),
    })
  } catch {
    if (savedImages) {
      await removeRecipeImageFiles(savedImages.filePaths)
    }

    throw AppError.from(ERROR_CODES.INTERNAL_SERVER_ERROR)
  }

  if (savedImages) {
    const previousImageFilePaths = getRecipeImageFilePaths(recipe.imageUrls)

    await removeRecipeImageFiles(previousImageFilePaths)
  }

  return toRecipeDetail(updatedRecipe)
}
