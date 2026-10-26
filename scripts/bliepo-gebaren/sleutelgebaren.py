"""
Nieuwe gebaren voor Bliepo, met keyframes gemaakt in Blender (26 oktober 2026,
opdracht eigenaar: een gebarenwoordenboek zoals een juf die met haar handen
uitlegt). Voor gebaren die Mixamo niet goed heeft (groot/klein, erbij/eraf,
tellen op de vingers, stop, wijzen in een richting...).

Gebruik:  Blender -b --python sleutelgebaren.py -- <uit.json>

Per gebaar staan er sleutelmomenten (keyframes): waar de pols is, waar de
elleboog heen buigt, hoe de hand staat (vingers en handpalm) en hoe krom elke
vinger is. Daartussen gaat het zacht (ease in/out). Per beeldje:
  - de arm wordt uitgerekend (twee botjes: bovenarm en onderarm);
  - gaat een arm, hand of vinger door zijn lijf, hoofd of wielen, dan wordt hij
    zo min mogelijk naar buiten / naar voren geduwd (zelfde dozen als bij het
    overzetten van Mixamo, overzetten.py);
  - de uitkomst heeft hetzelfde formaat als overzetten.py (quaternions per
    scharnier, Blender-assen), zodat maak-gebaren-glb.mjs hem kan inpakken.

Assen (Blender): +x = rechts in beeld (ArmRight), -y = naar voren (naar het
kind), +z = omhoog. Bliepo's vingers: drie vingers en een duim per hand, elk
een eigen scharnier (FingerLeft0..3, FingerRight0..3); de duim zit aan de
buitenkant (links 0, rechts 3).

Het hoogste punt van elk gebaar ligt op 0,3 seconde (het gebaar begint 0,3 s
voor het woord en is op zijn hoogste punt precies op het woord).
"""
import bpy, sys, json, math
from mathutils import Vector, Quaternion, Matrix, Euler

argv = sys.argv[sys.argv.index("--") + 1:]
UIT = argv[0]
FPS = 30
PIEK = 0.3

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath="/Users/sararifi/Desktop/thuisles/public/assets/zappie/3d/zappie.glb")
B = bpy.data.objects
SCHOUDER = {s: B["Arm" + s].matrix_world.translation.copy() for s in ("Left", "Right")}
ELLEBOOG = {s: B["Elbow" + s].matrix_world.translation.copy() for s in ("Left", "Right")}
POLS = {s: B["Hand" + s].matrix_world.translation.copy() for s in ("Left", "Right")}
LB = {s: (ELLEBOOG[s] - SCHOUDER[s]).length for s in SCHOUDER}
LO = {s: (POLS[s] - ELLEBOOG[s]).length for s in SCHOUDER}
U0 = {s: (ELLEBOOG[s] - SCHOUDER[s]).normalized() for s in SCHOUDER}
F0 = {s: (POLS[s] - ELLEBOOG[s]).normalized() for s in SCHOUDER}
HAND = 0.24
KANT = {"Left": -1, "Right": 1}

DOZEN = [
    ((-0.66, -0.36, 0.96), (0.66, 0.32, 2.62)),   # lijf
    ((-1.0, -0.49, 2.45), (1.0, 0.6, 3.91)),      # hoofd (beeldscherm)
    ((-1.05, -0.49, 0.0), (-0.71, 0.49, 0.98)),   # wiel links
    ((0.71, -0.49, 0.0), (1.05, 0.49, 0.98)),     # wiel rechts
]


def botst(p, r):
    return any(all(lo[i] - r < p[i] < hi[i] + r for i in range(3)) for lo, hi in DOZEN)


def punten(s, d1, d2):
    sh = SCHOUDER[s]
    el = sh + d1 * LB[s]
    po = el + d2 * LO[s]
    pts = [sh + d1 * (LB[s] * f) for f in (0.55, 0.8, 1.0)]
    pts += [el + d2 * (LO[s] * f) for f in (0.33, 0.66, 1.0)]
    pts += [po + d2 * (HAND * f) for f in (0.5, 1.0)]
    return pts


