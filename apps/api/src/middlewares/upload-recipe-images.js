import multer from 'multer' // 파일업로드 라이브러리

import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'

const MAX_IMAGE_COUNT = 10
const MAX_IMAGE_SIZE = 10 * 1024 * 1024

// 아이폰까지 감안
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
])

// memoryStorage() >> 요청값 검증이 모두 끝난 다음 실제 파일로 저장하기 위함
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    files: MAX_IMAGE_COUNT,
    fileSize: MAX_IMAGE_SIZE,
  },
  fileFilter(_request, file, callback) {
    if (!ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
      return callback(
        AppError.from(ERROR_CODES.VALIDATION_ERROR, [
          {
            field: 'images',
            reason:
              'JPEG, PNG, WebP, HEIC, HEIF 이미지 파일만 업로드할 수 있습니다.',
          },
        ]),
      )
    }

    return callback(null, true)
  },
})

export function uploadRecipeImages(request, response, next) {
  upload.array('images', MAX_IMAGE_COUNT)(request, response, (error) => {
    if (!error) {
      if (!request.files || request.files.length === 0) {
        return next(
          AppError.from(ERROR_CODES.VALIDATION_ERROR, [
            {
              field: 'images',
              reason: '이미지를 최소 1장 업로드해 주세요.',
            },
          ]),
        )
      }

      return next()
    }

    if (error instanceof AppError) {
      return next(error)
    }

    if (error instanceof multer.MulterError) {
      const reasons = {
        LIMIT_FILE_SIZE: '이미지 파일 크기는 한 장당 10MB 이하여야 합니다.',
        LIMIT_FILE_COUNT: '이미지는 최대 10장까지 업로드할 수 있습니다.',
        LIMIT_UNEXPECTED_FILE:
          'images 필드로 이미지를 최대 10장까지 업로드해 주세요.',
      }

      return next(
        AppError.from(ERROR_CODES.VALIDATION_ERROR, [
          {
            field: 'images',
            reason:
              reasons[error.code] ?? '이미지 업로드 요청이 올바르지 않습니다.',
          },
        ]),
      )
    }

    return next(error)
  })
}
