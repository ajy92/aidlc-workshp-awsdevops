export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly statusCode: number = 400,
  ) {
    super(message)
    this.name = 'DomainError'
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string, id: string) {
    super(
      `${resource.toUpperCase()}_NOT_FOUND`,
      `${resource}을(를) 찾을 수 없습니다: ${id}`,
      404,
    )
  }
}

export class InvalidStatusTransitionError extends DomainError {
  constructor(from: string, to: string) {
    super(
      'ORDER_INVALID_STATUS_TRANSITION',
      `${from}에서 ${to}로 변경할 수 없습니다`,
      422,
    )
  }
}

export class AuthError extends DomainError {
  constructor(code: string, message: string) {
    super(code, message, 401)
  }
}

export class ForbiddenError extends DomainError {
  constructor() {
    super('AUTH_FORBIDDEN', '접근 권한이 없습니다', 403)
  }
}

export class RateLimitError extends DomainError {
  constructor() {
    super('AUTH_RATE_LIMITED', '로그인 시도 횟수를 초과했습니다. 잠시 후 다시 시도해주세요.', 429)
  }
}
