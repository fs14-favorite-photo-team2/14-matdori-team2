import { env, validateServerEnv } from './config/env.js'

validateServerEnv()

const { default: app } = await import('./app.js')

const port = env.port

app.listen(port, () => {
  console.log(`API ready at http://localhost:${port}`)
  console.log(`Health check: http://localhost:${port}/health`)
  console.log(`Ready check: http://localhost:${port}/ready`)

  if (!env.isProduction) {
    console.log(`API docs: http://localhost:${port}/docs`)
  }
})
