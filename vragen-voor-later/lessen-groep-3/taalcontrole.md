# Taalcontrole groep 3-lessen (28 oktober 2026)

Alle zinnen van Bliepo in `src/components/les/lessen/*.ts(x)` nagelopen op:
woord past bij beeld, grammatica, eenvoud, niets ontbreekt, tijd en getallen.
Alleen zinnen veranderd; geen werking, volgorde of stap aangeraakt.

Niet aangeraakt (andere helpers): `verhaaltjessommen.tsx`, `klokkijken.tsx`,
`vlakken/verhaal-*` en `vlakken/klok-*`. De bevindingen daarover staan onderaan.

## Aanleiding: "bel" bij Splitsen

Op het scherm staan drie glazen bollen (luchtbellen) met parels erin. Bliepo
zei "bel", wat een kind (en Sara) anders leest. Nu overal "rondje" (zo noemde
het ook de opdracht). De code noemt ze in de commentaar "luchtbellen"; wil
Sara liever "luchtbel", dan is dat een kleine aanpassing op dezelfde 10 plekken.

## Verbeterd

### optellen-tot-100.tsx (les Splitsen, optellen-100-splitsen) - 10 zinnen

| oud | nieuw |
|---|---|
| Doe in allebei de bellen iets. | Doe in allebei de rondjes iets. |
| Begin bij deze bel onderaan. / Tik op de plus. | Begin bij het rondje links onderaan. / Tik op de plus eronder. |
| Zag je de grote bel bovenaan? | Zag je het grote rondje bovenaan? |
| Deze bel is nog leeg. / Tik op deze plus. | Het rondje rechts onderaan is nog leeg. / Tik op de plus eronder. |
| Hoeveel parels zitten er nu in de grote bel? | ... in het grote rondje? |
| Kijk naar de grote bel. | Kijk naar het grote rondje. |
| In de grote bel zitten {5} parels. | In het grote rondje zitten {5} parels. |
| Verander de parels in de bellen onderaan. | ... in de rondjes onderaan. |
| Kijk naar de bellen. | Kijk naar de rondjes. |
| Tel de parels in de grote bel nog eens. | Tel de parels in het grote rondje nog eens. |

Ook de commentaarregel ("maakt de bellen leeg") is aangepast.
"Deze bel/deze plus" wees naar iets zonder dat het aangewezen werd; nu staat
er waar (links/rechts onderaan) en dat de plus onder het rondje zit.

### optellen-tot-10.tsx - 2 zinnen
- "Misschien heb je je verteld." -> "Misschien heb je je vergist."
- "We zoeken samen uit welke sommen kunnen." -> "... welke sommen je kunt maken."

### optellen-tot-20.tsx - 1 zin
- "Dat waren lastige." -> "Dat waren lastige vragen."

### tellen-holo.tsx - 4 zinnen
- "En er komt er {1} bij." -> "En er komt {1} bij."
- "Er is er nog {1} bij." -> "Er komt nog {1} bij."
- "Er zijn er nog {2} bij." -> "Er komen nog {2} bij."
- "Nu zijn er {2} bij." -> "Nu komen er {2} bij."

### tellen-tot-120.tsx - 4 zinnen
- Zelfde drie zinnen als hierboven (vakjes in plaats van schelp).
- Fout in de code: bij 1 verkeerd vakje stond "Er is maar {1} *rood* vakje"
  (zonder -e, kleur niet omgezet). Nu "*rode*", "*gele*", enz. via `BIJ[keuze]`.

### getallenlijn.tsx - 3 zinnen
- "Spring je terug naar het begin?" -> "Je sprong terug naar het begin." (was
  een vraag terwijl het een mededeling is)
- "Ben je zeker? Dan in één sprong." -> "Weet je het zeker? Dan in één sprong."
- "Elk getal tellen is soms het beste." -> "Soms is het best om elk getal te tellen."

### tientallen.tsx - 1 zin
- "Alsjeblieft, {7} sterren." -> "Kijk, {7} sterren."

### aftrekken-tot-10.tsx - 6 zinnen
- "Dat klopt niet; laten we het samen doen." (3 plekken) -> "Dat klopt niet. Laten we het samen doen." (puntkomma weg, korte zinnen)
- "De paal kan nog iets." -> "Een lampje kan ook weer uit." (onduidelijk, en kondigt de minknop aan)
- "Hoeveel halen we eraf?" direct gevolgd door "Hoeveel lampjes heeft de kleine paal?"
  (twee vragen achter elkaar) -> "We halen er de lampjes van de kleine paal af." + de tweede vraag
