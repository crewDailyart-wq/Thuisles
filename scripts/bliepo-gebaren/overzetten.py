"""
Mixamo-bewegingen overzetten op Bliepo (retargeting), in Blender.

Gebruik:  Blender -b --python overzetten.py -- <fbx-map> <uit.json> [clipnaam=bestand.fbx ...]

Per beeldje:
  - richting van bovenarm en onderarm (en het vlak waarin de elleboog buigt)
    van de Mixamo-figuur, gemeten ten opzichte van zijn borst (zo blijft
    Bliepo's lijf stil), op Bliepo's korte armen gezet;
  - botst een arm met zijn lijf, hoofd of wielen, dan wordt hij met zo min
    mogelijk naar buiten / naar voren geduwd;
  - hoofd/nek en polsen: de draai ten opzichte van de borst / onderarm,
    kleiner gemaakt;
  - vingers: hoe ver ze krommen.
Uitkomst: JSON met per clip per scharnier quaternions (Blender-assen).
"""
import bpy, sys, json, math, os
from mathutils import Vector, Quaternion, Matrix

argv = sys.argv[sys.argv.index("--") + 1:]
MAP, UIT = argv[0], argv[1]
CLIPS = dict(a.split("=", 1) for a in argv[2:])
FPS = 30
TORSO_DY = 0.0

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
HAND = 0.24  # van pols tot vingertop
R = 0.07     # dikte van arm/hand (halve)
KANT = {"Left": -1, "Right": 1}

# Botsdozen (gemeten in maten.py), iets kleiner aan de schouderkant zodat de rusthouding vrij is.
DOZEN = [
    ((-0.66, -0.36, 0.96), (0.66, 0.32, 2.62)),   # lijf
    ((-1.0, -0.49, 2.45), (1.0, 0.6, 3.91)),      # hoofd (beeldscherm)
    ((-1.05, -0.49, 0.0), (-0.71, 0.49, 0.98)),   # wiel links
    ((0.71, -0.49, 0.0), (1.05, 0.49, 0.98)),     # wiel rechts
]


def botst(p, r=R):
    for lo, hi in DOZEN:
        if all(lo[i] - r < p[i] < hi[i] + r for i in range(3)):
            return True
    return False


def punten(s, d1, d2):
    sh = SCHOUDER[s]
    el = sh + d1 * LB[s]
    po = el + d2 * LO[s]
    pts = [sh + d1 * (LB[s] * f) for f in (0.55, 0.8, 1.0)]
    pts += [el + d2 * (LO[s] * f) for f in (0.33, 0.66, 1.0)]
    pts += [po + d2 * (HAND * f) for f in (0.5, 1.0)]
    return pts


def vrij(s, d1, d2):
    pts = punten(s, d1, d2)
    # bovenarm dun, onderarm iets dikker, hand het dikst (vingers)
    straal = [0.06, 0.06, 0.07, 0.08, 0.08, 0.09, 0.1, 0.1]
    if any(botst(p, r) for p, r in zip(pts, straal)):
        return False
    # Handen en onderarm nooit achter zijn lijf (dan zie je ze niet).
    return all(p.y < 0.12 for p in pts[3:])


def duw(s, d1, d2):
    """Kleinste duw naar buiten (x) en naar voren (-y) waarmee de arm nergens doorheen gaat."""
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


def basis(u, f, vorige_n=None):
    n = u.cross(f)
    if n.length < 1e-3:
        n = vorige_n if vorige_n is not None else u.cross(Vector((0, -1, 0)))
    n.normalize()
    m = Matrix((u, n, u.cross(n))).transposed()
    return m, n


def schaal_draai(q, factor, maxhoek):
    q = q.normalized()
    if q.w < 0:
        q = -q
    as_, hoek = q.to_axis_angle()
    hoek = max(-maxhoek, min(maxhoek, hoek * factor))
    return Quaternion(as_, hoek)


