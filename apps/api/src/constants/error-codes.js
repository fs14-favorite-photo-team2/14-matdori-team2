export const ERROR_CODES = Object.freeze({
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',
  NICKNAME_ALREADY_EXISTS: 'NICKNAME_ALREADY_EXISTS',
  MONTHLY_RECIPE_LIMIT_REACHED: 'MONTHLY_RECIPE_LIMIT_REACHED',
  AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  FORBIDDEN: 'FORBIDDEN',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  CONFLICT: 'CONFLICT',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  BAD_REQUEST: 'BAD_REQUEST',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
})

export const ERROR_CATALOG = Object.freeze({
  [ERROR_CODES.EMAIL_ALREADY_EXISTS]: {
    status: 409,
    message: '이미 가입된 이메일입니다.',
  },
  [ERROR_CODES.NICKNAME_ALREADY_EXISTS]: {
    status: 409,
    message: '이미 사용 중인 닉네임입니다.',
  },
  [ERROR_CODES.MONTHLY_RECIPE_LIMIT_REACHED]: {
    status: 409,
    message: '이번 달 레시피 생성 한도에 도달했습니다.',
  },
  [ERROR_CODES.AUTHENTICATION_REQUIRED]: {
    status: 401,
    message: '로그인이 필요합니다.',
  },
  [ERROR_CODES.INVALID_CREDENTIALS]: {
    status: 401,
    message: '이메일 또는 비밀번호가 올바르지 않습니다.',
  },
  [ERROR_CODES.FORBIDDEN]: {
    status: 403,
    message: '요청한 작업을 수행할 권한이 없습니다.',
  },
  [ERROR_CODES.RESOURCE_NOT_FOUND]: {
    status: 404,
    message: '요청한 리소스를 찾을 수 없습니다.',
  },
  [ERROR_CODES.CONFLICT]: {
    status: 409,
    message: '현재 상태에서는 요청한 작업을 수행할 수 없습니다.',
  },
  [ERROR_CODES.VALIDATION_ERROR]: {
    status: 400,
    message: '요청 값이 올바르지 않습니다.',
  },
  [ERROR_CODES.BAD_REQUEST]: {
    status: 400,
    message: '요청을 처리할 수 없습니다.',
  },
  [ERROR_CODES.ROUTE_NOT_FOUND]: {
    status: 404,
    message: '요청한 경로를 찾을 수 없습니다.',
  },
  [ERROR_CODES.INTERNAL_SERVER_ERROR]: {
    status: 500,
    message: '서버 오류가 발생했습니다.',
  },
})