- "Let goed op het rondje. Er staat nu een minteken." -> "Let goed op de ronde knop. Er staat nu een minteken op."
  (daar is "rondje" juist verwarrend: het is een knop)

### Zonder wijziging nagelopen
flitsen.tsx, zo-werkt-het.tsx, vergelijken.tsx, optellen-onder-10.ts: geen fouten gevonden.

Totaal: 31 zinnen verbeterd in 8 bestanden.

## Lijst voor de bestanden die ik niet mocht aanraken

### klokkijken.tsx (hoofdagent doorvoeren)
Hoogste prioriteit: de kleuren van de wijzers kloppen niet met het beeld. In
`vlakken/klok-wijzerklok.tsx` is de urenwijzer oranje (#c0620d) en de
minutenwijzer paars (#7c3fd6).
- Regel 748: "De korte rode wijzer is de urenwijzer." -> "oranje"
- Regel 900: "En deze korte rode wijzer." -> "oranje"
- Regel 933: "... of sleep de rode urenwijzer erheen." -> "oranje"
- Regel 1138: idem -> "oranje" (regels 313, 475 en 1951 zeggen al "oranje")
- Regels 887, 1341, 1785 en 1787: "blauwgroene (minuten)wijzer" -> "paarse"
  (let op: de nieuwe `klok-bliepo-klok.tsx` kan andere kleuren hebben; eerst
  nakijken welke kleuren daar in beeld zijn en dan alle zinnen gelijk trekken)
- Regel 2904: "Maar Bliepo deed allebei, het ene na het andere." -> "... na elkaar."
- Regel 2930: "Bliepo doet twee dingen, het ene na het andere." -> "... na elkaar."
- Knoplabel "Hulp" (klok-bliepo-klok.tsx, klok-holo-sterrenklok.tsx) heet in alle
  andere lessen "Weet ik niet". Gelijktrekken?
- De tijden zelf nagerekend: half 5 = 4:30, kwart over/voor, 10 voor half,
  5 over half, 5/10/15/20/25/30 minuten later, 12:55 + 5 = 1:00: allemaal goed.

### verhaaltjessommen.tsx
- Regels 2554 en 2600: "Er zweven er 2 weg." -> "Er vliegen er 2 weg." (lichtjes/zweven + weg; "zweven er weg" klinkt vreemd)
- Regel 567 (ballonnen, variant `gemaakt`): "Ik blies 7 ballonnen op." gevolgd door "Jij liet er 2 knappen." Wisselt van
  persoon. Voorstel: "Je blies 7 ballonnen op. Je liet er 2 knappen." (of met naam).
- Regel 2487: "Dat is 'm." -> "Dat is hem." of "Dat klopt." (spreektaal)
- Regel 1047: "Erbij past niet." -> "Erbij past hier niet."
- Regel 1250/1274/1298 ("Wat bloemen", "Een paar", "Wat knikkers"): als knoptekst
  voor "onbekend aantal" is "wat bloemen" te kort; "Een paar" past wel. Overweeg "Een paar bloemen".
- Verder (zin voor zin gelezen): getallen in de zinnen kloppen met de sommen,
  meervoud/enkelvoud (1 bloem, 1 lampje, 1 knikker) is overal geregeld.

### vlakken/verhaal-* en klok-*
Alleen labels en aria-teksten: geen fouten. "Weghalen"/"Erbij doen" past bij
de knoppen.

## Wat ik niet zeker wist
- "Rondje" of "luchtbel" voor de glazen bollen bij Splitsen (zie boven).
- Splitsen nagespeeld (stemmen vervangen door een snelle nepstem). De nieuwe
  zinnen kloppen met het beeld: "het rondje links onderaan", "het rondje
  rechts onderaan is nog leeg", "het grote rondje bovenaan". Wel viel op dat
  een getal in de spraakbel (bijv. de 8, 3 en 2 in "Daar zitten ook 3 parels")
  er heel klein uitziet op de foto's. Misschien groeit het pas als het gesproken
  wordt (met de nepstem werkt dat niet); niet onderzocht. Even met eigen ogen kijken.
- "Een grote mens kan hem invullen" (zo-werkt-het.tsx): in kindertaal gewoon,
  maar "een volwassene" kan ook. Niet veranderd.
- "{20} min hoeveel is {13}?" (verhaaltjessommen, rekenvraag) is begrijpelijk
  maar kort; niet veranderd.
- tsc meldt twee fouten in `.next/dev/types/app/page.ts` (ontbrekend
  `src/app/page.js`). Dat staat los van deze wijzigingen.
