import { Router } from 'express'

import {
  loginController,
  logoutController,
  signupController,
} from '../controllers/auth-controller.js'
import { requireAuthentication } from '../middlewares/require-authentication.js'
import { validateRequest } from '../middlewares/validate-request.js'
import { loginRequest, signupRequest } from '../validators/auth-validator.js'

const authRouter = Router()

authRouter.post('/signup', validateRequest(signupRequest), signupController)
authRouter.post('/login', validateRequest(loginRequest), loginController)
authRouter.post('/logout', requireAuthentication, logoutController)

export default authRouter
