# Keuring Klok (squla-klok-hoelaat-1-gouden) — 20 november 2026

Onafhankelijke keurder (deel 1). Er is **niets** aan de les veranderd; dit is alleen een rapport.

## Uitslag: AFGEKEURD (2 fouten, ernst middel)

## Wat er gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-klok-gouden.ts` | goed: 18807 zinnen nagelopen, geen hint die verklapt, altijd een vraag of opdracht, alles past in het tekstvak; 20000 lessen nagespeeld zonder dubbele zin. Bestand ongewijzigd. |
| Inhoud t.o.v. de oude les (15.8) | met de hand vergeleken: dezelfde 13 klokken, tijden en keuzes in dezelfde volgorde als `squla-klok-hoelaat-1` (`squla-klok-gouden-zinnen.ts:577-591` tegen `squla-klok.tsx:1237-1249`). Goed. |
| speelcontrole GOED (route Nee = uitleg) | goed, tot het eind; F16 0, 15.47 0, F11 0; 29 met zin, 9 stil |
| speelcontrole ALLEFOUT (route Ja, proef mis, alles fout) | tot het eind, maar **GOED-REACTIE: 3 met zin, 1 stil, 35 zonder zin van de les** (alle andere lessen in mijn deel: 0 zonder zin). Zie fout 1. |
| `test-klok-gouden-pijl.mjs` route ja-fout | na 10 minuten gestopt zonder uitslag (laptop zeer druk, load ±20); geen bruikbare uitkomst |
| begincontrole | goed (15.38); de vroegere F16 (groet wit, Ja/Nee al tikbaar) is opgelost: groet en startvraag in 1 alinea (`squla-klok-gouden.tsx:620-622`) |

Foto's: scratchpad `k20d1/foto-GOED/squla-klok-hoelaat-1-gouden/`, `k20d1/foto-ALLEFOUT/squla-klok-hoelaat-1-gouden/`.

## Fouten

1. **Na samen voordoen geen zin van Bliepo (15.39 punt 2, 15.49).** Na de 2e fout tikt het kind bij de kleine stap zelf op het antwoord. Dan komt het groene scherm en het geluid, maar Bliepo zegt niets: de les wacht 700 ms (of 1100 ms bij "Zet de kleine wijzer …") en gaat door. 15.49: `bliepoScherm("goed")` hoort vlak vóór Bliepo's slotzin, nooit vóór een wachttijd, en na hulp zegt Bliepo altijd een zin. De speelcontrole telt dit 35 keer als "goed zonder zin".
   - Plek: `src/components/les/lessen/squla-klok-gouden.tsx:475-482` (keuzevraag, samen voordoen: `bliepoScherm("goed")` dan `await l.wacht(700)`, geen zin) en `:526-533` (wijzer zetten, kleine stap: `else await l.wacht(1100)`, geen zin).
   - Ernst: middel. Gevolg ook: de stiltekiezer telt deze keren als "zonder zin".
2. **Synthesis-zinnen herkenbaar vertaald (15.41).** In de uitlegroute staan zinnen die vrijwel woordelijk uit de Engelse Synthesis-les (Hour Hand Hunt) vertaald zijn. Vergeleken met de opname in `SYNTHESIS-ANALYSE/T1-de-urenwijzer.md` en `T2-hele-uren-zetten.md`:
   | Synthesis | Gouden les | Plek |
   |---|---|---|
   | "Follow the clock all the way around. Which number sits at the very bottom?" | "Volg de klok helemaal rond. Welk getal staat onderaan?" | `squla-klok-gouden-zinnen.ts:507` |
   | "Take a look at the highest point of the clock. What number do you see?" | "Kijk naar het hoogste punt van de klok. Welk getal staat daar?" | `:499` |
   | "Now look at the 6. Which number comes right after it?" | "Kijk naar de 6. Welk getal komt erna?" | `:515` |
   | "Here's a tricky one. Which number comes right after the 12?" | "Nu een lastige. Welk getal komt na de 12?" | `:523` |
   | "Here's a tricky one. Is this 7 o'clock?" | "Let op, deze is lastig. Is het nu 7 uur?" | `:568` |
   | "And this orange short hand. What do we call it?" | "En deze korte oranje wijzer? Hoe heet die?" | `:542` |
   | "Tap the 5, or drag the orange hour hand there." | "Tik op de 5, of sleep de kleine wijzer erheen." | `:218` |
   | "Going this direction around a clock is called clockwise." | "Deze kant op heet: met de klok mee." | `:171` |
   | "No problem. Let's go through it together." | "Dat geeft niks. We gaan het samen bekijken." | `:204` |
   WIJZIGINGEN-ZINNEN-KLOK.md (regel 183) zegt "De klok had geen eigen Synthesis-zinnen meer", maar die vergelijking keek alleen naar het Nederlandse draaiboek, niet naar de Engelse opname. Ernst: middel. Let op: de vragen zelf zijn de vragen van het skelet; alleen de woorden moeten eigen worden (15.41).

## Opmerkingen

- "De bezorgbus staat klaar bij de bakkerij." terwijl er geen bakkerij in beeld is, en de bus staat los naast de klok zonder ondergrond (15.34/woorden passen bij beeld; zin is wel inhoud van Squla). Foto `foto-GOED/…/021.jpg`.
- De getallenlijn bij "Tik op een getal op de lijn." staat in een wit vak met zwarte cijfers: al als vraag aan Sara gemeld op 19 november (nog open).
- Pijl zonder tekst bij "stil bij goed": gedeeld lesscherm, zie Dagen.

## Goed bevonden

Afspeelknop, startvraag met Ja/Nee (hoort bij de klok), vraag altijd in beeld, keuzes rechts onder Bliepo, geen dubbele tekst, geen "nagekeken", geen "vinkje" in een zin, eindzin + "Tik op de kaart." en afscheid pas na de tik (`squla-klok-gouden.tsx:660-671`), gloed om de wijzer en oranje ring (7.9), 2 pogingen, cijfers.

## Niet kunnen nagaan

Echte stem, geluiden horen, vloeiendheid (bewust niet), het testscript `test-klok-gouden-pijl.mjs` (liep 10 minuten zonder uitslag door de drukte; opnieuw draaien als de laptop rustig is).
