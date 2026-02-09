import type { Request, Response, NextFunction } from 'express'
import { DomainError } from '../errors/domain-error.js'
import { ZodError } from 'zod'

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof DomainError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        requestId: req.requestId,
      },
    })
    return
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: '입력 검증에 실패했습니다',
        details: err.errors.map((e) => ({
          field: e.path.join('.'),
          message: e.message,
        })),
        requestId: req.requestId,
      },
    })
    return
  }

  const log = {
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    requestId: req.requestId,
    message: err.message,
    stack: err.stack,
  }
  process.stderr.write(JSON.stringify(log) + '\n')

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: '서버 내부 오류가 발생했습니다',
      requestId: req.requestId,
    },
  })
}
