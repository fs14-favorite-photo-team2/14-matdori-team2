export function sendSuccess(response, data, options = {}) {
  const { meta, status = 200 } = options
  const body = { success: true, data }

  if (meta !== undefined) {
    body.meta = meta
  }

  return response.status(status).json(body)
}

export function sendError(response, status, code, message, details) {
  const error = { code, message }

  if (details !== undefined) {
    error.details = details
  }

  return response.status(status).json({ success: false, error })
}
