# Controle herstel groep C — 7 november 2026

Onafhankelijke controleur. Getest als Testkind in `/voorbeeld/les/<id>`, zonder stem, met eigen schermfoto's
(vóór het antwoord, direct na het goede antwoord, en bij een deel van de vragen na een fout). Laptop 1440 × 900 en
telefoon 390 × 844. Telkens maar 1 Chrome tegelijk. Niets aangepast, niets in de database gezet.

Fotomap (alle paden hieronder zijn relatief aan deze map):
`/private/tmp/claude-501/-Users-sararifi-Desktop-thuisles/898e19d0-30cf-41fb-b2df-e9e93328f8ce/scratchpad/keurC/`
Bij elke vraag: `vNN.jpg` = vóór het antwoord, `vNNb/ c0–c3` = na het goede antwoord, `vNNf` = na een fout,
`vNNs0–s3` = na het slepen.

## AFGEKEURD

1. **squla-min-ruimte-1, squla-min-ruimte-2, squla-min-ruimte-3 — 4 sommen in het midden passen niet.**
   Bij "Welke som hoort hierbij?" met 4 sommen staat de rij knoppen buiten beeld: links valt de eerste som half
   van het scherm ("12 − 2 = 10" wordt "2 − 2 = 10") en rechts ligt de laatste knop over de microfoonknop.
   Foto's: `r9/squla-min-ruimte-2-v07.jpg`, `r13/squla-min-ruimte-3-v07.jpg`, `r11/squla-min-ruimte-1-v06.jpg`
   (raakt de microfoon net). Oorzaak: `.keuzesMidden .rij` in `Lesscherm.module.css` heeft `flex-wrap: nowrap`
   met 38px tekst in een vak van 940px; 4 lange sommen zijn breder. Oplossing: bij 4 sommen kleiner of 2 × 2.
   **Ook (ruimte-1 en -2): de zin noemt de keuzes in een andere volgorde dan de knoppen.** Bliepo zegt
   "Is het 16, 14 of 13?" terwijl de knoppen 16, 13, 14 tonen (`r9/squla-min-ruimte-2-v04.jpg`, ook v05, v15).
   Oorzaak: `squla-minsommen.tsx` regel 329 gebruikt `v.keuzes`, de knoppen `meng(v.keuzes)`. De zin moet de
   gemengde volgorde volgen. Telefoon is in orde (2 × 2, `r12/squla-min-ruimte-2-v07.jpg`).

2. **squla-plus-bakkerij-1 (en de andere bakkerijvragen met 4 sommen) — rij raakt de microfoonknop.**
   "Welke som hoort erbij?" met 4 sommen: de rechterknop "3 + 7 = 10" ligt tegen/over de microfoonknop en de
   linkerknop tegen de rand. Foto: `r11/squla-plus-bakkerij-1-v05.jpg`. Zelfde oorzaak en oplossing als punt 1.

3. **squla-plus-kaal-1, kaal-2, kaal-3 en de typvragen van bakkerij-3 — op de telefoon te klein.**
   Op de laptop is het goed: 1 invulvak, in de som (`r8/squla-plus-kaal-1-v01.jpg`, `-v01b.jpg`;
   `r9/squla-plus-bakkerij-3-v14.jpg`). Op de telefoon staat de som "3 + 4 = [ ]" piepklein bovenaan en is het
   invulvak maar een klein vierkantje, terwijl het zachte plusteken eronder groter is dan de som
   (`r12/squla-plus-kaal-1-v01.jpg`). Kind moet op een heel klein vakje tikken (BOUWREGELS 1.24). Som en vakje
   op telefoon veel groter maken.

4. **squla-rekenmix-mix1-1 — potloden nog steeds piepklein.** Bij "Tel de potloden" staan 6 dunne, kleine
   potloodjes ver uit elkaar (`r10/squla-rekenmix-mix1-1-v03.jpg`); dat stond in OVERZICHT-C als op te lossen
   ("groter, dichter bij elkaar") en is niet gedaan. Strandbal en antwoordknoppen in het midden zijn wel goed
   (`-v02.jpg`).

