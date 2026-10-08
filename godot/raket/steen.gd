@tool
extends Node2D
## Eén steen met een getal. Tik erop om hem te kiezen; nog een keer tikken
## laat hem weer los. Een gekozen steen krijgt een gloeiende ring.

signal getikt(steen: Node2D)

@export var getal := 4:
	set(waarde):
		getal = waarde
		_maak_vorm()
		queue_redraw()
@export var gekozen := false:
	set(waarde):
		gekozen = waarde
		queue_redraw()
## Al gekozen door de opgave zelf (bij "wat moet erbij?"): niet los te laten.
@export var vast := false:
	set(waarde):
		vast = waarde
		queue_redraw()
## Na een fout: de goede stenen lichten groen op.
@export var goed_oplichten := false:
	set(waarde):
		goed_oplichten = waarde
		queue_redraw()

const STRAAL := 34.0
var _vorm := PackedVector2Array()
var _tijd := 0.0
var _basis_y := 0.0
var _fase := 0.0


func _ready() -> void:
	_maak_vorm()
	_basis_y = position.y
	_fase = randf() * TAU


func _maak_vorm() -> void:
	# een onregelmatige, ronde steen; per getal steeds dezelfde vorm
	var rng := RandomNumberGenerator.new()
	rng.seed = getal * 7919 + 13
	_vorm = PackedVector2Array()
	for i in range(12):
		var hoek := TAU * i / 12.0
		var r := STRAAL * rng.randf_range(0.86, 1.06)
		_vorm.append(Vector2(cos(hoek), sin(hoek)) * r)


func _process(delta: float) -> void:
	if Engine.is_editor_hint():
		return
	# zachtjes zweven, zonder haast
	_tijd += delta
	position.y = _basis_y + sin(_tijd * 1.3 + _fase) * 4.0


func zet_basis(y: float) -> void:
	_basis_y = y
	position.y = y


func raakt(p: Vector2) -> bool:
	return to_local(p).length() <= STRAAL + 10.0


func _draw() -> void:
	var stijl = get_node_or_null("/root/Stijl")
	var gloed: Color = stijl.GLOED if stijl else Color("#5fd4e8")
	if goed_oplichten:
		draw_circle(Vector2.ZERO, STRAAL + 14, Color(Kleuren.GROEN, 0.35))
	elif gekozen or vast:
		draw_circle(Vector2.ZERO, STRAAL + 14, Color(gloed, 0.22))
		draw_arc(Vector2.ZERO, STRAAL + 9, 0, TAU, 40, gloed, 3.0, true)
	var schaduw := PackedVector2Array()
	for p in _vorm:
		schaduw.append(p + Vector2(0, 4))
	draw_colored_polygon(schaduw, Color(0, 0, 0, 0.25))
	draw_colored_polygon(_vorm, Color("#8d93ad"))
	var licht := PackedVector2Array()
	for p in _vorm:
		licht.append(p * 0.82 + Vector2(-3, -4))
	draw_colored_polygon(licht, Color("#a9aec6"))
	# kraters
	draw_circle(Vector2(-14, 12), 5, Color("#7c8299"))
	draw_circle(Vector2(15, -13), 4, Color("#7c8299"))
	var font := ThemeDB.fallback_font
	var tekst := str(getal)
	var maat := 30
	var w := font.get_string_size(tekst, HORIZONTAL_ALIGNMENT_LEFT, -1, maat).x
	draw_string_outline(font, Vector2(-w / 2.0, 11), tekst, HORIZONTAL_ALIGNMENT_LEFT, -1, maat, 6, Color("#1a2b57"))
	draw_string(font, Vector2(-w / 2.0, 11), tekst, HORIZONTAL_ALIGNMENT_LEFT, -1, maat, Color.WHITE)
