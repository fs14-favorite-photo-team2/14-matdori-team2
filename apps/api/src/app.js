import express from 'express'
import { fileURLToPath } from 'node:url'

import { env } from './config/env.js'
import passport from './config/passport.js'
import {
  getHealthController,
  getReadyController,
} from './controllers/health-controller.js'
import corsMiddleware from './middlewares/cors.js'
import { errorHandler } from './middlewares/error-handler.js'
import helmetMiddleware from './middlewares/helmet.js'
import httpLoggerMiddleware from './middlewares/http-logger.js'
import { notFoundHandler } from './middlewares/not-found.js'
import { apiRateLimit } from './middlewares/rate-limit.js'
import sessionMiddleware from './middlewares/session.js'
import { verifyOrigin } from './middlewares/verify-origin.js'
import apiDocsRouter from './routes/api-docs.js'
import apiRouter from './routes/index.js'

const uploadsDirectory = fileURLToPath(new URL('../uploads/', import.meta.url))

const app = express()

app.set('trust proxy', env.trustProxy)

app.use(httpLoggerMiddleware)
app.use(helmetMiddleware)
app.use(corsMiddleware)
app.use('/api', verifyOrigin)
app.use('/api', apiRateLimit)
app.use(express.json())
app.use(sessionMiddleware)
app.use(passport.initialize())

app.use('/uploads', express.static(uploadsDirectory))

app.get('/health', getHealthController)
app.get('/ready', getReadyController)

app.use('/docs', apiDocsRouter)
app.use('/api', apiRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
