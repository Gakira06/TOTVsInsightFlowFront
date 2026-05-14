const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:3001";

let ws = null;
const listeners = new Map();

export function connectWebSocket(userId) {
  if (ws && ws.readyState === WebSocket.OPEN) return;

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    ws.send(JSON.stringify({ type: "auth", userId }));
  };

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      listeners.forEach((cb) => cb(data));
    } catch {}
  };

  ws.onclose = () => {
    setTimeout(() => connectWebSocket(userId), 3000);
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
