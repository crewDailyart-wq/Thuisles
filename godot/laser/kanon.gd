@tool
extends Node2D
## Het laserkanon onderaan: een eigen tekening. De loop draait naar de steen
## die geraakt wordt; `richt` zet de draaiing.

var richting := -PI / 2.0
var _tijd := 0.0


func richt(doel: Vector2) -> void:
	var naar := (doel - global_position).angle()
	create_tween().tween_property(self, "richting", naar, 0.08)


func _process(delta: float) -> void:
	_tijd += delta
	queue_redraw()


func _draw() -> void:
	# voet
	draw_circle(Vector2(0, 14), 46, Color("#1a2b57"))
	draw_circle(Vector2(0, 14), 40, Color("#263a70"))
	# loop
	var r := Vector2(cos(richting), sin(richting))
	var n := Vector2(-r.y, r.x)
	var loop := PackedVector2Array([n * 11, n * 11 + r * 58, -n * 11 + r * 58, -n * 11])
	draw_colored_polygon(loop, Color("#dfe7ff"))
	draw_line(r * 58 + n * 11, r * 58 - n * 11, Color("#5fd4e8"), 5.0, true)
	# koepel
	draw_circle(Vector2.ZERO, 24, Color("#eef3ff"))
	draw_circle(Vector2(0, -2), 12, Color("#5fd4e8", 0.8 + 0.2 * sin(_tijd * 3.0)))
	draw_circle(Vector2(-4, -6), 3, Color.WHITE)
