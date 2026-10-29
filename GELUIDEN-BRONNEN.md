# Geluiden in de lessen: bronnen en licenties

Gemaakt op 29 oktober 2026, voor de 10 nagebouwde lessen (`indeling: "synthesis"`).

**Alles hieronder: LATER VERVANGEN** door eigen of ingekochte geluiden.

**LEGAL REVIEW REQUIRED (momenten):** wanneer een geluidje klinkt, hoe lang het
ongeveer duurt en hoe zacht het is, is overgenomen van Synthesis (gemeten in hun
lessen, zie onderaan). De klanken zelf komen níet van Synthesis: er is niets van
Synthesis gedownload, gekopieerd of gekoppeld.

## Waar de bestanden staan

- `public/geluiden/les/*.m4a` — 29 bestanden, samen ±210 kB.
- Mono, 22 050 Hz, AAC 32 kbit/s, piek op 0,5 (zacht genormaliseerd). Hoe hard
  ze echt klinken, staat per geluid in `src/lib/lesgeluiden.ts` (`BESTANDEN`,
  `vol`), afgestemd op Synthesis.
- Het formaat is AAC (`.m4a`) en niet mp3: op deze Mac zit geen mp3-maker
  (`afconvert` kan geen mp3 schrijven en ffmpeg is er niet). Alle browsers
  spelen `.m4a` af.
- Is een bestand er niet, dan klinkt de klank die in `lesgeluiden.ts` met code
  wordt gemaakt (die blijft als reserve).

## Bronnen (alle CC0: gratis, ook commercieel, naamsvermelding niet nodig)

De licentie is op elke pagina zelf gecontroleerd (29 okt 2026).

| Bron | Maker | Licentie | Link | Gebruikt in |
|---|---|---|---|---|
| Interface Sounds (pakket) | Kenney (kenney.nl) | CC0 (ook in `License.txt` in het pakket) | https://opengameart.org/content/interface-sounds | keuze, tik, goed, mis, terug, antwoord, beurt, markeer, kaart, wijzer-tik, wijzer-klik, plop, verschijn, lamp, groei, naar-som, klok-draai, sfeer-bloemen, sfeer-lampen, sfeer-vuurvliegjes, sfeer-lantaarns, sfeer-paddenstoelen |
| RPG Sound Pack (handleCoins) | Kenney (kenney.nl) | CC0 (ook in `license.txt` in het pakket) | https://opengameart.org/content/50-rpg-sound-effects | sfeer-munten |
| Ambient Bird Sounds | isaiah658 | CC0 | https://opengameart.org/content/ambient-bird-sounds | sfeer-vogels |
| Bird, cricket, frog and mosquito sounds (bird.ogg, cricket.ogg) | Aj_ | CC0 | https://opengameart.org/content/birdcricketfrog-and-mosquito-sounds | vlieg (zacht vogeltje), sfeer-vuurvliegjes (krekel) |
| Balloon Sounds (balloon_pop, balloon_inflate) | AntumDeluge | CC0 | https://opengameart.org/content/balloon-sounds | knal, sfeer-ballonnen |
| Bell Dings/Chimes (bell_ding1, 3, 4) | PWL | CC0 | https://opengameart.org/content/bell-dingschimes | goed, groei, naar-som, kaart (zachte nagalm) |
| Gold Coin | Aeva | CC0 | https://opengameart.org/content/gold-coin-6 | munt |
| Air Whoosh | pyranostudios | CC0 | https://opengameart.org/content/air-whoosh | vlieg, schuif, beurt, klok-draai, sfeer-bloemen (zacht briesje) |

