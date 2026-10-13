import { NextRequest, NextResponse } from "next/server";
import { AI_COOKIE, authenticated, configured, COOKIE_OPTIONS, createSession, passwordMatches } from "@/lib/ai/code-auth";
import { githubConfigured } from "@/lib/ai/github-code";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({
    configured: configured(),
    authenticated: await authenticated(),
    deepseek: Boolean(process.env.DEEPSEEK_API_KEY),
    github: githubConfigured(),
  }, { headers: { "Cache-Control": "no-store" } });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  if (body?.action === "logout") {
    const response = NextResponse.json({ authenticated: false });
    response.cookies.set(AI_COOKIE, "", { ...COOKIE_OPTIONS, maxAge: 0 });
    return response;
  }
  if (!passwordMatches(body?.password)) {
    return NextResponse.json({ error: "Onjuist wachtwoord of beheerwachtwoord ontbreekt." }, { status: 401 });
  }
  const response = NextResponse.json({ authenticated: true });
  response.cookies.set(AI_COOKIE, createSession(), COOKIE_OPTIONS);
  return response;
}
