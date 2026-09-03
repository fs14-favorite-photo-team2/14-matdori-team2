import { coerce, define, object, refine, string } from 'superstruct'

const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 24

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const NICKNAME_PATTERN = /^[A-Za-z0-9가-힣_-]+$/

const email = coerce(
  define('email', (value) => {
    if (typeof value !== 'string') {
      return '이메일을 입력해 주세요.'
    }

    if (value.length > 254) {
      return '이메일은 254자를 넘을 수 없습니다.'
    }

    return EMAIL_PATTERN.test(value) || '올바른 이메일 형식이 아닙니다.'
  }),
  string(),
  (value) => value.trim().toLowerCase(),
)

const nickname = define('nickname', (value) => {
  if (typeof value !== 'string') {
    return '닉네임을 입력해 주세요.'
  }

  if (value.length < 2 || value.length > 20) {
    return '닉네임은 2자 이상 20자 이하여야 합니다.'
  }

  return (
    NICKNAME_PATTERN.test(value) ||
    '닉네임은 한글, 영문, 숫자와 _, -만 사용할 수 있습니다.'
  )
})

const password = define('password', (value) => {
  if (typeof value !== 'string') {
    return '비밀번호를 입력해 주세요.'
  }

  return (
    (value.length >= PASSWORD_MIN_LENGTH &&
      value.length <= PASSWORD_MAX_LENGTH) ||
    `비밀번호는 ${PASSWORD_MIN_LENGTH}자 이상 ${PASSWORD_MAX_LENGTH}자 이하여야 합니다.`
  )
})

const signupBody = refine(
  object({
    email,
    nickname,
    password,
    passwordConfirmation: password,
  }),
  'password confirmation check',
  ({ password: value, passwordConfirmation }) =>
    value === passwordConfirmation || '비밀번호가 일치하지 않습니다.',
)

export const signupRequest = object({
  body: signupBody,
  params: object({}),
  query: object({}),
})

export const loginRequest = object({
  body: object({ email, password }),
  params: object({}),
  query: object({}),
})
