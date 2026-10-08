@tool
extends Node2D
## Het tijdelijke maatje: een rond bolletje in Thuisles-mint, met twee ogen en
## een mond. Geen vos en nog geen naam. Komt er een echte mascotte, dan
## vervang je alleen deze scène (maatje.tscn); de rest blijft hetzelfde.
##
## Het zit bovenop de kast. Kan: knipperen (vanzelf), lachen, nadenken, wijzen
## naar de kast, wiebelen en huppelen.

const KLEUR := Color("#0f9c8c")
const ZACHT := Color("#dcf3ef")
const INKT := Color("#2c2545")

@export_enum("rustig", "blij", "denkt", "wijst") var houding := "rustig":
	set(waarde):
		houding = waarde
		queue_redraw()
@export var maat := 30.0:
	set(waarde):
		maat = waarde
		queue_redraw()

var _knipper := 0.0
var _tot_knipper := 2.5
var _beurt := 0


func _process(delta: float) -> void:
	_tot_knipper -= delta
	if _tot_knipper <= 0.0:
		_knipper = 0.14
		_tot_knipper = randf_range(2.5, 4.5)
	if _knipper > 0.0:
		_knipper -= delta
		if _knipper <= 0.0:
			_knipper = 0.0
		queue_redraw()


func rustig() -> void:
	_beurt += 1
	houding = "rustig"
	rotation = 0.0


func lach() -> void:
	rustig()
	houding = "blij"
	huppel()
	_terug(2.2)


func denk() -> void:
	rustig()
	houding = "denkt"


func wijs() -> void:
	rustig()
	houding = "wijst"
	var t := create_tween().set_loops(3)
	t.tween_property(self, "rotation", -0.12, 0.18)
	t.tween_property(self, "rotation", 0.0, 0.18)
	_terug(2.5)


func huppel() -> void:
	var y := position.y
	var t := create_tween()
	t.tween_property(self, "position:y", y - 22.0, 0.16).set_trans(Tween.TRANS_QUAD).set_ease(Tween.EASE_OUT)
	t.tween_property(self, "position:y", y, 0.3).set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)


func _terug(na: float) -> void:
	var mijn := _beurt
	await get_tree().create_timer(na).timeout
	if mijn == _beurt:
		rustig()


func _draw() -> void:
	var r := maat
	if houding == "wijst":
		# een armpje dat naar beneden de kast in wijst
		draw_line(Vector2(-r * 0.75, r * 0.2), Vector2(-r * 1.35, r * 0.85), KLEUR, r * 0.26, true)
		draw_circle(Vector2(-r * 1.4, r * 0.9), r * 0.17, KLEUR)
	draw_circle(Vector2(0, r * 0.08), r, Color(0.24, 0.2, 0.15, 0.18))
	draw_circle(Vector2.ZERO, r, KLEUR)
	draw_circle(Vector2(-r * 0.35, -r * 0.45), r * 0.25, Color(1, 1, 1, 0.25))
	draw_circle(Vector2(-r * 0.55, r * 0.3), r * 0.16, Color(ZACHT, 0.55))
	draw_circle(Vector2(r * 0.55, r * 0.3), r * 0.16, Color(ZACHT, 0.55))
	var oog_y := -r * 0.12 - (r * 0.12 if houding == "denkt" else 0.0)
	if houding == "blij":
		for kant in [-1, 1]:
			draw_arc(Vector2(kant * r * 0.33, -r * 0.08), r * 0.15, PI * 1.1, PI * 1.9, 8, INKT, r * 0.1, true)
	elif _knipper > 0.0:
		for kant in [-1, 1]:
			draw_line(Vector2(kant * r * 0.33 - r * 0.13, oog_y), Vector2(kant * r * 0.33 + r * 0.13, oog_y), INKT, r * 0.08, true)
	else:
		for kant in [-1, 1]:
			draw_circle(Vector2(kant * r * 0.33, oog_y), r * 0.14, INKT)
			draw_circle(Vector2(kant * r * 0.33 + r * 0.05, oog_y - r * 0.05), r * 0.045, Color.WHITE)
	match houding:
		"blij":
			var mond := PackedVector2Array()
			for i in range(9):
				var a := PI * i / 8.0
				mond.append(Vector2(cos(a) * r * 0.36, r * 0.2 + sin(a) * r * 0.36))
			draw_colored_polygon(mond, INKT)
		"denkt":
			draw_line(Vector2(-r * 0.18, r * 0.42), Vector2(r * 0.2, r * 0.36), INKT, r * 0.09, true)
			for i in range(3):
				draw_circle(Vector2(r * (0.9 + i * 0.28), -r * (0.9 + i * 0.25)), r * (0.07 + i * 0.025), Color("#6e6685"))
		_:
			draw_arc(Vector2(0, r * 0.18), r * 0.26, PI * 0.2, PI * 0.8, 10, INKT, r * 0.09, true)
