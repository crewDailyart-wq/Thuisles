/**
 * Datatoegangslaag.
 *
 * Dit is de enige plek in de app die weet WAAR de gegevens vandaan komen.
 *
 * De leerdoelstructuur (vak, domein, subdomein, leerdoel) komt uit de
 * database — dezelfde bron als de beheeromgeving. Wat daar wordt aangemaakt,
 * verschijnt dus meteen bij het kind. Kindprofielen en voortgang komen sinds
 * stap 1 óók uit de database, gekoppeld aan een echt ouderaccount. Alleen de
 * beloningen en de wereldkaart staan nog in `seed.ts`: dat is de visuele laag
 * waarvan de mechaniek nog niet is vastgesteld.
 *
 * De functies zijn met opzet al `async`, zodat die overstap geen aanpassing
 * in de aanroepende schermen vraagt.
 */

import "server-only";

import { bepaalAanbeveling, pastBijGroep } from "@/lib/aanbeveling";
import * as seed from "@/lib/data/seed";
import { haalVoortgang } from "@/lib/data/voortgang";
import {
  haalDomeinen as haalDomeinenUitDb,
  haalLeerdoelen as haalLeerdoelenUitDb,
  haalSubdomeinen as haalSubdomeinenUitDb,
  haalVakken as haalVakkenUitDb,
} from "@/lib/data/structuur";
import { huidigeOuder, huidigKind, vereisKind } from "@/lib/auth/sessie";
import { haalKindVanOuder } from "@/lib/data/kinderen";
import {
  blokkenVoorStartscherm,
  koppelingVoorKind,
} from "@/lib/data/kindschool";
import { haalBlokken } from "@/lib/data/methodes";
import { haalSleutels } from "@/lib/data/sleutels";
import { haalKlaargezet } from "@/lib/data/dashboard";
import type {
  DomeinMetVoortgang,
  Kind,
  LeerdoelVoortgang,
  LeerdoelMetStatus,
  MasteryStatus,
  MethodeBlokMetOnderwerpen,
  MethodeKoppeling,
  OefenStart,
  Sleutelstand,
  Startscherm,
  SubdomeinMetVoortgang,
  Vak,
} from "@/lib/types";

/*
  Kleine hulpjes zodat de rest van dit bestand nauwelijks verandert: waar
  eerder de lijst uit seed.ts stond, komt het nu uit de database.
*/
const structuur = {
  get vakken() {
    return haalVakkenUitDb();
  },
  get domeinen() {
    return haalDomeinenUitDb();
  },
  get subdomeinen() {
    return haalSubdomeinenUitDb();
  },
  get leerdoelen() {
    return haalLeerdoelenUitDb();
  },
};

/** De voortgang uit de database, in de vorm die de schermen verwachten. */
function voortgangAlsLijst(kindId: string): LeerdoelVoortgang[] {
  return haalVoortgang(kindId).map((v) => ({
    kindId,
    leerdoelId: v.leerdoelId,
    status: v.status,
    aantalDirectGoed: v.aantalDirectGoed,
    aantalGoedNaHulp: v.aantalGoedNaHulp,
    aantalGoedNaMeerderePogingen: 0,
    aantalNogNietBeheerst: v.aantalNogNietBeheerst,
    laatstGeoefendOp: v.laatstGeoefendOp,
  }));
}

/**
 * Eén kindprofiel — maar alleen als het bij de ingelogde ouder hoort.
 *
 * De controle staat hier, bij de gegevens zelf, en niet alleen in het scherm.
 * Een kind-id uit een webadres of een koekje levert dus nooit gegevens van een
 * ander gezin op.
 */
export async function haalKind(kindId: string): Promise<Kind | null> {
  const ouder = await huidigeOuder();
  if (!ouder) return null;
  return haalKindVanOuder(ouder.id, kindId);
}

/**
 * Het kindprofiel dat op dit apparaat aan het oefenen is.
 *
 * Is er geen ouder ingelogd, of is er nog geen profiel gekozen, dan stuurt
 * `vereisKind` door naar het juiste scherm.
 */
export async function haalHuidigKind(): Promise<Kind> {
  return vereisKind();
}

