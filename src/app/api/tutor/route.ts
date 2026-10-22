/**
 * Praten met Bliepo (22 oktober 2026, opdracht eigenaar).
 *
 * POST /api/tutor (multipart): het kind hield de knop "Vraag het Bliepo"
 * ingedrukt en stelde een vraag. Velden:
 *   - audio: de opname (hooguit 15 seconden; wordt nergens bewaard);
 *   - seconden: hoe lang de opname was;
 *   - context: JSON met de opgave (id, tekst, domein, leerdoel, maatje-tip en
 *     -uitleg), de stap op de hintladder en het gesprek tot nu toe.
 *
 * Volgorde, van goedkoop naar duur:
 *   1. luisteren (OpenAI spraak naar tekst);
 *   2. standaardvraag? ("ik snap het niet", "help", "is dit goed?", ...) dan
 *      een vooraf gemaakt antwoord uit de hintladder, zonder AI;
 *   3. hetzelfde soort vraag al eens gesteld bij deze opgave? Dan het
 *      bewaarde antwoord (tekst en geluid), zonder nieuwe kosten;
 *   4. anders: nadenken (OpenAI), veiligheidscontrole (moderation), en Ruth
 *      spreekt het uit (ElevenLabs, of Fish Audio als de tekens op zijn).
 *
 * Limieten: per kind per dag (instelling ouder), het OpenAI-budget per maand,
 * en een reserve aan ElevenLabs-tekens. Staat "Praten met Bliepo" uit bij dit
 * kind, dan doet deze route niets. Op /voorbeeld-bliepo staat een demo die
 * zonder kind werkt (met een eigen daglimiet).
 */

import { createHash } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { huidigKind } from "@/lib/auth/sessie";
import { verbinding } from "@/lib/db/sqlite";
import { bewaarTutorGeluid, controleerLive, leesTutorGeluid, profielVoor, spreekLive } from "@/lib/stem-server";
import { budget, elevenTekens, elevenVoorLive, liveVandaag, telDag, telLiveVraag } from "@/lib/tutor/gebruik";
import { herkenVraag, ladderVoor, VASTE_ANTWOORDEN } from "@/lib/tutor/hints";
import { haalBliepoInstellingen } from "@/lib/tutor/instellingen";
import { bedenkAntwoord, isVeilig, lijkt, luisterNaarKind, openaiAan, vingerafdruk, zonderNamen } from "@/lib/tutor/openai";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Zo veel lijkt een vraag minstens op een eerdere vraag bij dezelfde opgave om het antwoord te delen. */
const ZELFDE_VRAAG = 0.9;
/** De demo op /voorbeeld-bliepo: zoveel live vragen per dag, voor iedereen samen. */
const DEMO_PER_DAG = 50;
let demo = { datum: "", aantal: 0 };

type Context = {
  opgaveId: string;
  opgaveTekst: string;
  domein: string;
  leerdoel: string;
  tip: string;
  uitleg: string;
  hintStap: number;
  gesprek: { vraag: string; antwoord: string }[];
  demo: boolean;
  groep: number;
};

function leesContext(ruw: unknown): Context {
  const c = (typeof ruw === "string" ? JSON.parse(ruw) : {}) as Partial<Context>;
  const tekst = (v: unknown, max = 600) => (typeof v === "string" ? v.slice(0, max) : "");
  return {
    opgaveId: tekst(c.opgaveId, 200),
    opgaveTekst: tekst(c.opgaveTekst),
    domein: tekst(c.domein, 60),
    leerdoel: tekst(c.leerdoel, 200),
    tip: tekst(c.tip),
    uitleg: tekst(c.uitleg, 1200),
    hintStap: Math.max(0, Math.min(10, Number(c.hintStap) || 0)),
    gesprek: Array.isArray(c.gesprek)
      ? c.gesprek.slice(-3).map((g) => ({ vraag: tekst(g?.vraag, 300), antwoord: tekst(g?.antwoord, 300) }))
      : [],
    demo: c.demo === true,
    groep: Math.max(1, Math.min(8, Number(c.groep) || 4)),
  };
}

/** De volgende tree op de hintladder. Eigen tip en uitleg van de opgave gaan voor. */
function hint(c: Context) {
  const ladder = ladderVoor(c.domein, `${c.opgaveId} ${c.leerdoel}`, c.opgaveTekst);
  const treden = [c.tip || ladder.hints[0], ladder.hints[1], ladder.hints[2], c.uitleg || ladder.uitleg];
  const stap = c.hintStap;
  return { soort: "hint" as const, zinnen: [treden[stap] ?? VASTE_ANTWOORDEN.laatsteHint], hintStap: Math.min(stap + 1, treden.length) };
}

const vast = (zin: string, extra: Record<string, unknown> = {}) => NextResponse.json({ soort: "vast", zinnen: [zin], ...extra });

