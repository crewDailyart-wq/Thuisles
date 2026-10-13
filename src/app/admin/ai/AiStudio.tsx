"use client";

import { useEffect, useState } from "react";

type Message = { role: "user" | "assistant"; content: string };
type Change = { path: string; content: string; sha: string | null; explanation: string };
type Status = { configured: boolean; authenticated: boolean; deepseek: boolean; github: boolean };

const IDEAS = [
  "Voeg een nieuwe originele rekenopdracht voor groep 4 toe die past bij onze bestaande oefenstructuur.",
  "Bekijk de kinderpagina en verbeter één concreet onderdeel van de vormgeving zonder functies te verwijderen.",
  "Zoek de bestaande uitleg bij foute antwoorden en stel een didactische verbetering voor.",
];

export function AiStudio() {
  const [status, setStatus] = useState<Status | null>(null);
  const [password, setPassword] = useState("");
  const [draft, setDraft] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [changes, setChanges] = useState<Change[]>([]);
  const [currentRequest, setCurrentRequest] = useState("");
  const [prUrl, setPrUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState("");

  async function refresh() {
    try {
      const response = await fetch("/api/admin/ai/session", { cache: "no-store" });
      if (!response.ok) throw new Error("Kan de sessie niet ophalen.");
      setStatus(await response.json() as Status);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verbindingsfout");
    }
  }

  useEffect(() => { void refresh(); }, []);

  async function login(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/admin/ai/session", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Inloggen mislukt.");
      setPassword("");
      await refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Inloggen mislukt.");
    } finally { setBusy(false); }
  }

  async function logout() {
    await fetch("/api/admin/ai/session", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    setStatus((old) => old ? { ...old, authenticated: false } : old);
    setMessages([]);
    setChanges([]);
    setPrUrl("");
  }

  async function send(text?: string) {
    const instruction = (text ?? draft).trim();
    if (!instruction || busy || publishing) return;
    const history = [...messages, { role: "user" as const, content: instruction }];
    setMessages(history);
    setDraft("");
    setChanges([]);
    setPrUrl("");
    setCurrentRequest(instruction);
    setError("");
    setBusy(true);
    try {
      const response = await fetch("/api/admin/ai/chat", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history.slice(-12) }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "DeepSeek kon niet antwoorden.");
      setMessages((previous) => [...previous, {
        role: "assistant", content: String(result.reply ?? "Geen antwoord"),
      }]);
      setChanges(Array.isArray(result.changes) ? result.changes : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Er ging iets mis.");
    } finally {
      setBusy(false);
    }
  }

  async function publishProposal() {
    if (publishing || !changes.length || !status?.github) return;
    setPublishing(true);
    setError("");
    try {
      const response = await fetch("/api/admin/ai/apply", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ changes, request: currentRequest }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "Kan de PR niet maken.");
      setPrUrl(String(result.url));
      setChanges([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "GitHub-fout.");
    } finally { setPublishing(false); }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-viool">Thuisles · Beheer</p>
          <h1 className="text-3xl font-extrabold tracking-tight">AI Studio <span aria-hidden="true">✦</span></h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            Beschrijf wat je wilt veranderen. DeepSeek leest de bestaande GitHub-code, werkt een voorstel uit en jij beslist wat wordt opgeslagen.
          </p>
        </div>
        {status?.authenticated && (
          <button onClick={() => void logout()} className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50">
            Uitloggen
          </button>
        )}
      </header>

      {status === null && <div className="rounded-xl border bg-white p-6 text-slate-500">Verbinding controleren…</div>}

      {status && !status.configured && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h2 className="font-bold text-amber-950">Eerst één instelling toevoegen</h2>
          <p className="mt-2 text-sm text-amber-950">Voeg in Railway onder <strong>Variables</strong> de variabele <code className="font-semibold">AI_ADMIN_PASSWORD</code> toe met een zelfgekozen sterk wachtwoord van minimaal 16 tekens. Pas daarna de wijzigingen toe. Je code is al voorbereid.</p>
        </div>
      )}

      {status?.configured && !status.authenticated && (
        <form onSubmit={(event) => void login(event)} className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="mb-1 text-lg font-bold">Privé programmeerpaneel</h2>
          <p className="mb-5 text-sm text-slate-600">Log in om DeepSeek toegang te geven tot de codevoorstellen voor Thuisles.</p>
          <label htmlFor="ai-password" className="mb-2 block text-sm font-semibold">Beheerwachtwoord</label>
          <input id="ai-password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base outline-none focus:border-viool" required />
          <button type="submit" disabled={busy} className="mt-4 w-full rounded-lg bg-viool px-4 py-3 font-bold text-white hover:bg-viool-diep disabled:opacity-50">
            {busy ? "Controleren…" : "Open AI Studio"}
          </button>
        </form>
      )}

      {status?.authenticated && (
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <section className="flex min-h-[530px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
              <div>
                <h2 className="font-bold">Gesprek met DeepSeek</h2>
                <p className="text-xs text-slate-500">Repository: crewDailyart-wq/Thuisles · main</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.deepseek ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"}`}>
                {status.deepseek ? "API ingesteld" : "API-key ontbreekt"}
              </span>
            </div>

            <div aria-live="polite" className="flex-1 space-y-4 px-4 py-6 sm:px-6">
              {messages.length === 0 && (
                <div className="py-8 text-center">
                  <div className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-viool-zacht text-2xl text-viool">✦</div>
                  <h3 className="text-xl font-extrabold">Wat gaan we bouwen?</h3>
                  <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">Je kunt een opdracht in gewone Nederlandse woorden geven. DeepSeek zoekt vervolgens de juiste bronbestanden op.</p>
                  <div className="mt-6 grid gap-2 text-left">
                    {IDEAS.map((idea) => <button key={idea} onClick={() => setDraft(idea)} className="rounded-lg border border-slate-200 px-4 py-3 text-left text-sm hover:border-viool hover:bg-viool-zacht">{idea}</button>)}
                  </div>
                </div>
              )}

              {messages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[94%] whitespace-pre-wrap break-words rounded-xl px-4 py-3 text-sm leading-relaxed ${message.role === "user" ? "bg-viool text-white" : "border border-slate-200 bg-slate-50 text-slate-800"}`}>{message.content}</div>
                </div>
              ))}
              {busy && <div className="flex items-center gap-2 text-sm text-slate-500"><span className="size-2 animate-pulse rounded-full bg-viool" />DeepSeek onderzoekt de code en werkt aan je opdracht…</div>}
            </div>

            <form onSubmit={(event) => { event.preventDefault(); void send(); }} className="border-t border-slate-200 p-4">\n              {error && <div role="alert" className="mb-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm font-semibold text-red-800">DeepSeek reageert niet: {error}</div>}
              <label htmlFor="ai-prompt" className="sr-only">Opdracht voor DeepSeek</label>
              <textarea id="ai-prompt" rows={3} value={draft} onChange={(event) => setDraft(event.target.value)}
                onKeyDown={(event) => { if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) { event.preventDefault(); void send(); } }}
                placeholder="Bijvoorbeeld: voeg een nieuwe oefening met getallenlijn toe voor groep 4…" className="w-full resize-y rounded-xl border border-slate-300 bg-white p-3 text-sm outline-none focus:border-viool" maxLength={4500} />
              <div className="mt-2 flex items-center justify-between gap-2">
                <p className="text-xs text-slate-400">Ctrl + Enter om te versturen</p>
                <button type="submit" disabled={busy || publishing || !draft.trim() || !status.deepseek}
                  className="rounded-lg bg-viool px-5 py-2.5 text-sm font-bold text-white hover:bg-viool-diep disabled:cursor-not-allowed disabled:opacity-40">
                  {busy ? "Bezig…" : "Verstuur opdracht →"}
                </button>
              </div>
            </form>
          </section>

          <aside className="space-y-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="font-bold">Koppelingen</h2>
              <div className="mt-4 space-y-3 text-sm">
                <div className="flex justify-between"><span>DeepSeek API</span><span className={status.deepseek ? "text-emerald-700" : "text-amber-700"}>{status.deepseek ? "Verbonden*" : "Niet ingesteld"}</span></div>
                <div className="flex justify-between"><span>GitHub schrijven</span><span className={status.github ? "text-emerald-700" : "text-amber-700"}>{status.github ? "Token ingesteld" : "Token nodig"}</span></div>
                <p className="text-xs text-slate-500">*API ingesteld; een echte verbinding wordt bij je eerste opdracht getest.</p>
                {!status.github && <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-950">Voeg <code className="font-bold">GITHUB_TOKEN</code> toe aan Railway om voorstellen als pull request te bewaren.</p>}
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h2 className="font-bold">Voorgestelde wijzigingen</h2>
              {changes.length === 0 ? <p className="mt-3 text-sm text-slate-500">Nog geen codewijzigingen. Geef links een programmeeropdracht.</p> : (
                <div className="mt-3 space-y-3">
                  {changes.map((change) => (
                    <details key={change.path} className="rounded-lg border border-slate-200 p-3">
                      <summary className="cursor-pointer break-all text-xs font-bold text-viool">{change.path}</summary>
                      <p className="mt-2 text-xs text-slate-600">{change.explanation}</p>
                      <pre className="mt-3 max-h-52 overflow-auto rounded-md bg-slate-950 p-3 text-[10px] text-slate-100">{change.content}</pre>
                    </details>
                  ))}
                  <p className="text-xs text-slate-600">Er verandert nog niets aan je live website. Je maakt eerst een concept-pull-request op GitHub.</p>
                  <button onClick={() => void publishProposal()} disabled={publishing || !status.github}
                    className="w-full rounded-lg bg-emerald-700 px-3 py-3 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-40">
                    {publishing ? "GitHub-voorstel maken…" : "Maak GitHub-voorstel"}
                  </button>
                </div>
              )}
              {prUrl && <a href={prUrl} target="_blank" rel="noopener noreferrer" className="mt-4 block rounded-lg bg-emerald-50 p-3 text-sm font-semibold text-emerald-800 underline">Open het concept op GitHub ↗</a>}
            </div>
            <div className="rounded-xl bg-slate-900 p-5 text-sm text-white">
              <h2 className="font-bold">Zo werkt publiceren</h2>
              <p className="mt-2 text-slate-300">1. DeepSeek schrijft het voorstel.</p>
              <p className="mt-2 text-slate-300">2. Jij bekijkt de gewijzigde bestanden.</p>
              <p className="mt-2 text-slate-300">3. GitHub maakt een aparte branch en concept-PR.</p>
              <p className="mt-2 text-slate-300">4. Na controle en samenvoegen met main bouwt Railway de nieuwe versie.</p>
            </div>
          </aside>
        </div>
      )}


    </div>
  );
}
