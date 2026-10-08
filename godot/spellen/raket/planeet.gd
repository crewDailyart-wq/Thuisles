@tool
extends Node2D
## De planeet met het doelgetal. Tik erop als je twee stenen hebt gekozen: dan
## vliegt de raket (dat is hetzelfde als Controleer).

@export var doel := 9:
	set(waarde):
		doel = waarde
		queue_redraw()
@export var gloed := 0.0:
	set(waarde):
		gloed = waarde
		queue_redraw()

const STRAAL := 48.0


func raakt(p: Vector2) -> bool:
	return to_local(p).length() <= STRAAL + 14.0


func _draw() -> void:
	if gloed > 0.0:
		draw_circle(Vector2.ZERO, STRAAL + 26 * gloed, Color(Kleuren.GROEN, 0.3 * gloed))
	draw_circle(Vector2.ZERO, STRAAL + 8, Color("#f6c945", 0.12))
	# ring achter
	draw_arc(Vector2.ZERO, STRAAL + 18, PI * 1.05, PI * 1.95, 30, Color("#f6c945"), 6.0, true)
	draw_circle(Vector2.ZERO, STRAAL, Color("#ff9f43"))
	draw_circle(Vector2(-12, -14), STRAAL * 0.55, Color("#ffb86b"))
	draw_circle(Vector2(18, 20), 8, Color("#e98a2e"))
	draw_circle(Vector2(-22, 18), 5, Color("#e98a2e"))
	# ring voor
	draw_arc(Vector2.ZERO, STRAAL + 18, PI * 0.05, PI * 0.95, 30, Color("#f6c945"), 6.0, true)
	var font := ThemeDB.fallback_font
	var tekst := str(doel)
	var w := font.get_string_size(tekst, HORIZONTAL_ALIGNMENT_LEFT, -1, 46).x
	draw_string_outline(font, Vector2(-w / 2.0, 16), tekst, HORIZONTAL_ALIGNMENT_LEFT, -1, 46, 8, Color("#7a3a0a"))
	draw_string(font, Vector2(-w / 2.0, 16), tekst, HORIZONTAL_ALIGNMENT_LEFT, -1, 46, Color.WHITE)
