# Controle rood rondje (6 november 2026)

Alleen gelezen en gemeten. Niets aangepast.

## FOUTEN (echt)
Geen echte fout gevonden in wat ik heb gelezen.

## RISICO (geen actieve fout)
1. Geld, `squla-geld-vlak.tsx` `zetGeteld` (regel ca. 832-838): bij het terugzetten van het vorige getelde stuk wordt `zetGloed(st, ... p.licht?.includes(ding.id) ? "warm" ...)` gedaan zonder `p.rondje` te controleren. Staat een ding tegelijk in `licht` en in `geteld`, dan krijgt het stuk tóch een gele gloed naast het rondje. Alleen als beide tegelijk voorkomen. Voorstel: daar `p.rondje && ... === "warm"` naar `null` laten gaan (zoals in `pasToe`).
2. Splitsen, `tekenRondjes`: het rondje wordt bepaald op de lijst `licht` (+ `uit`). Verandert alleen de zichtbaarheid van een ding (`toon`, verborgen ding dat later verschijnt) terwijl `licht` gelijk blijft, dan wordt het rondje niet opnieuw berekend. Staat een ding op dat moment nog verborgen, dan krijgt het geen rondje en komt dat ook niet meer. Ik heb niet gezien dat dit in `squla-splits-splitsen2-1` voorkomt. Voorstel: `toon` meenemen in `rondjeSleutel`.
3. Als `rondje-rood.png` niet laadt, wordt het één keer in de console gemeld en dan nooit meer geprobeerd; er is dan geen aanwijzing in beeld (ook geen gloed). Klein risico (bestand staat gewoon op de server, http 200).
4. In `public/rondje/` staat ook een ongebruikt `rondje-rood-2.png` (72 KB, niet in de code). Onschadelijk, alleen laten weten of het blijft.

## NIET GECONTROLEERD
- De speelcontrole (`speelcontrole.mjs` met GOED=1 voor splitsen2-1, geldmachine-1, zakgeld-1) is gestart maar was nog niet klaar toen ik dit schreef; ik heb dus geen uitslag. ALLEFOUT en NEE niet gedraaid.
- Niet met eigen ogen gezien (geen schermfoto's): plaats, grootte en stand van het rondje bij huisje, geld en kaarten; hoe het eruitziet bij `rustig`.
- Echte beeldjes per seconde en opentijd (`npm run vloeiend`) niet gemeten.
- Of andere les-bestanden met `rondje` in de tekst iets met dit rondje doen: alleen woorden zoals "een rondje van de minutenwijzer"; die ben ik niet verder nagegaan.

## IN ORDE
- Typecontrole op de gewijzigde splitsen- en geld-bestanden: geen fouten.
- Andere lessen niet veranderd: `rondje: true` staat alleen in `splitsen2a` (`squla-splitsen.tsx` regel 1588, via optie `rondje` in `squla-splitsen-hulp.ts` regel 166, alleen meegegeven als het aan staat) en in `LEEG` van `squla-geld.tsx`. `SqulaGeldVlak` wordt alleen in `squla-geld.tsx` gebruikt. `SqulaSplitsVlak` alleen in `squla-splitsen-hulp.ts`. Zonder `rondje` (standaard `false`/`undefined`) blijft de oude gloed precies zoals voorheen (`!st.rondje && ...`, `if (!p.rondje) zetGloed`, `licht && !rondje` voor de stijl).
- Gloed bij `goed` en `fout` blijft: bij geld wordt alleen "warm" weggehaald, bij splitsen alleen de `licht`-kleur; `goedIds` geeft nog steeds GOED. Verbindingslijnen (links/rechts) houden hun kleuren.
- Opruimen: geld `leeg()` leegt de lijst met rondjes; de plaatjes zitten in de doos van het ding, die bij opnieuw bouwen wordt vernietigd (`this.alles`). Bij splitsen wordt de rondjesdoos bij een nieuw beeld op null gezet en de oude doos verdwijnt met het hoofd; `rondjeSleutel` wordt dan ook gereset. Wordt `licht` leeg, dan worden de rondjes weggehaald. Geen dubbele rondjes: er wordt op sleutel vergeleken (geld per `ding:id` / `tel:id:tot`; splitsen op de hele lijst).
- Laden: plaatje wordt één keer geladen en één keer als texture toegevoegd (`textures.exists`-controle, `rondjeLaadt`-vlag). Na `decode` wordt gecontroleerd of de scène nog actief is. Tijdens het laden wordt na afloop opnieuw getekend.
- Prestaties: per beeld wordt niets nieuws gemaakt; rondjes alleen bij een nieuwe aanwijzing (korte tween 240 ms, niet bij `rustig`). Plaatje 738 x 617 px, 50 KB: redelijk; een kleinere versie (bijv. 370 x 310, ca. 15 KB) zou nog lichter zijn maar is geen eis.
- Geen kader of wit vlak; rood met de hand getekend, zoals Sara wilde. Geen herhaalde vraag/tekst aangeraakt.
