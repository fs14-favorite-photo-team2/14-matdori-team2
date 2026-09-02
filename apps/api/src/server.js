import { config } from 'dotenv'

config({ path: ['.env.local', '.env'] })

const { default: app } = await import('./app.js')

const port = process.env.PORT ?? 3001

app.listen(port, () => {
  console.log(`API ready at http://localhost:${port}`)
  console.log(`Health check: http://localhost:${port}/health`)
  console.log(`Ready check: http://localhost:${port}/ready`)

  if (process.env.NODE_ENV !== 'production') {
    console.log(`API docs: http://localhost:${port}/docs`)
  }
})
