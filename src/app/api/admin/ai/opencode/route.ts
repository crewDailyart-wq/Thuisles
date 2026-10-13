import { NextRequest, NextResponse } from "next/server";
import { authenticated } from "@/lib/ai/code-auth";

export const runtime = "nodejs";
export const maxDuration = 120;

const SESSION_RE = /^ses_[a-zA-Z0-9_-]+$/;

async function upstream(path: string, method: "GET" | "POST", body?: unknown): Promise<Response> {
  const base = process.env.OPENCODE_BASE_URL;
  const password = process.env.OPENCODE_SERVER_PASSWORD;
  if (!base || !password) throw new Error("OpenCode-service is nog niet geconfigureerd.");
  const target = new URL(base);
  if (target.protocol !== "http:" || !target.hostname.endsWith(".railway.internal") || target.username || target.password) {
    throw new Error("Alleen een privé Railway-adres is toegestaan.");
  }
  const url = new URL(path, target.origin);
  return fetch(url, {
    method,
    headers: {
      Authorization: "Basic " + Buffer.from("opencode:" + password).toString("base64"),
      "Content-Type": "application/json",
    },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    cache: "no-store",
    signal: AbortSignal.timeout(95000),
  });
}

export async function GET(request: NextRequest) {
  if (!(await authenticated())) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  const id = new URL(request.url).searchParams.get("session");
  if (!id || !SESSION_RE.test(id)) return NextResponse.json({ error: "Ongeldig sessie-ID." }, { status: 400 });
  try {
    const response = await upstream("/session/" + id + "/message?limit=30", "GET");
    if (!response.ok) return NextResponse.json({ error: "OpenCode HTTP " + response.status }, { status: 502 });
    return NextResponse.json({ messages: await response.json() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Verbindingsfout" }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  if (!(await authenticated())) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  const input = await request.json().catch(() => null);
  if (!input || !["create", "prompt"].includes(input.action)) return NextResponse.json({ error: "Ongeldige actie." }, { status: 400 });
  try {
    if (input.action === "create") {
      const response = await upstream("/session", "POST", { title: "Thuisles AI Studio" });
      if (!response.ok) throw new Error("OpenCode kon geen sessie maken (HTTP " + response.status + ").");
      const session = await response.json() as { id: string };
      if (!SESSION_RE.test(session.id)) throw new Error("Onverwacht sessieformaat.");
      return NextResponse.json({ sessionId: session.id });
    }
    if (typeof input.sessionId !== "string" || !SESSION_RE.test(input.sessionId) ||
      typeof input.prompt !== "string" || input.prompt.length < 1 || input.prompt.length > 4500) {
      return NextResponse.json({ error: "Ongeldige prompt of sessie." }, { status: 400 });
    }
    const response = await upstream("/session/" + input.sessionId + "/prompt_async", "POST", {
      parts: [{ type: "text", text: input.prompt }],
    });
    if (!response.ok) throw new Error("OpenCode prompt mislukt (HTTP " + response.status + ").");
    return NextResponse.json({ accepted: true, sessionId: input.sessionId });
  } catch (error) {
    const message = error instanceof Error ? error.message : "OpenCode niet bereikbaar.";
    return NextResponse.json({ error: message }, { status: 503 });
  }
}
