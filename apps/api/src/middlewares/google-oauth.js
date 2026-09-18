import { env } from '../config/env.js'
import passport from '../config/passport.js'
import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'

export const startGoogleOAuth = passport.authenticate('google', {
  scope: ['profile', 'email'],
})

export function requireGoogleOAuthConfigured(_request, _response, next) {
  if (!env.googleOAuth.isConfigured) {
    return next(AppError.from(ERROR_CODES.GOOGLE_OAUTH_NOT_CONFIGURED))
  }

  return next()
}

export const completeGoogleOAuth = passport.authenticate('google', {
  failureRedirect: '/api/auth/google/failure',
  session: false,
})

export function rememberOAuthRedirect(request, _response, next) {
  const redirectUrl = request.query.redirectUri

  if (redirectUrl && isAllowedClientUrl(redirectUrl)) {
    request.session.oauthRedirectUrl = redirectUrl
  } else {
    delete request.session.oauthRedirectUrl
  }

  return next()
}

function isAllowedClientUrl(value) {
  try {
    const redirectUrl = new URL(value)
    return env.clientOrigins.some(
      (origin) => redirectUrl.origin === new URL(origin).origin,
    )
  } catch {
    return false
  }
}
