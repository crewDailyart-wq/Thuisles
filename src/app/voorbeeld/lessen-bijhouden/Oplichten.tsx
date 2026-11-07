import lijst from "./oplichten.json";
import s from "./rondjecontrole.module.css";

/**
 * Oplichten in plaats van rondje (BOUWREGELS 7.9): waar een rondje onhandig is, licht het aangewezen ding op.
 * De lijst staat in oplichten.json; het onderdeel is er alleen als er iets in staat.
 */
type Regel = { les: string; reden: string; oplicht: string };

export function Oplichten() {
  const regels = lijst as Regel[];
  if (!regels.length) return null;
  return (
    <section className={s.sectie} aria-labelledby="oplichten-kop">
      <h2 id="oplichten-kop">Oplichten in plaats van rondje</h2>
      <p>
        Meestal wijst Bliepo aan met een rood rondje. Waar een rondje onhandig is, licht het aangewezen ding op. Onhandig is: (a) het rondje bedekt andere dingen, (b) het past niet goed om de vorm (een smalle wijzer, een lange lijn), of (c) het staat zo dicht op iets anders dat niet duidelijk is wat bedoeld wordt. Nooit allebei op hetzelfde ding.
      </p>
      <ul className={s.lessen}>
        {regels.map((r) => (
          <li key={r.les} className={s.les}>
            <span className={s.titel}>{r.les}</span>
            <p className={s.opmerking}>
              <b>Waarom:</b> {r.reden}
            </p>
            <p className={s.opmerking}>
              <b>Wat licht op:</b> {r.oplicht}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
