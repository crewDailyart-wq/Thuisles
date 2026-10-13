import { NextRequest, NextResponse } from "next/server";
import { authenticated } from "@/lib/ai/code-auth";
import { saveAsPullRequest, type Change } from "@/lib/ai/github-code";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: NextRequest) {
  if (!(await authenticated())) return NextResponse.json({ error: "Niet ingelogd." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.request !== "string" || body.request.length > 4500 || !Array.isArray(body.changes)) {
    return NextResponse.json({ error: "Ongeldig wijzigingsverzoek." }, { status: 400 });
  }
  const changes = body.changes as Change[];
  if (!changes.every((c) => c && typeof c.path === "string" && typeof c.content === "string" &&
    (typeof c.sha === "string" || c.sha === null) && typeof c.explanation === "string")) {
    return NextResponse.json({ error: "Ongeldige bestanden." }, { status: 400 });
  }
  try {
    const url = await saveAsPullRequest(changes, body.request);
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({
      error: err instanceof Error ? err.message : "Kon geen GitHub-voorstel maken.",
    }, { status: 400 });
  }
}
