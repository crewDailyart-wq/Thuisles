extends Spel
## De bundelmachine (Getallen: tientallen en eenheden, groep 3 en 4), naar het
## idee van Synthesis "Grouping 10s" en "Power of Place".
##
## Losse blokjes en staven van tien, in twee kolommen. Onderaan per kolom een
## teller met − en +. Komt er een tiende los blokje bij, dan schuiven de tien
## vanzelf in elkaar tot één staaf. Haal je een blokje weg terwijl er geen
## losse meer zijn, dan valt een staaf eerst uiteen in tien losse
## (inwisselen). Tien staven worden samen één plaat van honderd.
##
## Standen (van Thuisles, zie src/lib/generatoren/bundel.ts):
##   bouw      maak het getal (kiezen: het gebouwde getal is het antwoord)
##   enen      maak het getal met alleen losse blokjes (groep 3: tot 20)
##   lees      de blokjes liggen er; het kind typt het getal
##   erbij     er ligt al een getal; doe er tientallen bij of eraf (kiezen)
## Na Controleer: goed → de staven en blokjes tellen mee; fout → de goede
## manier wordt gebouwd.

const BLOK := 22.0

var stand := "bouw"
var h := 0           # platen van honderd
var t := 0           # staven van tien
var e := 0           # losse blokjes
var start := 0       # bij erbij en lees: het getal dat er al ligt
var _knoppen: Array = []   # [Rect2, wat]  wat: "t-", "t+", "e-", "e+"
var _tel := {}             # na Controleer: "t:i" of "e:i" -> tussenstand
var _flits := 0.0          # even oplichten na bundelen
var _flits_kolom := ""
var _beurt := 0


func _voorbeeld() -> Dictionary:
	return {"stand": "bouw", "start": 8}


func _demo() -> void:
	await wacht(1.0)
	for i in range(3):
		_druk("e+")
		await wacht(0.35)
	await wacht(0.6)
	_druk("t+")
	await wacht(0.5)
	_druk("e-")
	await wacht(1.0)
	_op_bericht({"type": "fase", "fase": "goed", "antwoord": "20"})


# ---------------------------------------------------------------------------

func _begin(o: Dictionary) -> void:
	stand = str(o.get("stand", "bouw"))
	start = int(o.get("start", 0))
	_beurt += 1
	_tel = {}
	_zet(start)
	_maak_knoppen()
	$Maatje.rustig()
	queue_redraw()
	if stand == "lees" and fase == "bezig":
		klaar(true)
	if stand != "lees":
		kies(str(_getal()) if start > 0 else "")


func _zet(n: int) -> void:
	h = n / 100
	t = (n % 100) / 10
	e = n % 10


func _getal() -> int:
	return h * 100 + t * 10 + e


func _maak_knoppen() -> void:
	_knoppen = []
	if stand == "lees":
		return
	var y := 452.0
	var mt := _midden_t()
	var me := _midden_e()
	if stand != "enen":
		_knoppen.append([Rect2(Vector2(mt - 130, y), Vector2(76, 76)), "t-"])
		_knoppen.append([Rect2(Vector2(mt + 54, y), Vector2(76, 76)), "t+"])
	_knoppen.append([Rect2(Vector2(me - 130, y), Vector2(76, 76)), "e-"])
	_knoppen.append([Rect2(Vector2(me + 54, y), Vector2(76, 76)), "e+"])


func _midden_t() -> float:
	return 350.0


func _midden_e() -> float:
	return 720.0 if stand != "enen" else 480.0


# ---------------------------------------------------------------------------
# Tikken
# ---------------------------------------------------------------------------

func _gui_input(event: InputEvent) -> void:
	if fase != "bezig" or stand == "lees":
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		for k in _knoppen:
			if (k[0] as Rect2).grow(6).has_point(event.position):
				_druk(k[1])
				accept_event()
				return


func _druk(wat: String) -> void:
	match wat:
		"e+":
			if _getal() >= 100:
				_nee()
				return
			e += 1
			$Geluid.plop(e % 8)
			if e == 10:
				await _bundel_enen()
		"e-":
			if _getal() == 0:
				_nee()
				return
			if e == 0:
				await _wissel_staaf()
			e -= 1
			$Geluid.plop(0)
		"t+":
			if _getal() + 10 > 100:
				_nee()
				return
			t += 1
			$Geluid.plop(5)
			if t == 10:
				await _bundel_staven()
		"t-":
			if _getal() < 10:
				_nee()
				return
			if t == 0:
				h -= 1
				t = 10
				_flits_aan("t")
				await wacht(0.3)
			t -= 1
			$Geluid.plop(0)
	queue_redraw()
	kies(str(_getal()))


func _nee() -> void:
	$Geluid.wiebel()
	$Maatje.wijs()


## Tien losse blokjes schuiven in elkaar tot één staaf.
func _bundel_enen() -> void:
	queue_redraw()
	await wacht(0.25)
	e = 0
	t += 1
	_flits_aan("t")
	$Geluid.tring()
	$Maatje.lach()
	if t == 10:
		await _bundel_staven()


func _bundel_staven() -> void:
	queue_redraw()
	await wacht(0.25)
	t = 0
	h += 1
	_flits_aan("h")
	$Geluid.tring()


## Geen losse meer: een staaf valt uiteen in tien losse.
func _wissel_staaf() -> void:
	if t == 0 and h > 0:
		h -= 1
		t = 10
	t -= 1
	e = 10
	_flits_aan("e")
	$Geluid.klop()
	queue_redraw()
	await wacht(0.35)


func _flits_aan(kolom: String) -> void:
	_flits_kolom = kolom
	_flits = 1.0
	create_tween().tween_property(self, "_flits", 0.0, 0.8)