STRAAL = [0.06, 0.06, 0.07, 0.08, 0.08, 0.09, 0.1, 0.1]


def vrij(s, d1, d2):
    pts = punten(s, d1, d2)
    if any(botst(p, r) for p, r in zip(pts, STRAAL)):
        return False
    return all(p.y < 0.12 for p in pts[3:])


def duw(s, d1, d2):
    """Kleinste duw naar buiten (x) en naar voren (-y) waarmee de arm nergens doorheen gaat (zoals overzetten.py)."""
    if vrij(s, d1, d2):
        return d1, d2, 0.0
    beste = None
    stappen = [i * 0.08 for i in range(0, 26)]
    for a in stappen:
        for b in stappen:
            if beste and a + b >= beste[2]:
                continue
            duwv = Vector((KANT[s] * a, -b, 0))
            n1 = (d1 + duwv).normalized()
            n2 = (d2 + duwv).normalized()
            if vrij(s, n1, n2):
                beste = (n1, n2, a + b)
    if beste:
        return beste
    return U0[s].copy(), F0[s].copy(), 99.0


def ik(s, doel, hint):
    """Twee botjes: waar komt de elleboog als de pols op `doel` moet, met de elleboog richting `hint`."""
    S = SCHOUDER[s]
    v = doel - S
    d = max(abs(LB[s] - LO[s]) + 1e-3, min(LB[s] + LO[s] - 1e-3, v.length))
    u = v.normalized()
    a = (LB[s] ** 2 - LO[s] ** 2 + d * d) / (2 * d)
    h = math.sqrt(max(0.0, LB[s] ** 2 - a * a))
    w = hint - u * hint.dot(u)
    if w.length < 1e-6:
        w = Vector((0, 0, -1)) - u * u.z
    w.normalize()
    E = S + u * a + w * h
    P = S + u * d
    return (E - S).normalized(), (P - E).normalized()


def ease(f):
    f = max(0.0, min(1.0, f))
    return f * f * (3 - 2 * f)


REST_HAND = (Vector((0, 0, -1)), Vector((0, -1, 0)))  # vingers omlaag, handpalm naar voren
# Welke scharnier is welke vinger: [duim, wijsvinger, middelvinger, ringvinger].
VINGER = {"Left": [0, 1, 2, 3], "Right": [3, 2, 1, 0]}


def kant_pose(s, pols=None, hint=None, vingers=None, palm=None, krom=(0, 0, 0, 0)):
    """Eén arm op één moment. Zonder pols: de rusthouding."""
    return {
        "pols": Vector(pols) if pols else POLS[s].copy(),
        "hint": Vector(hint) if hint else Vector((KANT[s] * 0.8, 0.15, -1.0)),
        "vingers": Vector(vingers).normalized() if vingers else REST_HAND[0].copy(),
        "palm": Vector(palm).normalized() if palm else REST_HAND[1].copy(),
        "krom": list(krom),
    }


def spiegel(p):
    """De linkerarm als spiegelbeeld van een rechterpose."""
    m = lambda v: Vector((-v.x, v.y, v.z))
    return {"pols": m(p["pols"]), "hint": m(p["hint"]), "vingers": m(p["vingers"]), "palm": m(p["palm"]), "krom": list(p["krom"])}


def rust():
    return {"Left": kant_pose("Left"), "Right": kant_pose("Right"), "hoofd": (0, 0, 0)}


def pose(right=None, left=None, hoofd=(0, 0, 0)):
    r = rust()
    if right:
        r["Right"] = kant_pose("Right", **right)
    if left == "spiegel" and right:
        r["Left"] = spiegel(r["Right"])
    elif left:
        r["Left"] = kant_pose("Left", **left)
    r["hoofd"] = hoofd
    return r


