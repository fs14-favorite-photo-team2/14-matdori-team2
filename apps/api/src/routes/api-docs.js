import { Router } from 'express'
import fs from 'node:fs'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yaml'

import { env } from '../config/env.js'
import { logger } from '../utils/logger.js'

const apiDocsRouter = Router()

if (!env.isProduction) {
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
    logger.warn(
      { err: error },
      'API docs disabled because openapi.yaml could not be read',
    )
  }
}

export default apiDocsRouter
