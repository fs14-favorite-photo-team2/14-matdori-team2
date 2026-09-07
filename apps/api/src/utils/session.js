function sessionOperation(run) {
  return new Promise((resolve, reject) => {
    run((error) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
  })
}

export function regenerateSession(session) {
  return sessionOperation((done) => session.regenerate(done))
}

export function saveSession(session) {
  return sessionOperation((done) => session.save(done))
}

export function destroySession(session) {
  return sessionOperation((done) => session.destroy(done))
}
