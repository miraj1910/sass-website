import "server-only";

type SSEClient = {
  id: string;
  userId: string;
  teamId?: string;
  controller: ReadableStreamDefaultController;
};

const clients = new Map<string, SSEClient>();

export function addClient(client: SSEClient): void {
  clients.set(client.id, client);
}

export function removeClient(clientId: string): void {
  clients.delete(clientId);
}

export function sendToUser(userId: string, event: string, data: unknown): void {
  for (const client of clients.values()) {
    if (client.userId === userId) {
      sendEvent(client, event, data);
    }
  }
}

export function sendToTeam(teamId: string, event: string, data: unknown): void {
  for (const client of clients.values()) {
    if (client.teamId === teamId) {
      sendEvent(client, event, data);
    }
  }
}

export function sendToAll(event: string, data: unknown): void {
  for (const client of clients.values()) {
    sendEvent(client, event, data);
  }
}

function sendEvent(client: SSEClient, event: string, data: unknown): void {
  try {
    const encoder = new TextEncoder();
    client.controller.enqueue(encoder.encode(`event: ${event}\n`));
    client.controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
  } catch {
    clients.delete(client.id);
  }
}

export function getConnectedClients(): number {
  return clients.size;
}
