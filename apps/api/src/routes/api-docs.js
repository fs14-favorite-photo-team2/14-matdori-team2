import { Router } from 'express'
import fs from 'node:fs'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yaml'

const apiDocsRouter = Router()

if (process.env.NODE_ENV !== 'production') {
  try {
    const openapiDocument = YAML.parse(
      fs.readFileSync(
        new URL('../../../../openapi.yaml', import.meta.url),
        'utf8',
      ),
    )

    apiDocsRouter.use(
      swaggerUi.serve,
      swaggerUi.setup(openapiDocument, {
        customCss: '.swagger-ui .authorize { display: none }',
      }),
    )
  } catch (error) {
    console.warn(
      `openapi.yaml을 읽지 못해 /docs를 비활성화합니다: ${error.message}`,
    )
  }
}

export default apiDocsRouter
