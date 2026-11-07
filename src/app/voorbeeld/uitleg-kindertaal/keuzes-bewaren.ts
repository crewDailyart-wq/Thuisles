import "server-only";
import { appendFileSync, existsSync, mkdirSync, readFileSync, renameSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { leesbareLesTekst } from "@/lib/lessen/tekstbewerking";
import { cijfersInTekst } from "@/lib/lessen/cijfertaal";
import { voorstelMetOpmaak } from "./opmaak";
import { leesControle } from "../beginschermen/bewaren";
import voorstellen from "./alle-voorstellen.json";

export type TekstKeuzeStand = {
  actueel: string;
  vorig: string;
  aan: boolean;
  kanTerug: boolean;
};
type Bewijs = { soort: string; sleutel: string; versie: string; oud: string; nieuw: string; aan: boolean; eigenTekst?: string };
export type KeuzeResultaat = { stand?: TekstKeuzeStand; nieuw?: string; versie?: string; fout?: string };
const map = path.join(process.cwd(), "output/lescontrole");
const logPad = path.join(map, "kindertaal-keuzes.jsonl");
const tekstPad = path.join(process.cwd(), "src/lib/lessen/tekstwijzigingen.json");

export const alleVoorstellen = voorstellen.map((les) => ({
  ...les,
  regels: les.regels.map((regel) => ({
    ...regel,
    hulp: "hulp" in regel && regel.hulp === true,
    nieuw: cijfersInTekst(regel.nieuw),
    sleutel: createHash("sha256").update(`${les.id}\0${regel.bron}`).digest("hex").slice(0, 24),
    versie: createHash("sha256").update(cijfersInTekst(regel.nieuw)).digest("hex"),
  })),
}));
const index = new Map(alleVoorstellen.flatMap((les) => les.regels.map((regel) => [regel.sleutel, { ...regel, id: les.id }] as const)));

function leesBewijzen() {
  const uit = { bewijzen: new Map<string, Bewijs>(), eigen: new Map<string, string>() };
  if (!existsSync(logPad)) return uit;
  for (const regel of readFileSync(logPad, "utf8").split("\n")) {
    if (!regel.trim()) continue;
    // Een afgebroken laatste logregel mag geen geldige eerder opgeslagen keuze verbergen.
    try {
      const bewijs = JSON.parse(regel) as Bewijs;
      if (bewijs.soort !== "kindertaal" || typeof bewijs.sleutel !== "string") continue;
      if (typeof bewijs.eigenTekst === "string" && bewijs.eigenTekst.trim()) uit.eigen.set(bewijs.sleutel, cijfersInTekst(bewijs.eigenTekst));
      if (bewijs.aan && typeof bewijs.oud === "string" && typeof bewijs.nieuw === "string") uit.bewijzen.set(bewijs.sleutel, bewijs);
    } catch { /* Onvolledige logregel: de lesteksten blijven leidend. */ }
  }
  return uit;
}

function metEigenTekst(regel: NonNullable<ReturnType<typeof index.get>>, eigen: Map<string, string>) {
  const nieuw = eigen.get(regel.sleutel) ?? regel.nieuw;
  return { ...regel, nieuw, versie: createHash("sha256").update(nieuw).digest("hex") };
}

function stand(regel: NonNullable<ReturnType<typeof index.get>>, teksten: Record<string, Record<string, string>>, bewijzen: Map<string, Bewijs>): TekstKeuzeStand {
  const perLes = Object.hasOwn(teksten, regel.id) ? teksten[regel.id] : {};
  const actueel = Object.hasOwn(perLes, regel.bron) ? perLes[regel.bron] : regel.bron;
  const nieuw = voorstelMetOpmaak(regel.nieuw, regel.bron);
  const bewijs = bewijzen.get(regel.sleutel);
  const aan = actueel === nieuw;
  const kanTerug = aan && bewijs?.versie === regel.versie && bewijs.nieuw === actueel;
  return { actueel, aan, kanTerug: Boolean(kanTerug), vorig: kanTerug ? bewijs!.oud : actueel };
}

export function leesKeuzes() {
  const { teksten, zinnen } = leesControle();
  const { bewijzen, eigen } = leesBewijzen();
  return alleVoorstellen.filter((les) => les.id.startsWith("squla-") && Object.hasOwn(zinnen, les.id)).map((les) => ({
    ...les,
    begin: zinnen[les.id],
    regels: les.regels.map((basis) => {
      const regel = metEigenTekst({ ...basis, id: les.id }, eigen);
      return { ...regel, stand: stand(regel, teksten, bewijzen) };
    }),
  }));
}

/** Eén keuze verandert uitsluitend deze exacte tekst in deze les. Geen lesdata of antwoorden. */
export function bewaarKeuze(sleutel: string, aan: boolean, verwacht: string, versie: string): KeuzeResultaat {
  return slaOp(sleutel, aan, verwacht, versie);
}

export function bewaarEigenTekst(sleutel: string, tekst: string, verwacht: string, versie: string): KeuzeResultaat {
  if (typeof tekst !== "string" || !tekst.trim() || tekst.trim().length > 1500) return { fout: "Vul een tekst in van maximaal 1500 tekens." };
  return slaOp(sleutel, true, verwacht, versie, cijfersInTekst(tekst.trim()));
}

function slaOp(sleutel: string, aan: boolean, verwacht: string, versie: string, eigenTekst?: string): KeuzeResultaat {
  const basis = index.get(sleutel);
  if (!basis || typeof aan !== "boolean") return { fout: "Dit voorstel is vernieuwd. Vernieuw de pagina en bekijk de tekst opnieuw." };
  const { bewijzen, eigen } = leesBewijzen();
  let regel = metEigenTekst(basis, eigen);
  const { teksten, zinnen } = leesControle();
  if (!regel.id.startsWith("squla-") || !Object.hasOwn(zinnen, regel.id)) return { fout: "Deze les is niet beschikbaar voor tekstkeuzes." };
  const huidig = stand(regel, teksten, bewijzen);
  const actueel = { stand: huidig, nieuw: regel.nieuw, versie: regel.versie };
  if (versie !== regel.versie || typeof verwacht !== "string" || huidig.actueel !== verwacht) return { ...actueel, fout: "Deze tekst is intussen ergens anders aangepast. De nieuwste tekst staat nu hier. Je invoer blijft staan. Bekijk de teksten eerst en kies daarna opnieuw." };
  if (aan === huidig.aan && (eigenTekst === undefined || eigenTekst === regel.nieuw)) return actueel;
  if (!aan && !huidig.kanTerug) return { stand: huidig, fout: "De eerdere tekst kan hier niet worden teruggezet. Je kunt de tekst in de les bewerken." };
  if (eigenTekst !== undefined) {
    eigen.set(sleutel, eigenTekst);
    regel = metEigenTekst(basis, eigen);
  }
  const nieuw = aan ? voorstelMetOpmaak(regel.nieuw, regel.bron) : huidig.vorig;
  if (!leesbareLesTekst(nieuw).trim() || nieuw.length > 5000) return { stand: huidig, fout: "Dit voorstel bevat geen geldige lestekst." };

  mkdirSync(map, { recursive: true });
  const veranderd = nieuw !== huidig.actueel;
  const bewijs = { soort: "kindertaal", tijd: new Date().toISOString(), sleutel, versie: regel.versie, id: regel.id, bron: regel.bron, oud: huidig.actueel, nieuw, aan: aan && veranderd, ...(eigenTekst === undefined ? {} : { eigenTekst }) };
  // Eerst herstelbare historie, daarna één atomische wijziging van het echte tekstbestand.
  // Een vinkje wordt nooit uit de historie afgeleid, alleen uit de daadwerkelijk opgeslagen tekst.
  appendFileSync(logPad, JSON.stringify(bewijs) + "\n");
  if (veranderd) {
    const perLes = Object.hasOwn(teksten, regel.id) ? teksten[regel.id] : {};
    teksten[regel.id] = { ...perLes, [regel.bron]: nieuw };
    if (nieuw === regel.bron) delete teksten[regel.id][regel.bron];
    if (Object.keys(teksten[regel.id]).length === 0) delete teksten[regel.id];
    writeFileSync(`${tekstPad}.tmp`, JSON.stringify(teksten, null, 2) + "\n");
    renameSync(`${tekstPad}.tmp`, tekstPad);
    if (aan) bewijzen.set(sleutel, bewijs);
  }
  return { stand: stand(regel, teksten, bewijzen), nieuw: regel.nieuw, versie: regel.versie };
}
