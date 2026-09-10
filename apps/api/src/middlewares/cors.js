import cors from 'cors'

import { getClientOrigins } from '../config/client-origins.js'

const corsMiddleware = cors({
  origin: getClientOrigins(),
  credentials: true,
})

export default corsMiddleware