/** Zonder doorsturen: voor plekken die zelf willen beslissen wat er gebeurt. */
export async function haalActiefKindOfNull(): Promise<Kind | null> {
  return huidigKind();
}

export async function haalStartscherm(kindId: string): Promise<Startscherm> {
  const kind = await haalKind(kindId);
  if (!kind) throw new Error(`Onbekend kindprofiel: ${kindId}`);

  const voortgangVanKind = voortgangAlsLijst(kind.id);

  const subdomeinen: SubdomeinMetVoortgang[] = structuur.subdomeinen
    .map((subdomein) => {
      const domein = structuur.domeinen.find((d) => d.id === subdomein.domeinId)!;
      const leerdoelenVanSubdomein = structuur.leerdoelen.filter(
        (ld) => ld.subdomeinId === subdomein.id && pastBijGroep(ld, kind),
      );
      const aantalBeheerst = leerdoelenVanSubdomein.filter((ld) =>
        voortgangVanKind.some(
          (v) => v.leerdoelId === ld.id && v.status === "beheerst",
        ),
      ).length;

      return {
        subdomein,
        domein,
        aantalLeerdoelen: leerdoelenVanSubdomein.length,
        aantalBeheerst,
      };
    })
    // Alleen subdomeinen tonen waar voor deze groep iets te oefenen valt.
    .filter((s) => s.aantalLeerdoelen > 0)
    .sort(
      (a, b) =>
        a.domein.volgorde - b.domein.volgorde ||
        a.subdomein.volgorde - b.subdomein.volgorde,
    );

  /*
    "Voor jou": heeft de ouder iets klaargezet, dan gaat dat voor. Anders geldt
    de gewone regel uit `aanbeveling.ts`. In beide gevallen is in één zin uit
    te leggen waarom juist dit wordt voorgesteld — er zit geen AI in.
  */
  const klaargezet = haalKlaargezet(kind.id);
  const eerstKlaar = klaargezet
    .map((k) => {
      const leerdoel = structuur.leerdoelen.find((ld) => ld.id === k.leerdoelId);
      const subdomein = leerdoel
        ? structuur.subdomeinen.find((s) => s.id === leerdoel.subdomeinId)
        : undefined;
      if (!leerdoel || !subdomein) return null;

      const v = voortgangVanKind.find((x) => x.leerdoelId === leerdoel.id);
      return {
        leerdoel,
        subdomein,
        status: v?.status ?? ("nog_niet_gestart" as MasteryStatus),
        waarom: "Dit heeft je vader of moeder voor je klaargezet.",
      };
    })
    .find((x) => x !== null);

  const aanbeveling =
    eerstKlaar ??
    bepaalAanbeveling(
      kind,
      structuur.leerdoelen,
      structuur.subdomeinen,
      voortgangVanKind,
    );

  /*
    School en methode komen uit wat de ouder heeft ingesteld. Is er niets
    ingesteld, dan blijft het onbekend — er wordt nooit iets geraden of
    automatisch ingevuld. Het kind ziet dan alleen "Vrij oefenen" en
    "Voor jou", en dat is precies goed.
  */
  const methode = koppelingVoorKind(kind.id);

  return {
    kind,
    vakken: structuur.vakken,
    aanbeveling,
    subdomeinen,
    methode,
    // Harde regel: zonder betrouwbaar bekende methode tonen we geen blokken.
    methodeBlokken: blokkenVoorStartscherm(kind.id, kind.groep),
    wereld: [...seed.wereldGebieden].sort((a, b) => a.volgorde - b.volgorde),
  };
}

// ---------------------------------------------------------------------------
// Navigatie binnen een vak: vak -> domein -> subdomein -> oefenstart
//
// Alle functies hieronder lezen dezelfde leerdoelstructuur als het
// startscherm. Er is geen aparte lijst voor de navigatie: wat je hier ziet,
// komt uit `vakken`, `domeinen`, `subdomeinen` en `leerdoelen`. Een leerdoel
// dat wordt toegevoegd, verschijnt dus vanzelf in de tellingen.
// ---------------------------------------------------------------------------

