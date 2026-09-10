import express from 'express'

import passport from './config/passport.js'
import {
  getHealthController,
  getReadyController,
} from './controllers/health-controller.js'
import corsMiddleware from './middlewares/cors.js'
import { errorHandler } from './middlewares/error-handler.js'
import { notFoundHandler } from './middlewares/not-found.js'
import sessionMiddleware from './middlewares/session.js'
import apiDocsRouter from './routes/api-docs.js'
import apiRouter from './routes/index.js'

const app = express()

app.set('trust proxy', 1)

app.use(corsMiddleware)
app.use(express.json())
app.use(sessionMiddleware)
app.use(passport.initialize())

app.get('/health', getHealthController)
app.get('/ready', getReadyController)

app.use('/docs', apiDocsRouter)
app.use('/api', apiRouter)

app.use(notFoundHandler)
app.use(errorHandler)

export default app
