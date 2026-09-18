import { Router } from 'express'

import {
  claimRandomBoxController,
  getRandomBoxController,
} from '../controllers/random-box-controller.js'
import { randomBoxClaimRateLimit } from '../middlewares/rate-limit.js'
import { requireAuthentication } from '../middlewares/require-authentication.js'
import { validateRequest } from '../middlewares/validate-request.js'
import { randomBoxRequest } from '../validators/random-box-validator.js'

const randomBoxRouter = Router()

randomBoxRouter.use(requireAuthentication)

randomBoxRouter.get(
  '/',
  validateRequest(randomBoxRequest),
  getRandomBoxController,
)

randomBoxRouter.post(
  '/',
  randomBoxClaimRateLimit,
  validateRequest(randomBoxRequest),
  claimRandomBoxController,
)

export default randomBoxRouter
