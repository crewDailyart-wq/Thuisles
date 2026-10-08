@tool
extends Node2D
## De kast: twee planken met elk 5 plekken, hoogstens 10 doosjes. Eerst vult de
## bovenste plank, dan de onderste. De doosjes hangen onder "Doosjes".

const BREED := 430.0
const HOOG := 420.0
const RAND := 12.0
const PLANK := 14.0
const PER_PLANK := 5

## De plek van het volgende doosje: een stippel-doosje met een plus.
@export var volgende := 0:
	set(waarde):
		volgende = waarde
		queue_redraw()
@export var toon_volgende := true:
	set(waarde):
		toon_volgende = waarde
		queue_redraw()
## Geknipt na 5 doosjes: elke plank een eigen kleur, met een knip ertussen.
@export var geknipt := false:
	set(waarde):
		geknipt = waarde
		queue_redraw()

var _tijd := 0.0


func _process(delta: float) -> void:
	_tijd += delta
	if toon_volgende:
		queue_redraw()


func plank_y(rij: int) -> float:
	var verdieping := (HOOG - RAND - PLANK * 2) / 2.0
	return RAND + verdieping * (rij + 1) + PLANK * rij


## Waar doosje i staat: het midden van zijn onderkant.
func plek(i: int) -> Vector2:
	var vak := (BREED - RAND * 2) / PER_PLANK
	return Vector2(RAND + vak * (i % PER_PLANK + 0.5), plank_y(i / PER_PLANK))


func _rond(r: Rect2, kleur: Color, straal: int, schaduw := 0) -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color = kleur
	sb.set_corner_radius_all(straal)
	if schaduw > 0:
		sb.shadow_color = Color(0.24, 0.2, 0.15, 0.18)
		sb.shadow_size = schaduw
		sb.shadow_offset = Vector2(0, schaduw / 2.0)
	draw_style_box(sb, r)


func _draw() -> void:
	# de kast: houten rand met een zachte schaduw, licht hout van achteren
	_rond(Rect2(0, 0, BREED, HOOG), Kleuren.HOUT_DIEP, 16, 14)
	var binnen := Rect2(RAND, RAND, BREED - RAND * 2, HOOG - RAND * 2)
	draw_polygon(
		PackedVector2Array([binnen.position, Vector2(binnen.end.x, binnen.position.y), binnen.end, Vector2(binnen.position.x, binnen.end.y)]),
		PackedColorArray([Color("#fbf1df"), Color("#fbf1df"), Color("#f1dfc2"), Color("#f1dfc2")]))
	for rij in range(2):
		var kleur := Kleuren.HOUT
		if geknipt:
			kleur = Kleuren.LUCHT if rij == 0 else Kleuren.ROZE
		var y := plank_y(rij)
		draw_rect(Rect2(RAND, y, BREED - RAND * 2, PLANK), kleur)
		draw_rect(Rect2(RAND, y, BREED - RAND * 2, 3), Color(1, 1, 1, 0.25))
		draw_rect(Rect2(RAND, y + PLANK - 3, BREED - RAND * 2, 3), Color(0, 0, 0, 0.15))
	if geknipt:
		var y := plank_y(0) + PLANK + 4
		var x := RAND
		while x < BREED - RAND:
			draw_line(Vector2(x, y), Vector2(min(x + 12, BREED - RAND), y), Kleuren.INKT, 4.0)
			x += 22
	if toon_volgende and volgende < PER_PLANK * 2:
		var p := plek(volgende)
		var r := Rect2(p.x - 37, p.y - 172, 74, 172)
		var a := 0.45 + 0.2 * sin(_tijd * 3.0)
		_stippelrand(r, Color(Kleuren.KNOP, a))
		var font := ThemeDB.fallback_font
		draw_string(font, Vector2(r.position.x, r.get_center().y + 18), "+", HORIZONTAL_ALIGNMENT_CENTER, r.size.x, 52, Color(Kleuren.KNOP, a + 0.15))


func _stippelrand(r: Rect2, kleur: Color) -> void:
	var hoeken := [r.position, Vector2(r.end.x, r.position.y), r.end, Vector2(r.position.x, r.end.y), r.position]
	for i in range(4):
		var van: Vector2 = hoeken[i]
		var naar: Vector2 = hoeken[i + 1]
		var lengte := van.distance_to(naar)
		var t := 0.0
		while t < lengte:
			draw_line(van.lerp(naar, t / lengte), van.lerp(naar, min(t + 9.0, lengte) / lengte), kleur, 3.0)
			t += 16.0
