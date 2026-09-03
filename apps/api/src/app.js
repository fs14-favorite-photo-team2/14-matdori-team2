import cors from 'cors'
import express from 'express'
import fs from 'node:fs'
import swaggerUi from 'swagger-ui-express'
import YAML from 'yaml'

import { checkDatabaseConnection } from './db/prisma.js'
import { errorHandler } from './middlewares/error-handler.js'
import { notFoundHandler } from './middlewares/not-found.js'
import apiRouter from './routes/index.js'
import { sendSuccess } from './utils/response.js'

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN ?? 'http://localhost:3000',
    credentials: true,
  }),
)
app.use(express.json())

if (process.env.NODE_ENV !== 'production') {
  try {
    const openapiDocument = YAML.parse(
      fs.readFileSync(
        new URL('../../../openapi.yaml', import.meta.url),
        'utf8',
      ),
    )

    app.use(
      '/docs',
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

app.get('/health', (_request, response) => {
  return sendSuccess(response, { status: 'ok' })
})

app.get('/ready', async (_request, response, next) => {
  try {
    await checkDatabaseConnection()

    return sendSuccess(response, { status: 'ready' })
  } catch (error) {
    return next(error)
  }
})

app.use('/api', apiRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