def lees_clip(pad):
    for o in list(bpy.data.objects):
        if o.type == "ARMATURE" or o.name.startswith("mixamo") or o.parent and o.parent.type == "ARMATURE":
            bpy.data.objects.remove(o, do_unlink=True)
    voor = set(bpy.data.objects)
    bpy.ops.import_scene.fbx(filepath=pad, automatic_bone_orientation=False)
    arm = next(o for o in bpy.data.objects if o not in voor and o.type == "ARMATURE")
    act = arm.animation_data.action
    f0, f1 = [int(round(v)) for v in act.frame_range]
    return arm, f0, f1


def bot(arm, naam):
    for pre in ("mixamorig:", "mixamorig1:", "mixamorig2:", ""):
        if pre + naam in arm.pose.bones:
            return arm.pose.bones[pre + naam]
    raise KeyError(naam)


def wereld(arm, pb):
    return arm.matrix_world @ pb.matrix


def rust_wereld(arm, pb):
    return arm.matrix_world @ pb.bone.matrix_local


VINGERS = {0: ["Thumb1", "Thumb2", "Thumb3"], 1: ["Index1", "Index2", "Index3"], 2: ["Middle1", "Middle2", "Middle3"], 3: ["Ring1", "Ring2", "Ring3", "Pinky1", "Pinky2", "Pinky3"]}


REF = {}


def bij_rust(d, ref):
    w = max(0.0, min(1.0, (d.dot(ref) - 0.8) / 0.18))
    return w * w * (3 - 2 * w)


def meet_rust(arm, f0, f1):
    """Hoe de armen van de mens hangen als hij rustig staat (gemiddeld over de rust-clip)."""
    scene = bpy.context.scene
    borst = bot(arm, "Spine2")
    rB = rust_wereld(arm, borst).to_quaternion()
    som = {}
    for f in range(f0, f1 + 1, 3):
        scene.frame_set(f)
        C = rB @ wereld(arm, borst).to_quaternion().inverted()
        for mk in ("Left", "Right"):
            s = "Right" if rust_wereld(arm, bot(arm, mk + "Arm")).translation.x > 0 else "Left"
            pa = wereld(arm, bot(arm, mk + "Arm")).translation
            pe = wereld(arm, bot(arm, mk + "ForeArm")).translation
            ph = wereld(arm, bot(arm, mk + "Hand")).translation
            a, b = som.get(s, (Vector(), Vector()))
            som[s] = (a + (C @ (pe - pa)).normalized(), b + (C @ (ph - pe)).normalized())
    spiegel = lambda v: Vector((-v.x, v.y, v.z))
    a = (som["Right"][0].normalized() + spiegel(som["Left"][0].normalized())).normalized()
    b = (som["Right"][1].normalized() + spiegel(som["Left"][1].normalized())).normalized()
    REF["Right"] = (a, b)
    REF["Left"] = (spiegel(a), spiegel(b))
    for s in REF:
        print("rusthouding mens", s, [round(v, 2) for v in REF[s][0]], [round(v, 2) for v in REF[s][1]])


NAAR_OPDRACHT = 0.0