def meng(a, b, f):
    uit = {}
    for s in ("Left", "Right"):
        A, Bk = a[s], b[s]
        uit[s] = {
            "pols": A["pols"].lerp(Bk["pols"], f),
            "hint": A["hint"].lerp(Bk["hint"], f),
            "vingers": A["vingers"].slerp(Bk["vingers"], f) if A["vingers"].angle(Bk["vingers"], 0) < 3.1 else A["vingers"].lerp(Bk["vingers"], f).normalized(),
            "palm": A["palm"].slerp(Bk["palm"], f) if A["palm"].angle(Bk["palm"], 0) < 3.1 else A["palm"].lerp(Bk["palm"], f).normalized(),
            "krom": [x + (y - x) * f for x, y in zip(A["krom"], Bk["krom"])],
        }
    uit["hoofd"] = tuple(x + (y - x) * f for x, y in zip(a["hoofd"], b["hoofd"]))
    return uit


def handdraai(vingers, palm):
    """De draai van de hand in de wereld: vingers en handpalm zoals gevraagd (zoals in overzetten.py)."""
    langs = vingers.normalized()
    palm = (palm - langs * palm.dot(langs)).normalized()
    doel = Matrix((langs, palm, langs.cross(palm))).transposed()
    rb = Matrix((REST_HAND[0], REST_HAND[1], REST_HAND[0].cross(REST_HAND[1]))).transposed()
    return (doel @ rb.inverted()).to_quaternion()


def frame(p):
    rij = {}
    duwen = 0.0
    for s in ("Left", "Right"):
        k = p[s]
        d1, d2 = ik(s, k["pols"], k["hint"])
        d1, d2, hoeveel = duw(s, d1, d2)
        duwen = max(duwen, hoeveel)
        qA = U0[s].rotation_difference(d1)
        qE = F0[s].rotation_difference(qA.inverted() @ d2)
        Qf = qA @ qE
        Rw = handdraai(k["vingers"], k["palm"])
        qH = Qf.inverted() @ Rw
        # Vingers niet in zijn hoofd of lijf: dan draait de pols minder ver.
        pols = SCHOUDER[s] + d1 * LB[s] + d2 * LO[s]
        for stap in range(11):
            q = qH.slerp(Quaternion(), stap / 10)
            richting = Qf @ q @ F0[s]
            if not any(botst(pols + richting * (HAND * f), 0.09) for f in (0.4, 0.75, 1.0)):
                qH = q
                break
        rij["Arm" + s] = qA
        rij["Elbow" + s] = qE
        rij["Hand" + s] = qH
        for i, j in enumerate(VINGER[s]):
            # Tot 1.35: een stevige vuist (bij de duim), zodat de duim er verder bovenuit steekt.
            rij["Finger" + s + str(j)] = Quaternion((1, 0, 0), -1.25 * max(0.0, min(1.35, k["krom"][i])))
    x, y, z = p["hoofd"]
    rij["Head"] = Euler((x, y, z), "XYZ").to_quaternion()
    return rij, duwen


def clip(sleutels, duur):
    """sleutels: [(tijd, pose)], gesorteerd. Tussen twee sleutels zacht (ease in/out)."""
    sporen = {}
    max_duw = 0.0
    n = int(round(duur * FPS)) + 1
    for i in range(n):
        t = i / FPS
        for j in range(len(sleutels) - 1):
            t0, p0 = sleutels[j]
            t1, p1 = sleutels[j + 1]
            if t <= t1 or j == len(sleutels) - 2:
                f = ease((t - t0) / max(1e-6, t1 - t0))
                p = meng(p0, p1, f)
                break
        rij, d = frame(p)
        max_duw = max(max_duw, d)
        for k, q in rij.items():
            sporen.setdefault(k, []).append(q)
    return sporen, max_duw


# --------------------------------------------------------------------------- de gebaren
# Veel gebruikte handen.
OPEN = (0, 0, 0, 0)
WIJS = (0.55, 0, 1, 1)          # wijsvinger gestrekt, de rest krom, duim half
ZACHT = (0.25, 0.2, 0.25, 0.3)  # ontspannen hand
VUIST = (0.8, 1, 1, 1)
TEL = {1: (1, 0, 1, 1), 2: (1, 0, 0, 1), 3: (1, 0, 0, 0), 4: (0, 0, 0, 0)}

R0 = rust()


