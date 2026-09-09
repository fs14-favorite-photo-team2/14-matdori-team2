const DEFAULT_CLIENT_ORIGIN = 'http://localhost:3000'

export function getClientOrigins() {
  return (process.env.CLIENT_ORIGIN ?? DEFAULT_CLIENT_ORIGIN)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
}
