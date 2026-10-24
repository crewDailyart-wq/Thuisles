import bpy, sys, json, os, math
from mathutils import Quaternion, Vector
a=sys.argv[sys.argv.index("--")+1:];DATA,UIT=a[0],a[1];CLIPS=a[2:]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath="/Users/sararifi/Desktop/thuisles/public/assets/zappie/3d/zappie.glb")
sc=bpy.context.scene;sc.render.engine="BLENDER_WORKBENCH";sc.display.shading.light="STUDIO";sc.display.shading.color_type="MATERIAL"
sc.render.resolution_x=420;sc.render.resolution_y=380
cd=bpy.data.cameras.new("c");cd.lens=60;cam=bpy.data.objects.new("c",cd);sc.collection.objects.link(cam);sc.camera=cam
alle=json.load(open(DATA))["clips"]
def hoek(q): return 2*math.acos(min(1,abs(q[3])))
for CLIP in CLIPS or list(alle):
  sp=alle[CLIP];n=len(sp["ArmLeft"])
  i=max(range(n),key=lambda f:sum(hoek(sp[k][f])-hoek(sp[k][0]) for k in ("ArmLeft","ArmRight","ElbowLeft","ElbowRight")));FR=i/n
  for k,v in sp.items():
    o=bpy.data.objects[k];x,y,z,w=v[min(i,len(v)-1)];o.rotation_mode="QUATERNION";o.rotation_quaternion=Quaternion((w,x,y,z))
  for nm,h in (("voor",0),("schuin",-0.7),("zij",-1.5)):
    cam.location=Vector((math.sin(h)*6,-math.cos(h)*6,2.2));cam.rotation_euler=(Vector((0,0,1.9))-cam.location).to_track_quat("-Z","Y").to_euler()
    sc.render.filepath=os.path.join(UIT,f"{CLIP}-piek-{nm}.png");bpy.ops.render.render(write_still=True)
  for k in sp: bpy.data.objects[k].rotation_quaternion=Quaternion()
