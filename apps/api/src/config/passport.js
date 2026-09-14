import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'
import { authenticateWithGoogle } from '../services/auth-service.js'
import { env } from './env.js'

if (!env.googleOAuth.isConfigured) {
  console.warn(
    `Google 로그인을 비활성화합니다. 다음 환경 변수가 없습니다: ${env.googleOAuth.missingVariables.join(', ')}`,
  )
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: env.googleOAuth.clientId,
        clientSecret: env.googleOAuth.clientSecret,
        callbackURL: env.googleOAuth.callbackUrl,
        state: true,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const emailEntry = profile.emails?.find((entry) => entry.verified)

          if (!emailEntry) {
            return done(AppError.from(ERROR_CODES.GOOGLE_EMAIL_REQUIRED))
          }

          const user = await authenticateWithGoogle({
            googleId: profile.id,
            email: emailEntry.value.trim().toLowerCase(),
          })

          return done(null, user)
        } catch (error) {
          return done(error)
        }
      },
    ),
  )
}

export default passport
