import { promisify } from 'node:util'

export function regenerateSession(session) {
  return promisify(session.regenerate.bind(session))()
}

export function saveSession(session) {
  return promisify(session.save.bind(session))()
}

export function destroySession(session) {
  return promisify(session.destroy.bind(session))()
}
