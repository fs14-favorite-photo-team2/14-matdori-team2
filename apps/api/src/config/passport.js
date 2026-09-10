import passport from 'passport'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'

import { ERROR_CODES } from '../constants/error-codes.js'
import { AppError } from '../errors/app-error.js'
import { authenticateWithGoogle } from '../services/auth-service.js'

const requiredEnvironmentVariables = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
]

const missingEnvironmentVariables = requiredEnvironmentVariables.filter(
  (name) => !process.env[name],
)

export const isGoogleOAuthConfigured = missingEnvironmentVariables.length === 0

if (!isGoogleOAuthConfigured && process.env.NODE_ENV === 'production') {
  throw new Error(
    `${missingEnvironmentVariables.join(', ')} 환경 변수가 필요합니다.`,
  )
}

if (!isGoogleOAuthConfigured) {
  console.warn(
    `Google 로그인을 비활성화합니다. 다음 환경 변수가 없습니다: ${missingEnvironmentVariables.join(', ')}`,
  )
} else {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
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
