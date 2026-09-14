import cors from 'cors'

import { env } from '../config/env.js'

const corsMiddleware = cors({
  origin: env.clientOrigins,
  credentials: true,
  exposedHeaders: ['Request-ID', 'Retry-After'],
})

export default corsMiddleware
