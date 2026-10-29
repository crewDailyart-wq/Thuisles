# Voorwerpen: waar ze vandaan komen

Bijgehouden sinds 28 oktober 2026, toen de eigen voorwerpenstijl van Bliepo begon.

**De stijl:**
- vlakke, volledig dekkende vormen;
- geen gloed, glas, glans, doorzichtigheid of decoratieve sterren;
- afgeronde vormen met overal dezelfde lijndikte: rand 6 en dunne rand 3,5 punten;
- lichte of warme vullingen met een donkerblauwe rand, zodat alles afsteekt tegen de blauwe achtergrond.

Het palet en de tekenhulpjes staan in `src/components/les/vlakken/bliepo-voorwerpen.ts`.

**Het palet:**

| naam | kleur | gebruik |
|---|---|---|
| donkerblauw | `#1d2b5e` | contouren, cijfers, streepjes |
| petrol | `#127c86` | onderdelen (minutenwijzer, steeltjes, blaadjes) |
| licht petrol | `#bfe6e3` | lichte vulling (geveegd stuk van de klok, lantaarn uit) |
| koraal | `#f2715e` | onderdelen (urenwijzer, bloemblaadjes, lantaarndak, paddenstoel) |
| licht koraal | `#ffd6cc` | lichte vulling (knopje, paddenstoel uit) |
| warmgeel | `#ffc845` | accent (hartje, knopje van de wijzer, gekozen, goed) |
| licht geel | `#ffeab0` | lichte vulling (tijdboog) |
| warmwit | `#fff7ea` | wijzerplaat, vleugels, stippen, keuzeknoppen |

**Hoe de voorwerpen gemaakt zijn:** zelf ontworpen en in code getekend als SVG-paddata (Path2D), voor deze site gemaakt.
- Geen plaatjes van buiten, geen AI-gegenereerde plaatjes, geen emoji.
- Geen pakketten van derden, dus er is ook geen licentie te controleren.
- Niets is overgenomen van Synthesis: geen illustraties, kleurcombinaties of schermen.

## Klokles (`klok-bliepo-klok.tsx`)

Lessen: De urenwijzer, Hele uren zetten, Halve uren, Kwart over, 5 en 10 minuten later.

| voorwerp | bron |
|---|---|
| wijzerplaat (warmwit, donkerblauwe rand) | zelf getekend, SVG-pad |
| minuutstreepjes en uurstreepjes | zelf getekend, SVG-pad |
| cijfers 1–12 en de boogtekst 0–60 | lettertype van de les, als tekst getekend |
| urenwijzer (koraal) en minutenwijzer (petrol) | zelf getekend, SVG-pad |
| geel knopje aan de urenwijzer, middenknop | zelf getekend, SVG-pad |
| gele rand om een wijzer of getal (gekozen) | zelf getekend, SVG-pad |
| driehoekje, vlaggetje, pijl, tijdboog, geveegd stuk | zelf getekend, SVG-pad en Phaser-vormen |

### Aanvulling klokles (28 oktober 2026, nabouw naar Synthesis)

| voorwerp | vorm van Synthesis | bron |
|---|---|---|
| wijzerklok met twee wijzers | een ronde klok met cijfers, een lange en een korte wijzer | zelf getekend in code, eigen kleuren (warmwit, koraal, petrol) |
| Sam, het vriendje van Bliepo (`SamTekening`) | een poppetje naast een klok | eigen tekening: rond hoofd met haar, geel hemd, petrol broek, een hand omhoog; SVG-paden in `klok-bliepo-klok.tsx` |
| klok van Sam (stippelrand) | een tweede klok met een rode stippelrand | zelf getekend, koraal stippelrand |
| digitale klok onder de klok | schermpje met uur en minuten in twee kleuren | CSS: uur in koraal (urenwijzer), minuten in petrol (minutenwijzer) |

