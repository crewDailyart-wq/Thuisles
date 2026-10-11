extends Control
## Het begin van alle Godot-spellen van Thuisles (één project, één download).
##
## Welk spel er komt, staat achter het adres: index.html?spel=raket. In de
## Godot-app kies je met "-- --spel=raket" (zonder keuze: de groepjesmaker).
## Elk spel staat in zijn eigen map met een main.tscn; wat alle spellen delen
## (de brug, de stijl, het geluid, de kleuren en het maatje) staat in gedeeld/.

const SPELLEN := ["groepjesmaker", "raket", "laser", "tegels", "stippen", "bundel"]


func _ready() -> void:
	var spel := ""
	if OS.has_feature("web"):
		var v = JavaScriptBridge.eval("new URLSearchParams(window.location.search).get('spel') || ''")
		spel = str(v) if v != null else ""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--spel="):
			spel = arg.substr(7)
	if spel not in SPELLEN:
		spel = SPELLEN[0]
	var scene: PackedScene = load("res://%s/main.tscn" % spel)
	var spelnode: Node = scene.instantiate()
	add_child(spelnode)
	# Spellen die nog op 600 bij 500 getekend zijn, komen in het midden van het
	# brede speelvlak (960 bij 540).
	if spelnode is Control and (spelnode as Control).custom_minimum_size == Vector2(600, 500):
		(spelnode as Control).position = Vector2(180, 20)
	# Eén maatje, rechts naast het spel in Thuisles; niet ook nog in het spel.
	var maatje := spelnode.get_node_or_null("Maatje")
	if maatje:
		maatje.visible = false
	Brug.stuur({"type": "geladen", "spel": spel})
