class_name Spel
extends Control
## De basis van een Godot-spel van het algemene soort (zie
## src/components/oefenen/GodotSpel.tsx). Een spel erft hiervan en vult in:
##   _begin(opgave)          een nieuwe opgave van Thuisles
##   _goed(antwoord)         na Controleer, goed
##   _fout(antwoord)         na Controleer, fout: laat de goede manier zien
##   _voorbeeld() -> Dictionary   een opgave om los in de Godot-app te spelen
## en roept zelf aan:
##   kies(waarde)            bij invoer "kiezen": dit is nu het antwoord
##   klaar(ja)               bij invoer "typen" met wachten: het vakje mag open
##   lanceer()               hetzelfde als Controleer
## Godot kijkt niets na; dat doet Thuisles.

var fase := "wacht"


func _ready() -> void:
	Brug.bericht.connect(_op_bericht)
	if not OS.has_feature("web"):
		# los gestart in de Godot-app: een voorbeeld, of "-- --opgave={...}" om te proberen
		var opgave := _voorbeeld()
		for arg in OS.get_cmdline_user_args():
			if arg.begins_with("--opgave="):
				var eigen = JSON.parse_string(arg.substr(9))
				if eigen is Dictionary:
					opgave = eigen
		_op_bericht.call_deferred(opgave.merged({"type": "opgave"}))
		if "--demo" in OS.get_cmdline_user_args():
			_demo.call_deferred()


func _op_bericht(d: Dictionary) -> void:
	match str(d.get("type", "")):
		"opgave":
			fase = "bezig"
			_begin(d)
		"fase":
			fase = str(d.get("fase", ""))
			if fase == "goed":
				_goed(str(d.get("antwoord", "")))
			elif fase == "fout":
				_fout(str(d.get("antwoord", "")))
		"geluid":
			var g = get_node_or_null("Geluid")
			if g:
				g.aan = bool(d.get("aan", true))


func kies(waarde: String) -> void:
	Brug.stuur({"type": "antwoord", "waarde": waarde})


func klaar(ja := true) -> void:
	Brug.stuur({"type": "klaar", "klaar": ja})


func lanceer() -> void:
	Brug.stuur({"type": "lanceer"})


func _begin(_opgave: Dictionary) -> void:
	pass


func _goed(_antwoord: String) -> void:
	pass


func _fout(_antwoord: String) -> void:
	pass


func _voorbeeld() -> Dictionary:
	return {}


func _demo() -> void:
	pass


func wacht(seconden: float) -> void:
	await get_tree().create_timer(seconden).timeout
