# Keuring Plussommen extra (squla-plus-bakkerij-1-gouden-extra) — 20 november 2026

Onafhankelijke keurder (deel 2). Er is **niets** aan de les, de code of de zinnen veranderd; dit is alleen een rapport.
Gespeeld als Testkind via `/voorbeeld/les/squla-plus-bakkerij-1-gouden-extra?naam=Testkind`.

## Uitslag: AFGEKEURD (1 kleine fout, ernst laag)

## Wat er gedraaid is

| Controle | Uitslag |
|---|---|
| `npx tsx scripts/fouttabel-plussommen-extra-gouden.ts` | goed: 38 rijen, 512 combinaties eerste zin + hint (nergens blijft maar 1 keuze over), nergens "fout", geen getal 2 keer in 1 zin |
| `node scripts/speelcontrole.mjs` GOED | goed tot het eind; F16 0, 15.47 0, F11 0; 10 goed met zin, 0 stil |
| `node scripts/speelcontrole.mjs` ALLEFOUT | goed tot het eind (26 stappen); F16 0, F11 0; `goed-na-hulp` 2 keer |
| `RUSTIG=1` speelcontrole GOED | F16 0 bij 20 wachtmomenten van 3 s |
| Begin zonder tik (`vraag-aanwezig-controle.mjs`) | alleen de lesachtergrond met de ronde afspeelknop (15.38) |
| `test-plussommen-extra-gouden.mjs` goed, fout1, allefout, stil | goed: 10× goed in één keer; fout1: 10× goed na een fout, 10 denkfouten vastgelegd; allefout: 9× samen gedaan, 18 denkfouten; database niets bijgekomen. stil: hulphandje na 6,1 s stilte (15.19), tot de eindkaart. |
| Antwoordplek (15.32) | goed: alle cijfers en sommen rechts onder Bliepo's zin (`raster` wordt genegeerd) |
| Einde (15.50, 15.46) | goed: "Je bent klaar. Ik vond het leuk met jou! Tik maar op de kaart.", kaart links; na veel fouten "Je hebt goed doorgezet. Volgende keer gaat het nog beter." (15.13 punt 3 klopt) |

Schermfoto's: `/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/k20d2/foto-goed/`, `foto-fout/`, `tfoto/plusextra/`.

## Fout

1. **Lof die niet klopt na veel fouten (15.5 "zinnen kloppen met wat het kind ziet en hoort", 15.48, 3.17). Ernst: laag.**
   Bij de overgang naar "samen 10" zegt Bliepo altijd "Testkind, je snapt het al goed. Nu maken we het een beetje
   moeilijker." Ook als het kind alles fout had en Bliepo alles samen heeft voorgedaan (ALLEFOUT, `foto-fout/.../024.jpg`).
   Dat is niet waar, en de naam valt dan in een zin direct na een reeks fouten.
   Plek: `src/components/les/lessen/squla-plussommen-extra-zinnen.ts:67` (`moeilijker`), gezegd zonder voorwaarde in
   `src/components/les/lessen/squla-plussommen-extra-gouden.tsx:357`.

## Opmerkingen (geen afkeur)

- In de goede route is Bliepo na een goed antwoord nooit stil (0 van 10). Dat mag volgens 15.39 punt 3, omdat elke goede reactie hier een uitleg met de som heeft ("Goed gerekend: 3 + 7 = 10."), maar daardoor komt de stilte-regel in deze les nooit voor.
- Keuze "7 − 3 = 10" bij "Welke som hoort erbij?" is een som die niet klopt; als foute keuze voor de denkfout "plus en min verwisseld" is dat te verdedigen (15.44), maar het is een rekenfout op het scherm. Sara laten kijken.
- Woorden "is-teken" en "totaal" staan niet in WOORDEN-GROEP3.md (twijfel 15.48).

## Goed bevonden (kort)

- Tegels: elk vakje telbaar, kleuren per getal, de som "7 + 3 = ?" in de kleuren van de tegels (2.1). Na omwisselen staat de 3 bovenop, zoals Bliepo zegt.
- Fouttabel: hints wijzen naar tellen, niet naar het antwoord; 2× dezelfde denkfout krijgt een "weer"-zin en een andere uitleg.
- Geen dubbele tekst (F11), vraag altijd in beeld (F16).

## Wat ik niet kon nagaan

- Echte stem, woord-oplichten en de geluiden zelf (headless, zonder geluid).
- Vloeiendheid (bewust niet), telefoon en tablet.
- Waarom de allefout-route 9 uitkomsten heeft en de goede route 10 ("nog een manier om 10 te maken" komt in de allefout-route niet voor); niet uitgezocht, mogelijk bewust.


## Herstel (20 november 2026)

1. "{naam}, je snapt het al goed." zegt Bliepo alleen nog als het klopt: niets samen voorgedaan en minder dan de helft na een fout. Anders alleen "Nu maken we het een beetje moeilijker." 2. De getallen in Bliepo's tekst hebben nu de kleur van hun tegel (`{n:tegel}`); een gekozen getal dat bij geen tegel hoort blijft wit (14.27). 3. "is samen" werd "zijn samen". Fouttabel-script, speelcontrole GOED en ALLEFOUT: in orde.
