/**
 * Welke schrijver hoort bij welke figuur, voor Optellen en Aftrekken.
 */

import {
  aanvulTabel,
  balans,
  flitsen,
  gewoneSom,
  handig,
  kaartKeuze,
  koppelen,
  leesKaart,
  metSom,
  pootjes,
  somBijPlaatje,
  somMetLeeg,
  somWoorden,
  tweeGetallen,
  type Kaart,
} from "@/lib/maatje/schrijvers/rekenen";
import { zin } from "@/lib/maatje/bouw";
import type { Plaatje } from "@/lib/maatje/schrijvers/som";
import type { Geschreven } from "@/lib/maatje/types";
import type { Opgave } from "@/lib/maatje/schrijf";

const teken = (t: unknown): "+" | "−" => (t === "+" ? "+" : "−");

export function schrijfRekenen(o: Opgave): Geschreven | null {
  const f = o.figuur;
  /*
    Een kale som zonder tekening ("Hoeveel is 5 + 3?"), van de types Optellen
    en Aftrekken. Alleen met twee getallen; drie getallen krijgen (nog) geen
    maatje.
  */
  if (!f) {
    const s = o.somgegevens;
    if (s && (s.soort === "optellen" || s.soort === "aftrekken") && s.getallen.length === 2) {
      const [a, b] = s.getallen;
      return gewoneSom(o, a, s.soort === "optellen" ? "+" : "−", b, "geen");
    }
    return null;
  }
  if (typeof f !== "object") return null;

  switch (f.soort) {
    case "plussom":
      return gewoneSom(o, f.eerste, "+", f.tweede, "geen");

    /* De getaltegels (Godot): twee tegels samen. */
    case "godotspel":
      if (f.spel === "tegels" && (f.stand === "samen" || f.stand === "dubbel")) {
        return gewoneSom(o, Number(f.opgave.a), "+", Number(f.opgave.b), "geen");
      }
      return null;

    case "minsom":
      return gewoneSom(o, f.van, "−", f.af, "geen");

    case "rekenrekflits":
      return flitsen(o, f.aantal);

    case "rekenrekhoofd":
      return gewoneSom(o, f.van, "−", f.af, "geen");

    case "rekenrekaf":
      return gewoneSom(o, f.van, "−", f.af, "rekenrek");

    case "rekenrekerbij": {
      const p: Plaatje = f.rekenrek ? "rekenrek" : "geen";
      if (f.stand === "pootjes") return pootjes(o, f.eerste, f.tweede);
      if (f.stand === "aanvullen") {
        const s = somMetLeeg(o, "+", [f.eerste, f.tweede, 10], 1, p);
        if (f.omgekeerd) s.teksten.voorlezen = zin(metSom(o.vraagtekst, `10 is ${f.eerste} plus hoeveel?`));
        return s;
      }
      return gewoneSom(o, f.eerste, "+", f.tweede, p, f.rekenrek ? `Schuif er ${f.tweede} ${f.tweede === 1 ? "kraal" : "kralen"} bij.` : undefined);
    }

    case "viatien":
      if (f.pootjes) return pootjes(o, f.eerste, f.tweede);
      return null;

    case "plaatjessom": {
      const p: Plaatje = f.bouw === "strook" || f.hulpBijFout === "strook" ? "strook" : "plaatjes";
      if (f.stand === "som") return somBijPlaatje(o, f.eerste, "+", f.tweede, "plaatjes");
      return gewoneSom(o, f.eerste, "+", f.tweede, p);
    }

    case "plaatjesminsom":
      return gewoneSom(o, f.totaal, "−", f.eraf, "plaatjes");

    case "wegstrepen":
      return gewoneSom(o, f.totaal, "−", f.eraf, "plaatjes", `Streep er ${f.eraf} weg.`);

    case "minsomplaatje":
      return somBijPlaatje(o, f.totaal, "−", f.eraf, "plaatjes");

    case "rekensom": {
      const op = teken(f.teken);
      const g = f.getallen as number[];
      if (f.weergave === "som") {
        const vraag = /\d/.test(o.vraagtekst) ? undefined : o.vraagtekst;
        return somMetLeeg(o, op, [g[0], g[1], g[2]], f.leeg, "geen", vraag && vraag.endsWith("?") ? vraag : undefined);
      }
      if (f.weergave === "balans") {
        return balans(o, [f.leeg === 0 ? null : g[0], f.leeg === 1 ? null : g[1]], teken(f.linksTeken), [f.leeg === 2 ? null : g[2], f.leeg === 3 ? null : g[3]], teken(f.rechtsTeken), "geen");
      }
      if (f.weergave === "kaarten") {
        const kaarten = (f.kaarten as string[]).map(leesKaart);
        if (kaarten.some((k) => !k)) return null;
        const v = o.somgegevens?.variant;
        if (v === "klopt") return kaartKeuze(o, "klopt", kaarten as Kaart[], f.goed);
        if (v === "nietbij") {
          const doel = Number((o.vraagtekst.match(/(\d+)\?$/) ?? [])[1]);
          return kaartKeuze(o, "nietbij", kaarten as Kaart[], f.goed, Number.isFinite(doel) ? doel : undefined);
        }
        if (v === "evenveel") {
          const boven = f.boven ? leesKaart(f.boven) : leesKaart((o.vraagtekst.match(/als (.+)\?$/) ?? [])[1] ?? "");
          return boven ? kaartKeuze(o, "evenveel", kaarten as Kaart[], f.goed, undefined, boven) : null;
        }
        return null;
      }
      if (f.weergave === "stippen") return somBijPlaatje(o, g[0], op, g[1], "plaatjes");
      if (f.weergave === "tweegetallen") return tweeGetallen(o, f.lijst, g[2]);
      if (f.weergave === "handig") return handig(o, f.lijst);
      return null;
    }

    case "aanvultabel":
      return aanvulTabel(o, f.doel, f.getallen, f.hulpBijFout === "strook" ? "strook" : "geen");

    case "balans":
      return balans(o, f.links, "+", f.rechts, "+", f.hulpBijFout === "weegschaal" ? "weegschaal" : "geen");

    case "evenveelsom": {
      const kaarten: Kaart[] = (f.kaarten as { eerste: number; tweede: number }[]).map((k) => ({ a: k.eerste, b: k.tweede, op: "+" }));
      return kaartKeuze(o, "evenveel", kaarten, Number(o.antwoord), undefined, { a: f.eerste, b: f.tweede, op: "+" });
    }

    case "somkeuze": {
      const kaarten: Kaart[] = (f.kaarten as { eerste: number; tweede: number; uitkomst: number }[]).map((k) => ({ a: k.eerste, b: k.tweede, op: "+", uitkomst: k.uitkomst }));
      if (f.stand === "klopt") return kaartKeuze(o, "klopt", kaarten, Number(o.antwoord));
      if (f.stand === "nietbij") return kaartKeuze(o, "nietbij", kaarten.map((k) => ({ ...k, uitkomst: undefined })), Number(o.antwoord), f.doel);
      return null;
    }

    case "koppelsommen":
      return koppelen(o, (f.sommen as { eerste: number; tweede: number }[]).map((k) => ({ a: k.eerste, b: k.tweede, op: "+" })));

    case "minkoppelen":
      return koppelen(o, (f.sommen as { eerste: number; tweede: number }[]).map((k) => ({ a: k.eerste, b: k.tweede, op: "−" })));

    case "tweegetallen":
      return tweeGetallen(o, f.getallen, f.doel);

    case "raketsom": {
      /* De raket: dezelfde uitleg als "Kies twee getallen", met een bouw-aanwijzing. */
      const s = tweeGetallen(o, f.stenen, f.doel);
      if (s) s.teksten.bouw = zin(f.stand === "aanvullen" ? "Tik op de steen die erbij moet." : "Tik op twee stenen.", "de stenen zweven");
      return s;
    }

    default:
      return null;
  }
}

export { somWoorden };