def kort(piek_pose, houd=0.5, uit=0.45, tussen=None):
    """Omhoog in 0,3 s naar de piek, even vasthouden, en terug naar rust."""
    sl = [(0.0, R0), (PIEK, piek_pose)]
    t = PIEK
    for dt, p in tussen or []:
        t += dt
        sl.append((t, p))
    t += houd
    sl.append((t, sl[-1][1]))
    t += uit
    sl.append((t, R0))
    return sl, t


G = {}

# groot: handen ver uit elkaar, handpalmen naar elkaar toe.
groot = pose(right=dict(pols=(1.42, -0.45, 2.05), hint=(1, 0.3, -0.6), vingers=(0.25, -0.5, 0.8), palm=(-1, 0, 0), krom=ZACHT), left="spiegel", hoofd=(0.02, 0, 0))
G["groot"] = kort(groot, houd=0.6)

# klein: de handen dicht bij elkaar voor zijn borst.
klein = pose(right=dict(pols=(0.66, -0.8, 1.93), hint=(1, 0.2, -1), vingers=(-0.35, -0.6, 0.7), palm=(-1, 0, 0), krom=(0.45, 0.4, 1, 1)), left="spiegel", hoofd=(0.06, 0, 0))
G["klein"] = kort(klein, houd=0.6)

# erbij / plus / bij elkaar: iets naar zich toe halen.
erbij_a = pose(right=dict(pols=(0.9, -0.78, 1.9), hint=(1, 0.3, -1), vingers=(0, -1, 0.15), palm=(0, 0, 1), krom=OPEN))
erbij_b = pose(right=dict(pols=(0.7, -0.6, 1.8), hint=(1, 0.3, -1), vingers=(-0.6, -0.2, 0.5), palm=(0, 1, 0.2), krom=(0.5, 0.55, 0.6, 0.65)), hoofd=(0.05, 0, 0))
G["erbij"] = kort(erbij_a, houd=0.15, tussen=[(0.32, erbij_b)])

# eraf / min / weg: iets wegvegen.
eraf_a = pose(right=dict(pols=(0.8, -0.77, 1.85), hint=(1, 0.2, -1), vingers=(0, -1, 0), palm=(-1, 0, -0.3), krom=ZACHT))
eraf_b = pose(right=dict(pols=(1.33, -0.45, 1.84), hint=(1, 0.3, -0.7), vingers=(0.7, -0.7, 0), palm=(1, 0, 0), krom=OPEN))
G["eraf"] = kort(eraf_a, houd=0.05, tussen=[(0.28, eraf_b)])

# snel: snelle, korte bewegingen met beide handen.
snel_a = pose(right=dict(pols=(0.68, -0.73, 1.8), hint=(1, 0.2, -1), vingers=(0, -1, 0), palm=(0, 0, -1), krom=ZACHT), left="spiegel")
snel_b = pose(right=dict(pols=(0.68, -0.74, 1.94), hint=(1, 0.2, -1), vingers=(0, -1, 0.3), palm=(0, 0.2, -1), krom=ZACHT), left="spiegel")
G["snel"] = kort(snel_a, houd=0.05, tussen=[(0.11, snel_b), (0.11, snel_a), (0.11, snel_b), (0.11, snel_a)])

# langzaam: een rustige, trage beweging naar buiten.
lz_a = pose(right=dict(pols=(0.82, -0.76, 1.82), hint=(1, 0.2, -1), vingers=(0, -1, 0), palm=(0, 0, -1), krom=ZACHT), left="spiegel")
lz_b = pose(right=dict(pols=(1.08, -0.58, 1.8), hint=(1, 0.3, -1), vingers=(0.3, -1, 0), palm=(0, 0, -1), krom=ZACHT), left="spiegel", hoofd=(0.04, 0, 0))
G["langzaam"] = kort(lz_a, houd=0.2, uit=0.7, tussen=[(1.5, lz_b)])

# meer: hand met de palm omhoog gaat omhoog.
meer_a = pose(right=dict(pols=(0.8, -0.72, 1.72), hint=(1, 0.2, -1), vingers=(0, -1, 0), palm=(0, 0, 1), krom=ZACHT))
meer_b = pose(right=dict(pols=(0.85, -0.6, 2.22), hint=(1, 0.3, -1), vingers=(0, -1, 0.2), palm=(0, 0, 1), krom=ZACHT))
G["meer"] = kort(meer_a, houd=0.3, tussen=[(0.4, meer_b)])

