import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import { addClient, removeClient } from '@/lib/sse';
import { TablePayload } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'table-order-secret';

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get('token');
  if (!token) return new Response('Unauthorized', { status: 401 });

  let payload: TablePayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as TablePayload;
  } catch {
    return new Response('Unauthorized', { status: 401 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      controller.enqueue(encoder.encode('event: connected\ndata: {}\n\n'));
      addClient(payload.storeId, payload.sessionId, controller);

      req.signal.addEventListener('abort', () => {
        removeClient(controller);
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
