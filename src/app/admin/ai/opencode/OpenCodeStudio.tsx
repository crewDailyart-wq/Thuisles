"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Part = { type: string; text?: string; state?: { status?: string }; tool?: string };
type Message = { info?: { id?: string; role?: string }; parts?: Part[] };

export function OpenCodeStudio() {
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const id = window.localStorage.getItem("thuisles-opencode-session");
    if (id) setSessionId(id);
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    let active = true;
    const poll = async () => {
      try {
        const response = await fetch("/api/admin/ai/opencode?session=" + encodeURIComponent(sessionId), { cache: "no-store" });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Kan sessie niet laden.");
        if (active) setMessages(Array.isArray(data.messages) ? data.messages : []);
      } catch (e) { if (active) setError(e instanceof Error ? e.message : "Verbindingsfout"); }
    };
    void poll();
    const timer = window.setInterval(() => void poll(), 3500);
    return () => { active = false; window.clearInterval(timer); };
  }, [sessionId]);

  async function startNew() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/ai/opencode", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "create" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "OpenCode niet beschikbaar.");
      window.localStorage.setItem("thuisles-opencode-session", data.sessionId);
      setSessionId(data.sessionId); setMessages([]); setWorking(false);
    } catch (e) { setError(e instanceof Error ? e.message : "Verbindingsfout"); }
    finally { setBusy(false); }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const prompt = draft.trim();
    if (!prompt || !sessionId || busy) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/admin/ai/opencode", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "prompt", sessionId, prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Opdracht geweigerd.");
      setDraft(""); setWorking(true);
    } catch (e) { setError(e instanceof Error ? e.message : "Verbindingsfout"); }
    finally { setBusy(false); }
  }

  return <div className="mx-auto max-w-5xl space-y-5">
    <header className="flex items-center justify-between gap-3">
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-viool">Thuisles · programmeeromgeving</p>
        <h1 className="text-3xl font-extrabold">OpenCode + DeepSeek</h1>
        <p className="mt-2 text-sm text-slate-600">Echte programmeeragent met Git-werkmap en terminal. De live website wordt niet rechtstreeks aangepast.</p>
      </div>
      <Link href="/admin/ai" className="text-sm font-semibold text-viool underline">Vorige AI Studio</Link>
    </header>
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-slate-600">{sessionId ? "OpenCode-sessie: " + sessionId : "Start een nieuwe OpenCode-sessie."}</p>
        <button onClick={() => void startNew()} disabled={busy} className="rounded-lg bg-viool px-4 py-2 text-sm font-bold text-white disabled:opacity-50">Nieuwe sessie</button>
      </div>
      <div className="max-h-[60vh] min-h-60 space-y-3 overflow-auto rounded-xl bg-slate-50 p-4">
        {messages.length === 0 && <p className="text-sm text-slate-500">Nog geen berichten. Geef een opdracht, bijvoorbeeld: onderzoek de bestaande oefencomponenten en implementeer een nieuwe oefening. Voer daarna tests uit.</p>}
        {messages.map((m, i) => <div key={m.info?.id ?? i} className={`rounded-xl border p-4 text-sm ${m.info?.role === "user" ? "bg-viool-zacht" : "bg-white"}`}>
          <div className="mb-2 text-xs font-bold uppercase text-slate-500">{m.info?.role === "user" ? "Jij" : "OpenCode"}</div>
          {(m.parts ?? []).filter(p => p.type === "text" || p.type === "tool").map((part, j) =>
            <div key={j} className="my-2 whitespace-pre-wrap break-words">{part.type === "text" ? part.text : "Tool: " + (part.tool ?? "bewerking") + " · " + (part.state?.status ?? "bezig")}</div>
          )}
        </div>)}
      </div>
      {working && <p className="mt-3 text-xs text-slate-500">Opdracht verstuurd. De resultaten worden iedere paar seconden bijgewerkt.</p>}
      {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <form onSubmit={(e) => void submit(e)} className="mt-4 space-y-3">
        <textarea value={draft} onChange={e => setDraft(e.target.value)} maxLength={4500} rows={4} placeholder="Beschrijf precies wat je wilt laten bouwen…" className="w-full rounded-xl border border-slate-300 p-4 text-sm outline-none focus:border-viool"/>
        <button type="submit" disabled={!sessionId || !draft.trim() || busy} className="rounded-lg bg-viool px-5 py-3 text-sm font-bold text-white disabled:opacity-40">Laat OpenCode programmeren</button>
      </form>
    </div>
    <p className="text-xs text-slate-500">Let op: wijzigingen blijven eerst in de werkmap van de afzonderlijke agentservice. Automatische GitHub-publicatie is niet ingeschakeld.</p>
  </div>;
}
