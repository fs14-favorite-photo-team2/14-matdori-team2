import { randomUUID } from 'node:crypto'

import sharp from 'sharp'

import cloudinary from '../config/cloudinary.js'
import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'

const MAX_IMAGE_WIDTH = 1600
const MAX_IMAGE_HEIGHT = 1600
const WEBP_QUALITY = 82

function uploadRecipeImage(buffer, publicId) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',
        public_id: publicId,
        asset_folder: 'matdori/recipes',
        format: 'webp',
        overwrite: false,
      },
      (error, result) => {
        if (error) {
          reject(error)
          return
        }

        resolve(result)
      },
    )

    uploadStream.end(buffer)
  })
}

export async function saveRecipeImages(files) {
  const savedImages = []

  try {
    // 순차 처리하여 업로드 순서와 반환 순서를 동일하게 유지
    for (const file of files) {
      const publicId = `matdori/recipes/${randomUUID()}`

      const imageBuffer = await sharp(file.buffer)
        // EXIF 방향 정보를 기준으로 이미지 방향 보정
        .rotate()

        // 원본 비율을 유지하며 최대 크기 안으로 축소
        .resize({
          width: MAX_IMAGE_WIDTH,
          height: MAX_IMAGE_HEIGHT,
          fit: 'inside',
          withoutEnlargement: true,
        })

        // 업로드된 이미지를 WebP로 변환
        .webp({
          quality: WEBP_QUALITY,
        })

        // 서버 파일로 저장하지 않고 메모리 Buffer로 반환
        .toBuffer()

      const uploadedImage = await uploadRecipeImage(imageBuffer, publicId)

      savedImages.push({
        imageUrl: uploadedImage.secure_url,
        publicId: uploadedImage.public_id,
      })
    }

    return {
      imageUrls: savedImages.map((image) => image.imageUrl),
      publicIds: savedImages.map((image) => image.publicId),
    }
  } catch {
    await removeRecipeImages(savedImages.map((image) => image.publicId))

    throw AppError.from(ERROR_CODES.VALIDATION_ERROR, [
      {
        field: 'images',
        reason:
          '이미지를 처리할 수 없습니다. 지원되는 이미지 파일인지 확인해 주세요.',
      },
    ])
  }
}

export async function removeRecipeImages(publicIds) {
  const validPublicIds = publicIds.filter(Boolean)

  await Promise.allSettled(
    validPublicIds.map((publicId) =>
      cloudinary.uploader.destroy(publicId, {
        resource_type: 'image',
      }),
    ),
  )
}