export async function POST(request: NextRequest) {
  const t0 = performance.now();
  const tijden: Record<string, number> = {};
  const meet = (naam: string) => (tijden[naam] = Math.round(performance.now() - t0));
  const formulier = await request.formData().catch(() => null);
  if (!formulier) return NextResponse.json({ fout: "Geen geldige vraag." }, { status: 400 });
  let c: Context;
  try {
    c = leesContext(formulier.get("context"));
  } catch {
    return NextResponse.json({ fout: "Geen geldige vraag." }, { status: 400 });
  }

  /* Wie vraagt er? Een kind met "Praten met Bliepo" aan, of de demo. */
  const kind = c.demo ? null : await huidigKind().catch(() => null);
  if (!c.demo) {
    if (!kind) return NextResponse.json({ fout: "Geen kind." }, { status: 401 });
    if (!haalBliepoInstellingen(kind.id).praten) return NextResponse.json({ fout: "Praten met Bliepo staat uit." }, { status: 403 });
  }
  /* Geen naam naar OpenAI: ook niet als hij in de opgave staat. */
  if (kind) c.opgaveTekst = zonderNamen(c.opgaveTekst, [kind.roepnaam]);
  const groep = kind?.groep ?? c.groep;
  const profiel = profielVoor(groep);
  const b = budget();

  /* Budget op (of geen OpenAI): de knop geeft gewoon de volgende hint, zonder te luisteren. */
  if (!openaiAan() || b.op) {
    telDag({ vragen: 1, hints: 1 });
    return NextResponse.json({ ...hint(c), opgeladen: false });
  }

  /* De stand van de ElevenLabs-tekens alvast ophalen, terwijl er geluisterd wordt. */
  void elevenTekens();

  // 1. Luisteren ------------------------------------------------------------
  const audio = formulier.get("audio");
  const seconden = Math.min(15, Math.max(0, Number(formulier.get("seconden")) || 0));
  /* Alleen op de laptop, om te testen zonder microfoon: een getypte vraag in plaats van een opname. */
  const testTekst = process.env.NODE_ENV !== "production" ? formulier.get("testtekst") : null;
  if (typeof testTekst !== "string" && (!(audio instanceof Blob) || audio.size < 1000)) {
    return vast(VASTE_ANTWOORDEN.nietGehoord, {
      gehoord: "",
      ...(process.env.NODE_ENV !== "production" && { test: { blob: audio instanceof Blob, grootte: audio instanceof Blob ? audio.size : null } }),
    });
  }
  const gehoordRuw =
    typeof testTekst === "string"
      ? ({ ok: true, waarde: testTekst, kosten: 0 } as const)
      : await luisterNaarKind(audio as Blob, seconden);
  if (!gehoordRuw.ok) {
    telDag({ vragen: 1, hints: 1 });
    return NextResponse.json(hint(c));
  }
  meet("geluisterd");
  const gehoord = zonderNamen(gehoordRuw.waarde, kind ? [kind.roepnaam] : []);
  let kosten = gehoordRuw.kosten;
  if (gehoord.replace(/[^a-zA-Z]/g, "").length < 2) {
    telDag({ vragen: 1, hints: 1, kosten_usd: kosten });
    return vast(VASTE_ANTWOORDEN.nietGehoord, { gehoord });
  }

  // 2. Standaardvraag? --------------------------------------------------------
  const soort = herkenVraag(gehoord);
  if (soort !== "vrij") {
    telDag({ vragen: 1, hints: 1, kosten_usd: kosten });
    if (soort === "herhaal") return NextResponse.json({ soort: "herhaal", gehoord });
    if (soort === "isgoed") return vast(VASTE_ANTWOORDEN.isGoed, { gehoord });
    if (soort === "watdoen") return NextResponse.json({ soort: "herhaal", zinnen: [VASTE_ANTWOORDEN.watDoen], gehoord });
    return NextResponse.json({ ...hint(c), gehoord });
  }

  // Daglimiet (alleen live vragen tellen mee) --------------------------------
  const vandaagDatum = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Amsterdam" }).format(new Date());
  if (kind) {
    const max = haalBliepoInstellingen(kind.id).vragenPerDag;
    if (liveVandaag(kind.id) >= max) {
      telDag({ vragen: 1, kosten_usd: kosten });
      return vast(VASTE_ANTWOORDEN.limiet, { gehoord, limiet: true });
    }
  } else {
    if (demo.datum !== vandaagDatum) demo = { datum: vandaagDatum, aantal: 0 };
    if (demo.aantal >= DEMO_PER_DAG) return vast(VASTE_ANTWOORDEN.limiet, { gehoord, limiet: true });
  }

  // 3 en 4 tegelijk: vingerafdruk (gedeeld antwoord?) en nadenken ------------
  const opgave = c.opgaveId || `tekst:${createHash("sha1").update(c.opgaveTekst).digest("hex").slice(0, 16)}`;
  /* Alleen op de laptop: "!zeg ..." slaat het nadenken over, om de stem te testen zonder OpenAI-tegoed. */
  const testZeg = typeof testTekst === "string" && testTekst.startsWith("!zeg ") ? testTekst.slice(5) : null;
  const [afdruk, gedacht] = await Promise.all([
    vingerafdruk(gehoord),
    testZeg
      ? Promise.resolve({ ok: true, waarde: testZeg, kosten: 0 } as const)
      : bedenkAntwoord(gehoord, { opgave: c.opgaveTekst, groep, leerdoel: c.leerdoel, gesprek: c.gesprek }),
  ]);
  kosten += afdruk.kosten;
  meet("nagedacht");

  if (afdruk.ok) {
    const eerder = verbinding()
      .prepare("select id, tekst, bestand, vingerafdruk from tutor_antwoorden where opgave = ? and profiel = ?")
      .all(opgave, profiel) as { id: number; tekst: string; bestand: string; vingerafdruk: string }[];
    let beste: (typeof eerder)[number] | null = null;
    let score = 0;
    for (const e of eerder) {
      const s = lijkt(afdruk.waarde, JSON.parse(e.vingerafdruk) as number[]);
      if (s > score) [beste, score] = [e, s];
    }
    if (beste && score >= ZELFDE_VRAAG) {
      const geluid = await leesTutorGeluid(beste.bestand);
      if (geluid) {
        verbinding().prepare("update tutor_antwoorden set gebruikt = gebruikt + 1 where id = ?").run(beste.id);
        /* Het nadenken liep al mee; die kosten tellen wel. */
        telDag({ vragen: 1, gedeeld: 1, kosten_usd: kosten + gedacht.kosten });
        return NextResponse.json({ soort: "gedeeld", tekst: beste.tekst, audio: geluid.toString("base64"), gehoord });
      }
    }
  }

  kosten += gedacht.kosten;
  if (!gedacht.ok) {
    telDag({ vragen: 1, hints: 1, kosten_usd: kosten });
    return NextResponse.json({ ...hint(c), gehoord });
  }

  /* Geen naam in wat Bliepo zegt; staat er toch {naam}, dan valt het weg. */
  const tekst = gedacht.waarde.replace(/\s*,?\s*\{naam\}\s*,?/g, " ").replace(/\s{2,}/g, " ").trim();
  /*
    Veiligheidscontrole en uitspreken tegelijk (scheelt ±0,8 s). Komt het
    antwoord niet door de controle, dan wordt het geluid weggegooid en krijgt
    het kind een hint; Bliepo zegt een tegengehouden antwoord dus nooit.
  */
  meet("gecontroleerd");
  const elevenMag = await elevenVoorLive(tekst.length + 60);
  meet("tekens");
  const [veilig, stem] = await Promise.all([isVeilig(tekst), spreekLive(tekst, profiel, elevenMag)]);
  meet("uitgesproken");
  if (!veilig) {
    console.warn("[tutor] antwoord tegengehouden door de veiligheidscontrole");
    telDag({ vragen: 1, hints: 1, kosten_usd: kosten });
    return NextResponse.json({ ...hint(c), gehoord });
  }

  if (kind) telLiveVraag(kind.id);
  else demo.aantal++;
  telDag({
    vragen: 1,
    live: 1,
    kosten_usd: kosten,
    eleven_tekens: stem?.dienst === "elevenlabs" ? stem.tekens : 0,
    fish_tekens: stem?.dienst === "fish" ? stem.tekens : 0,
  });
  if (!stem) return NextResponse.json({ soort: "tekst", tekst, gehoord });

  /* Achteraf: klopt het geluid woord voor woord, dan wordt het gedeeld met andere kinderen. */
  if (afdruk.ok) {
    const naam = `${createHash("sha1").update(`${opgave}\n${profiel}\n${tekst}`).digest("hex").slice(0, 24)}.mp3`;
    void controleerLive(tekst, stem.data).then(async (goed) => {
      if (!goed) return;
      await bewaarTutorGeluid(naam, stem.data);
      verbinding()
        .prepare(
          "insert into tutor_antwoorden (opgave, profiel, soort, vingerafdruk, tekst, bestand, aangemaakt_op) values (?, ?, 'vrij', ?, ?, ?, ?)",
        )
        .run(opgave, profiel, JSON.stringify(afdruk.waarde.map((v) => Math.round(v * 1e4) / 1e4)), tekst, naam, new Date().toISOString());
    });
  }

  return NextResponse.json({
    soort: "live",
    tekst,
    audio: stem.data.toString("base64"),
    gehoord,
    ...(process.env.NODE_ENV !== "production" && { tijden, dienst: stem.dienst }),
  });
}
