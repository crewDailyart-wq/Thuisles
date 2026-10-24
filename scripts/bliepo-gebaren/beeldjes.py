"""Render per clip een paar beeldjes van Bliepo (voor en schuin) om te controleren.
Gebruik: Blender -b --python beeldjes.py -- <gebaren.json> <uitmap> [clip ...]"""
import bpy, sys, json, os, math
from mathutils import Quaternion, Vector

argv = sys.argv[sys.argv.index("--") + 1:]
DATA, UIT = argv[0], argv[1]
ALLEEN = argv[2:]
os.makedirs(UIT, exist_ok=True)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath="/Users/sararifi/Desktop/thuisles/public/assets/zappie/3d/zappie.glb")
sc = bpy.context.scene
sc.render.engine = "BLENDER_WORKBENCH"
sc.display.shading.light = "STUDIO"
sc.display.shading.color_type = "MATERIAL"
sc.display.shading.show_shadows = False
sc.render.resolution_x = 240
sc.render.resolution_y = 280
sc.render.film_transparent = False
sc.display.render_aa = "OFF"
sc.world = bpy.data.worlds.new("w") if not sc.world else sc.world
cam_data = bpy.data.cameras.new("cam")
cam_data.lens = 45
cam = bpy.data.objects.new("cam", cam_data)
sc.collection.objects.link(cam)
sc.camera = cam


def richt(hoek):
    afstand = 7.2
    cam.location = Vector((math.sin(hoek) * afstand, -math.cos(hoek) * afstand, 2.3))
    richting = Vector((0, 0, 2.0)) - cam.location
    cam.rotation_euler = richting.to_track_quat("-Z", "Y").to_euler()


data = json.load(open(DATA))
if "--rust" in ALLEEN:
    for zijde, hoek in (("voor", 0.0), ("schuin", -0.9)):
        richt(hoek); sc.render.filepath = os.path.join(UIT, f"rust-{zijde}.png"); bpy.ops.render.render(write_still=True)
    ALLEEN.remove("--rust")
for naam, sporen in data["clips"].items():
    if ALLEEN and naam not in ALLEEN:
        continue
    n = len(next(iter(sporen.values())))
    for i in [int(n * f) for f in (0.15, 0.35, 0.55, 0.75, 0.92)]:
        for k, v in sporen.items():
            o = bpy.data.objects[k]
            x, y, z, w = v[min(i, len(v) - 1)]
            o.rotation_mode = "QUATERNION"
            o.rotation_quaternion = Quaternion((w, x, y, z))
        for zijde, hoek in (("voor", 0.0), ("schuin", -0.9)):
            richt(hoek)
            sc.render.filepath = os.path.join(UIT, f"{naam}-{i:03d}-{zijde}.png")
            bpy.ops.render.render(write_still=True)
    for k in sporen:
        bpy.data.objects[k].rotation_quaternion = Quaternion()
print("KLAAR")
