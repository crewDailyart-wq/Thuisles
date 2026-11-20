# Keuring Splitsen extra (squla-splits-splitsen1-1-gouden-extra) — 20 november 2026

Onafhankelijke keurder (deel 3). Er is **niets** aan lessen, code of zinnen veranderd; dit is alleen een rapport.
Getest als Testkind op http://localhost:3000. Schermfoto's: `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/keur3/` (mappen `foto-goed/…-extra`, `foto-allefout/…-extra`, `test-splitsen-extra-*`).

## Oordeel: AFGEKEURD

## Wat gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-splitsen-extra-gouden.ts` | goed (710 combinaties, geen verklapper, geen "fout", kiezer 0 keer dubbel). Fouttabel-bestand bleef gelijk. |
| speelcontrole GOED | tot het eind, 0 fouten; F11 0, F16 0; 7 met zin, 1 stil |
| speelcontrole ALLEFOUT | tot het eind, 0 fouten; `goed-na-hulp` 4 keer = 4 keer samen doen (15.49 klopt) |
| `test-splitsen-extra-gouden.mjs` goed, fout1, allefout | alle 3 tot de eindkaart, denkfouten vastgelegd, database niets bijgekomen |

## Fouten

1. **Getallen in Bliepo's tekst zijn wit, terwijl ze bij een gekleurd deel horen** — ernst: **middel** — regel 2.1, 2.2, 14.27 en het besluit van KEUZES-VOOR-SARA.md Ronde 52.
   - Wat je ziet: bij "Wat is 3 + 2?" zijn de 3 en de 2 in Bliepo's tekst wit, terwijl de stippen in de machine geel (3) en oranje (2) zijn en het lijstje erboven "3 + 2 = 5" wél geel/oranje/groen toont. Zo ook "Tik op de plus bij het deel links, tot er 4 stippen in staan.", "5 kun je splitsen in 3 en 2.", "Splits 8 nog op een andere manier." (schermfoto's `foto-allefout/squla-splits-splitsen1-1-gouden-extra/007.jpg`, `foto-goed/…-extra/001.jpg`, `004.jpg`, `007.jpg`).
   - Oorzaak: de zinnen schrijven `{3}`, `{2}`, `{5}` zonder kleurnaam (`squla-splitsen-extra-zinnen.ts:26` zegt zelf "{5} = een getal in zijn eigen kleur"; bijvoorbeeld `:46`, `:59`, `:81`, `:86`, `:89`, `:118`). In een les met `indeling: "synthesis"` maakt `src/components/les/Lesscherm.module.css:606-608` elk getal zonder eigen kleur wit (`color: inherit !important`); alleen `{n:kleur}` (`data-eigen`, `:613`) houdt een kleur.
   - Gevolg voor "32" (gevraagd om te checken): het aan elkaar geplakte getal `{32:wit}` staat wél apart en in wit, zoals Ronde 52 wil. Maar de losse getallen "{3} + {2} = {5}" in dezelfde zin zijn óók wit, dus het verschil dat Ronde 52 wilde laten zien ("3 en 2 houden de kleur van hun deel, 32 is iets anders") is er in beeld niet (`squla-splitsen-extra-zinnen.ts:86`). Eigen kleur per getal: **niet gehaald**.
   - Mogelijk speelt hetzelfde in Plussommen extra ("{37:wit}" naast `{3}`/`{7}`); die les heb ik niet gekeurd.

## Kleine opmerkingen (geen afkeur op zich)

2. "Wil je nog een getal zoals dit splitsen, of een groter getal?" (`squla-splitsen-extra-zinnen.ts:112`): op dat moment is de machine leeg, dus "zoals dit" verwijst nergens naar wat het kind ziet; de knoppen "Splits 10" en "Splits 8" maken het wel duidelijk. Twijfel 15.36.
3. Bij de 2e opdracht na de keuze staat bovenaan "Splits 8 in 2 delen." en bij Bliepo "Splits 8 nog op een andere manier." (`squla-splitsen-extra-gouden.tsx:535`, kop `ZIN.keuzeKop`). Geen dubbele tekst (F11 0), maar 2 verschillende opdrachten tegelijk; de kop kan beter "nog een andere manier" zeggen. Klein (15.36).
4. Bij de laatste keuze (8 of 10) groeit het totaal mee met de delen; de bovenste cirkel is eerst leeg. Dat is zo bedoeld (`vast: false`, `:532-535`) en past bij Synthesis; voor een kind wel even zoeken.

## Nagekeken en in orde

- **15.43**: tikken op plus en min bij de 2 delen (alleen in deze machine) en de keuze "Splits 8" / "Splits 10" (8 of 10, niet 12): klopt (`squla-splitsen-extra-zinnen.ts:42-43`, schermfoto `foto-allefout/…-extra/015.jpg`).
- F17-zinnen zijn opgelost: geen "linkerdeel", "rechterdeel", "Verander de stippen onder." of "2 delen en 1 totaal" meer.
- Keuzes (totaal, som, tussenvraag, nieuw totaal, 8/10) staan rechts onder Bliepo's zin (15.32). Plus/min-knoppen horen bij de machine.
- Vraag of opdracht altijd in beeld (F16 0); bij de splitsopdrachten staat de opdracht als kop in het vlak en niet nog een keer bij Bliepo (15.31).
- Na samen doen groen scherm en `goed-na-hulp` (15.49).
- Eind: "Klaar! Je hebt veel geoefend vandaag. Kijk, een kaart voor jou! Tik erop." — eindzin, dan de kaart-opdracht als laatste; kaart links van het tekstvak (15.46, 15.50).
- Geen "nagekeken", geen disco, geen "vinkje" in een gesproken zin, hoeveelheden in cijfers.
- 2 pogingen; 2e fout = uitleg + samen doen; nooit vast (vangnet).

## Niet kunnen nagaan

Echte stem, of de geluiden echt klinken, de duur van het rode scherm (testscripts praten versneld), tablet/telefoon, vloeiendheid (bewust later). De uitleg na de keuze "32" heb ik alleen in de code gelezen; de speler koos bij de tussenvraag een andere foute keuze.


## Herstel (20 november 2026)

De getallen in Bliepo's tekst hebben nu de kleur van hun stippen (`{3:tegel}` geeft de tegelkleur: 3 geel, 2 oranje, 5 groen), zoals Ronde 52 wilde. "32", "1 keer" en een foute keuze (4, 6, 8) blijven wit (14.27). Geen woorden veranderd. Fouttabel-script, speelcontrole GOED en ALLEFOUT: in orde.
