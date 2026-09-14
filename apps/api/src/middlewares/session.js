import connectPgSimple from 'connect-pg-simple'
import session from 'express-session'

import { env } from '../config/env.js'
import { pool } from '../db/pool.js'

export const sessionCookieName = env.session.cookieName
export const sessionCookieOptions = {
  httpOnly: true,
  secure: env.isProduction,
  sameSite: env.isProduction ? 'none' : 'lax',
  path: '/',
}

const PgSession = connectPgSimple(session)

const sessionMiddleware = session({
  store: new PgSession({
    pool,
    tableName: 'session',
    ttl: env.session.ttlSeconds,
    createTableIfMissing: false,
  }),
  name: sessionCookieName,
  secret: env.session.secret,
  resave: false,
  saveUninitialized: false,
  rolling: true,
  cookie: {
    ...sessionCookieOptions,
    maxAge: env.session.ttlSeconds * 1000,
  },
})

export default sessionMiddleware