# ---------------------------------------------------------------------------
# Na Controleer
# ---------------------------------------------------------------------------

func _goed(_antwoord: String) -> void:
	$Maatje.lach()
	await _tel_mee()
	$Geluid.tring()


func _fout(antwoord: String) -> void:
	$Maatje.wijs()
	if stand != "lees":
		await wacht(0.4)
		_zet(int(antwoord))
		_flits_aan("t")
		queue_redraw()
		await wacht(0.5)
	await _tel_mee()


## Eerst de staven per tien, dan de losse per één.
func _tel_mee() -> void:
	var mijn := _beurt
	_tel = {}
	var stand_ := h * 100
	for i in range(t):
		if mijn != _beurt:
			return
		stand_ += 10
		_tel["t:%d" % i] = stand_
		$Geluid.tel(i)
		queue_redraw()
		await wacht(0.3)
	for i in range(e):
		if mijn != _beurt:
			return
		stand_ += 1
		_tel["e:%d" % i] = stand_
		$Geluid.tel(t + i)
		queue_redraw()
		await wacht(0.2)


# ---------------------------------------------------------------------------
# Tekenen
# ---------------------------------------------------------------------------

func _process(_delta: float) -> void:
	if _flits > 0.0:
		queue_redraw()


func _draw() -> void:
	var twee_kolommen := stand != "enen"
	var midden_t := _midden_t()
	var midden_e := _midden_e()
	# de vakken van de kolommen
	if twee_kolommen:
		var vt := Rect2(Vector2(midden_t - 210, 70), Vector2(420, 362))
		Teken.vak(self, vt, Color(Teken.GLOED, 0.35 + (0.5 * _flits if _flits_kolom == "t" else 0.0)), Color(1, 1, 1, 0.02), 2.0, 16.0)
		Teken.tekst(self, Vector2(midden_t, 48), "tientallen", 24, Teken.ZACHT)
	var ve := Rect2(Vector2(midden_e - 150, 70), Vector2(300, 362))
	Teken.vak(self, ve, Color(Teken.GLOED, 0.35 + (0.5 * _flits if _flits_kolom == "e" else 0.0)), Color(1, 1, 1, 0.02), 2.0, 16.0)
	Teken.tekst(self, Vector2(midden_e, 48), "losse" if twee_kolommen else "blokjes", 24, Teken.ZACHT)

	# een plaat van honderd: linksboven, klein
	if h > 0:
		var r := Rect2(Vector2(14, 110), Vector2(110, 110))
		_teken_plaat(r)
		Teken.tekst(self, Vector2(69, 244), "100", 26, Teken.GEEL)

	# staven
	for i in range(t):
		var x := midden_t - (mini(t, 10) - 1) * 18.0 + i * 36.0
		_teken_staaf(Vector2(x, 92), _tel.get("t:%d" % i, 0))

	# losse blokjes in rijtjes van 5 (twee kolommen van 5 breed)
	for i in range(e):
		var rij := i / 5
		var kol := i % 5
		var p := Vector2(midden_e - 2 * (BLOK + 16) + kol * (BLOK + 16), 392 - rij * (BLOK + 20))
		_teken_blok(p, Teken.getalkleur(3), _tel.get("e:%d" % i, 0))

	# de tellers
	for k in _knoppen:
		var r: Rect2 = k[0]
		Teken.vak(self, r, Teken.GLOED, Color(Teken.KNOP, 0.22), 2.5, 18.0)
		Teken.tekst(self, r.get_center(), "−" if str(k[1]).ends_with("-") else "+", 46, Teken.WIT)
	if stand != "lees":
		if twee_kolommen:
			Teken.tekst(self, Vector2(midden_t, 490), str(t + h * 10), 42, Teken.WIT)
		Teken.tekst(self, Vector2(midden_e, 490), str(e), 42, Teken.WIT)


func _teken_staaf(onder: Vector2, tussen: int) -> void:
	var kleur := Teken.getalkleur(7)
	var r := Rect2(onder - Vector2(BLOK / 2.0, 0), Vector2(BLOK, 10 * BLOK + 9 * 2.0 + 0.0))
	draw_rect(r.grow(5), Color(kleur, 0.14))
	for j in range(10):
		var b := Rect2(Vector2(r.position.x, r.position.y + j * (BLOK + 2.0)), Vector2(BLOK, BLOK))
		draw_rect(b, kleur)
		draw_rect(Rect2(b.position, Vector2(BLOK, 4)), Color(1, 1, 1, 0.35))
	if tussen > 0:
		Teken.tekst(self, Vector2(onder.x, onder.y - 14), str(tussen), 20, Teken.GEEL)


func _teken_blok(p: Vector2, kleur: Color, tussen: int) -> void:
	var b := Rect2(p - Vector2(BLOK, BLOK) / 2.0, Vector2(BLOK, BLOK))
	draw_rect(b.grow(4), Color(kleur, 0.16))
	draw_rect(b, kleur)
	draw_rect(Rect2(b.position, Vector2(BLOK, 4)), Color(1, 1, 1, 0.4))
	if tussen > 0:
		Teken.tekst(self, p + Vector2(0, -22), str(tussen), 18, Teken.GEEL)


func _teken_plaat(r: Rect2) -> void:
	var kleur := Teken.GEEL
	draw_rect(r.grow(4), Color(kleur, 0.14))
	var stap := r.size.x / 10.0
	for i in range(10):
		for j in range(10):
			draw_rect(Rect2(r.position + Vector2(i * stap + 0.5, j * stap + 0.5), Vector2(stap - 1.0, stap - 1.0)), kleur)
