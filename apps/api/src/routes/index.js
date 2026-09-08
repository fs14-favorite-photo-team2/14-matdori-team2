import { Router } from 'express'

import authRouter from './auth.js'
import usersRouter from './users.js'

const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/users', usersRouter)

export default apiRouter
