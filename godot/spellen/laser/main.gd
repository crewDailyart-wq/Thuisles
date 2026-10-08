extends Control
## De laser (Tafels en Aftrekken, groep 4): raak alle goede stenen.
##
## Wat je ziet, staat als losse scènes in deze map: het laserkanon
## (kanon.tscn), een steen (doelsteen.tscn) en het maatje (maatje.tscn). Dit
## script laat ze samenspelen.
##
## Acht stenen zweven langzaam rond; ze vallen niet weg en er is geen klok. Tik
## een steen aan: het kanon draait, er flitst een laserstraal en er komt een
## vizier op de steen. Nog een keer tikken haalt het vizier eraf. Vuur! (of
## Controleer) laat Thuisles nakijken:
##   goed:  alle geraakte stenen ontploffen;
##   fout:  goede geraakte stenen ontploffen, verkeerd geraakte stenen kaatsen de
##          straal terug en kleuren roze, gemiste goede stenen lichten groen op.
## Geen levens. Godot kijkt niets na; dat doet Thuisles (via brug.gd).

const STEEN := preload("res://laser/doelsteen.tscn")
const PLEKKEN := [
	Vector2(92, 96), Vector2(232, 82), Vector2(372, 96), Vector2(510, 84),
	Vector2(122, 236), Vector2(262, 222), Vector2(402, 238), Vector2(522, 228),
]

@onready var kanon: Node2D = $Kanon
@onready var maatje: Node2D = $Maatje
@onready var geluid: Node = $Geluid

var stenen: Array = []
var fase := "wacht"
var _straal_van := Vector2.ZERO
var _straal_naar := Vector2.ZERO
var _straal := 0.0
var _straal_kleur := Color("#5fd4e8")


func _ready() -> void:
	Brug.bericht.connect(_op_bericht)
	$Vuur.pressed.connect(_vuur)
	if not OS.has_feature("web"):
		# Los gestart in de Godot-app: een voorbeeld (de tafel van 3).
		_op_bericht({"type": "opgave", "stenen": ["12", "7", "9", "16", "21", "10", "4", "14"]})
		if "--demo" in OS.get_cmdline_user_args():
			_demo()


func _demo() -> void:
	await get_tree().create_timer(0.8).timeout
	for i in [0, 2, 3]:
		_tik(stenen[i])
		await get_tree().create_timer(0.5).timeout
	await get_tree().create_timer(0.8).timeout
	_op_bericht({"type": "fase", "fase": "fout", "goed": [0, 2, 4]})


# ---------------------------------------------------------------------------
# Berichten van Thuisles
# ---------------------------------------------------------------------------

func _op_bericht(d: Dictionary) -> void:
	match str(d.get("type", "")):
		"opgave":
			_begin(d.get("stenen", []))
		"fase":
			match str(d.get("fase", "")):
				"goed":
					_uitslag(_geraakt(), true)
				"fout":
					_uitslag(d.get("goed", []), false)
		"geluid":
			geluid.aan = bool(d.get("aan", true))


func _begin(teksten: Array) -> void:
	for s in stenen:
		s.queue_free()
	stenen.clear()
	fase = "bezig"
	maatje.rustig()
	$Vuur.disabled = true
	$Vuur.visible = true
	var rng := RandomNumberGenerator.new()
	rng.seed = hash(str(teksten))
	for i in range(min(teksten.size(), PLEKKEN.size())):
		var s: Node2D = STEEN.instantiate()
		s.tekst = str(teksten[i])
		add_child(s)
		move_child(s, kanon.get_index())
		s.zet_basis(PLEKKEN[i] + Vector2(rng.randf_range(-12, 12), rng.randf_range(-10, 10)))
		s.scale = Vector2.ZERO
		create_tween().tween_property(s, "scale", Vector2.ONE, 0.3).set_delay(i * 0.04).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
		stenen.append(s)
	_meld()


# ---------------------------------------------------------------------------
# Tikken
# ---------------------------------------------------------------------------

