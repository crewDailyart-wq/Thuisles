extends Control
## Het begin van alle Godot-spellen van Thuisles (één project, één download).
##
## Welk spel er komt, staat achter het adres: index.html?spel=raket. In de
## Godot-app kies je met "-- --spel=raket" (zonder keuze: de groepjesmaker).
## Elk spel staat in zijn eigen map met een main.tscn; wat alle spellen delen
## (de brug, de stijl, het geluid, de kleuren en het maatje) staat in gedeeld/.

const SPELLEN := ["groepjesmaker", "raket", "laser"]


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
	add_child(scene.instantiate())
	Brug.stuur({"type": "geladen", "spel": spel})
