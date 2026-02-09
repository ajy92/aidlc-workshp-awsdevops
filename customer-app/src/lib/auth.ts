import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'table-order-secret';

export type TablePayload = {
  storeId: string;
  tableNumber: number;
  sessionId: string;
};

export function signTableToken(payload: TablePayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '16h' });
}

export function verifyTableAuth(req: NextRequest): TablePayload | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(auth.slice(7), JWT_SECRET) as TablePayload;
  } catch {
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
