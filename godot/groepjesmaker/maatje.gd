@tool
extends Node3D
## Het tijdelijke maatje: een rond bolletje in Thuisles-mint, met twee ogen en
## een mond. Geen vos en nog geen naam. Komt er een echte mascotte, dan
## vervang je alleen deze scène (maatje.tscn); de rest blijft hetzelfde.
##
## Het zit bovenop de kast. Kan: knipperen (vanzelf), lachen, nadenken,
## wijzen naar de kast, wiebelen en huppelen.

@onready var lijf: Node3D = $Lijf
@onready var mond: Node3D = $Lijf/Mond
@onready var arm: Node3D = $Lijf/Arm

var _tot_knipper := 2.0
var _beurt := 0


func _process(delta: float) -> void:
	_tot_knipper -= delta
	if _tot_knipper <= 0.0:
		_tot_knipper = randf_range(2.5, 4.5)
		for oog in [$Lijf/OogLinks, $Lijf/OogRechts]:
			var t := create_tween()
			t.tween_property(oog, "scale:y", 0.1, 0.06)
			t.tween_property(oog, "scale:y", 1.0, 0.08)
	# rustig ademen
	if not Engine.is_editor_hint():
		lijf.scale = Vector3(1.0, 1.0 + 0.02 * sin(Time.get_ticks_msec() / 400.0), 1.0)


func rustig() -> void:
	_beurt += 1
	arm.visible = false
	create_tween().tween_property(mond, "scale", Vector3.ONE, 0.2)
	create_tween().tween_property(lijf, "rotation", Vector3.ZERO, 0.2)


func lach() -> void:
	rustig()
	var t := create_tween()
	t.tween_property(mond, "scale", Vector3(2.2, 1.6, 1.0), 0.15).set_trans(Tween.TRANS_BACK)
	huppel()
	_terug(2.2)


func denk() -> void:
	rustig()
	create_tween().tween_property(lijf, "rotation", Vector3(-0.25, 0.25, 0.0), 0.3)
	create_tween().tween_property(mond, "scale", Vector3(0.6, 1.0, 1.0), 0.2)


func wijs() -> void:
	rustig()
	arm.visible = true
	var t := create_tween().set_loops(3)
	t.tween_property(lijf, "rotation:z", -0.15, 0.18)
	t.tween_property(lijf, "rotation:z", 0.0, 0.18)
	_terug(2.5)


func wiebel() -> void:
	var t := create_tween().set_loops(2)
	t.tween_property(lijf, "rotation:z", -0.12, 0.1)
	t.tween_property(lijf, "rotation:z", 0.12, 0.1)
	t.chain().tween_property(lijf, "rotation:z", 0.0, 0.1)


func huppel() -> void:
	var t := create_tween()
	t.tween_property(lijf, "position:y", 0.85, 0.16).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	t.tween_property(lijf, "position:y", 0.45, 0.32).set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)


func _terug(na: float) -> void:
	var mijn := _beurt
	await get_tree().create_timer(na).timeout
	if mijn == _beurt:
		rustig()
