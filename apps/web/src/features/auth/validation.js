const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const EMAIL_MAX_LENGTH = 254

const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 24

export const EMAIL_VALIDATION_RULES = {
  setValueAs: (value) => value.trim(),
  required: '이메일을 입력해 주세요.',
  maxLength: {
    value: EMAIL_MAX_LENGTH,
    message: '이메일은 254자 이하로 입력해 주세요.',
  },
  pattern: {
    value: EMAIL_PATTERN,
    message: '올바른 이메일 형식이 아닙니다.',
  },
}

export const PASSWORD_VALIDATION_RULES = {
  required: '비밀번호를 입력해 주세요.',
  minLength: {
    value: PASSWORD_MIN_LENGTH,
    message: '비밀번호를 8자 이상 입력해 주세요.',
  },
  maxLength: {
    value: PASSWORD_MAX_LENGTH,
    message: '비밀번호를 24자 이하로 입력해 주세요.',
  },
}
