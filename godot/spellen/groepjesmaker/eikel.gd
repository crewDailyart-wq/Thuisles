class_name Eikel
## De eikel, op één plek. Wil je later iets anders in de doosjes (bolletjes,
## knikkers), dan hoeft alleen dit bestand anders.
##
## Dezelfde tekening als de eikel bij Plaatjes tellen in Thuisles
## (Telplaatjes.tsx): een nootje met een gestreept hoedje en een steeltje, in
## een vierkant van 100 bij 100.

const NOOT := Color("#e0a45e")
const HOEDJE := Color("#9a6433")
const STEEL := Color("#7a5230")
const LIJN := Color("#3d3226")


static func _bezier(p0: Vector2, p1: Vector2, p2: Vector2, p3: Vector2, stappen: int) -> PackedVector2Array:
	var uit := PackedVector2Array()
	for i in range(stappen + 1):
		var t := float(i) / stappen
		var m := 1.0 - t
		uit.append(p0 * m * m * m + p1 * 3.0 * m * m * t + p2 * 3.0 * m * t * t + p3 * t * t * t)
	return uit


## Tekent één eikel met het midden op `midden`, `maat` breed.
static func teken(ci: CanvasItem, midden: Vector2, maat: float) -> void:
	var k := maat / 100.0
	var o := midden - Vector2(50, 55) * k
	var p := func(x: float, y: float) -> Vector2: return o + Vector2(x, y) * k
	var dik: float = max(1.0, 4.5 * k)

	var noot := _bezier(p.call(26, 46), p.call(26, 68), p.call(36, 84), p.call(50, 84), 8)
	noot.append_array(_bezier(p.call(50, 84), p.call(64, 84), p.call(74, 68), p.call(74, 46), 8))
	ci.draw_colored_polygon(noot, NOOT)
	noot.append(noot[0])
	ci.draw_polyline(noot, LIJN, dik, true)

	var hoed := _bezier(p.call(22, 46), p.call(22, 34), p.call(34, 26), p.call(50, 26), 8)
	hoed.append_array(_bezier(p.call(50, 26), p.call(66, 26), p.call(78, 34), p.call(78, 46), 8))
	ci.draw_colored_polygon(hoed, HOEDJE)
	hoed.append(hoed[0])
	ci.draw_polyline(hoed, LIJN, dik, true)
	for streep in [[34, 30, 30, 44], [50, 27, 50, 44], [66, 30, 70, 44]]:
		ci.draw_line(p.call(streep[0], streep[1]), p.call(streep[2], streep[3]), LIJN, max(1.0, 3.0 * k), true)

	ci.draw_line(p.call(50, 26), p.call(49, 12), STEEL, max(1.5, 5.5 * k), true)
	ci.draw_circle(p.call(38, 58), 6.5 * k, Color(1, 1, 1, 0.35))
