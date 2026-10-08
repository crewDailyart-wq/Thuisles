@tool
extends Node2D
## Eén eikel als knooppunt in een scène. De tekening staat in eikel.gd.

@export var maat := 46.0:
	set(waarde):
		maat = waarde
		queue_redraw()


func _draw() -> void:
	Eikel.teken(self, Vector2.ZERO, maat)
