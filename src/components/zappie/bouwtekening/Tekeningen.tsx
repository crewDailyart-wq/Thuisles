/**
 * Tesla's tekeningen van Zappie (16 oktober 2026).
 *
 * Elke tekening is een los "blad" op de blauwdruk. Ze volgen het echte 3D-
 * model uit het pakket van de eigenaar: een beeldscherm als hoofd met een
 * golflijn, twee antennes met bolletjes, een petje achterstevoren, een
 * eivormige romp met een bliksemknop, armen met gele bandjes, een onderstel
 * met twee wielen en een oplaadkabel als staartje.
 *
 * Stukjes met data-reageer doen iets als de muis of een vinger in de buurt
 * komt (zie Bouwtekening.tsx en de CSS in startpagina.css).
 */

import { L, Maat, Pijl, Schrift, blok, bliksem, kring, lijn, tandwiel, vloeiend } from "@/components/zappie/bouwtekening/pen";

/** BLAD A: Bliepo van voren, met maten en aantekeningen. */
export function Vooraanzicht() {
  return (
    <svg viewBox="0 0 240 450" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Schrift x={120} y={14} anker="middle" grootte={13} className="bt-kop">BLAD A · BLIEPO VAN VOREN</Schrift>
      <Schrift x={238} y={40} anker="end" grootte={14}>petje achterstevoren!</Schrift>
      <Pijl punten={[[178, 42], [158, 56], [140, 86]]} zaad={9} dik={1} />
      <g transform="translate(0 24)">
        {/* antennes */}
        <g data-reageer="antennes" className="bt-antennes">
          <L d={lijn([[96, 84], [88, 48]], 1)} />
          <L d={kring(87, 43, 5, 2)} />
          <L d={lijn([[144, 84], [152, 48]], 3)} />
          <L d={kring(153, 43, 5, 4)} />
        </g>
        {/* petje */}
        <L d={vloeiend([[100, 84], [104, 70], [120, 64], [136, 70], [140, 84]])} />
        <L d={blok(113, 64, 14, 8, 2, 5)} dik={1.2} />
        {/* hoofd en scherm */}
        <L d={blok(62, 84, 116, 92, 16, 6)} dik={2} />
        <L d={blok(74, 96, 92, 68, 10, 7)} />
        <g data-reageer="scherm" className="bt-scherm">
          <L d={lijn([[82, 130], [104, 130], [110, 120], [116, 140], [122, 124], [127, 130], [158, 130]], 8, 0.4, 0)} className="bt-golf" dik={1.8} />
        </g>
        <L d={kring(55, 130, 10, 10)} />
        <L d={kring(55, 130, 4.5, 11)} dik={1} />
        <L d={kring(185, 130, 10, 12)} />
        <L d={kring(185, 130, 4.5, 13)} dik={1} />
        {/* romp met bliksemknop */}
        <L d={kring(120, 232, 30, 14, 54)} dik={2} />
        <L d={kring(120, 210, 12, 15)} />
        <L d={lijn([[124, 201], [115, 212], [123, 212], [116, 222]], 16, 0.3, 0)} dik={1.4} />
        {/* linkerarm, hangend */}
        <L d={kring(88, 192, 7, 17)} />
        <L d={lijn([[83, 198], [75, 232]], 18)} />
        <L d={lijn([[93, 199], [85, 234]], 19)} />
        <L d={kring(79, 238, 6, 20)} />
        <L d={lijn([[73, 243], [71, 266]], 21)} />
        <L d={lijn([[85, 243], [83, 266]], 22)} />
        <L d={lijn([[69, 262], [86, 262]], 23)} dik={2.4} className="bt-geel" />
        <L d={kring(77, 277, 9, 24, 11)} />
        {/* rechterarm, zwaaiend */}
        <g data-reageer="zwaai" className="bt-zwaaiarm">
          <L d={kring(152, 192, 7, 25)} />
          <L d={lijn([[156, 186], [178, 166]], 26)} />
          <L d={lijn([[160, 196], [182, 175]], 27)} />
          <L d={kring(184, 168, 6, 28)} />
          <L d={lijn([[186, 161], [196, 136]], 29)} />
          <L d={lijn([[192, 168], [204, 142]], 30)} />
          <L d={lijn([[193, 141], [207, 146]], 31)} dik={2.4} className="bt-geel" />
          <L d={kring(204, 126, 9, 32, 11)} />
          <L d={vloeiend([[216, 112], [221, 122], [216, 132]])} dik={1} />
          <L d={vloeiend([[224, 106], [231, 122], [224, 138]])} dik={1} />
        </g>
        {/* onderstel en wielen */}
        <L d={blok(84, 290, 72, 44, 8, 33)} dik={2} />
        <L d={blok(92, 298, 56, 26, 4, 34)} dik={1} />
        <L d={blok(60, 294, 22, 84, 9, 35)} dik={2} />
        <L d={blok(158, 294, 22, 84, 9, 36)} dik={2} />
        {[306, 320, 334, 348, 362].map((y, i) => (
          <g key={y}>
            <L d={lijn([[63, y], [79, y]], 40 + i, 0.4, 0)} dik={0.9} />
            <L d={lijn([[161, y], [177, y]], 50 + i, 0.4, 0)} dik={0.9} />
          </g>
        ))}
        {/* de grond, gearceerd */}
        <L d={lijn([[30, 380], [212, 380]], 60)} />
        {Array.from({ length: 15 }, (_, i) => (
          <L key={i} d={lijn([[36 + i * 12, 380], [28 + i * 12, 390]], 61 + i, 0.3, 0)} dik={0.7} />
        ))}
        <Maat van={[24, 40]} tot={[24, 380]} tekst="1 Bliepo hoog" zaad={80} />
        <Maat van={[60, 400]} tot={[180, 400]} tekst="wielbreedte" zaad={90} />
      </g>
    </svg>
  );
}

