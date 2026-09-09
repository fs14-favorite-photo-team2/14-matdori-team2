import { Router } from 'express'
import authRouter from './auth.js'
import marketRouter from './market-listings.js'

const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/market-listings', marketRouter)

export default apiRouter
