extends Node
## De brug tussen Thuisles en Godot.
##
## Thuisles is de baas: het vertelt welke opgave er is en wanneer de goede
## manier getoond moet worden, en het kijkt het antwoord na. Godot vertelt
## alleen wat het kind doet. Elk bericht is een stukje JSON-tekst via
## postMessage, en staat ook in de console (met "[brug]" ervoor).

signal bericht(data: Dictionary)

var _luisteraar: JavaScriptObject


func _ready() -> void:
	if OS.has_feature("web"):
		_luisteraar = JavaScriptBridge.create_callback(_op_bericht)
		JavaScriptBridge.get_interface("window").addEventListener("message", _luisteraar)
	stuur({"type": "geladen"})


func _op_bericht(args: Array) -> void:
	var data = args[0].data
	if typeof(data) != TYPE_STRING:
		return
	var obj = JSON.parse_string(data)
	if obj is Dictionary and obj.get("bron", "") == "thuisles":
		print("[brug] van Thuisles: ", data)
		bericht.emit(obj)


func stuur(data: Dictionary) -> void:
	data["bron"] = "godot"
	var tekst := JSON.stringify(data)
	print("[brug] naar Thuisles: ", tekst)
	if OS.has_feature("web"):
		JavaScriptBridge.eval("window.parent.postMessage(%s, window.location.origin)" % JSON.stringify(tekst))
