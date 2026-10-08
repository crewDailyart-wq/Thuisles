extends Spel
## De getaltegels (Optellen en Splitsen, groep 3 en 4): tegels met stippen in
## een tienveld (of twee, tot 20). Elke tegel heeft een eigen kleur per getal,
## zodat een kind de hoeveelheid ziet zonder te tellen.
##
## Standen (van Thuisles, zie src/lib/generatoren/tegels.ts):
##   samen   twee tegels liggen in het veld; het kind typt hoeveel samen
##   dubbel  twee dezelfde tegels; het kind typt hoeveel samen
##   maak    één tegel ligt er; het kind kiest uit de bak de tegel die het veld
##           precies vol maakt (zoveel vakjes als het doelgetal)
## Na Controleer: goed → de stippen tellen mee; fout → de goede manier.

const VAK := 46.0
const RUIM := 8.0

## Wat er in het veld ligt: per vakje de kleur, of null.
var cellen: Array = []
var aantal_vakken := 10
var stand := "samen"
var a := 3
var b := 4
var doel := 10
## De tegel die het kind uit de bak koos (bij "maak"), of 0.
var gekozen := 0
var _bak: Array = []          # Rect2 per tegel in de bak (1 tot en met 9)
var _cijfers: Array = []      # tellen na Controleer: getal per vakje, of ""
var _goede_plek := -1         # bij fout: vanaf hier lichten de ontbrekende vakjes op
var _wiebel := 0.0
## Telt per opgave op, zodat een animatie van de vorige opgave stopt.
var _beurt := 0


func _voorbeeld() -> Dictionary:
	return {"stand": "maak", "a": 3, "doel": 7}


func _demo() -> void:
	await wacht(1.2)
	_tik_bak(5)
	await wacht(0.8)
	_tik_bak(5)
	await wacht(0.5)
	_tik_bak(4)
	await wacht(1.0)
	_op_bericht({"type": "fase", "fase": "goed", "antwoord": "4"})


# ---------------------------------------------------------------------------

func _begin(o: Dictionary) -> void:
	stand = str(o.get("stand", "samen"))
	a = int(o.get("a", 3))
	b = int(o.get("b", a))
	doel = int(o.get("doel", a + b))
	gekozen = 0
	_beurt += 1
	_cijfers = []
	_goede_plek = -1
	var totaal := doel if stand == "maak" else a + b
	aantal_vakken = 10 if totaal <= 10 else 20
	cellen = []
	cellen.resize(aantal_vakken)
	$Maatje.rustig()
	_maak_bak()
	queue_redraw()
	# de eerste tegel (en bij samen/dubbel ook de tweede) ploppen erin
	await _leg(0, a)
	if stand != "maak":
		await wacht(0.25)
		await _leg(a, b)
	if fase == "bezig" and stand != "maak":
		klaar(true)


## Leg een tegel van n stippen vanaf vakje `van`, stip voor stip.
func _leg(van: int, n: int, kleur: Color = Color.TRANSPARENT) -> void:
	var k := kleur if kleur.a > 0.0 else Teken.getalkleur(n)
	var mijn := _beurt
	for i in range(n):
		if mijn != _beurt or van + i >= aantal_vakken:
			break
		cellen[van + i] = k
		$Geluid.plop(i)
		queue_redraw()
		await wacht(0.07)


func _haal_weg(van: int, n: int) -> void:
	for i in range(n):
		if van + i < aantal_vakken:
			cellen[van + i] = null
	queue_redraw()


# ---------------------------------------------------------------------------
# De bak (alleen bij "maak")
# ---------------------------------------------------------------------------

func _maak_bak() -> void:
	_bak = []
	if stand != "maak":
		return
	# negen tegels in twee rijen onder het veld
	for n in range(1, 10):
		var rij := 0 if n <= 5 else 1
		var plek := (n - 1) % 5
		var breed := 96.0
		var x := 300.0 - 2.5 * (breed + 12.0) + plek * (breed + 12.0) + (54.0 if rij == 1 else 0.0)
		_bak.append(Rect2(Vector2(x, 330.0 + rij * 76.0), Vector2(breed, 62.0)))


func _gui_input(event: InputEvent) -> void:
	if fase != "bezig" or stand != "maak":
		return
	if event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT:
		for i in range(_bak.size()):
			if (_bak[i] as Rect2).grow(4).has_point(event.position):
				_tik_bak(i + 1)
				accept_event()
				return


func _tik_bak(n: int) -> void:
	if gekozen == n:
		# nog een keer tikken: de tegel gaat terug in de bak
		_haal_weg(a, n)
		gekozen = 0
		$Geluid.plop(0)
		kies("")
		return
	if a + n > doel:
		# past niet in het veld
		$Geluid.wiebel()
		_wiebel = 1.0
		create_tween().tween_property(self, "_wiebel", 0.0, 0.4)
		$Maatje.wijs()
		return
	if gekozen > 0:
		_haal_weg(a, gekozen)
	gekozen = n
	kies(str(n))
	await _leg(a, n)


# ---------------------------------------------------------------------------
# Na Controleer
# ---------------------------------------------------------------------------

