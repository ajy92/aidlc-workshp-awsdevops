type Client = { storeId: string; controller: ReadableStreamDefaultController };

const clients: Client[] = [];

export function addClient(storeId: string, controller: ReadableStreamDefaultController) {
  clients.push({ storeId, controller });
}

export function removeClient(controller: ReadableStreamDefaultController) {
  const idx = clients.findIndex(c => c.controller === controller);
  if (idx !== -1) clients.splice(idx, 1);
}

export function broadcast(storeId: string, event: string, data: unknown) {
  const encoder = new TextEncoder();
  const msg = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  clients
    .filter(c => c.storeId === storeId)
    .forEach(c => {
      try { c.controller.enqueue(encoder.encode(msg)); } catch { /* closed */ }
    });
}
