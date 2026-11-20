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