## Na Controleer moet het veld af zijn, ook als het inploppen nog bezig was.
func _vul_meteen() -> void:
	_beurt += 1
	for i in range(aantal_vakken):
		cellen[i] = null
	for i in range(mini(a, aantal_vakken)):
		cellen[i] = Teken.getalkleur(a)
	if stand == "maak":
		for i in range(mini(gekozen, aantal_vakken - a)):
			cellen[a + i] = Teken.getalkleur(gekozen)
	else:
		for i in range(mini(b, aantal_vakken - a)):
			cellen[a + i] = Teken.getalkleur(b)
	queue_redraw()


func _goed(_antwoord: String) -> void:
	_vul_meteen()
	$Maatje.lach()
	await _tel_mee()
	$Geluid.tring()
	$Sterren.position = _vak_rect(maxi(0, _gevuld() - 1)).get_center()
	$Sterren.restart()


func _fout(antwoord: String) -> void:
	_vul_meteen()
	$Maatje.wijs()
	if stand == "maak":
		var juist := int(antwoord)
		if gekozen > 0:
			_haal_weg(a, gekozen)
			await wacht(0.3)
		_goede_plek = a
		await _leg(a, juist, Teken.GOED)
	await _tel_mee()


func _gevuld() -> int:
	var n := 0
	for c in cellen:
		if c != null:
			n += 1
	return n


func _tel_mee() -> void:
	_cijfers = []
	_cijfers.resize(aantal_vakken)
	var mijn := _beurt
	for i in range(aantal_vakken):
		if mijn != _beurt or cellen[i] == null:
			break
		_cijfers[i] = str(i + 1)
		$Geluid.tel(i)
		queue_redraw()
		await wacht(0.16)


# ---------------------------------------------------------------------------
# Tekenen
# ---------------------------------------------------------------------------

func _veld_links() -> float:
	var velden := aantal_vakken / 10
	var breed := velden * (5 * VAK + 4 * RUIM) + (velden - 1) * 30.0
	return 300.0 - breed / 2.0


func _vak_rect(i: int) -> Rect2:
	var veld := i / 10
	var binnen := i % 10
	var rij := binnen / 5
	var kol := binnen % 5
	var x := _veld_links() + veld * (5 * VAK + 4 * RUIM + 30.0) + kol * (VAK + RUIM)
	# bij "maak" staat de bak eronder; anders staat het veld in het midden
	var y := (120.0 if stand == "maak" else 190.0) + rij * (VAK + RUIM)
	return Rect2(Vector2(x, y), Vector2(VAK, VAK))


func _process(_delta: float) -> void:
	if _wiebel > 0.0:
		queue_redraw()


func _draw() -> void:
	Teken.raster(self)
	if cellen.is_empty():
		cellen.resize(aantal_vakken)
	var schud := sin(_wiebel * 30.0) * 8.0 * _wiebel
	for i in range(aantal_vakken):
		var r := _vak_rect(i)
		r.position.x += schud
		var leeg := cellen[i] == null
		var rand := Teken.GLOED
		if stand == "maak" and i >= doel:
			rand = Color(Teken.ZACHT, 0.18)   # vakjes buiten het doel tellen niet mee
		if _goede_plek >= 0 and i >= _goede_plek and i < doel:
			rand = Teken.GOED
		Teken.vak(self, r, rand, Color(1, 1, 1, 0.04 if leeg else 0.08), 2.5, 10.0)
		if not leeg:
			Teken.stip(self, r.get_center(), 15.0, cellen[i])
		if i < _cijfers.size() and _cijfers[i] != null and str(_cijfers[i]) != "":
			Teken.tekst(self, r.get_center(), str(_cijfers[i]), 20, Teken.NACHT)
	if stand == "maak":
		# het doelgetal rechts van het veld: zoveel vakjes moeten vol
		# naast het veld; bij twee velden past dat niet, dan erboven
		var badge := Rect2(Vector2(_vak_rect(4).end.x + 26.0, _vak_rect(0).position.y), Vector2(70, VAK * 2 + RUIM))
		if aantal_vakken == 20:
			badge = Rect2(Vector2(265, 38), Vector2(70, 64))
		Teken.vak(self, badge, Teken.GEEL, Color(Teken.GEEL, 0.1), 3.0, 14.0)
		Teken.tekst(self, badge.get_center(), str(doel), 40, Teken.GEEL)
		for i in range(_bak.size()):
			_teken_tegel(_bak[i], i + 1, gekozen == i + 1)


## Een tegel in de bak: n stippen in de kleur van het getal, in rijtjes van 5.
func _teken_tegel(r: Rect2, n: int, weg: bool) -> void:
	var k := Teken.getalkleur(n)
	Teken.vak(self, r, Color(k, 0.35 if weg else 0.9), Color(k, 0.06 if weg else 0.14), 2.5, 14.0)
	var rijen := 1 if n <= 5 else 2
	for i in range(n):
		var rij := i / 5
		var kol := i % 5
		var kolommen := mini(n, 5)
		var p := r.get_center() + Vector2((kol - (kolommen - 1) / 2.0) * 17.0, (rij - (rijen - 1) / 2.0) * 18.0)
		Teken.stip(self, p, 6.0, Color(k, 0.3) if weg else k)
