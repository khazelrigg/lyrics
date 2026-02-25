import { WebSocketServer } from "ws";

const PORT = Number(process.env.PORT || 6677);
const HOST = process.env.HOST || "127.0.0.1";

const wss = new WebSocketServer({ host: HOST, port: PORT });

function now() {
  return new Date().toISOString().replace("T", " ").slice(0, 19);
}

function broadcastText(text) {
  let sent = 0;
  for (const client of wss.clients) {
    if (client.readyState === 1) {
      client.send(text);
      sent++;
    }
  }
  return sent;
}

console.log(`${now()} | RELAY | listening on ws://${HOST}:${PORT}`);

wss.on("connection", (ws, req) => {
  const remote = req.socket.remoteAddress;
  console.log(`${now()} | RELAY | client connected: ${remote}`);

  ws.on("message", (data, isBinary) => {
    const text = isBinary ? data.toString() : data.toString();

    // ignore empty/noise
    const trimmed = text.trim();
    if (!trimmed) return;

    const sent = broadcastText(trimmed);
    console.log(`${now()} | RELAY | recv="${trimmed}" -> broadcast to ${sent} client(s)`);
  });

  ws.on("close", (code, reason) => {
    console.log(
      `${now()} | RELAY | client disconnected (${remote}) code=${code} reason=${reason?.toString?.() || ""}`
    );
  });

  ws.on("error", (err) => {
    console.log(`${now()} | RELAY | ws error (${remote}):`, err?.message || err);
  });
});