import { Router } from 'express'

import authRouter from './auth.js'
import usersRouter from './users.js'
import marketRouter from './market-listings.js'
import randomBoxRouter from './random-box.js'
import recipesRouter from './recipes.js'

const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/users', usersRouter)
apiRouter.use('/market-listings', marketRouter)
apiRouter.use('/random-box', randomBoxRouter)
apiRouter.use('/recipes', recipesRouter)

export default apiRouter