func _gui_input(event: InputEvent) -> void:
	if not (event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT):
		return
	if fase != "bezig":
		return
	for s in stenen:
		if s.raakt(event.position):
			_tik(s)
			accept_event()
			return


func _tik(s: Node2D) -> void:
	s.geraakt = not s.geraakt
	kanon.richt(s.position)
	_flits(s.position, Color("#5fd4e8"))
	geluid.plop(4 if s.geraakt else 0)
	var t := create_tween()
	t.tween_property(s, "scale", Vector2(1.15, 1.15), 0.07)
	t.tween_property(s, "scale", Vector2.ONE, 0.2).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	$Vuur.disabled = _geraakt().is_empty()
	_meld()


func _geraakt() -> Array:
	var uit := []
	for i in range(stenen.size()):
		if stenen[i].geraakt:
			uit.append(i)
	return uit


func _meld() -> void:
	Brug.stuur({"type": "keuze", "indexen": _geraakt()})


func _vuur() -> void:
	if fase != "bezig" or _geraakt().is_empty():
		return
	geluid.klop()
	Brug.stuur({"type": "lanceer"})


# ---------------------------------------------------------------------------
# De laserstraal
# ---------------------------------------------------------------------------

func _flits(naar: Vector2, kleur: Color) -> void:
	_straal_van = kanon.position + Vector2(cos(kanon.richting), sin(kanon.richting)) * 58
	_straal_naar = naar
	_straal_kleur = kleur
	_straal = 1.0
	var t := create_tween()
	t.tween_property(self, "_straal", 0.0, 0.25)


func _process(_delta: float) -> void:
	queue_redraw()


func _draw() -> void:
	var lijn := Color(1, 1, 1, 0.035)
	var x := 0.0
	while x <= 600:
		draw_line(Vector2(x, 0), Vector2(x, 500), lijn, 1.0)
		x += 28.0
	var y := 0.0
	while y <= 500:
		draw_line(Vector2(0, y), Vector2(600, y), lijn, 1.0)
		y += 28.0
	if _straal > 0.0:
		draw_line(_straal_van, _straal_naar, Color(_straal_kleur, 0.3 * _straal), 14.0, true)
		draw_line(_straal_van, _straal_naar, Color(_straal_kleur, _straal), 4.0, true)


# ---------------------------------------------------------------------------
# Na Controleer
# ---------------------------------------------------------------------------

func _uitslag(goed: Array, alles_goed: bool) -> void:
	fase = "klaar"
	$Vuur.visible = false
	for i in range(stenen.size()):
		var s: Node2D = stenen[i]
		var hoort := i in goed
		if s.geraakt and hoort:
			kanon.richt(s.position)
			_flits(s.position, Color("#f6c945"))
			geluid.tel(i)
			await get_tree().create_timer(0.25).timeout
			_ontplof(s)
		elif s.geraakt and not hoort:
			kanon.richt(s.position)
			_flits(s.position, Color("#ff8fab"))
			s.uitslag = "mis"
			geluid.wiebel()
			var x := s.position.x
			var t := create_tween()
			for k in range(4):
				t.tween_property(s, "position:x", x + (8 if k % 2 == 0 else -8), 0.05)
			t.tween_property(s, "position:x", x, 0.05)
			await get_tree().create_timer(0.35).timeout
		elif hoort:
			s.uitslag = "gemist"
	if alles_goed:
		geluid.tring()
		maatje.lach()
	else:
		maatje.wijs()


func _ontplof(s: Node2D) -> void:
	s.uitslag = "goed"
	var deeltjes: CPUParticles2D = $Sterren.duplicate()
	add_child(deeltjes)
	deeltjes.position = s.position
	deeltjes.restart()
	var t := create_tween().set_parallel()
	t.tween_property(s, "scale", Vector2(1.4, 1.4), 0.15)
	t.tween_property(s, "modulate:a", 0.0, 0.2)
	t.chain().tween_callback(func(): s.visible = false)
