@tool
extends Node3D
## Eén kartonnen doosje, open aan de voorkant, zodat je de eikels ziet liggen.
## Het midden van de onderkant is (0, 0, 0): zo staat het precies op de plank.
## Hoogstens 10 eikels: 2 naast elkaar en 5 hoog, van onder naar boven gevuld.

const EIKEL := preload("res://eikel.tscn")
const CEL_X := 0.34
const CEL_Y := 0.32
## Hoe groot een eikel in het doosje is.
const GROOTTE := 1.25

## Hoeveel eikels erin horen (hiermee kijkt de groepjesmaker de bouw na).
@export_range(0, 10) var inhoud := 3:
	set(waarde):
		inhoud = waarde
		if Engine.is_editor_hint() and is_inside_tree():
			toon_meteen()


func _ready() -> void:
	if Engine.is_editor_hint():
		toon_meteen()


func plek(i: int) -> Vector3:
	return Vector3((i % 2 - 0.5) * CEL_X, 0.21 + CEL_Y * (i / 2), 0.04)


## Alle eikels er meteen in, zonder animatie.
func toon_meteen() -> void:
	for e in $Eikels.get_children():
		e.queue_free()
	for i in range(inhoud):
		var e := EIKEL.instantiate()
		e.position = plek(i)
		e.rotation.y = randf_range(-0.6, 0.6)
		e.scale = Vector3.ONE * GROOTTE
		$Eikels.add_child(e)


## De eikels vallen er één voor één in, met een plopje.
func vul(geluid: Node, wacht := 0.07) -> void:
	for i in range(inhoud):
		var e := EIKEL.instantiate()
		e.position = plek(i) + Vector3(0, 1.0, 0)
		e.rotation.y = randf_range(-0.6, 0.6)
		e.scale = Vector3.ONE * GROOTTE
		$Eikels.add_child(e)
		var t := e.create_tween()
		t.tween_property(e, "position", plek(i), 0.28).set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)
		if geluid:
			geluid.plop(i)
		await get_tree().create_timer(wacht).timeout


## Een huppeltje, en het telgetal ervoor (3, 6, 9 …).
func tel(getal: int) -> void:
	var tg: Label3D = $Telgetal
	tg.text = str(getal)
	tg.visible = true
	tg.scale = Vector3.ONE * 0.1
	var y := position.y
	var t := create_tween()
	t.tween_property(self, "position:y", y + 0.35, 0.14).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	t.parallel().tween_property(tg, "scale", Vector3.ONE, 0.25).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	t.tween_property(self, "position:y", y, 0.25).set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)
