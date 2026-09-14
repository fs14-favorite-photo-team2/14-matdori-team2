import cors from 'cors'

import { env } from '../config/env.js'

const corsMiddleware = cors({
  origin: env.clientOrigins,
  credentials: true,
})

export default corsMiddleware
