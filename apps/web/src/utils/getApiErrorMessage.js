const DEFAULT_ERROR_MESSAGE =
  '요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.'

export default function getApiErrorMessage(
  error,
  fallbackMessage = DEFAULT_ERROR_MESSAGE,
) {
  const message = error?.response?.data?.error?.message

  if (typeof message !== 'string' || message.trim() === '') {
    return fallbackMessage
  }

  return message
}
