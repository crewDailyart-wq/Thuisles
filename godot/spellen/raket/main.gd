extends Control
## De raket (Optellen, groep 4): kies twee stenen die samen het getal op de
## planeet maken.
##
## Wat je ziet, staat als losse scènes in deze map: het raketje (schip.tscn),
## een steen (steen.tscn), de planeet (planeet.tscn) en het maatje
## (maatje.tscn). Dit script laat ze samenspelen.
##
## Het kind tikt een steen aan: die krijgt een gloeiende ring en er tekent zich
## een stippellijn van de raket naar die steen. Nog een steen: de lijn loopt
## door, en dan naar de planeet. Nog een keer tikken laat een steen los. Tikken
## op de planeet is hetzelfde als Controleer.
##
## Standen (komen van Thuisles): twee (kies er twee) en aanvullen (één steen is
## al gekozen, zoek de steen die erbij moet).
##
## Godot kijkt niets na. Thuisles kijkt na en zegt via de brug (brug.gd) of het
## goed was (de raket vliegt de route en landt) of fout (de raket schiet langs
## de planeet; daarna lichten de goede stenen groen op en vliegt hij die route).
## Er is geen klok en er zijn geen levens.

const STEEN := preload("res://raket/steen.tscn")
const START := Vector2(78, 250)

## Vaste plekken voor de stenen, zodat ze nooit over elkaar of over de raket of
## de planeet heen vallen. Per opgave een beetje verschoven.
const PLEKKEN := [
	Vector2(190, 110), Vector2(318, 92), Vector2(430, 128),
	Vector2(214, 252), Vector2(352, 226), Vector2(254, 396), Vector2(404, 372),
]

@onready var schip: Node2D = $Schip
@onready var planeet: Node2D = $Planeet
@onready var maatje: Node2D = $Maatje
@onready var geluid: Node = $Geluid

var doel := 9
var stand := "twee"
var stenen: Array = []
var gekozen: Array = []         # stenen in de volgorde waarin ze gekozen zijn
var fase := "wacht"             # wacht, bezig, vliegt, goed, fout
var goede_route: Array = []
var gezegd := {}


func _ready() -> void:
	Brug.bericht.connect(_op_bericht)
	if not OS.has_feature("web"):
		# Los gestart in de Godot-app: een voorbeeld, zodat je kunt spelen.
		_op_bericht({"type": "opgave", "doel": 9, "stenen": [2, 4, 8, 5, 3, 12], "vast": -1})
		if "--demo" in OS.get_cmdline_user_args():
			_demo()


func _demo() -> void:
	await get_tree().create_timer(0.8).timeout
	_kies(stenen[1])
	await get_tree().create_timer(0.6).timeout
	_kies(stenen[3])
	await get_tree().create_timer(1.0).timeout
	_op_bericht({"type": "fase", "fase": "goed"})


# ---------------------------------------------------------------------------
# Berichten van Thuisles
# ---------------------------------------------------------------------------

func _op_bericht(d: Dictionary) -> void:
	match str(d.get("type", "")):
		"opgave":
			doel = int(d.get("doel", 9))
			stand = "aanvullen" if int(d.get("vast", -1)) >= 0 else "twee"
			_begin(d.get("stenen", []), int(d.get("vast", -1)))
		"fase":
			match str(d.get("fase", "")):
				"goed":
					_goed()
				"fout":
					_fout(d.get("goed", []))
		"geluid":
			geluid.aan = bool(d.get("aan", true))


func _begin(getallen: Array, vast: int) -> void:
	for s in stenen:
		s.queue_free()
	stenen.clear()
	gekozen.clear()
	goede_route.clear()
	gezegd = {}
	fase = "bezig"
	planeet.doel = doel
	planeet.gloed = 0.0
	schip.position = START
	schip.rotation = 0.0
	schip.modulate.a = 1.0
	maatje.rustig()
	var rng := RandomNumberGenerator.new()
	rng.seed = hash(str(getallen) + str(doel))
	for i in range(min(getallen.size(), PLEKKEN.size())):
		var s: Node2D = STEEN.instantiate()
		s.getal = int(getallen[i])
		var p: Vector2 = PLEKKEN[i] + Vector2(rng.randf_range(-14, 14), rng.randf_range(-12, 12))
		s.position = p
		add_child(s)
		move_child(s, $Schip.get_index())
		s.zet_basis(p.y)
		s.scale = Vector2.ZERO
		create_tween().tween_property(s, "scale", Vector2.ONE, 0.3).set_delay(i * 0.05).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
		stenen.append(s)
	if vast >= 0 and vast < stenen.size():
		stenen[vast].vast = true
		gekozen.append(stenen[vast])
	_meld()
	queue_redraw()


# ---------------------------------------------------------------------------
# Tikken
# ---------------------------------------------------------------------------

func _gui_input(event: InputEvent) -> void:
	if not (event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT):
		return
	if fase != "bezig":
		return
	var p: Vector2 = event.position
	if planeet.raakt(p):
		if gekozen.size() == 2:
			geluid.klop()
			Brug.stuur({"type": "lanceer"})
		else:
			_zeg("eerst_twee")
		accept_event()
		return
	for s in stenen:
		if s.raakt(p):
			_kies(s)
			accept_event()
			return


