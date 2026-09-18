const DEFAULT_ERROR_MESSAGE =
  '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'

function findAllowedDetailMessage(details, allowedDetailMatchers) {
  if (!Array.isArray(details) || allowedDetailMatchers.length === 0) {
    return null
  }

  for (const detail of details) {
    const reason = detail?.reason

    if (typeof reason !== 'string' || reason.trim() === '') {
      continue
    }

    const detailMessage = reason.trim()
    const isAllowed = allowedDetailMatchers.some((matcher) => {
      if (typeof matcher === 'string') {
        return matcher === detailMessage
      }

      return matcher instanceof RegExp && matcher.test(detailMessage)
    })

    if (isAllowed) {
      return detailMessage
    }
  }

  return null
}

export default function getApiErrorMessage(
  error,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
  allowedDetailMatchers = [],
) {
  const errorData = error?.response?.data?.error
  const detailMessage = findAllowedDetailMessage(
    errorData?.details,
    allowedDetailMatchers,
  )

  if (detailMessage) {
    return detailMessage
  }

  const message = errorData?.message

  if (typeof message !== 'string' || message.trim() === '') {
    return fallbackMessage
  }

  return message
}
