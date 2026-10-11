class_name Teken
## Tekenhulpjes die alle Godot-spellen delen: het zachte raster, tekst in het
## midden van een plek, gloeiende vakjes en stippen, en de knoppen. Zo zien
## alle spellen er hetzelfde uit (ONTWERPREGELS.md, "Godot-bouwstenen").

const NACHT := Color("#0f1b3d")
const NACHT_OP := Color("#1a2b57")
const GLOED := Color("#5fd4e8")
const WIT := Color("#f4f7ff")
const ZACHT := Color("#9fb3d9")
const KNOP := Color("#22b8a5")
const KNOP_DIEP := Color("#178a7c")
const GOED := Color("#3ddc97")
const MIS := Color("#ff8fab")
const GEEL := Color("#f6c945")

## Een eigen kleur per getal 1 tot en met 10, in de volgorde van de regenboog
## (rood, oranje, geel, limoen, groen, lichtblauw, blauw, paars, magenta, roze).
const GETALKLEUR := [
	Color("#9fb3d9"),
	Color("#ff5c5c"), Color("#ff9a3c"), Color("#f4d03f"), Color("#b5e655"), Color("#2ecc71"),
	Color("#5dade2"), Color("#3a7bd5"), Color("#a066d3"), Color("#e056c8"), Color("#ff9fd6"),
]


static func getalkleur(n: int) -> Color:
	return GETALKLEUR[clampi(n, 0, 10)]


static func raster(ci: CanvasItem, breed := 600.0, hoog := 500.0) -> void:
	var lijn := Color(1, 1, 1, 0.035)
	var x := 0.0
	while x <= breed:
		ci.draw_line(Vector2(x, 0), Vector2(x, hoog), lijn, 1.0)
		x += 28.0
	var y := 0.0
	while y <= hoog:
		ci.draw_line(Vector2(0, y), Vector2(breed, y), lijn, 1.0)
		y += 28.0


static func tekst(ci: CanvasItem, midden: Vector2, s: String, maat := 28, kleur := WIT) -> void:
	var font := ThemeDB.fallback_font
	var grootte := font.get_string_size(s, HORIZONTAL_ALIGNMENT_LEFT, -1, maat)
	ci.draw_string(font, midden + Vector2(-grootte.x / 2.0, grootte.y * 0.32), s, HORIZONTAL_ALIGNMENT_LEFT, -1, maat, kleur)


static func vak(ci: CanvasItem, r: Rect2, kleur := GLOED, vul := Color(1, 1, 1, 0.03), dik := 2.5, straal := 10.0) -> void:
	var sb := StyleBoxFlat.new()
	sb.bg_color = vul
	sb.border_color = kleur
	sb.set_border_width_all(int(dik))
	sb.set_corner_radius_all(int(straal))
	sb.shadow_color = Color(kleur, 0.18)
	sb.shadow_size = 6
	ci.draw_style_box(sb, r)


static func stip(ci: CanvasItem, p: Vector2, r: float, kleur: Color) -> void:
	ci.draw_circle(p, r * 1.5, Color(kleur, 0.16))
	ci.draw_circle(p, r, kleur)
	ci.draw_circle(p + Vector2(-r * 0.3, -r * 0.35), r * 0.32, Color(1, 1, 1, 0.45))


## Een knop in de spelstijl; groen-blauw met een gloed.
static func knop(tekst_: String, maat := 26) -> Button:
	var b := Button.new()
	b.text = tekst_
	b.focus_mode = Control.FOCUS_NONE
	b.add_theme_font_size_override("font_size", maat)
	for naam in ["font_color", "font_hover_color", "font_pressed_color", "font_focus_color"]:
		b.add_theme_color_override(naam, Color.WHITE)
	b.add_theme_color_override("font_disabled_color", Color(1, 1, 1, 0.6))
	var gewoon := StyleBoxFlat.new()
	gewoon.bg_color = KNOP
	gewoon.set_corner_radius_all(20)
	gewoon.shadow_color = Color(KNOP, 0.45)
	gewoon.shadow_size = 10
	var in_ := gewoon.duplicate()
	in_.bg_color = KNOP_DIEP
	in_.shadow_size = 4
	var uit := gewoon.duplicate()
	uit.bg_color = Color(KNOP, 0.3)
	uit.shadow_size = 0
	b.add_theme_stylebox_override("normal", gewoon)
	b.add_theme_stylebox_override("hover", gewoon)
	b.add_theme_stylebox_override("focus", gewoon)
	b.add_theme_stylebox_override("pressed", in_)
	b.add_theme_stylebox_override("disabled", uit)
	return b