Gedownload maar niet gebruikt: `birdchirping071414.wav` van syncopika (CC0,
https://opengameart.org/content/bird-chirping-sounds).

Niet gebruikt omdat de licentie niet CC0 is: o.a. "Coins Sounds" (CC-BY),
"Noisy blue tit birdsong" (CC-BY), "Bird song 1 second" (CC-BY-SA/GPL),
"Cozy farm SFX" (CC-BY).

Niet gelukt:
- **Kenney.nl zelf** weigert downloads vanaf de opdrachtregel (fout 403). Dezelfde
  Kenney-pakketten staan met dezelfde CC0-licentie op OpenGameArt; daar komen ze
  vandaan.
- **Pixabay** weigert ook (403). Niet gebruikt.
- **Freesound** vraagt om in te loggen om te downloaden. Niet gebruikt.

## Wat zelf gemaakt is

Elk bestand is een eigen knip- en mengwerk van de CC0-bronnen hierboven
(stukje eruit, zachter, in- en uitfaden, soms twee geluiden over elkaar):

| Bestand | Wat erin zit | Lengte |
|---|---|---|
| sfeer-vogels | stukje vogelgezang (isaiah658) | 2,0 s |
| sfeer-bloemen | zacht briesje + twee plukjes + een glastikje (Kenney) | 1,6 s |
| sfeer-ballonnen | stukje ballon opblazen | 1,0 s |
| sfeer-lampen | twee zachte schakelaartjes | 0,8 s |
| sfeer-munten | rinkelende muntjes | 0,85 s |
| sfeer-vuurvliegjes | drie zachte krekeltjes + glinster | 1,6 s |
| sfeer-lantaarns | twee glastikjes | 0,9 s |
| sfeer-paddenstoelen | twee zachte bloeps | 0,6 s |
| vlieg | whoosh + heel zacht vogeltje | 0,73 s |
| knal | ballon knapt | 0,54 s |
| lamp | schakelaar | 0,25 s |
| munt | muntje | 0,6 s |
| groei | bloep + zachte bel | 1,13 s |
| keuze, antwoord, tik | klikjes (Kenney select) | 0,38 / 0,38 / 0,06 s |
| goed | bevestiging + zachte bel | 2,0 s |
| mis | zacht dalend toontje | 0,4 s |
| terug | zachte bloep | 0,2 s |
| schuif | zacht briesje | 1,4 s |
| naar-som | glinster + bel | 1,2 s |
| beurt | zacht briesje + glastikje | 1,0 s |
| markeer | twee glastikjes | 0,6 s |
| kaart | bevestiging + bel | 2,0 s |
| wijzer-tik, wijzer-klik | plukje / klikje | 0,12 / 0,16 s |
| plop, verschijn | bloepjes | 0,12 / 0,2 s |
| klok-draai | briesje + stijgend toontje | 1,5 s |

Synthesis heeft alleen een sfeergeluidje bij het vogelverhaal. De andere
sfeergeluidjes (bloemen, ballonnen, lampen, munten, vuurvliegjes, lantaarns,
paddenstoelen) zijn er zelf bij gemaakt, in dezelfde zachte stijl.

## Wat er bij Synthesis klinkt (gemeten 28–29 okt 2026)

Gemeten met een script in de pagina dat bijhoudt welk geluid start, hoe lang het
is en hoe hard (versterking × hoogste uitslag van het geluid). Alleen de namen
van hun bestanden zijn gelezen; niets is gedownload of bewaard.

| Moment (les) | Duur | Hoe zacht (versterking → piek) |
|---|---|---|
| **Vogeltjes aan het begin van het vogelverhaal** (Small Problems, ±1 s na Play, vlak vóór de tekst en de stem) | 2,0 s | 0,45 → ±0,11 |
| Nieuwe beurt (alle lessen) | 2,0 s | 0,2 → ±0,13 (maar heel zacht van inhoud) |
| Keuze aantikken | 0,48 s | 0,175 → ±0,14 |
| Goed (getal, zin, signaalwoord) | 2,85 s | 0,175 → ±0,17 |
| Fout woord aangetikt / start toets | 1,06 s | 0,15 → ±0,07 |
| Fout woord weer wit / ballon knapt (2× tegelijk) | 0,98 s | 0,25 → ±0,15 |
| Plaatjes schuiven in beeld | 2,04 s | 0,1 → ±0,08 |
| Getal of antwoord gekozen | 5,04 s + 2,06 s | 0,05 en 0,15 → ±0,02 en ±0,03 |
| Vogel vliegt weg (per vogel) | 0,73 s | 0,225 → ±0,18 |
| Klok: getallenlijn buigt tot klok | 1,54 s + 0,5 s | 0,15 → ±0,06 en ±0,08 |
| Klok: lijn verschijnt / bijzonder moment | 1,78 s | 0,15 → ±0,1 |

- Bij de bloemen, de ballonnen (Small en Bigger Problems), de lampen (toets) en
  de klokken klinkt bij de start **geen** sfeergeluid.
- Lamp, pot en munt (Bigger Problems): duur eerder gemeten (0,16 s, 1,13 s,
  0,44–0,5 s, zie `SYNTHESIS-ANALYSE/GEDRAG-V3-grotere-verhaaltjes.md`); het volume
  daarvan is niet gemeten en geschat op dezelfde zachtheid als de andere.
- Synthesis speelt het beurtgeluid tegelijk met de stem. Wij zetten alle
  geluidjes zachter zodra Bliepo praat (naar 20 %), en een sfeergeluidje wacht
  tot Bliepo klaar is.