def zet_over(arm, f0, f1):
    scene = bpy.context.scene
    borst = bot(arm, "Spine2")
    hoofd = bot(arm, "Head")
    rB = rust_wereld(arm, borst).to_quaternion()
    rH = rust_wereld(arm, hoofd).to_quaternion()
    # Welke Mixamo-kant hoort bij welke Bliepo-kant: op plek in beeld.
    # Kijkt de figuur naar -y (zoals Bliepo)? Anders draaien we hem om.
    voet = rust_wereld(arm, bot(arm, "LeftToeBase")).translation - rust_wereld(arm, bot(arm, "LeftFoot")).translation
    draai_om = voet.y > 0  # teen ligt op +y: figuur kijkt naar +y
    kanten = {}
    for mk in ("Left", "Right"):
        x = rust_wereld(arm, bot(arm, mk + "Arm")).translation.x * (-1 if draai_om else 1)
        kanten[mk] = "Right" if x > 0 else "Left"
    print("figuur omgedraaid:", draai_om, "kanten:", kanten)
    global PALMTEKEN
    PALMTEKEN = {}
    for mk in ("Left", "Right"):
        hp = rust_wereld(arm, bot(arm, mk + "Hand")).translation
        langs = rust_wereld(arm, bot(arm, mk + "HandMiddle1")).translation - hp
        dwars = rust_wereld(arm, bot(arm, mk + "HandIndex1")).translation - rust_wereld(arm, bot(arm, mk + "HandPinky1")).translation
        n = langs.cross(dwars)
        # In de T-houding van Mixamo wijzen de handpalmen omlaag.
        PALMTEKEN[mk] = -1 if n.z > 0 else 1
    print("palmteken", PALMTEKEN)
    Z180 = Quaternion((0, 0, 1), math.pi)
    sporen = {}
    vorige_n = {}
    duwen = []
    for f in range(f0, f1 + 1):
        scene.frame_set(f)
        qB = wereld(arm, borst).to_quaternion()
        C = rB @ qB.inverted()  # haalt de beweging van zijn lijf eruit
        if draai_om:
            C = Z180 @ C
        rij = {}
        Qf = {}
        for mk, s in kanten.items():
            pa = wereld(arm, bot(arm, mk + "Arm")).translation
            pe = wereld(arm, bot(arm, mk + "ForeArm")).translation
            ph = wereld(arm, bot(arm, mk + "Hand")).translation
            d1 = (C @ (pe - pa)).normalized()
            d2 = (C @ (ph - pe)).normalized()
            # Hangt de arm omlaag, dan Bliepo's eigen houding (armen iets naar buiten);
            # gaat hij omhoog of naar voren, dan de echte richting.
            if NAAR_OPDRACHT and s == "Left":
                # Wijzen: de opdracht staat links van hem (in beeld); de arm draait die kant op.
                draai = Quaternion((0, 0, 1), -NAAR_OPDRACHT)
                d1 = draai @ d1
                d2 = draai @ d2
            w1 = bij_rust(d1, REF[s][0]); w2 = bij_rust(d2, REF[s][1])
            d1 = (REF[s][0].rotation_difference(U0[s]).slerp(Quaternion(), 1 - w1) @ d1).normalized()
            d2 = (REF[s][1].rotation_difference(F0[s]).slerp(Quaternion(), 1 - w2) @ d2).normalized()
            d1, d2, hoeveel = duw(s, d1, d2)
            duwen.append(hoeveel)
            qA = U0[s].rotation_difference(d1)
            qE = F0[s].rotation_difference(qA.inverted() @ d2)
            rij["Arm" + s] = qA
            rij["Elbow" + s] = qE
            Qf[s] = qA @ qE
            # Pols: de handpalm en de vingers wijzen dezelfde kant op als bij de mens.
            mh = bot(arm, mk + "Hand")
            hp = wereld(arm, mh).translation
            midden = wereld(arm, bot(arm, mk + "HandMiddle1")).translation
            wijs = wereld(arm, bot(arm, mk + "HandIndex1")).translation
            pink = wereld(arm, bot(arm, mk + "HandPinky1")).translation
            langs = (C @ (midden - hp)).normalized()
            dwars = (C @ (wijs - pink))
            palm = langs.cross(dwars).normalized() * PALMTEKEN[mk]
            doel = Matrix((langs, palm, langs.cross(palm))).transposed()
            rust_b = Matrix((Vector((0, 0, -1)), Vector((0, -1, 0)), Vector((0, 0, -1)).cross(Vector((0, -1, 0))))).transposed()
            Rw = (doel @ rust_b.inverted()).to_quaternion()
            Dl = Qf[s].inverted() @ Rw
            # Dicht bij de rusthouding: Bliepo's eigen handen (palm naar voren).
            qH = schaal_draai(Dl, 1.0, 1.6).slerp(Quaternion(), min(w1, w2))
            # Vingers niet in zijn hoofd of lijf: dan draait de pols minder ver.
            pols = SCHOUDER[s] + d1 * LB[s] + d2 * LO[s]
            for stap in range(11):
                q = qH.slerp(Quaternion(), stap / 10)
                richting = Qf[s] @ q @ F0[s]
                if not any(botst(pols + richting * (HAND * f), 0.09) for f in (0.4, 0.75, 1.0)):
                    qH = q
                    break
            rij["Hand" + s] = qH
            # Vingers.
            for i, namen in VINGERS.items():
                tot = 0.0
                n = 0
                for nm in namen:
                    try:
                        pb = bot(arm, mk + "Hand" + nm)
                    except KeyError:
                        continue
                    q = pb.matrix_basis.to_quaternion()
                    tot += 2 * math.acos(min(1, abs(q.w)))
                    n += 1
                if n:
                    tot = tot / n * 3
                krom = max(0.0, min(1.0, tot / 2.4))
                # Bliepo's rechterhand (rechts in beeld) heeft zijn "duim" aan de buitenkant als vinger 3.
                j = i if s == "Left" else 3 - i
                rij["Finger" + s + str(j)] = Quaternion((1, 0, 0), -1.2 * krom)
        # Hoofd en nek samen, ten opzichte van de borst, kleiner (hij kijkt toch vooral naar het kind).
        qHn = wereld(arm, hoofd).to_quaternion()
        rel_nu = qB.inverted() @ qHn
        rel_rust = rB.inverted() @ rH
        Dh = rB @ (rel_nu @ rel_rust.inverted()) @ rB.inverted()
        if draai_om:
            Dh = Z180 @ Dh @ Z180.inverted()
        rij["Head"] = Dh.normalized()
        for k, q in rij.items():
            sporen.setdefault(k, []).append(q)
    # Hoofd: de gemiddelde stand eruit (de mens kijkt omhoog/opzij naar iemand),
    # alleen knikken en scheef houden blijven, met grenzen.
    qs = sporen["Head"]
    gem = Vector((0, 0, 0, 0))
    for q in qs:
        v = Vector((q.w, q.x, q.y, q.z))
        gem += v if v.dot(Vector((qs[0].w, qs[0].x, qs[0].y, qs[0].z))) >= 0 else -v
    lengte = sum(c * c for c in gem) ** 0.5
    gem = Quaternion([c / lengte for c in gem])
    nieuw = []
    for q in qs:
        e = (gem.inverted() @ q).to_euler("XYZ")
        x = max(-0.015, min(0.1, e.x * 0.8))   # omlaag (+) tot 6 graden; omhoog bijna niet (dan weerkaatst zijn scherm)
        y = max(-0.14, min(0.14, e.y * 0.8))   # scheef houden
        z = max(-0.05, min(0.05, e.z * 0.3))   # opzij: hij kijkt naar het kind
        from mathutils import Euler
        nieuw.append(Euler((x, y, z), "XYZ").to_quaternion())
    sporen["Head"] = nieuw
    return sporen, duwen


