import { Router } from 'express'

import { signupController } from '../controllers/auth-controller.js'
import { validateRequest } from '../middlewares/validate-request.js'
import { signupRequest } from '../validators/auth-validator.js'

const authRouter = Router()

authRouter.post('/signup', validateRequest(signupRequest), signupController)

export default authRouter
