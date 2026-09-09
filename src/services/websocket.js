const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3001";

let ws = null;
const listeners = new Map();

export function connectWebSocket(userId) {
  if (
    ws &&
    (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING)
  )
    return;

  // Usa uma referência local (em vez da variável mutável `ws`) para que os
  // callbacks nunca acabem operando sobre um socket diferente do que foi
  // criado nesta chamada — era isso que causava o "Still in CONNECTING
  // state" quando connectWebSocket rodava mais de uma vez em sequência.
  const socket = new WebSocket(WS_URL);
  ws = socket;

  socket.onopen = () => {
    if (socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ type: "auth", userId }));
    }
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      listeners.forEach((cb) => cb(data));
    } catch {}
  };

  socket.onclose = () => {
    if (ws === socket) {
      setTimeout(() => connectWebSocket(userId), 3000);
    }
  };
}

export function disconnectWebSocket() {
  if (ws) {
    ws.close();
    ws = null;
  }
}

export function onMessage(id, callback) {
  listeners.set(id, callback);
}

export function offMessage(id) {
  listeners.delete(id);
}
