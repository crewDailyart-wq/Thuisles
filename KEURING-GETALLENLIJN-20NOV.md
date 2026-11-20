# Keuring Getallenlijn (squla-getallenlijn-kat-1-gouden) — 20 november 2026

Onafhankelijke keurder (deel 1). Er is **niets** aan de les veranderd; dit is alleen een rapport.

## Uitslag: AFGEKEURD (1 fout, ernst middel)

## Wat er gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-getallenlijn-gouden.ts` | goed: 15 vragen + uitlegvraag, 37 foute antwoorden, 1168 varianten, geen verklappen, inhoud gelijk aan de oude les (15.8). Bestand ongewijzigd. |
| speelcontrole GOED (route Nee = uitleg) | goed, tot het eind; F16 0, 15.47 0, F11 0; 12 met zin, 4 stil |
| speelcontrole ALLEFOUT (route Ja, proef mis, uitleg, alles fout) | goed, tot het eind; 15 met zin na hulp, 0 zonder zin (15.49 goed) |
| `test-getallenlijn-gouden.mjs` route allefout (foto's) | "Alles in orde"; eindkaart vrij; pijl vanzelf; F7/F8 0; geen overlap. Wel: **Bliepo verspringt 4 keer** ±15 px (`[1116,590,236]→[1121,605,225]`), bij "Het raketje zoekt graag sterren…", "13 zeg je eerder als je telt." en "Zet de getallen op volgorde…" (waarschijnlijk zijn wijs-houding; zie opmerkingen) |
| begincontrole | goed (15.38); de vroegere F16 bij het begin (groet wit, Ja/Nee al tikbaar) is opgelost: groet en startvraag staan nu in 1 alinea (`squla-getallenlijn-gouden.tsx:948-951`) |

Foto's: scratchpad `k20d1/foto-GOED/squla-getallenlijn-…`, `k20d1/testfoto-getallenlijn-gouden/`.

## Fout

1. **Hint verwijst naar iets wat niet in beeld is (15.36, 15.37: het kind weet wát en wáár).** Bij "Welk getal ligt het dichtst bij 20?" (vraag 12) en "… bij 10?" (vraag 13) staan alleen 3 bordjes (18, 14, 8) in beeld: geen getallenlijn, geen 20, geen sprongen. Na een fout zegt Bliepo "Van 8 naar de 20 zijn het 12 sprongen. Welk getal heeft de minste sprongen nodig? Tel ze maar." Er is niets om te tellen; de lijn komt pas bij het samen doen.
   - Plek: hints `src/components/les/lessen/squla-getallenlijn-gouden-zinnen.ts:627` en `:902`; beeld alleen bordjes `src/components/les/lessen/squla-getallenlijn-gouden.tsx:399-402`.
   - Foto's: `testfoto-getallenlijn-gouden/allefout-vraag12-dichtst-20-1-vraag.png` en `…-1-na-8.png`.
   - Ernst: middel. (Ook: de 3 bordjes zijn precies de 3 knoppen; ze helpen niet bij het rekenen.)

## Opmerkingen

- **Bliepo verspringt (15.30):** het testscript meet 4 sprongen van Bliepo van ±15 px tussen 2 standen; de test keurt het niet af. Waarschijnlijk de houding met wijzende arm. Nakijken of dat binnen 15.30 valt.
- Startvraag "Kun jij dat al?" mag hier (besluit 19 november, hoofdstuk 4).
- Pijl zonder tekst bij "stil bij goed": gedeeld lesscherm, zie Dagen.

## Goed bevonden

Afspeelknop, vraag altijd in beeld, keuzes rechts onder Bliepo (15.32), raketje staat op de lijn, getallen wit waar ze nergens naar verwijzen, geen dubbele tekst, geen "nagekeken", eindzin + "Tik op de kaart." en afscheid na de tik (`:991-998`), eindkaart links, groen + geluid na samen doen, 2 pogingen, rondje alleen om wat Bliepo noemt. Synthesis: de vertaalde vragen zijn eerder vervangen (15.41); ik vond geen letterlijk vertaalde zinnen meer (alleen vergeleken met het Nederlandse draaiboek, niet met de Engelse opname).

## Niet kunnen nagaan

Echte stem, geluiden horen, vloeiendheid (bewust niet), de routes ja/proefmis/vangnet/wachten van het testscript los (tijdslimiet; de speelcontrole ALLEFOUT nam wel de Ja-route met proef mis).
