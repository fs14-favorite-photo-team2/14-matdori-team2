import { Router } from 'express'

import {
  googleOAuthCallbackController,
  googleOAuthErrorController,
  googleOAuthFailureController,
  loginController,
  logoutController,
  signupController,
} from '../controllers/auth-controller.js'
import {
  completeGoogleOAuth,
  rememberOAuthRedirect,
  requireGoogleOAuthConfigured,
  startGoogleOAuth,
} from '../middlewares/google-oauth.js'
import { requireAuthentication } from '../middlewares/require-authentication.js'
import { validateRequest } from '../middlewares/validate-request.js'
import {
  loginRequest,
  logoutRequest,
  signupRequest,
} from '../validators/auth-validator.js'

const authRouter = Router()

authRouter.post('/signup', validateRequest(signupRequest), signupController)
authRouter.post('/login', validateRequest(loginRequest), loginController)
authRouter.post(
  '/logout',
  requireAuthentication,
  validateRequest(logoutRequest),
  logoutController,
)
authRouter.get(
  '/google',
  requireGoogleOAuthConfigured,
  rememberOAuthRedirect,
  startGoogleOAuth,
)
authRouter.get(
  '/google/callback',
  completeGoogleOAuth,
  googleOAuthCallbackController,
  googleOAuthErrorController,
)
authRouter.get('/google/failure', googleOAuthFailureController)

export default authRouter