func _kies(s: Node2D) -> void:
	if s.vast:
		return
	if s in gekozen:
		gekozen.erase(s)
		s.gekozen = false
		geluid.plop(0)
	elif gekozen.size() < 2:
		gekozen.append(s)
		s.gekozen = true
		geluid.plop(gekozen.size() * 2)
		var t := create_tween()
		t.tween_property(s, "scale", Vector2(1.18, 1.18), 0.08)
		t.tween_property(s, "scale", Vector2.ONE, 0.2).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	else:
		# al twee gekozen: even wiebelen, en het maatje helpt
		geluid.wiebel()
		var x := s.position.x
		var t := create_tween()
		for i in range(4):
			t.tween_property(s, "position:x", x + (6 if i % 2 == 0 else -6), 0.05)
		t.tween_property(s, "position:x", x, 0.05)
		_zeg("twee")
		maatje.wijs()
	_meld()
	queue_redraw()


func _meld() -> void:
	var getallen := []
	for s in gekozen:
		getallen.append(s.getal)
	Brug.stuur({"type": "keuze", "getallen": getallen})


func _zeg(sleutel: String) -> void:
	if gezegd.has(sleutel):
		return
	gezegd[sleutel] = true
	Brug.stuur({"type": "zeg", "sleutels": [sleutel], "doel": doel})


# ---------------------------------------------------------------------------
# De route
# ---------------------------------------------------------------------------

func _route(langs: Array) -> Array:
	var punten := [START]
	for s in langs:
		punten.append(s.position)
	if langs.size() == 2:
		# landen tegen de linkerkant van de planeet, niet over het getal
		punten.append(planeet.position - Vector2(70, 0))
	return punten


func _draw() -> void:
	# zacht raster
	var lijn := Color(1, 1, 1, 0.035)
	var x := 0.0
	while x <= 600:
		draw_line(Vector2(x, 0), Vector2(x, 500), lijn, 1.0)
		x += 28.0
	var y := 0.0
	while y <= 500:
		draw_line(Vector2(0, y), Vector2(600, y), lijn, 1.0)
		y += 28.0
	var stijl = get_node_or_null("/root/Stijl")
	var gloed: Color = stijl.GLOED if stijl else Color("#5fd4e8")
	if fase == "bezig" or fase == "vliegt":
		_stippellijn(_route(gekozen), gloed)
	if not goede_route.is_empty():
		_stippellijn(_route(goede_route), Kleuren.GROEN)


func _stippellijn(punten: Array, kleur: Color) -> void:
	for i in range(punten.size() - 1):
		var van: Vector2 = punten[i]
		var naar: Vector2 = punten[i + 1]
		var lengte := van.distance_to(naar)
		var t := 0.0
		while t < lengte:
			draw_line(van.lerp(naar, t / lengte), van.lerp(naar, min(t + 10.0, lengte) / lengte), kleur, 3.0, true)
			t += 18.0


# ---------------------------------------------------------------------------
# Goed en fout (komt van Thuisles, na Controleer)
# ---------------------------------------------------------------------------

func _vlieg(punten: Array, mis: bool) -> void:
	fase = "vliegt"
	var t := create_tween()
	for i in range(1, punten.size()):
		var naar: Vector2 = punten[i]
		if mis and i == punten.size() - 1:
			# langs de planeet heen
			naar = planeet.position + Vector2(40, -150)
		var van: Vector2 = punten[i - 1]
		t.tween_callback(func(): schip.rotation = (naar - van).angle())
		t.tween_property(schip, "position", naar, 0.45).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN_OUT)
	await t.finished


func _goed() -> void:
	var route := _route(gekozen)
	geluid.klop()
	await _vlieg(route, false)
	fase = "goed"
	geluid.tring()
	$Sterren.position = planeet.position
	$Sterren.restart()
	create_tween().tween_property(planeet, "gloed", 1.0, 0.3)
	maatje.lach()
	queue_redraw()


func _fout(goed: Array) -> void:
	var route := _route(gekozen)
	if route.size() >= 4:
		await _vlieg(route, true)
		geluid.wiebel()
		create_tween().tween_property(schip, "modulate:a", 0.0, 0.3)
		await get_tree().create_timer(0.5).timeout
	fase = "fout"
	for s in gekozen:
		if not s.vast:
			s.gekozen = false
	# de goede stenen lichten groen op, en de raket vliegt die route
	goede_route.clear()
	var nog := goed.duplicate()
	for s in stenen:
		if s.getal in nog:
			nog.erase(s.getal)
			goede_route.append(s)
			s.goed_oplichten = true
	maatje.wijs()
	queue_redraw()
	schip.position = START
	schip.rotation = 0.0
	create_tween().tween_property(schip, "modulate:a", 1.0, 0.3)
	await get_tree().create_timer(0.8).timeout
	if goede_route.size() == 2:
		await _vlieg(_route(goede_route), false)
		fase = "fout"
		create_tween().tween_property(planeet, "gloed", 1.0, 0.3)
		geluid.tring()
	queue_redraw()