Plek: de klok staat groot, rechts van het midden (zoals Synthesis); de klok van Sam en Sam staan rechts daarvan, Sam boven zijn klok; links is de kolom van het lesscherm. Handje en vinkje staan linksboven in het vlak, bij de opdracht. Eén kleur per soort voorwerp: alle urenwijzers koraal, alle minutenwijzers petrol, alle wijzerplaten warmwit.

**LEGAL REVIEW REQUIRED voor de lancering** voor elk overgenomen voorwerp hierboven: wijzerklok, klok van Sam met stippelrand, digitale klok met twee kleuren, vlaggetje, tijdboog, driehoekje, gebogen pijl (alleen vorm en plek zijn van Synthesis; tekening en kleuren zijn eigen werk).

## Bloementuin: verhaaltjessommen (`verhaal-bliepo-tuin.tsx`)

Lessen: Instaptoets, Kleine verhaaltjes, Grotere verhaaltjes, Verstopte getallen, Eindtoets.

| voorwerp | bron |
|---|---|
| bloem en gesloten knopje | zelf getekend, SVG-pad |
| vuurvliegje | zelf getekend, SVG-pad |
| lantaarntje (aan en uit) | zelf getekend, SVG-pad |
| paddenstoel (aan en uit) | zelf getekend, SVG-pad |
| lichtje | zelf getekend, SVG-pad |
| lege plek (stippelrondje) | zelf getekend, canvas |
| keuzeknoppen, vakjes in de som, nummertjes | CSS in `verhaal-bliepo-tuin.module.css` |

## Verhaaltjessommen nagebouwd naar Synthesis (28 oktober 2026, `verhaal-bliepo-tuin.tsx`)

Lessen: Instaptoets, Kleine verhaaltjes, Grotere verhaaltjes, Verstopte getallen, Eindtoets. Vorm overgenomen van Synthesis (opbouw en indeling), tekening en kleuren zelf gemaakt, SVG-paddata in code (`vogel`, `bloempot`, `ballon`, `gloeilamp`, `munt`), vlakke dekkende kleuren met een donkerblauwe rand, geen gloed.

| voorwerp | vorm van Synthesis | eigen tekening en kleuren |
|---|---|---|
| vogeltjes op een draad | zijaanzicht, in groepjes van twee, draad eronder (LEGAL REVIEW REQUIRED voor de lancering) | rond lijfje, wit vleugeltje, snaveltje, alle vogeltjes geel; draad warmwit met donkerblauwe rand |
| bloempot leeg, met spruitje, met bloem | pot met aarde; spruit met twee blaadjes; bloem van 5 blaadjes (LEGAL REVIEW REQUIRED voor de lancering) | koraalrode pot, bruine aarde, petrol steel, alle bloemen roze; lege pot = gestippelde omtrek |
| ballon met touwtje, heel en geknapt | ovale ballon met knoopje en touwtje; geknapt = donker vlekje met scherfjes (LEGAL REVIEW REQUIRED voor de lancering) | alle ballonnen koraal; geknapt = donkerblauw vlekje met warmwitte rand en drie scherfjes |
| gloeilamp aan en uit | ronde peer met schroefvoet en draadje; aan met straaltjes (LEGAL REVIEW REQUIRED voor de lancering) | aan = warmgeel met 5 straaltjes, uit = lichtgrijs |
| munt | ronde munt (LEGAL REVIEW REQUIRED voor de lancering) | eigen gele munt met een ring en zonder teken of cijfer; uitgegeven = grijs |
| lege plek | stippelrondje | warmwit stippelrondje (bestond al) |
| kaarttekeningen | lijntekeningen (LEGAL REVIEW REQUIRED voor de lancering) | eigen kleine SVG's met dezelfde vormen |

## De oude versies

De oude versies blijven staan, volgens regel 1:
- `klok-holo-sterrenklok.tsx`;
- `verhaal-holo-bord.tsx`.

Terugzetten kan met één regel in het draaiboek:
- in `lessen/klokkijken.tsx`: `BliepoKlok` weer `Sterrenklok`;
- in `lessen/verhaaltjessommen.tsx`: `VerhaalTuin` weer `VerhaalHolo`.