/** BLAD B: de opengewerkte tekening. Muis in de buurt: de delen klikken in elkaar. */
export function Opengewerkt() {
  return (
    <svg viewBox="0 0 240 450" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <Schrift x={120} y={14} anker="middle" grootte={13} className="bt-kop">BLAD B · ZO ZIT HIJ IN ELKAAR</Schrift>
      <L d={lijn([[120, 32], [120, 420]], 1, 0.3, 0)} dik={0.8} gestippeld />
      <g data-reageer="opengewerkt" className="bt-opengewerkt">
        <g className="bt-deel bt-deel-hoofd">
          <L d={lijn([[100, 62], [94, 40]], 2)} />
          <L d={kring(93, 36, 4.5, 3)} />
          <L d={lijn([[140, 62], [146, 40]], 4)} />
          <L d={kring(147, 36, 4.5, 5)} />
          <L d={blok(68, 62, 104, 78, 14, 6)} dik={2} />
          <L d={blok(80, 74, 80, 54, 9, 7)} />
          <L d={lijn([[88, 101], [108, 101], [113, 93], [118, 109], [123, 97], [127, 101], [152, 101]], 8, 0.4, 0)} dik={1.6} />
          <L d={lijn([[174, 100], [198, 100]], 9)} dik={0.9} />
          <L d={kring(210, 100, 10, 10)} />
          <Schrift x={210} y={104} anker="middle" grootte={12}>1</Schrift>
        </g>
        <g className="bt-deel bt-deel-romp">
          <L d={kring(120, 228, 28, 11, 48)} dik={2} />
          <L d={kring(120, 207, 10, 12)} />
          <L d={lijn([[123, 199], [116, 209], [123, 209], [117, 217]], 13, 0.3, 0)} dik={1.3} />
          <L d={kring(86, 196, 6, 14)} />
          <L d={kring(154, 196, 6, 15)} />
          <L d={lijn([[150, 228], [198, 228]], 16)} dik={0.9} />
          <L d={kring(210, 228, 10, 17)} />
          <Schrift x={210} y={232} anker="middle" grootte={12}>2</Schrift>
        </g>
        <g className="bt-deel bt-deel-onderstel">
          <L d={blok(84, 312, 72, 40, 8, 18)} dik={2} />
          <L d={blok(60, 316, 22, 72, 9, 19)} dik={2} />
          <L d={blok(158, 316, 22, 72, 9, 20)} dik={2} />
          <L d={vloeiend([[100, 352], [96, 370], [84, 384], [70, 392]])} dik={1.2} />
          <L d={blok(56, 388, 14, 9, 2, 21)} dik={1.2} />
          <L d={lijn([[182, 350], [198, 350]], 22)} dik={0.9} />
          <L d={kring(210, 350, 10, 23)} />
          <Schrift x={210} y={354} anker="middle" grootte={12}>3</Schrift>
        </g>
        <Pijl punten={[[44, 140], [44, 168]]} zaad={30} dik={1} />
        <Pijl punten={[[44, 306], [44, 280]]} zaad={32} dik={1} />
        <Schrift x={176} y={160} grootte={16} className="bt-klik">klik!</Schrift>
      </g>
      <Schrift x={120} y={440} anker="middle" grootte={13}>1 hoofd · 2 romp · 3 onderstel</Schrift>
    </svg>
  );
}

