import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AuthError, ForbiddenError } from '../errors/domain-error.js'

export interface AdminTokenPayload {
  sub: string
  role: 'ADMIN'
  storeId: string
}

export interface TableTokenPayload {
  sub: string
  role: 'TABLE'
  storeId: string
  tableId: string
  tableNumber: number
}

export type TokenPayload = AdminTokenPayload | TableTokenPayload

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload
    }
  }
}

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me'

export function signToken(payload: Omit<AdminTokenPayload, 'iat' | 'exp'> | Omit<TableTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '16h' })
}

export function authenticate(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  const queryToken = req.query.token as string | undefined

  let token: string | undefined
  if (header?.startsWith('Bearer ')) {
    token = header.slice(7)
  } else if (queryToken) {
    token = queryToken
  }

  if (!token) {
    throw new AuthError('AUTH_TOKEN_MISSING', '인증 토큰이 필요합니다')
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET) as TokenPayload
    req.user = payload
    next()
  } catch {
    throw new AuthError('AUTH_TOKEN_EXPIRED', '인증 토큰이 만료되었거나 유효하지 않습니다')
  }
}

export function requireRole(...roles: Array<'ADMIN' | 'TABLE'>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ForbiddenError()
    }
    next()
  }
}
