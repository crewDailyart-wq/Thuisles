/**
 * Schil van de openbare pagina's voor ouders.
 *
 * ---------------------------------------------------------------------------
 * Waarom deze pagina's bestaan
 * ---------------------------------------------------------------------------
 * Alles waar een kind mee oefent zit achter een login en wordt níet
 * geïndexeerd. Een zoekmachine zou Thuisles dan nooit kunnen vinden. Daarom is
 * er een openbare kant: pagina's die uitleggen wat een kind in welke groep
 * leert, met een link naar de oefeningen. Die staan los van de oefeningen zelf,
 * zodat Google ze kan lezen zonder iets van een kind te zien.
 *
 * Ze worden volledig op de server opgebouwd (WERKPLAN.md, SEO-basis punt 4).
 * Daar hoeft niets voor te worden ingesteld: een servercomponent zonder
 * `"use client"` levert vanzelf volledige HTML. Er staat hier dus met opzet
 * géén `dynamic = "force-dynamic"`, anders zou elke bezoeker de pagina
 * opnieuw laten bouwen terwijl er niets persoonlijks op staat.
 *
 * Rustig en zakelijk, net als de ouderomgeving: geen landschap, geen mascotte.
 * Het is een ouder die dit leest, meestal vanuit een zoekresultaat.
 */

export default function OpenbaarLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-zakelijk flex min-h-dvh flex-col bg-beheer-vlak text-beheer-inkt">
      {children}
    </div>
  );
}