/** BLAD C: de aandrijving. De tandwielen draaien mee als je scrolt. */
export function Tandwielen() {
  return (
    <svg viewBox="0 0 460 210" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g data-reageer="tandwielen" className="bt-tandwielen">
        <g className="bt-tandwiel" style={{ "--verhouding": 1 } as React.CSSProperties}>
          <g className="bt-tandwiel-binnen">
            <L d={tandwiel(100, 118, 62, 14, 1)} dik={1.8} />
            <L d={kring(100, 118, 12, 2)} />
            <L d={kring(134, 118, 9, 3)} dik={1} />
            <L d={kring(66, 118, 9, 4)} dik={1} />
            <L d={kring(100, 152, 9, 5)} dik={1} />
            <L d={kring(100, 84, 9, 6)} dik={1} />
          </g>
        </g>
        <g className="bt-tandwiel" style={{ "--verhouding": -1.63 } as React.CSSProperties}>
          <g className="bt-tandwiel-binnen">
            <L d={tandwiel(177, 54, 38, 9, 7)} dik={1.8} />
            <L d={kring(177, 54, 8, 8)} />
            <L d={lijn([[177, 46], [177, 24]], 9)} dik={1} />
            <L d={lijn([[170, 58], [152, 68]], 10)} dik={1} />
            <L d={lijn([[184, 58], [202, 68]], 11)} dik={1} />
          </g>
        </g>
        <g className="bt-tandwiel" style={{ "--verhouding": 2.38 } as React.CSSProperties}>
          <g className="bt-tandwiel-binnen">
            <L d={tandwiel(241, 54, 26, 7, 12)} dik={1.8} />
            <L d={kring(241, 54, 6, 13)} />
          </g>
        </g>
      </g>
      <Schrift x={284} y={116} grootte={18}>de aandrijving</Schrift>
      <Schrift x={284} y={138} grootte={15}>draait mee als je scrolt!</Schrift>
      <Pijl punten={[[286, 112], [266, 96], [254, 80]]} zaad={20} dik={1} />
      <Schrift x={456} y={202} anker="end" grootte={12} className="bt-kop">BLAD C · AANDRIJVING</Schrift>
    </svg>
  );
}