def glad(sporen, breed=2):
    uit = {}
    for k, qs in sporen.items():
        n = len(qs)
        res = []
        for i in range(n):
            som = Vector((0, 0, 0, 0))
            for j in range(max(0, i - breed), min(n, i + breed + 1)):
                q = qs[j]
                v = Vector((q.w, q.x, q.y, q.z))
                if v.dot(Vector((qs[i].w, qs[i].x, qs[i].y, qs[i].z))) < 0:
                    v = -v
                som += v
            # Zelf delen: Vector.normalize() van Blender kijkt bij 4 getallen maar naar 3.
            lengte = sum(c * c for c in som) ** 0.5
            res.append(Quaternion([c / lengte for c in som]))
        uit[k] = res
    return uit


uitkomst = {"fps": FPS, "clips": {}}
meet_rust(*lees_clip(os.path.join(MAP, "bliepo-rust.fbx")))
for naam, bestand in CLIPS.items():
    arm, f0, f1 = lees_clip(os.path.join(MAP, bestand))
    NAAR_OPDRACHT = 0.7 if naam.startswith("wijzen") else 0.0
    sporen, duwen = zet_over(arm, f0, f1)
    sporen = glad(sporen)
    geduwd = sum(1 for d in duwen if d > 0) / max(1, len(duwen))
    print(f"CLIP {naam}: {f1 - f0 + 1} beeldjes, arm geduwd in {geduwd:.0%} van de beeldjes, max duw {max(duwen):.2f}")
    uitkomst["clips"][naam] = {k: [[round(q.x, 5), round(q.y, 5), round(q.z, 5), round(q.w, 5)] for q in v] for k, v in sporen.items()}
with open(UIT, "w") as fh:
    json.dump(uitkomst, fh)
print("KLAAR", UIT)