/** Leerdoelen tellen alleen mee als ze bij de groep van het kind horen. */
function leerdoelenVoor(subdomeinId: string, kind: Kind) {
  return structuur.leerdoelen.filter(
    (ld) => ld.subdomeinId === subdomeinId && pastBijGroep(ld, kind),
  );
}

function statusVan(kindId: string, leerdoelId: string): MasteryStatus {
  const v = haalVoortgang(kindId).find((r) => r.leerdoelId === leerdoelId);
  return v?.status ?? "nog_niet_gestart";
}

export async function haalVakken(): Promise<Vak[]> {
  return structuur.vakken;
}

export async function haalVak(vakSlug: string): Promise<Vak | null> {
  return structuur.vakken.find((v) => v.slug === vakSlug && v.actief) ?? null;
}

/** Alle domeinen van een vak, met hoeveel er binnen elk domein al beheerst is. */
export async function haalDomeinen(
  vakSlug: string,
  kindId: string,
): Promise<DomeinMetVoortgang[]> {
  const kind = await haalKind(kindId);
  const vak = await haalVak(vakSlug);
  if (!kind || !vak) return [];

  return structuur.domeinen
    .filter((d) => d.vakId === vak.id)
    .sort((a, b) => a.volgorde - b.volgorde)
    .map((domein) => {
      const subs = structuur.subdomeinen.filter((s) => s.domeinId === domein.id);
      const leerdoelen = subs.flatMap((s) => leerdoelenVoor(s.id, kind));

      return {
        domein,
        aantalSubdomeinen: subs.length,
        aantalLeerdoelen: leerdoelen.length,
        aantalBeheerst: leerdoelen.filter(
          (ld) => statusVan(kind.id, ld.id) === "beheerst",
        ).length,
      };
    });
}

export async function haalDomein(vakSlug: string, domeinSlug: string) {
  const vak = await haalVak(vakSlug);
  if (!vak) return null;
  return (
    structuur.domeinen.find((d) => d.vakId === vak.id && d.slug === domeinSlug) ??
    null
  );
}

/** De onderwerpen binnen een domein, elk met een voortgangsindicatie. */
export async function haalSubdomeinen(
  vakSlug: string,
  domeinSlug: string,
  kindId: string,
): Promise<SubdomeinMetVoortgang[]> {
  const kind = await haalKind(kindId);
  const domein = await haalDomein(vakSlug, domeinSlug);
  if (!kind || !domein) return [];

  return structuur.subdomeinen
    .filter((s) => s.domeinId === domein.id)
    .sort((a, b) => a.volgorde - b.volgorde)
    .map((subdomein) => {
      const leerdoelen = leerdoelenVoor(subdomein.id, kind);
      return {
        subdomein,
        domein,
        aantalLeerdoelen: leerdoelen.length,
        aantalBeheerst: leerdoelen.filter(
          (ld) => statusVan(kind.id, ld.id) === "beheerst",
        ).length,
      };
    })
    // Onderwerpen zonder leerdoelen voor deze groep laten we weg: daar valt
    // voor dit kind niets te oefenen.
    .filter((s) => s.aantalLeerdoelen > 0);
}

/** Het startpunt van een oefening: welk onderwerp, en welke leerdoelen erin. */
export async function haalOefenStart(
  vakSlug: string,
  domeinSlug: string,
  subdomeinSlug: string,
  kindId: string,
): Promise<OefenStart | null> {
  const kind = await haalKind(kindId);
  const vak = await haalVak(vakSlug);
  const domein = await haalDomein(vakSlug, domeinSlug);
  if (!kind || !vak || !domein) return null;

  const subdomein = structuur.subdomeinen.find(
    (s) => s.domeinId === domein.id && s.slug === subdomeinSlug,
  );
  if (!subdomein) return null;

  const leerdoelen: LeerdoelMetStatus[] = leerdoelenVoor(subdomein.id, kind)
    .sort((a, b) => a.volgorde - b.volgorde)
    .map((leerdoel) => ({ leerdoel, status: statusVan(kind.id, leerdoel.id) }));

  return {
    vak,
    domein,
    subdomein,
    leerdoelen,
    aantalBeheerst: leerdoelen.filter((l) => l.status === "beheerst").length,
  };
}