/** BLAD D: de oplaadpaal, een teslaspoel. Muis in de buurt: hij vonkt. */
export function Oplaadpaal() {
  return (
    <svg viewBox="0 0 330 210" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g data-reageer="spoel" className="bt-spoel">
        <L d={blok(40, 170, 90, 24, 4, 1)} dik={2} />
        <L d={lijn([[66, 82], [66, 170]], 2)} />
        <L d={lijn([[104, 82], [104, 170]], 3)} />
        {Array.from({ length: 11 }, (_, i) => (
          <L key={i} d={lijn([[66, 86 + i * 8], [104, 90 + i * 8]], 4 + i, 0.3, 0)} dik={0.8} />
        ))}
        <L d={kring(85, 66, 36, 20, 14)} dik={2} />
        <L d={kring(85, 66, 18, 21, 6)} dik={1} />
        <g className="bt-vonken">
          <L d={bliksem([50, 62], [8, 34], 5, 30)} dik={1.6} />
          <L d={bliksem([66, 54], [46, 8], 4, 31)} dik={1.6} />
          <L d={bliksem([112, 56], [160, 22], 5, 32)} dik={1.6} />
          <L d={bliksem([120, 70], [168, 78], 4, 33)} dik={1.6} />
        </g>
        <L d={vloeiend([[130, 186], [168, 192], [198, 180], [224, 186]])} dik={1.3} />
        <L d={blok(224, 179, 18, 14, 2, 40)} dik={1.3} />
        <L d={lijn([[242, 183], [250, 183]], 41, 0.2, 0)} dik={1.2} />
        <L d={lijn([[242, 189], [250, 189]], 42, 0.2, 0)} dik={1.2} />
      </g>
      <L d={lijn([[30, 196], [150, 196]], 50)} />
      {Array.from({ length: 10 }, (_, i) => (
        <L key={i} d={lijn([[36 + i * 12, 196], [28 + i * 12, 205]], 51 + i, 0.3, 0)} dik={0.7} />
      ))}
      <Schrift x={170} y={96} grootte={19}>de oplaadpaal</Schrift>
      <Schrift x={170} y={118} grootte={15}>hier laadt Bliepo op</Schrift>
      <Schrift x={170} y={138} grootte={15}>(niet aanraken!)</Schrift>
      <Pijl punten={[[172, 92], [150, 80], [126, 72]]} zaad={60} dik={1} />
      <Schrift x={326} y={206} anker="end" grootte={12} className="bt-kop">BLAD D · OPLADEN</Schrift>
    </svg>
  );
}

/** BLAD E: Tesla's werkbank, met de raket naar de maan en een wiel. */
export function Werkbank() {
  return (
    <svg viewBox="0 0 640 290" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g data-reageer="raket" className="bt-raket">
        <L d={vloeiend([[90, 28], [108, 62], [115, 120], [113, 200], [67, 200], [65, 120], [72, 62]], true)} dik={2} />
        <L d={kring(90, 104, 13, 1)} />
        <L d={kring(90, 104, 7, 2)} dik={0.9} />
        <L d={lijn([[67, 160], [44, 214], [67, 204]], 3, 0.6, 0)} />
        <L d={lijn([[113, 160], [136, 214], [113, 204]], 4, 0.6, 0)} />
        <L d={lijn([[73, 70], [107, 70]], 5)} dik={0.9} />
        <L d={blok(76, 200, 28, 10, 2, 6)} />
        <g className="bt-vlam">
          <L d={lijn([[80, 214], [86, 236], [90, 226], [94, 252], [98, 228], [100, 214]], 7, 0.5, 0)} dik={1.6} />
        </g>
      </g>
      <Maat van={[150, 28]} tot={[150, 210]} tekst="hoogte: heel hoog" zaad={10} />
      <L d={vloeiend([[100, 18], [220, 6], [360, 18], [474, 46]])} dik={1} gestippeld />
      <L d={kring(520, 62, 32, 20)} dik={1.8} />
      <L d={kring(508, 52, 7, 21)} dik={0.9} />
      <L d={kring(532, 74, 5, 22)} dik={0.9} />
      <L d={kring(526, 48, 3, 23)} dik={0.9} />
      <Schrift x={404} y={128} grootte={20}>plan: Bliepo naar de maan</Schrift>
      <Schrift x={404} y={152} grootte={16}>(versie 2?)</Schrift>
      <g className="bt-wiel">
        <L d={kring(310, 196, 52, 30)} dik={2} />
        <L d={kring(310, 196, 40, 31)} />
        <L d={kring(310, 196, 22, 32)} />
        <L d={kring(310, 196, 9, 33)} />
        {Array.from({ length: 18 }, (_, i) => {
          const a = (i / 18) * Math.PI * 2;
          return (
            <L key={i} d={lijn([[310 + Math.cos(a) * 46, 196 + Math.sin(a) * 46], [310 + Math.cos(a) * 52, 196 + Math.sin(a) * 52]], 34 + i, 0.2, 0)} dik={0.8} />
          );
        })}
      </g>
      <Pijl punten={[[252, 168], [262, 140], [286, 126]]} zaad={60} dik={1.1} />
      <Pijl punten={[[368, 224], [358, 252], [334, 266]]} zaad={62} dik={1.1} />
      <Schrift x={384} y={204} grootte={18}>het wiel</Schrift>
      <Schrift x={384} y={226} grootte={15}>draait mee als je scrolt</Schrift>
      <Schrift x={636} y={286} anker="end" grootte={13} className="bt-kop">{"BLAD E · TESLA'S WERKBANK"}</Schrift>
    </svg>
  );
}