# minder: hand met de palm omlaag duwt naar beneden.
minder_a = pose(right=dict(pols=(0.75, -0.72, 2.02), hint=(1, 0.2, -1), vingers=(0, -1, 0), palm=(0, 0, -1), krom=ZACHT))
minder_b = pose(right=dict(pols=(0.8, -0.62, 1.55), hint=(1, 0.2, -1), vingers=(0, -1, -0.1), palm=(0, 0, -1), krom=ZACHT))
G["minder"] = kort(minder_a, houd=0.3, tussen=[(0.4, minder_b)])

# stop / wacht even: hand vooruit, handpalm naar het kind.
stop = pose(right=dict(pols=(0.85, -0.8, 2.03), hint=(1, 0.3, -1), vingers=(0, -0.15, 1), palm=(0, -1, 0), krom=OPEN), hoofd=(0.03, 0, 0))
G["stop"] = kort(stop, houd=0.7)

# samen: de handen naar elkaar toe.
samen_a = pose(right=dict(pols=(1.02, -0.6, 1.88), hint=(1, 0.2, -1), vingers=(0, -1, 0.3), palm=(-1, 0, 0), krom=ZACHT), left="spiegel")
samen_b = pose(right=dict(pols=(0.68, -0.8, 1.9), hint=(1, 0.2, -1), vingers=(-0.4, -1, 0.3), palm=(-1, 0, 0), krom=ZACHT), left="spiegel", hoofd=(0.05, 0, 0))
G["samen"] = kort(samen_a, houd=0.3, tussen=[(0.35, samen_b)])

# wijzen in een richting, met één vinger.
G["boven"] = kort(pose(right=dict(pols=(1.22, -0.44, 2.44), hint=(1, 0.4, -0.2), vingers=(0, -0.05, 1), palm=(0, -1, 0), krom=WIJS), hoofd=(-0.012, 0.06, 0)), houd=0.6)
G["onder"] = kort(pose(right=dict(pols=(0.83, -0.7, 1.65), hint=(1, 0.3, -0.6), vingers=(0, -0.45, -1), palm=(-1, 0, 0), krom=WIJS), hoofd=(0.1, 0, 0)), houd=0.6)
G["links"] = kort(pose(left=dict(pols=(-1.38, -0.45, 2.0), hint=(-0.6, 0.3, -1), vingers=(-1, -0.15, 0.1), palm=(0, -1, 0), krom=WIJS), hoofd=(0.02, 0, -0.06)), houd=0.6)
G["rechts"] = kort(pose(right=dict(pols=(1.4, -0.45, 2.0), hint=(0.6, 0.3, -1), vingers=(1, -0.15, 0.1), palm=(0, -1, 0), krom=WIJS), hoofd=(0.02, 0, 0.06)), houd=0.6)

# eerst / dan: twee korte handbewegingen na elkaar (eerst links, dan rechts), handpalm omhoog.
eerst = pose(left=dict(pols=(-0.82, -0.77, 1.84), hint=(-1, 0.2, -1), vingers=(0, -1, 0.15), palm=(0, 0, 1), krom=ZACHT))
dan = pose(right=dict(pols=(0.82, -0.77, 1.84), hint=(1, 0.2, -1), vingers=(0, -1, 0.15), palm=(0, 0, 1), krom=ZACHT))
G["eerst"] = kort(eerst, houd=0.35)
G["dan"] = kort(dan, houd=0.35)

# helemaal: een brede armbeweging.
hm_a = pose(right=dict(pols=(0.8, -0.8, 1.95), hint=(1, 0.2, -1), vingers=(-0.3, -1, 0), palm=(0, 0, -1), krom=ZACHT))
hm_b = pose(right=dict(pols=(1.05, -0.74, 2.02), hint=(1, 0.2, -1), vingers=(0.4, -1, 0), palm=(0, 0, -1), krom=OPEN))
hm_c = pose(right=dict(pols=(1.45, -0.35, 1.95), hint=(1, 0.3, -0.7), vingers=(1, -0.4, 0), palm=(0, 0, -1), krom=OPEN))
G["helemaal"] = kort(hm_a, houd=0.15, tussen=[(0.3, hm_b), (0.3, hm_c)])