5. **squla-min-machine-4 — munten te klein (BOUWREGELS 1.24).** Strandbal is herkenbaar en de knoppen staan
   goed (`r6/squla-min-machine-4-v03.jpg`, `-v04.jpg`). Maar de munten van 1 en 2 euro zijn op de laptop klein
   en op de telefoon bijna niet uit elkaar te houden (`r12/squla-min-machine-4-v01.jpg`). Verder verschijnen de
   munten pas ruim na de vraag terwijl de knoppen al aan te tikken zijn (`r6/...-v03.jpg` zonder munten,
   `-v04.jpg` met). Naspelen blijft Sara's keuze.

## GOEDGEKEURD

- **squla-min-bus1-1, bus1-2, bus1-3, bus2-1, bus2-2, bus2-3** — verklappen is weg: tijdens de vraag zitten
  alle pakjes in de bus; pas na het goede antwoord springen ze eruit, met de som en een rondje om wat er over is.
  Hint na een fout klopt ("Begin bij 16 en tel 4 terug."). Plek van het goede antwoord wisselt per les-start
  (eerste vraag bus1-1: 3 5 8, daarna 8 3 5). Telefoon goed. Foto's: `r2/squla-min-bus1-2-v01.jpg`, `-v01b.jpg`,
  `-v01f.jpg`; `r2/squla-min-bus2-2-v01.jpg`, `-v03f.jpg`, `-v03b.jpg`; `r1/squla-min-bus1-1-v01.jpg`;
  `r12/squla-min-bus1-1-v01.jpg`; `r13/` bus1-3 en bus2-3.
- **squla-splits-splitsen2-1** — alleen het briefje tijdens de vraag; 4 munten verschijnen pas na het antwoord
  (`r4/squla-splits-splitsen2-1-v01s0.jpg`). Plek wisselt. Klein: op het beginscherm staan de tegels in een
  andere volgorde dan bij de eerste vraag (`r3/...-v00-begin.jpg` vs `-v01.jpg`); niet erg.
- **squla-splits-delen-1** — 1 gemengde hoop, geen groepjes boven de bakjes meer (`r4/squla-splits-delen-1-v06.jpg`);
  na het antwoord vallen ze in de bakjes. Potlodenrek kleiner (`r3/...-v13.jpg`), nog steeds vrij hoog maar
  rustig. Opmerking: in de hoop zit 1 kleur meer dan er bakjes zijn (bv. groene knikkers bij een paars en oranje
  bakje); verklapt niets, maar Sara kan het vreemd vinden.
- **squla-piraat-1, -2, -3** — planeet/raket/maan/komeet weg; som groot in het midden met lucht tot de letters
  (`r5/squla-piraat-1-v13.jpg`); raadselantwoorden groot in het midden (`r5/squla-piraat-2-v07.jpg`,
  `r5/squla-piraat-3-v05.jpg`), maan bij maan-darijn weg. Hint na fout goed (`r5/squla-piraat-1-v08f.jpg`).
  Tip: bij de 2 tekstraadsels noemt Bliepo A en dan B; als de knoppen gewisseld staan, past de zin minder goed.
- **squla-min-machine-1, -2** — tijdens de vraag 10 blokjes en een lege bak (`r6/squla-min-machine-1-v01.jpg`,
  `r6/squla-min-machine-2-v08.jpg`); na het antwoord draait de machine, 3 blokjes vallen in de bak, de rest gaat
  naar het vraagteken (`-v01c1.jpg`, `-v01c3.jpg`). Bekers/bordjes met 3 sommen netjes (`r6/...machine-2-v01.jpg`).
- **squla-rekenmix-mix4-2** — helemaal uitgespeeld (48 stappen) tot "Jij zet alles in de goede volgorde.",
  geen enkele foutmelding. Potloden zijn echte, even grote potloden zonder lichtringen
  (`r7/squla-rekenmix-mix4-2-v05.jpg`).
