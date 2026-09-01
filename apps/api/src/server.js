import 'dotenv/config'
import app from './app.js'

const port = process.env.PORT ?? 3001

app.listen(port, () => {
  console.log(`API ready at http://localhost:${port}`)
  console.log(`Health check: http://localhost:${port}/health`)
})
