import connectPgSimple from 'connect-pg-simple'
import session from 'express-session'

const SESSION_TTL_SECONDS = Number(process.env.SESSION_TTL_SECONDS ?? 604800)
const isProduction = process.env.NODE_ENV === 'production'

if (!Number.isFinite(SESSION_TTL_SECONDS) || SESSION_TTL_SECONDS <= 0) {
  throw new Error('SESSION_TTL_SECONDS는 양수여야 합니다.')
}

if (
  !process.env.SESSION_SECRET ||
  Buffer.byteLength(process.env.SESSION_SECRET, 'utf8') < 32
) {
  throw new Error('SESSION_SECRET은 32바이트 이상이어야 합니다.')
}

const PgSession = connectPgSimple(session)

const sessionMiddleware = session({
  store: new PgSession({
    conString: process.env.DATABASE_URL,
    tableName: 'session',
    ttl: SESSION_TTL_SECONDS,
    createTableIfMissing: false,
  }),
  name: process.env.SESSION_COOKIE_NAME ?? 'session',
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS * 1000,
  },
})

export default sessionMiddleware
