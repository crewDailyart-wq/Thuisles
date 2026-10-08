@tool
extends Node2D
## Eén eikel als knooppunt in een scène. De tekening staat in eikel.gd.

@export var maat := 46.0:
	set(waarde):
		maat = waarde
		queue_redraw()


func _draw() -> void:
	var stijl = get_node_or_null("/root/Stijl")
	if stijl and stijl.synthesis:
		# een gloeiende gekleurde stip
		var r := maat * 0.27
		draw_circle(Vector2.ZERO, r * 1.6, Color(stijl.STIP, 0.12))
		draw_circle(Vector2.ZERO, r * 1.3, Color(stijl.STIP, 0.22))
		draw_circle(Vector2.ZERO, r, stijl.STIP)
		draw_circle(Vector2(-r * 0.3, -r * 0.3), r * 0.35, Color(1, 1, 1, 0.45))
	else:
		Eikel.teken(self, Vector2.ZERO, maat)
