import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'

config({
  path: [
    fileURLToPath(new URL('../../.env.local', import.meta.url)),
    fileURLToPath(new URL('../../.env', import.meta.url)),
  ],
})

const clientOrigins = (process.env.CLIENT_ORIGIN ?? 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const missingGoogleOAuthVariables = [
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'GOOGLE_CALLBACK_URL',
].filter((name) => !process.env[name])

const missingCloudinaryVariables = [
  ['CLOUDINARY_CLOUD_NAME', process.env.CLOUDINARY_CLOUD_NAME],
  ['CLOUDINARY_API_KEY', process.env.CLOUDINARY_API_KEY],
  ['CLOUDINARY_API_SECRET', process.env.CLOUDINARY_API_SECRET],
]
  .filter(([, value]) => !value)
  .map(([name]) => name)

export const env = Object.freeze({
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT ?? 3001),
  databaseUrl: process.env.DATABASE_URL,
  clientOrigins: Object.freeze(clientOrigins),
  session: Object.freeze({
    cookieName: process.env.SESSION_COOKIE_NAME ?? 'session',
    secret: process.env.SESSION_SECRET,
    ttlSeconds: Number(process.env.SESSION_TTL_SECONDS ?? 604800),
  }),
  googleOAuth: Object.freeze({
    clientId: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackUrl: process.env.GOOGLE_CALLBACK_URL,
    successRedirect:
      process.env.GOOGLE_OAUTH_SUCCESS_REDIRECT ?? clientOrigins[0],
    isConfigured: missingGoogleOAuthVariables.length === 0,
    missingVariables: Object.freeze(missingGoogleOAuthVariables),
  }),
  cloudinary: Object.freeze({
    cloudName: process.env.CLOUDINARY_CLOUD_NAME ?? '',
    apiKey: process.env.CLOUDINARY_API_KEY ?? '',
    apiSecret: process.env.CLOUDINARY_API_SECRET ?? '',
    missingVariables: Object.freeze(missingCloudinaryVariables),
  }),
})

export function validateServerEnv() {
  if (!Number.isInteger(env.port) || env.port < 0 || env.port > 65535) {
    throw new Error('PORT는 0 이상 65535 이하의 정수여야 합니다.')
  }

  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL 환경 변수가 필요합니다.')
  }

  if (!Number.isFinite(env.session.ttlSeconds) || env.session.ttlSeconds <= 0) {
    throw new Error('SESSION_TTL_SECONDS는 양수여야 합니다.')
  }

  if (
    !env.session.secret ||
    Buffer.byteLength(env.session.secret, 'utf8') < 32
  ) {
    throw new Error('SESSION_SECRET은 32바이트 이상이어야 합니다.')
  }

  if (env.isProduction && !env.googleOAuth.isConfigured) {
    throw new Error(
      `${env.googleOAuth.missingVariables.join(', ')} 환경 변수가 필요합니다.`,
    )
  }

  if (env.cloudinary.missingVariables.length > 0) {
    throw new Error(
      `${env.cloudinary.missingVariables.join(', ')} 환경 변수가 필요합니다.`,
    )
  }
}
