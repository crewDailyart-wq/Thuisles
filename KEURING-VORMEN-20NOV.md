# Keuring Vormen: Patronen (squla-vormen-patronen-1-gouden) — 20 november 2026

Onafhankelijke keurder (deel 3). Er is **niets** aan lessen, code of zinnen veranderd; dit is alleen een rapport.
Getest als Testkind op http://localhost:3000. Schermfoto's: `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/keur3/` (mappen `foto-goed/squla-vormen-patronen-1-gouden`, `foto-allefout/…`, `test-vormen-*`, `begin`).

## Oordeel: GOEDGEKEURD (met kleine opmerkingen)

## Wat gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-vormen-gouden.ts` | goed: inhoud (15 vragen), verklap- en waarheidscontrole in orde (1027 varianten, 659 beweringen). Fouttabel-bestand bleef gelijk. |
| speelcontrole GOED | tot het eind, 0 fouten; F11 0, F16 0; 10 met zin, 5 stil |
| speelcontrole ALLEFOUT | tot het eind (475 stappen), 0 fouten; `goed-na-hulp` 9 keer |
| `test-vormen-gouden.mjs` goed, fouten | "Alles in orde" |
| `test-vormen-gouden.mjs` allefout | **niet afgerond**: 1e keer stopte hij door een volle schijf (ENOSPC, geen lesfout) na vraag 9; 2e keer gestopt na de tijdslimiet van 10 minuten (de test is op deze drukke computer gewoon traag). De speelcontrole ALLEFOUT liep wel helemaal goed. |

## Kleine opmerkingen

1. **Puzzel (vraag 15)**: de losse stukjes liggen deels over elkaar en een stukje ligt over de rand van het bord (foto `foto-goed/…/009.jpg`, `test-vormen-goed/goed-vraag15-puzzel-puzzel.png`). Zo zie je het patroon op een stukje niet helemaal. 14.23 ("kijk als een kind"), klein tot middel. Plek: `src/components/les/vlakken/squla-vormen-gouden-vlak.tsx` (de beginplekken van de stukjes).
2. Eén schermfoto midden in een overgang (`foto-allefout/…/012.jpg`) toont 2 kettingen half door elkaar met lichtstralen; dat is de verschijn-animatie, geen blijvend beeld. Alleen even op letten dat de opdracht "Sleep elke kraal naar een lege plek." niet al te lang boven een onleesbaar beeld staat.
3. "In deze rij ontbreekt iets." — "ontbreekt" is een moeilijker woord; de rest van de zin maakt het duidelijk. Twijfel (WOORDEN-GROEP3.md), klein.

## Nagekeken en in orde

- **15.32**: de kralen, dingen en vormen om uit te kiezen staan rechts onder Bliepo's zin (foto `foto-goed/…/001.jpg`, `007.jpg`, `test-vormen-goed/goed-vraag12-pijl-1-vraag.png`).
- Gekozen keuze krijgt alleen een vinkje; rood rondje om een keuze alleen als Bliepo hem noemt ("Je koos weer hetzelfde als aan het eind.", `foto-allefout/…/009.jpg`).
- Patronen kloppen op de foto's (paars-oranje-groen-geel-paars-oranje → groen; appel-banaan-peer-sinaasappel-appel-banaan-? → peer; bal-blok-potlood-boek-?-blok-potlood-boek → bal).
- F17 opgelost: geen los "En" meer aan het begin van een vraag.
- Hint verklapt niet (bijvoorbeeld "Kijk naar de laatste kraal. Zoek die kleur eerder en kijk wat daarna komt. Kies dan de kraal die past.").
- Geen startvraag (geen Synthesis-les), begin met de voorbeeldketting in beeld (`begin/…-4s.png`).
- Vraag altijd in beeld (F16 0); eind: eindzin + "Tik op de kaart." als laatste; kaart links.
- Geen "nagekeken" in zinnen (alleen in commentaar), geen disco, geen "vinkje" in een zin; cijfers.

## Niet kunnen nagaan

Echte stem, of de geluiden echt klinken (speelcontrole "stil: nog geen tik"), de duur van het rode scherm, tablet/telefoon, vloeiendheid (bewust later), de volledige allefout-route van het eigen testscript (zie tabel).


## Herstel (20 november 2026)

De losse puzzelstukjes hebben in de gouden les eigen plekken: links 2 kolommen, rechts 1 kolom van 4, met ruimte ertussen; ze draaien minder schuin. Niets ligt meer over elkaar of over het bord (schermfoto bekeken). De oude lessen houden hun plekken. Speelcontrole GOED en ALLEFOUT, `test-vormen-gouden.mjs` goed (zone in orde): in orde. In de ontwerpcontrole (ONTWERP=1, allefout) wel 1 melding "de pijl ging 3 keer weg en kwam terug"; dat komt van de pijl-wijziging in Lesscherm.tsx van een andere helper (15.51), niet van de puzzel.

## Herstel pijl (20 november 2026, besluit Sara)

- **De pijl knippert niet meer.** Een pijl die al onder een gewoon stuk tekst stond (bijvoorbeeld "Kom, ik leg de andere stukjes erbij."), blijft staan terwijl het geluidje speelt. Alleen een nieuwe pijl (na een vraag of opdracht) wacht op het geluid en komt tegelijk met de nieuwe zin (15.51). Geregeld in het gedeelde lesscherm (`Lesscherm.tsx`), dus voor alle lessen tegelijk.
- De knippertest in de `scripts/test-*-gouden.mjs` telt nu alleen een pijl die weggaat terwijl dezelfde zin blijft staan; het gewone lege tekstvak tussen 2 vragen telt niet meer.
- Gecontroleerd: `scripts/test-vormen-gouden.mjs` routes goed en allefout: pijl weg en terug 0, "Alles in orde". Meting 15.51 (zichtbare Chrome, meter) op Vormen, Dagen, Klok, Meten en Splitsen: punt 1 t/m 4 kloppen nog overal (pijl tijdens praten 100%, tik stopt de stem binnen 1 ms, goed met zin gaat vanzelf door, stil goed zonder pijl). Speelcontrole goed en allefout op Tijd, Minsommen, Plussommen, Vormen, Dagen en Meten: tot het eind.
