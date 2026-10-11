@tool
extends Node2D
## Eén steen met een getal of een minsom. Tik erop: er komt een vizier op (de
## laser heeft hem geraakt). Nog een keer tikken haalt het vizier eraf. Pas na
## Controleer blijkt of hij goed was: dan ontploft hij, of kaatst de straal
## terug.

@export var tekst := "12":
	set(waarde):
		tekst = waarde
		_maak_vorm()
		queue_redraw()
@export var geraakt := false:
	set(waarde):
		geraakt = waarde
		queue_redraw()
## Na Controleer: "goed" (ontploft), "mis" (verkeerd geraakt), "gemist" (goed
## maar niet geraakt), of "" (gewoon).
@export var uitslag := "":
	set(waarde):
		uitslag = waarde
		queue_redraw()

const STRAAL := 40.0
var _vorm := PackedVector2Array()
var _tijd := 0.0
var _basis := Vector2.ZERO
var _fase := 0.0


func _ready() -> void:
	_maak_vorm()
	_basis = position
	_fase = randf() * TAU


func zet_basis(p: Vector2) -> void:
	_basis = p
	position = p


func _maak_vorm() -> void:
	var rng := RandomNumberGenerator.new()
	rng.seed = hash(tekst) + 17
	_vorm = PackedVector2Array()
	for i in range(13):
		var hoek := TAU * i / 13.0
		_vorm.append(Vector2(cos(hoek), sin(hoek)) * STRAAL * rng.randf_range(0.88, 1.05))


func _process(delta: float) -> void:
	if Engine.is_editor_hint():
		return
	_tijd += delta
	if uitslag == "":
		position = _basis + Vector2(sin(_tijd * 0.9 + _fase) * 5.0, cos(_tijd * 1.2 + _fase) * 4.0)
	if uitslag == "gemist":
		queue_redraw()


func raakt(p: Vector2) -> bool:
	return to_local(p).length() <= STRAAL + 10.0


func _draw() -> void:
	var stijl = get_node_or_null("/root/Stijl")
	var gloed: Color = stijl.GLOED if stijl else Color("#5fd4e8")
	if uitslag == "gemist":
		var a := 0.3 + 0.25 * sin(_tijd * 6.0)
		draw_circle(Vector2.ZERO, STRAAL + 16, Color(Kleuren.GROEN, a))
	var schaduw := PackedVector2Array()
	for p in _vorm:
		schaduw.append(p + Vector2(0, 4))
	draw_colored_polygon(schaduw, Color(0, 0, 0, 0.25))
	var kleur := Color("#8d93ad")
	if uitslag == "mis":
		kleur = Color("#b06a86")
	draw_colored_polygon(_vorm, kleur)
	var licht := PackedVector2Array()
	for p in _vorm:
		licht.append(p * 0.82 + Vector2(-3, -4))
	draw_colored_polygon(licht, kleur.lightened(0.18))
	draw_circle(Vector2(-18, 16), 5, kleur.darkened(0.12))
	draw_circle(Vector2(20, -17), 4, kleur.darkened(0.12))
	var font := ThemeDB.fallback_font
	var maat := 30 if tekst.length() <= 2 else 22
	var w := font.get_string_size(tekst, HORIZONTAL_ALIGNMENT_LEFT, -1, maat).x
	draw_string_outline(font, Vector2(-w / 2.0, maat * 0.36), tekst, HORIZONTAL_ALIGNMENT_LEFT, -1, maat, 6, Color("#1a2b57"))
	draw_string(font, Vector2(-w / 2.0, maat * 0.36), tekst, HORIZONTAL_ALIGNMENT_LEFT, -1, maat, Color.WHITE)
	if geraakt and uitslag != "goed":
		# het vizier
		var c := gloed if uitslag != "mis" else Color("#ff8fab")
		draw_arc(Vector2.ZERO, STRAAL + 8, 0, TAU, 40, c, 3.0, true)
		for k in range(4):
			var hoek := PI / 2.0 * k
			var r := Vector2(cos(hoek), sin(hoek))
			draw_line(r * (STRAAL + 2), r * (STRAAL + 16), c, 3.0, true)