/** BLAD F: de lamp van het idee. Muis in de buurt: hij gaat aan. */
export function Ideelamp() {
  const peer = vloeiend(
    [[100, 20], [136, 34], [150, 70], [138, 104], [121, 124], [118, 146], [82, 146], [79, 124], [62, 104], [50, 70], [64, 34]],
    true,
  );
  return (
    <svg viewBox="0 0 210 220" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g data-reageer="lamp" className="bt-lamp">
        <path d={peer} className="bt-gloei" />
        <g className="bt-stralen">
          {Array.from({ length: 9 }, (_, i) => {
            const a = -Math.PI + (i / 8) * Math.PI - 0.0;
            return <L key={i} d={lijn([[100 + Math.cos(a) * 68, 70 + Math.sin(a) * 68], [100 + Math.cos(a) * 86, 70 + Math.sin(a) * 86]], 40 + i, 0.4, 0)} dik={2} />;
          })}
        </g>
        <L d={peer} dik={2} />
        <L d={lijn([[88, 146], [88, 110], [94, 98], [100, 110], [106, 98], [112, 110], [112, 146]], 2, 0.4, 0)} dik={1.2} />
        {[154, 162, 170].map((y, i) => (
          <L key={y} d={lijn([[84, y], [116, y]], 3 + i)} />
        ))}
        <L d={blok(92, 174, 16, 9, 3, 7)} />
      </g>
      <Schrift x={168} y={44} anker="middle" grootte={26} draai={-10} className="bt-idee">idee!</Schrift>
      <Schrift x={206} y={214} anker="end" grootte={12} className="bt-kop">BLAD F · HET IDEE</Schrift>
    </svg>
  );
}

/** BLAD G: het petje, voor in Bliepo’s atelier. Muis in de buurt: hij tikt het aan. */
export function Petje() {
  return (
    <svg viewBox="0 0 280 160" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <g data-reageer="petje" className="bt-petje">
        <L d={vloeiend([[44, 100], [54, 64], [90, 44], [130, 50], [152, 84], [154, 100]])} dik={2} />
        <L d={lijn([[44, 100], [154, 100]], 1)} dik={2} />
        <L d={lijn([[44, 100], [8, 108], [6, 114], [46, 108]], 2, 0.5, 0)} dik={1.8} />
        <L d={lijn([[104, 58], [92, 78], [104, 78], [94, 96]], 3, 0.3, 0)} dik={1.4} className="bt-geel" />
        <L d={kring(96, 46, 4, 4)} dik={1} />
      </g>
      <Maat van={[44, 124]} tot={[154, 124]} tekst="maat: Bliepo-hoofd" zaad={10} />
      <Schrift x={168} y={56} grootte={17}>ontwerp 3</Schrift>
      <Schrift x={168} y={78} grootte={14}>klep naar achteren!</Schrift>
      <Schrift x={276} y={154} anker="end" grootte={12} className="bt-kop">BLAD G · HET PETJE</Schrift>
    </svg>
  );
}

