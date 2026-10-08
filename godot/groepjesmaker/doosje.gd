@tool
extends Node2D
## Eén doosje met eikels. Het midden van de onderkant is (0, 0): zo staat het
## precies op de plank. Hoogstens 10 eikels: 2 naast elkaar en 5 hoog, van onder
## naar boven gevuld.

const EIKEL := preload("res://eikel.tscn")
const CEL := 32.0
const BREED := 74.0
const HOOG := 172.0

## Hoeveel eikels erin horen (hiermee kijkt de groepjesmaker de bouw na).
@export_range(0, 10) var inhoud := 3:
	set(waarde):
		inhoud = waarde
		if Engine.is_editor_hint() and is_inside_tree():
			toon_meteen()


func _ready() -> void:
	if Engine.is_editor_hint():
		toon_meteen()


func plek(i: int) -> Vector2:
	return Vector2((i % 2 - 0.5) * CEL, -8.0 - CEL * (i / 2 + 0.5))


func toon_meteen() -> void:
	for e in $Eikels.get_children():
		e.queue_free()
	for i in range(inhoud):
		var e := EIKEL.instantiate()
		e.position = plek(i)
		$Eikels.add_child(e)


## De eikels vallen er één voor één in, met een plopje.
func vul(geluid: Node, wacht := 0.07) -> void:
	for i in range(inhoud):
		var e := EIKEL.instantiate()
		e.position = plek(i) - Vector2(0, 60)
		e.scale = Vector2(0.4, 0.4)
		$Eikels.add_child(e)
		var t := e.create_tween().set_parallel()
		t.tween_property(e, "position", plek(i), 0.28).set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)
		t.tween_property(e, "scale", Vector2.ONE, 0.18).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
		if geluid:
			geluid.plop(i)
		await get_tree().create_timer(wacht).timeout


## Een huppeltje, en het telgetal groot ervoor (3, 6, 9 …).
func tel(getal: int) -> void:
	var r: Control = $Telrondje
	r.get_node("Getal").text = str(getal)
	r.visible = true
	r.scale = Vector2(0.2, 0.2)
	var y := position.y
	var t := create_tween()
	t.tween_property(self, "position:y", y - 24.0, 0.14).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	t.parallel().tween_property(r, "scale", Vector2.ONE, 0.25).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	t.tween_property(self, "position:y", y, 0.25).set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)
