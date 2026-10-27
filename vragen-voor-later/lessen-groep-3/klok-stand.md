# Klokkijken Phaser: stand (T1-T5)

27 okt 2026 (middag). tsc en eslint schoon voor klokkijken.tsx en klok-holo-sterrenklok.tsx.
Speelscript: scratchpad/klok/kloktest.mjs (<les> <laptop|telefoon> <goed|mix|weetniet>). Niet "speel.mjs" noemen: andere helpers doen pkill op die naam.

- klok-urenwijzer (T1) · klaar · laptop goed, laptop mix (1x/2x fout, weet ik niet), telefoon mix, telefoon weetniet: tot het eind, geen console-fouten · vloeiend: niet te meten (machine overbelast, zie verslag)
- klok-hele-uren-zetten (T2) · klaar · laptop goed/mix, telefoon mix/weetniet: tot het eind · vloeiend: telefoon 60 b/s, laptop 50 b/s met hapering 523 ms bij load 50 (overbelast)
- klok-halve-uren (T3) · klaar · laptop goed/mix, telefoon goed: tot het eind
- klok-kwart-over (T4) · klaar · laptop goed, telefoon mix: tot het eind
- klok-minuten-later (T5) · klaar · laptop goed/mix, telefoon goed: tot het eind
