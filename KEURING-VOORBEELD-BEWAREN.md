# KEURING voorbeeldpagina bewaart alleen voor Testkind

Onafhankelijke keurder, 12 november 2026, branch backup-squla (commit 4c38ca4). Alleen code gelezen en beoordeeld
(zoals gevraagd; niet getest onder een andere naam, geen echt kind aangeraakt). Niets veranderd, niets online, geen
helpers, hoogste id `les_uitkomsten`: **147**.

Bestanden: `src/lib/data/lesuitkomsten-voorbeeld.ts` (`voorbeeldMagBewaren`), `src/app/lesuitkomstacties.ts`
(`bewaarUitkomst`, regel 20: `if (!voorbeeldMagBewaren((await headers()).get("referer"), kind.roepnaam)) return { ok: false };`),
`scripts/test-voorbeeld-bewaren.ts`.

## UITSLAG: GOEDGEKEURD

0 harde fouten. 2 opmerkingen en 1 vraag voor Sara.

## Wat ik beoordeeld heb

- Logica: op de pagina `/voorbeeld/...` bewaart de tik alleen als de naam in de adresbalk `?naam=Testkind` is EN het gekozen
  profiel `Testkind` heet. Anders `{ ok: false }` (er wordt niets bewaard en er komt geen foutmelding in beeld, de
  functie blijft "stil", zoals in de kop van het bestand staat). Zo komt een voorbeeld nooit in de voortgang van een echt
  kind, ook niet als `?naam=Anna` bij een kind Anna.
- De gewone kinderkant (adres niet onder `/voorbeeld`) blijft zoals het was: `return true`.
- Het testscript `scripts/test-voorbeeld-bewaren.ts` heeft 8 gevallen (Anna met `?naam=Anna`, Testkind zonder naam, `testkind`
  met kleine letter, `?naam=Testkind` met een ander profiel, Testkind goed, gewoon `/oefenen/...`, geen Referer). Dat
  script raakt de database niet aan. Ik heb het niet laten draaien (de opdracht zei: alleen code lezen).
- Alle lessen bewaren via `bewaarUitkomst`: ja, via `squla-extra-basis.ts` en de gouden lessen; de keuring van deze
  functie dekt dus alle gouden lessen en extra lessen. `LesBewerker.tsx` bewaart wel iets (een "wens" van Sara bij een
  les), maar dat is geen gegeven van een kind.

## Opmerkingen

**O1. Zonder Referer wordt er wel bewaard.** `voorbeeldMagBewaren` geeft `true` als de browser geen (leesbare) Referer
meestuurt (regel 11-13). Dat is bewust gedaan voor de gewone kinderkant. Maar een browser of extensie die de Referer
weglaat, op de voorbeeldpagina, bewaart dan wel voor het gekozen profiel, ook een echt kind. De standaardinstelling van
Next.js en browsers stuurt de volledige Referer mee voor dezelfde site; er staat geen `Referrer-Policy` in het project
(ik zocht in `next.config.*` en `src/app/layout.tsx`). Risico klein, maar niet nul.

**O2. De controle zit alleen op de server, niet in de pagina zelf.** Dat is goed (kan niet omzeild worden door de pagina), maar
betekent dat een tik op de voorbeeldpagina een mislukte server-actie is (stil `ok: false`); de les gaat gewoon door (zie
kopregel van het bestand: "meldt nooit een fout en stuurt nooit door").

## Vraag voor Sara

**V1.** Wil je dat een voorbeeld zonder Referer ook NIET bewaart (strenger), en alleen de gewone kinderkant (met een
Referer onder `/oefenen`) bewaart? Dan moet `voorbeeldMagBewaren` bij geen Referer `false` geven voor profielen die niet
"Testkind" heten. Advies: ja, want echte kinderen horen niet in een voorbeeld te komen en een gewone les stuurt altijd
een Referer mee.
