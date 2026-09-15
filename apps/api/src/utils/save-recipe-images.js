import { randomUUID } from 'node:crypto'
import { mkdir, unlink } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { basename, join } from 'node:path'

import sharp from 'sharp'

import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'

const RECIPE_IMAGE_URL_PREFIX = '/uploads/recipes/'
const RECIPE_IMAGE_DIRECTORY = fileURLToPath(
  new URL('../../uploads/recipes/', import.meta.url),
)

const API_ORIGIN = process.env.API_ORIGIN ?? 'http://localhost:3001'

const MAX_IMAGE_WIDTH = 1600
const MAX_IMAGE_HEIGHT = 1600
const WEBP_QUALITY = 82

export async function saveRecipeImages(files) {
  await mkdir(RECIPE_IMAGE_DIRECTORY, { recursive: true })

  const savedImages = []

  try {
    // 순차 처리하여 업로드 순서와 반환 순서를 동일하게 유지
    for (const file of files) {
      const filename = `${randomUUID()}.webp`
      const filePath = `${RECIPE_IMAGE_DIRECTORY}${filename}`

      await sharp(file.buffer)
        // EXIF 방향 정보를 기준으로 이미지 방향 보정
        .rotate()
        // 원본 비율을 유지하며 최대 크기 안으로 축소
        .resize({
          width: MAX_IMAGE_WIDTH,
          height: MAX_IMAGE_HEIGHT,
          fit: 'inside',
          withoutEnlargement: true,
        })
        // JPEG, PNG, HEIC, HEIF 등을 WebP로 화면에서 바로 보일 수 있게 변환
        .webp({
          quality: WEBP_QUALITY,
        })
        .toFile(filePath)

      const imageUrl = new URL(
        `${RECIPE_IMAGE_URL_PREFIX}${filename}`,
        API_ORIGIN,
      ).toString()

      savedImages.push({
        imageUrl,
        filePath,
      })
    }

    return {
      imageUrls: savedImages.map((image) => image.imageUrl),
      filePaths: savedImages.map((image) => image.filePath),
    }
  } catch {
    await removeRecipeImageFiles(savedImages.map((image) => image.filePath))

    throw AppError.from(ERROR_CODES.VALIDATION_ERROR, [
      {
        field: 'images',
        reason:
          '이미지를 처리할 수 없습니다. 지원되는 이미지 파일인지 확인해 주세요.',
      },
    ])
  }
}

export async function removeRecipeImageFiles(filePaths) {
  await Promise.allSettled(filePaths.map((filePath) => unlink(filePath)))
}

export function getRecipeImageFilePaths(imageUrls) {
  return imageUrls.flatMap((imageUrl) => {
    try {
      const { pathname } = new URL(imageUrl)

      if (!pathname.startsWith(RECIPE_IMAGE_URL_PREFIX)) {
        return []
      }

      const filename = basename(pathname)

      if (
        pathname !== `${RECIPE_IMAGE_URL_PREFIX}${filename}` ||
        !filename.endsWith('.webp')
      ) {
        return []
      }

      return [join(RECIPE_IMAGE_DIRECTORY, filename)]
    } catch {
      return []
    }
  })
}
