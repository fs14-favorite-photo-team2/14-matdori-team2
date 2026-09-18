import { Router } from 'express'

import {
  getCurrentUserController,
  listMyListingsController,
  listMyPurchasesController,
  listMyRecipeCopiesController,
  listMySalesController,
  listMyTradeOffersController,
  listReceivedTradeOffersController,
  updateCurrentUserController,
} from '../controllers/user-controller.js'
import { requireAuthentication } from '../middlewares/require-authentication.js'
import { validateRequest } from '../middlewares/validate-request.js'
import {
  getCurrentUserRequest,
  myListingsRequest,
  myRecipeCopiesRequest,
  myTradeOffersRequest,
  myTradesRequest,
  updateCurrentUserRequest,
} from '../validators/user-validator.js'

const usersRouter = Router()

usersRouter.use(requireAuthentication)

usersRouter.get(
  '/me',
  validateRequest(getCurrentUserRequest),
  getCurrentUserController,
)
usersRouter.patch(
  '/me',
  validateRequest(updateCurrentUserRequest),
  updateCurrentUserController,
)
usersRouter.get(
  '/me/recipe-copies',
  validateRequest(myRecipeCopiesRequest),
  listMyRecipeCopiesController,
)
usersRouter.get(
  '/me/market-listings',
  validateRequest(myListingsRequest),
  listMyListingsController,
)
usersRouter.get(
  '/me/trade-offers',
  validateRequest(myTradeOffersRequest),
  listMyTradeOffersController,
)
usersRouter.get(
  '/me/received-trade-offers',
  validateRequest(myTradeOffersRequest),
  listReceivedTradeOffersController,
)
usersRouter.get(
  '/me/purchases',
  validateRequest(myTradesRequest),
  listMyPurchasesController,
)
usersRouter.get(
  '/me/sales',
  validateRequest(myTradesRequest),
  listMySalesController,
)

export default usersRouter
