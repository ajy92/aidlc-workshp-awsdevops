import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'table-order-secret';

export type AdminPayload = { storeId: string; storeName: string };

export function signAdminToken(payload: AdminPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '16h' });
}

export function verifyAdminAuth(req: NextRequest): AdminPayload | null {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(auth.slice(7), JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
