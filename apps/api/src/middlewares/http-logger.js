import { randomUUID } from 'node:crypto'
import pinoHttp from 'pino-http'

import { logger } from '../utils/logger.js'

const HEALTH_CHECK_PATHS = ['/health', '/ready']

const httpLoggerMiddleware = pinoHttp({
  logger,
  genReqId: (_request, response) => {
    const requestId = randomUUID()
    response.setHeader('Request-ID', requestId)

    return requestId
  },
  customLogLevel: (request, response, error) => {
    if (error || response.statusCode >= 500) return 'error'
    if (HEALTH_CHECK_PATHS.includes(request.path)) return 'silent'

    return 'info'
  },
  customProps: (request) => ({
    userId: request.userId ?? request.session?.userId,
  }),
  serializers: {
    req: (request) => ({
      id: request.id,
      method: request.method,
      path: request.url.split('?')[0],
    }),
    res: (response) => ({ statusCode: response.statusCode }),
  },
})

export default httpLoggerMiddleware
