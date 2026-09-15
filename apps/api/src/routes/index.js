import { Router } from 'express'

import authRouter from './auth.js'
import usersRouter from './users.js'
import marketRouter from './market-listings.js'
import listingTradeOffersRouter from './listing-trade-offers.js'
import notificationsRouter from './notifications.js'
import randomBoxRouter from './random-box.js'
import recipesRouter from './recipes.js'
import tradeOffersRouter from './trade-offers.js'

const apiRouter = Router()

apiRouter.use('/auth', authRouter)
apiRouter.use('/users', usersRouter)
apiRouter.use('/market-listings', marketRouter)
apiRouter.use(
  '/market-listings/:listingId/trade-offers',
  listingTradeOffersRouter,
)
apiRouter.use('/notifications', notificationsRouter)
apiRouter.use('/random-box', randomBoxRouter)
apiRouter.use('/recipes', recipesRouter)
apiRouter.use('/trade-offers', tradeOffersRouter)

export default apiRouter
