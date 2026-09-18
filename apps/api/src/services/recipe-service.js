import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'
import {
  createRecipeRecord,
  toRecipeDetail,
  findRecipeDetailById,
  findRecipeImageStorageById,
  updateRecipeRecord,
} from '../repositories/recipe-repository.js'
import {
  removeRecipeImages,
  saveRecipeImages,
} from '../utils/save-recipe-images.js'

export async function createRecipe(userId, input, files) {
  // 월간 생성 제한 정책이 확정되면 이 위치에서 검사 (ex. 월 10회 생성, 5분 내 10회 이상 생성 제한 등)

  // 이미지를 Cloudinary에 저장하고 URL/publicId 반환
  const { imageUrls, publicIds } = await saveRecipeImages(files)

  let recipe

  try {
    recipe = await createRecipeRecord({
      creatorId: userId,
      ...input,
      imageUrls,
      imagePublicIds: publicIds,
    })
  } catch {
    // DB 생성 실패 시 방금 업로드한 Cloudinary 이미지 롤백
    await removeRecipeImages(publicIds)

    throw AppError.from(ERROR_CODES.INTERNAL_SERVER_ERROR)
  }

  return {
    ...toRecipeDetail(recipe),
    canEdit: true,
  }
}

// id 상세조회
export async function getRecipe(userId, recipeId) {
  const recipe = await findRecipeDetailById(recipeId, userId)

  if (!recipe) {
    throw AppError.from(ERROR_CODES.RESOURCE_NOT_FOUND)
  }

  const { _count, copies: completedCopies, ...recipeDetail } = recipe

  const isCreator = recipe.creator.id === userId
  const ownsCopy = _count.copies > 0

  if (!isCreator && !ownsCopy) {
    throw AppError.from(ERROR_CODES.FORBIDDEN)
  }

  const canEdit = isCreator && completedCopies.length === 0

  return {
    ...toRecipeDetail(recipeDetail),
    canEdit,
  }
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

  if (recipe.copies.length > 0) {
    throw AppError.from(ERROR_CODES.CONFLICT, [
      {
        field: 'canEdit',
        reason: '판매 또는 교환 이력이 있는 레시피는 수정할 수 없습니다.',
      },
    ])
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
  let previousImagePublicIds = []

  if (hasNewImages) {
    // 기존 Cloudinary 이미지 publicId 보관
    const previousImageStorage = await findRecipeImageStorageById(recipeId)

    previousImagePublicIds = previousImageStorage?.imagePublicIds ?? []

    // 새 이미지 Cloudinary 업로드
    savedImages = await saveRecipeImages(files)
  }

  let updatedRecipe

  try {
    updatedRecipe = await updateRecipeRecord(recipeId, {
      ...input,
      ...(savedImages
        ? {
            imageUrls: savedImages.imageUrls,
            imagePublicIds: savedImages.publicIds,
          }
        : {}),
    })
  } catch {
    if (savedImages) {
      await removeRecipeImages(savedImages.publicIds)
    }

    throw AppError.from(ERROR_CODES.INTERNAL_SERVER_ERROR)
  }

  if (savedImages) {
    // DB 수정이 성공한 후에만 이전 Cloudinary 이미지 삭제
    await removeRecipeImages(previousImagePublicIds)
  }

  return {
    ...toRecipeDetail(updatedRecipe),
    canEdit: true,
  }
}
