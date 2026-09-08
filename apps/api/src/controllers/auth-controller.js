import { getClientOrigins } from '../config/client-origins.js'
import { AppError } from '../errors/app-error.js'
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

const GENERIC_OAUTH_ERROR_CODE = 'OAUTH_FAILED'

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

export async function googleOAuthCallbackController(request, response, next) {
  const redirectUrl =
    request.session.oauthRedirectUrl ?? getDefaultRedirectUrl()

  try {
    await regenerateSession(request.session)
    request.session.userId = request.user.id
    await saveSession(request.session)

    return response.redirect(redirectUrl)
  } catch (error) {
    return next(error)
  }
}

export function googleOAuthFailureController(_request, response) {
  return redirectToLoginWithError(response, GENERIC_OAUTH_ERROR_CODE)
}

export function googleOAuthErrorController(error, _request, response, _next) {
  if (!(error instanceof AppError)) {
    console.error(error)
  }

  return redirectToLoginWithError(
    response,
    error instanceof AppError ? error.code : GENERIC_OAUTH_ERROR_CODE,
  )
}

function redirectToLoginWithError(response, code) {
  const loginUrl = new URL('/login', getClientOrigins()[0])
  loginUrl.searchParams.set('oauthError', code)

  return response.redirect(loginUrl.toString())
}

function getDefaultRedirectUrl() {
  return process.env.GOOGLE_OAUTH_SUCCESS_REDIRECT ?? getClientOrigins()[0]
}
