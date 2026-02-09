import rateLimit from 'express-rate-limit'

export const loginRateLimit = rateLimit({
  windowMs: 5 * 60 * 1000, // 5분
  max: 5,                   // 5회
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'AUTH_RATE_LIMITED',
      message: '로그인 시도 횟수를 초과했습니다. 5분 후 다시 시도해주세요.',
      requestId: '',
    },
  },
})
