import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'

config({
  path: [
    fileURLToPath(new URL('../../.env.local', import.meta.url)),
    fileURLToPath(new URL('../../.env', import.meta.url)),
  ],
})
