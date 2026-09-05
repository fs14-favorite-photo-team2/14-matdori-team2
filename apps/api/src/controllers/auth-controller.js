import { login, signup } from '../services/auth-service.js'
import { sendSuccess } from '../http/response.js'
import {
  sessionCookieName,
  sessionCookieOptions,
} from '../middlewares/session.js'
import {
  destroySession,
  regenerateSession,
  saveSession,
} from '../utils/session.js'

export async function signupController(request, response, next) {
  try {
    const user = await signup(request.validated.body)
    request.session.userId = user.id
    await saveSession(request.session)

    return sendSuccess(response, user, { status: 201 })
  } catch (error) {
    return next(error)
  }
}

export async function loginController(request, response, next) {
  try {
    const user = await login(request.validated.body)

    await regenerateSession(request.session)
    request.session.userId = user.id
    await saveSession(request.session)

    return sendSuccess(response, user)
  } catch (error) {
    return next(error)
  }
}

export async function logoutController(request, response, next) {
  try {
    await destroySession(request.session)
    response.clearCookie(sessionCookieName, sessionCookieOptions)

    return response.status(204).end()
  } catch (error) {
    return next(error)
  }
}
