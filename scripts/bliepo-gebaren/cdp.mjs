export async function cdp(poort = 9337) {
  const v = await fetch(`http://127.0.0.1:${poort}/json/version`).then((r) => r.json());
  const ws = new WebSocket(v.webSocketDebuggerUrl); await new Promise((r) => ws.addEventListener("open", r));
  let n = 0; const w = new Map(); const luister = [];
  ws.addEventListener("message", (e) => { const m = JSON.parse(e.data); if (m.id && w.has(m.id)) { const r = w.get(m.id); w.delete(m.id); r(m.result ?? m.error); } else luister.forEach((f) => f(m)); });
  const st = (method, params = {}, sessionId) => new Promise((res) => { const id = ++n; w.set(id, res); ws.send(JSON.stringify({ id, method, params, sessionId })); });
  return { st, luister, ws };
}
export const wacht = (ms) => new Promise((r) => setTimeout(r, ms));
