import { Router } from 'express'

import authRouter from './auth.js'
import usersRouter from './users.js'
import marketRouter from './market-listings.js'

const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/users', usersRouter)
apiRouter.use('/market-listings', marketRouter)

export default apiRouter
