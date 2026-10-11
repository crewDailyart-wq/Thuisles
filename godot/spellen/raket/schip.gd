@tool
extends Node2D
## Het raketje: een eigen tekening (geen plaatje van ergens anders). Neus naar
## rechts. Het vlammetje flakkert zachtjes.

var _tijd := 0.0
@export var vlam := 1.0


func _process(delta: float) -> void:
	_tijd += delta
	queue_redraw()


func _draw() -> void:
	# vlammetje
	var f := 0.8 + 0.2 * sin(_tijd * 22.0)
	var vlammen := PackedVector2Array([Vector2(-30, -8), Vector2(-30 - 26 * f * vlam, 0), Vector2(-30, 8)])
	draw_colored_polygon(vlammen, Color("#f6c945"))
	draw_colored_polygon(PackedVector2Array([Vector2(-30, -4), Vector2(-30 - 14 * f * vlam, 0), Vector2(-30, 4)]), Color("#ff8a3d"))
	# vinnen
	draw_colored_polygon(PackedVector2Array([Vector2(-22, -10), Vector2(-34, -24), Vector2(-8, -12)]), Color("#e4607f"))
	draw_colored_polygon(PackedVector2Array([Vector2(-22, 10), Vector2(-34, 24), Vector2(-8, 12)]), Color("#e4607f"))
	# romp
	var romp := PackedVector2Array()
	for i in range(21):
		var t := float(i) / 20.0
		var hoek := -PI / 2 + PI * t
		romp.append(Vector2(14 + cos(hoek) * 26, sin(hoek) * 14))
	romp.append(Vector2(-28, 12))
	romp.append(Vector2(-28, -12))
	draw_colored_polygon(romp, Color("#eef3ff"))
	draw_line(Vector2(-28, 12), Vector2(14, 14), Color("#c9d3ee"), 3.0)
	# raampje
	draw_circle(Vector2(8, 0), 7, Color("#1a2b57"))
	draw_circle(Vector2(8, 0), 5, Color("#5fd4e8"))
	draw_circle(Vector2(6, -2), 1.8, Color.WHITE)
