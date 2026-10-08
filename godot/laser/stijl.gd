extends Node
## Welke stijl de laser heeft (keuze van de eigenaar, oktober 2026):
##   synthesis  zoals Synthesis aanvoelt: effen donkerblauw, gloeiende vakjes en
##              gekleurde stippen (standaard). Geen plaatjes of teksten van
##              Synthesis zelf; zie ONTWERPREGELS.md, "Godot-bouwstenen".
##   thuisles   licht en warm, houten kast, eikels.
## Kiezen: ?stijl=thuisles achter het adres, of in de Godot-app met
## "-- --stijl=thuisles".

var synthesis := true

const NACHT := Color("#0f1b3d")
const NACHT_OP := Color("#1a2b57")
const RASTER := Color(1, 1, 1, 0.045)
const GLOED := Color("#5fd4e8")
const STIP := Color("#f6c945")
const WIT := Color("#f4f7ff")
const ZACHT := Color("#9fb3d9")
const KNOP := Color("#22b8a5")
const KNOP_DIEP := Color("#178a7c")


func _ready() -> void:
	var keuze := ""
	if OS.has_feature("web"):
		var v = JavaScriptBridge.eval("new URLSearchParams(window.location.search).get('stijl') || ''")
		keuze = str(v) if v != null else ""
	for arg in OS.get_cmdline_user_args():
		if arg.begins_with("--stijl="):
			keuze = arg.substr(8)
	synthesis = keuze != "thuisles"
	if synthesis:
		RenderingServer.set_default_clear_color(NACHT)