- **squla-plus-bus1-1** — bus staat er al op het beginscherm en bij de eerste vraag (`r8/squla-plus-bus1-1-v00-begin.jpg`,
  `-v01.jpg`); zin zonder "bij de halte".
- **squla-plus-dansen-1..4** — eerste vraag niet leeg (`r8/squla-plus-dansen-1-v01.jpg`); luidsprekers klein en
  zacht (`r11/squla-plus-dansen-2-v01.jpg`); volgorde wisselt.
- **squla-min-kaal-1, squla-min-machine-3** (typvragen) — vraagteken op het bord is geen vakje meer, 1 invulvak
  (`r8/squla-min-kaal-1-v01.jpg`, `r8/squla-min-machine-3-v01.jpg`). Klein, niet nieuw: de zin breekt midden in
  de som ("Hoeveel is 7 − / 4?").
- **squla-plus-bakkerij-2** — antwoorden groot in het midden onder de toonbank (`r13/squla-plus-bakkerij-2-v01.jpg`).
  (Let op punt 2 als er 4 sommen in 1 rij komen.)
- **Rekenmix:** mix1-2 (kleed en platte tekeningen, `r10/...mix1-2-v03.jpg`, `-v06.jpg`, `-v10.jpg`), mix1-3 en
  mix3-2 (direct in de rij tikken, `r10/...mix1-3-v13.jpg`, `...mix3-2-v01.jpg`), mix1-4 (alles even groot,
  `...mix1-4-v01.jpg`), mix2-2 (strandbal, "op de doos" duidelijk, `...mix2-2-v02.jpg`, `-v04.jpg`), mix2-4,
  mix4-3, mix4-4 (groepjes los van elkaar, `...mix2-4-v07.jpg`, `...mix4-3-v03.jpg`, `...mix4-4-v01.jpg`,
  `-v03.jpg`), mix3-1, mix3-3, mix3-4, mix4-1 (`r13/...mix4-1-v01.jpg`, `r11/...mix3-4-v01.jpg`). De strandbal is
  overal duidelijk een bal.
- **squla-splits-splitsen1-1** — 1 nette doek (`r11/squla-splits-splitsen1-1-v13.jpg`), oranje vak echt oranje (`-v01.jpg`).
- **squla-splits-splitsen1-2** — shirts: getal onder het vak, lucht tot de shirts (`r11/...splitsen1-2-v06.jpg`);
  ballen bij de splitspaal bewust laten staan (`-v09.jpg`).
- **squla-splits-splitsen2-2** — geen geld meer, sommen weg van Bliepo, niet recht tegenover het goede huisje
  (`r11/...splitsen2-2-v01.jpg`, `-v04.jpg`).
- **squla-rekentaal** — "Welke pannenkoek is groter? Tik erop." in 1 zin; plek wisselt (`r11/squla-rekentaal-v01.jpg`).

Niet gekeurd (niet aangepast, Sara beslist): rekenmix-mix2-1 (boterhammen).

## Plek van het goede antwoord (1.23)
Alle keuzes gaan door `meng()` (willekeurig per les-start, vast per vraag). In de logs wisselt de plek binnen een
les (bv. machine-2: midden, midden, rechts, links, midden) en tussen 2 starts (bus1-1, machine-4, splitsen2-1).
Geen vast patroon gezien. Uitzondering links/rechts/midden en eerste/tweede bij rekenmix is terecht.

## Samenvatting
- 5 punten afgekeurd: (1) min-ruimte-1/2/3: 4 sommen lopen buiten beeld en over de microfoon, en de zin noemt de
  getallen in een andere volgorde dan de knoppen; (2) bakkerij met 4 sommen raakt de microfoon; (3) plus-kaal en
  bakkerij-typvragen op telefoon te klein; (4) mix1-1 potloden nog klein; (5) machine-4 munten te klein (1.24).
- Alle verklappers zijn echt weg (6 bus-lessen, splitsen2-1, delen-1, piraat-3, machine-1/2). mix4-2 werkt van
  begin tot eind. Geen lege schermen bij dansen-1 en plus-bus1-1. Geen foutmeldingen in alle runs.
