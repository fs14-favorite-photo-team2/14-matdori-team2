import { coerce, define, object, refine, string } from 'superstruct'

import { nickname, request } from './common-validator.js'

const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 24

const EMAIL_MAX_LENGTH = 254
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const email = coerce(
  define('email', (value) => {
    if (typeof value !== 'string') {
      return '이메일을 입력해 주세요.'
    }

    if (value.length > EMAIL_MAX_LENGTH) {
      return `이메일은 ${EMAIL_MAX_LENGTH}자를 넘을 수 없습니다.`
    }

    return EMAIL_PATTERN.test(value) || '올바른 이메일 형식이 아닙니다.'
  }),
  string(),
  (value) => value.trim().toLowerCase(),
)

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

export const signupRequest = request({ body: signupBody })

export const loginRequest = request({ body: object({ email, password }) })

export const logoutRequest = request()