/** Turfstreepjes: per vijf vier rechte streepjes en één schuine erdoor. */
function Turven({ aantal }: { aantal: number }) {
  const zichtbaar = Math.min(aantal, 40);
  const groepen = Math.ceil(zichtbaar / 5);
  return (
    <g>
      {Array.from({ length: groepen }, (_, g) => {
        const x0 = 18 + g * 34;
        const inGroep = Math.min(5, zichtbaar - g * 5);
        return (
          <g key={g}>
            {Array.from({ length: Math.min(4, inGroep) }, (_, i) => (
              <L key={i} d={lijn([[x0 + i * 6, 126], [x0 + i * 6 + 1, 146]], g * 10 + i + 1, 0.6, 1)} dik={1.6} />
            ))}
            {inGroep === 5 && <L d={lijn([[x0 - 4, 142], [x0 + 23, 128]], g * 10 + 9, 0.5, 1)} dik={1.6} />}
          </g>
        );
      })}
      {aantal > 40 && <Schrift x={300} y={142} anker="end" grootte={12}>+{aantal - 40}</Schrift>}
    </g>
  );
}

/** Het titelblokje van de bouwtekening, rechtsonder, met Tesla's handtekening. */
export function Titelblok({ testritten }: { testritten: number }) {
  return (
    <svg viewBox="0 0 320 160" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
      <L d={lijn([[4, 4], [316, 4], [316, 156], [4, 156], [4, 4]], 1, 0.4, 0)} dik={2} />
      <L d={lijn([[4, 44], [316, 44]], 2)} dik={1} />
      <L d={lijn([[4, 96], [316, 96]], 3)} dik={1} />
      <L d={lijn([[176, 4], [176, 96]], 4)} dik={1} />
      <Schrift x={12} y={18} grootte={11} className="bt-label">ONTWERP</Schrift>
      <Schrift x={12} y={38} grootte={22}>ZAPPIE</Schrift>
      <Schrift x={184} y={18} grootte={11} className="bt-label">VERSIE</Schrift>
      <Schrift x={184} y={38} grootte={22}>1</Schrift>
      <Schrift x={12} y={58} grootte={11} className="bt-label">UITVINDER</Schrift>
      <text x={14} y={86} className="bt-handtekening">Tesla</text>
      <L d={vloeiend([[12, 90], [60, 94], [110, 86], [150, 90]])} dik={1.1} />
      <Schrift x={184} y={58} grootte={11} className="bt-label">BLAD</Schrift>
      <Schrift x={184} y={82} grootte={20}>1 VAN 1</Schrift>
      <Schrift x={12} y={112} grootte={11} className="bt-label">TESTRITTEN VAN ZAPPIE</Schrift>
      {testritten > 0 ? (
        <Turven aantal={testritten} />
      ) : (
        <Schrift x={14} y={142} grootte={15}>nog geen · maak een missie!</Schrift>
      )}
    </svg>
  );
}

/** Een getekend draaiplateau waar het 3D-prototype op staat. */
export function Plateau() {
  return (
    <svg viewBox="0 0 260 150" preserveAspectRatio="xMidYMax meet" aria-hidden="true">
      <L d={kring(130, 70, 104, 1, 26)} dik={2} />
      <L d={kring(130, 70, 84, 2, 19)} dik={1} />
      <L d={lijn([[26, 72], [26, 92]], 3)} />
      <L d={lijn([[234, 72], [234, 92]], 4)} />
      <L d={vloeiend([[26, 92], [70, 110], [130, 116], [190, 110], [234, 92]])} />
      <Schrift x={130} y={142} anker="middle" grootte={15} className="bt-kop">PROTOTYPE NR. 1 · WERKT!</Schrift>
    </svg>
  );
}
