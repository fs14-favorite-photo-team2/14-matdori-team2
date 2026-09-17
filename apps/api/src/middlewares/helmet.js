import helmet from 'helmet'

import { env } from '../config/env.js'

const helmetMiddleware = helmet({
  strictTransportSecurity: env.isProduction,
  contentSecurityPolicy: {
    directives: {
      upgradeInsecureRequests: env.isProduction ? [] : null,
    },
  },
})

export default helmetMiddleware