# nadenken: hand bij zijn borst, hoofd scheef.
G["denken"] = kort(pose(right=dict(pols=(0.5, -0.68, 2.3), hint=(1, 0.2, -0.8), vingers=(-0.35, -0.15, 1), palm=(0, 1, 0), krom=(0.35, 0.45, 0.6, 0.7)), hoofd=(0.05, 0.13, 0.03)), houd=0.9)

# tellen op de vingers: hand omhoog, één vinger per getal (1 tot 4; Bliepo heeft drie vingers en een duim).
for n, kr in TEL.items():
    G[f"vingers{n}"] = kort(pose(right=dict(pols=(0.82, -0.76, 1.98), hint=(1, 0.2, -1), vingers=(0, -0.2, 1), palm=(0, -1, 0), krom=kr), hoofd=(0.03, 0, 0)), houd=0.45)

# duim omhoog (26 oktober 2026): een vuist met de duim recht omhoog, op borsthoogte en iets naar voren,
# ver onder zijn hoofd (de Mixamo-duim hief een open hand naast zijn hoofd: dat leek op zwaaien).
# De handrug naar het kind: de vingers krommen naar zijn lijf tot een vuist, en de duim steekt aan de buitenkant recht omhoog (tegen de achtergrond goed te zien).
G["duimop"] = kort(pose(right=dict(pols=(0.8, -0.8, 2.05), hint=(1, 0.2, -1), vingers=(0.12, -0.15, 1), palm=(-0.25, 1, 0), krom=(0, 1.35, 1.35, 1.35)), hoofd=(0.04, 0, 0)), houd=0.6)

# Een vraag: twee open handen naar voren, de palmen omhoog, al op het hoogste punt (26 oktober 2026).
G["openhanden"] = kort(pose(right=dict(pols=(0.9, -0.72, 1.82), hint=(1, 0.2, -1), vingers=(0.25, -1, 0.25), palm=(0, 0, 1), krom=(0.1, 0, 0.05, 0.1)), left="spiegel", hoofd=(0.03, 0.06, 0)), houd=0.55)

# open hand (uitnodigend), en een rustige hand met zachte vingers.
G["openhand"] = kort(pose(right=dict(pols=(0.86, -0.74, 1.86), hint=(1, 0.2, -1), vingers=(0.2, -1, 0.3), palm=(0, 0, 1), krom=OPEN)), houd=0.5)

def meet_sleutels(naam, sleutels):
    for t, p in sleutels:
        for s_ in ("Left", "Right"):
            k = p[s_]
            if (k["pols"] - POLS[s_]).length < 1e-4:
                continue
            bereik = (k["pols"] - SCHOUDER[s_]).length / (LB[s_] + LO[s_])
            d1, d2 = ik(s_, k["pols"], k["hint"])
            n1, n2, hoeveel = duw(s_, d1, d2)
            echt = SCHOUDER[s_] + n1 * LB[s_] + n2 * LO[s_]
            print(f"SLEUTEL {naam} t={t:.2f} {s_}: bereik {bereik:.2f}, duw {hoeveel:.2f}, pols mist {(echt - k['pols']).length:.2f} -> {tuple(round(c, 2) for c in echt)}")


uitkomst = {"fps": FPS, "piek": PIEK, "clips": {}}
for naam, (sleutels, duur) in G.items():
    meet_sleutels(naam, sleutels)
    sporen, max_duw = clip(sleutels, duur)
    print(f"CLIP {naam}: {duur:.2f} s, grootste duw {max_duw:.2f}")
    uitkomst["clips"][naam] = {k: [[round(q.x, 5), round(q.y, 5), round(q.z, 5), round(q.w, 5)] for q in v] for k, v in sporen.items()}
with open(UIT, "w") as fh:
    json.dump(uitkomst, fh)
print("KLAAR", UIT)
