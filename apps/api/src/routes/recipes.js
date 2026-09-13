import { Router } from 'express'

import { createRecipeController } from '../controllers/recipe-controller.js'
import { normalizeRecipeForm } from '../middlewares/normalize-recipe-form.js'
import { requireAuthentication } from '../middlewares/require-authentication.js'
import { uploadRecipeImages } from '../middlewares/upload-recipe-images.js'
import { validateRequest } from '../middlewares/validate-request.js'
import { createRecipeRequest } from '../validators/recipe-validator.js'

const recipesRouter = Router()

// 로그인 사용자 확인 > multipart 요청을 분석, 파일 생성 > json문자열 실제 자료형으로 변환 > 검사 > 서비스호출
recipesRouter.post(
  '/',
  requireAuthentication,
  uploadRecipeImages,
  normalizeRecipeForm,
  validateRequest(createRecipeRequest),
  createRecipeController,
)

export default recipesRouter
