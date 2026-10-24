import bpy, sys, json
from mathutils import Quaternion, Vector
a=sys.argv[sys.argv.index("--")+1:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath="/Users/sararifi/Desktop/thuisles/public/assets/zappie/3d/zappie.glb")
DOZEN=[((-0.66,-0.36,0.96),(0.66,0.32,2.62),'lijf'),((-1.0,-0.49,2.45),(1.0,0.6,3.91),'hoofd'),((-1.05,-0.49,0.0),(-0.71,0.49,0.98),'wiel'),((0.71,-0.49,0.0),(1.05,0.49,0.98),'wiel')]
def in_doos(p,r=0.03):
    for lo,hi,n in DOZEN:
        if all(lo[i]-r<p[i]<hi[i]+r for i in range(3)):return n
alle=json.load(open(a[0]))["clips"]
for clip,sp in alle.items():
    n=len(sp["ArmLeft"]);fout={}
    for f in range(n):
        for k,v in sp.items():
            o=bpy.data.objects[k];x,y,z,w=v[f];o.rotation_mode="QUATERNION";o.rotation_quaternion=Quaternion((w,x,y,z))
        bpy.context.view_layer.update()
        for s in ("Left","Right"):
            pts=[("elleboog",bpy.data.objects["Elbow"+s].matrix_world.translation),("pols",bpy.data.objects["Hand"+s].matrix_world.translation)]+[("vinger",bpy.data.objects[f"Finger{s}{i}"].matrix_world.translation) for i in range(4)]
            for nm,p in pts:
                d=in_doos(p)
                if d:
                    fout[f"{s} {nm} in {d}"]=fout.get(f"{s} {nm} in {d}",0)+1
                    if fout[f"{s} {nm} in {d}"]==1: print("VOORBEELD",clip,f,s,nm,[round(c,2) for c in p],"pols",[round(c,2) for c in bpy.data.objects["Hand"+s].matrix_world.translation])
    print("CHECK",clip,n,"beeldjes:", fout or "niets botst")