// ---------------------------------------------------------------------------
// Oefenen volgens school en methode
// ---------------------------------------------------------------------------

/**
 * Alles wat het scherm "Oefenen volgens school" nodig heeft.
 *
 * Belangrijk: dit haalt GEEN andere vragen op dan vrij oefenen. Het is exact
 * dezelfde Thuisles-structuur van domein, onderwerp en leerdoel. Wat de
 * methodekoppeling toevoegt is alleen de VOLGORDE: `blok_leerdoelen` zegt
 * welke leerdoelen bij welk blok horen, en die volgorde bepaalt hier onder
 * welk blok een onderwerp verschijnt.
 *
 * Twee harde regels uit het project blijven staan:
 *
 *   1. Is de methode niet betrouwbaar bekend, of staat "volgen" uit, dan komen
 *      er geen blokken terug. De pagina toont dan "Rekenmethode nog niet
 *      bekend" en vrij oefenen blijft gewoon werken.
 *   2. Er wordt nooit geraden. Een blok zonder ingevulde koppeling krijgt een
 *      lege lijst onderwerpen — niet een zelfbedachte gok.
 */
export async function haalMethodeoverzicht(kindId: string): Promise<{
  methode: MethodeKoppeling;
  blokken: MethodeBlokMetOnderwerpen[];
}> {
  const kind = await haalKind(kindId);
  if (!kind) throw new Error(`Onbekend kindprofiel: ${kindId}`);

  const methode = koppelingVoorKind(kind.id);
  const metStatus = blokkenVoorStartscherm(kind.id, kind.groep);

  // Geen methode of niet volgen: dan is er niets te tonen. Zie regel 1.
  if (metStatus.length === 0 || !methode.methode) {
    return { methode, blokken: [] };
  }

  // De koppeling blok -> leerdoelen, in de volgorde die de beheerder gaf.
  const gekoppeld = haalBlokken(methode.methode.id, kind.groep);

  const blokken = metStatus.map((blok) => {
    const leerdoelIds = gekoppeld.find((b) => b.id === blok.id)?.leerdoelIds ?? [];

    /*
      Van leerdoelen naar onderwerpen. Meerdere leerdoelen kunnen bij hetzelfde
      onderwerp horen, dus we houden bij wat we al gezien hebben en bewaren de
      volgorde van de koppeling: het eerste leerdoel bepaalt waar het onderwerp
      in de rij komt te staan.
    */
    const gezien = new Set<string>();
    const onderwerpen: SubdomeinMetVoortgang[] = [];

    for (const leerdoelId of leerdoelIds) {
      const leerdoel = structuur.leerdoelen.find((ld) => ld.id === leerdoelId);
      // Leerdoelen buiten de groep van dit kind tellen niet mee.
      if (!leerdoel || !pastBijGroep(leerdoel, kind)) continue;
      if (gezien.has(leerdoel.subdomeinId)) continue;
      gezien.add(leerdoel.subdomeinId);

      const subdomein = structuur.subdomeinen.find(
        (sub) => sub.id === leerdoel.subdomeinId,
      );
      if (!subdomein) continue;
      const domein = structuur.domeinen.find((d) => d.id === subdomein.domeinId);
      if (!domein) continue;

      const leerdoelen = leerdoelenVoor(subdomein.id, kind);
      onderwerpen.push({
        subdomein,
        domein,
        aantalLeerdoelen: leerdoelen.length,
        aantalBeheerst: leerdoelen.filter(
          (ld) => statusVan(kind.id, ld.id) === "beheerst",
        ).length,
      });
    }

    return { ...blok, onderwerpen };
  });

  return { methode, blokken };
}

// ---------------------------------------------------------------------------
// Sleutels
// ---------------------------------------------------------------------------

/**
 * De sleutels van dit kind, voor de teller bovenaan elk scherm.
 *
 * Dun laagje boven `sleutels.ts`, zodat schermen net als voor al het andere
 * via de datalaag lezen en niet rechtstreeks bij de database komen.
 */
export async function haalSleutelstand(kindId: string): Promise<Sleutelstand> {
  return haalSleutels(kindId);
}
