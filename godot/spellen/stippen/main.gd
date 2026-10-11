extends Spel
## De stippen (Aftrekken en Getallen, groep 3 en 4), naar het idee van
## Synthesis "Dot Destruction", "Difference Dimension" en "Compare the Pair".
##
## Standen (van Thuisles, zie src/lib/generatoren/stippen.ts):
##   weg        a stippen in een tienveld; het kind tikt er b weg (ze springen
##              kapot) en typt hoeveel er overblijven
##   verschil   twee rijen stippen onder elkaar; het kind typt hoeveel de
##              bovenste rij meer heeft
##   vergelijk  twee rijen; het kind tikt de rij met de meeste (of de minste)
##   teken      twee rijen met hun getal; het kind kiest <, = of >
##   splits     bolletjes in groepjes, elk groepje met zijn getal erboven en
##              plustekens ertussen (naar Synthesis "Splitting Sums"); het kind
##              typt hoeveel, of kiest een som uit de knoppen
## Na Controleer: goed → het antwoord licht op; fout → de goede manier.

const VAK := 64.0
const RUIM := 10.0
const MIDDEN := 480.0

var stand := "weg"
var a := 7
var b := 3
var zoek := "meeste"          # bij vergelijk: "meeste" of "minste"
var aantal_vakken := 10
## Bij weg: per stip of hij al weg is.
var weg: Array = []
var gekozen := ""             # bij vergelijk: "boven"/"onder"; bij teken: "<", "=", ">"
var _knoppen: Array = []      # bij teken: [Rect2, teken]
var _licht := []              # stippen die oplichten na Controleer: [rij, index]
var _cijfers := {}            # tellen na Controleer: "rij:index" -> getal
var _wiebel := 0.0
var _beurt := 0
## Bij splits: de groepjes bolletjes, en de knoppen met sommen om uit te kiezen.
var groepen: Array = []
var splitsknoppen: Array = []   # [Rect2, tekst]
var gekozen_som := ""
var _boven_te_zien := 0
var _onder_te_zien := 0


func _voorbeeld() -> Dictionary:
	return {"stand": "weg", "a": 8, "b": 3}


func _demo() -> void:
	await wacht(1.5)
	for i in [7, 6, 5]:
		_tik_stip(i)
		await wacht(0.4)
	await wacht(0.6)
	_op_bericht({"type": "fase", "fase": "fout", "antwoord": "5"})


# ---------------------------------------------------------------------------

func _begin(o: Dictionary) -> void:
	stand = str(o.get("stand", "weg"))
	if stand == "splits":
		_begin_splits(o)
		return
	a = int(o.get("a", 7))
	b = int(o.get("b", 3))
	zoek = str(o.get("zoek", "meeste"))
	_beurt += 1
	gekozen = ""
	_licht = []
	_cijfers = {}
	aantal_vakken = 10 if maxi(a, b) <= 10 else 20
	weg = []
	weg.resize(a)
	weg.fill(false)
	$Maatje.rustig()
	_maak_knoppen()
	_boven_te_zien = 0
	_onder_te_zien = 0
	queue_redraw()
	var mijn := _beurt
	# de stippen ploppen erin
	var tot := maxi(a, b if stand != "weg" else 0)
	for i in range(tot):
		if mijn != _beurt:
			return
		_boven_te_zien = mini(i + 1, a)
		_onder_te_zien = mini(i + 1, b) if stand != "weg" else 0
		$Geluid.plop(i % 8)
		queue_redraw()
		await wacht(0.06)
	if stand == "verschil" and fase == "bezig":
		klaar(true)


func _begin_splits(o: Dictionary) -> void:
	_beurt += 1
	groepen = []
	for g in o.get("groepen", []):
		groepen.append(int(g))
	gekozen_som = ""
	splitsknoppen = []
	var teksten: Array = o.get("knoppen", [])
	var breed := 250.0
	for i in range(teksten.size()):
		var x := 480.0 - (teksten.size() * (breed + 20.0) - 20.0) / 2.0 + i * (breed + 20.0)
		splitsknoppen.append([Rect2(Vector2(x, 440), Vector2(breed, 72)), str(teksten[i])])
	_licht = []
	_cijfers = {}
	queue_redraw()
	$Geluid.plop(2)
	if teksten.is_empty() and fase == "bezig":
		klaar(true)


## De plek van bolletje k in groepje g: groepjes naast elkaar, elk twee breed.
func _splits_bolletje(g: int, k: int) -> Vector2:
	var breedtes := []
	var totaal := 0.0
	for n in groepen:
		var b := 44.0 if n == 1 else 88.0
		breedtes.append(b)
		totaal += b
	totaal += (groepen.size() - 1) * 56.0
	var x := 480.0 - totaal / 2.0
	for i in range(g):
		x += breedtes[i] + 56.0
	var n: int = groepen[g]
	if n == 1:
		return Vector2(x + 22.0, 300.0)
	var rij := k / 2
	var kol := k % 2
	var rijen := int(ceil(n / 2.0))
	return Vector2(x + 22.0 + kol * 44.0, 300.0 + (rijen - 1) * 22.0 - rij * 44.0)


func _teken_splits() -> void:
	for g in range(groepen.size()):
		var n: int = groepen[g]
		var kleur := Teken.getalkleur(mini(n, 10))
		var hoogste := 300.0
		for k in range(n):
			var p := _splits_bolletje(g, k)
			hoogste = minf(hoogste, p.y)
			Teken.stip(self, p, 17.0, kleur)
		var midden := (_splits_bolletje(g, 0).x + _splits_bolletje(g, mini(1, n - 1)).x) / 2.0
		Teken.tekst(self, Vector2(midden, hoogste - 44.0), str(n), 34, Teken.WIT)
		if g < groepen.size() - 1:
			var rechts := _splits_bolletje(g, mini(1, n - 1)).x + 22.0
			Teken.tekst(self, Vector2(rechts + 28.0, 300.0), "+", 34, Teken.ZACHT)
	for k in splitsknoppen:
		var r: Rect2 = k[0]
		var aan: bool = gekozen_som == k[1]
		Teken.vak(self, r, Teken.GEEL if aan else Teken.GLOED, Color(Teken.GEEL if aan else Teken.KNOP, 0.25 if aan else 0.18), 3.0, 18.0)
		Teken.tekst(self, r.get_center(), k[1], 28, Teken.WIT)


func _maak_knoppen() -> void:
	_knoppen = []
	if stand != "teken":
		return
	var tekens := ["<", "=", ">"]
	for i in range(3):
		_knoppen.append([Rect2(Vector2(MIDDEN - 165.0 + i * 120.0, 420), Vector2(90, 90)), tekens[i]])


# ---------------------------------------------------------------------------
# Tikken
# ---------------------------------------------------------------------------

func _gui_input(event: InputEvent) -> void:
	if fase != "bezig":
		return
	if not (event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT):
		return
	var p: Vector2 = event.position
	if stand == "splits":
		for k in splitsknoppen:
			if (k[0] as Rect2).has_point(p):
				gekozen_som = k[1]
				$Geluid.plop(3)
				kies(gekozen_som)
				queue_redraw()
				accept_event()
		return
	match stand:
		"weg":
			for i in range(a):
				if _stip_rect(0, i).grow(4).has_point(p):
					_tik_stip(i)
					accept_event()
					return
		"vergelijk":
			for rij in [0, 1]:
				if _rij_rect(rij).grow(10).has_point(p):
					_kies_rij("boven" if rij == 0 else "onder")
					accept_event()
					return
		"teken":
			for k in _knoppen:
				if (k[0] as Rect2).has_point(p):
					gekozen = k[1]
					$Geluid.plop(3)
					kies(gekozen)
					queue_redraw()
					accept_event()
					return


func _tik_stip(i: int) -> void:
	var al := weg.count(true)
	if weg[i]:
		weg[i] = false
		$Geluid.plop(0)
	elif al >= b:
		# er zijn er al genoeg weg
		$Geluid.wiebel()
		_wiebel = 1.0
		create_tween().tween_property(self, "_wiebel", 0.0, 0.4)
		$Maatje.wijs()
		return
	else:
		weg[i] = true
		$Geluid.klop()
	queue_redraw()
	klaar(weg.count(true) == b)


func _kies_rij(welke: String) -> void:
	gekozen = welke
	$Geluid.plop(4)
	kies(welke)
	queue_redraw()


# ---------------------------------------------------------------------------
# Na Controleer
# ---------------------------------------------------------------------------

func _klaar_zetten() -> void:
	_beurt += 1
	_boven_te_zien = a
	_onder_te_zien = b if stand != "weg" else 0
	if stand == "weg":
		# precies b weg: die het kind koos, aangevuld met de laatste
		var nog := b - weg.count(true)
		for i in range(a - 1, -1, -1):
			if nog <= 0:
				break
			if not weg[i]:
				weg[i] = true
				nog -= 1
		for i in range(a):
			if weg.count(true) <= b:
				break
			if weg[i]:
				weg[i] = false
	queue_redraw()


func _goed(_antwoord: String) -> void:
	if stand == "splits":
		$Geluid.tring()
		return
	_klaar_zetten()
	$Maatje.lach()
	await _toon_uitkomst()
	$Geluid.tring()


func _fout(antwoord: String) -> void:
	if stand == "splits":
		# de goede som licht op
		gekozen_som = antwoord
		queue_redraw()
		return
	_klaar_zetten()
	$Maatje.wijs()
	await _toon_uitkomst()


## Laat zien waar het om draait: wat er overblijft, of de stippen die meer zijn.
func _toon_uitkomst() -> void:
	var mijn := _beurt
	_licht = []
	_cijfers = {}
	match stand:
		"weg":
			var n := 0
			for i in range(a):
				if mijn != _beurt:
					return
				if not weg[i]:
					n += 1
					_licht.append([0, i])
					_cijfers["0:%d" % i] = n
					$Geluid.tel(n)
					queue_redraw()
					await wacht(0.18)
		_:
			# de stippen die geen partner in de andere rij hebben
			var groot := 0 if a >= b else 1
			var verschil := absi(a - b)
			for k in range(verschil):
				if mijn != _beurt:
					return
				var i := mini(a, b) + k
				_licht.append([groot, i])
				_cijfers["%d:%d" % [groot, i]] = k + 1
				$Geluid.tel(k)
				queue_redraw()
				await wacht(0.2)


# ---------------------------------------------------------------------------
# Tekenen
# ---------------------------------------------------------------------------

func _klein() -> bool:
	return aantal_vakken == 20 and stand != "weg"


func _maat() -> float:
	return 36.0 if _klein() else VAK


## Elke rij een eigen vaste kleur, zodat je ze goed uit elkaar houdt.
func _rijkleur(rij: int) -> Color:
	return Teken.GEEL if rij == 0 else Color("#5fb8ff")


func _rij_y(rij: int) -> float:
	if stand == "weg":
		return 190.0
	return 120.0 + rij * 150.0


## Bij weg: een tienveld (of twee). Anders: één lange rij per getal.
func _stip_rect(rij: int, i: int) -> Rect2:
	if stand == "weg":
		var veld := i / 10
		var binnen := i % 10
		var r := binnen / 5
		var kol := binnen % 5
		var velden := aantal_vakken / 10
		var breed := velden * (5 * VAK + 4 * RUIM) + (velden - 1) * 30.0
		var x := MIDDEN - breed / 2.0 + veld * (5 * VAK + 4 * RUIM + 30.0) + kol * (VAK + RUIM)
		return Rect2(Vector2(x, _rij_y(0) + r * (VAK + RUIM)), Vector2(VAK, VAK))
	var m := _maat()
	var ruim := 5.0 if _klein() else 10.0
	var breed_rij := aantal_vakken * m + (aantal_vakken - 1) * ruim + (12.0 if aantal_vakken == 20 else 0.0)
	var links := MIDDEN - breed_rij / 2.0 + (30.0 if stand == "teken" else 0.0)
	var extra := 12.0 if i >= 10 else 0.0   # een klein gaatje na tien
	return Rect2(Vector2(links + i * (m + ruim) + extra, _rij_y(rij)), Vector2(m, m))


func _rij_rect(rij: int) -> Rect2:
	var eerste := _stip_rect(rij, 0)
	var laatste := _stip_rect(rij, aantal_vakken - 1)
	return Rect2(eerste.position - Vector2(10, 10), laatste.end - eerste.position + Vector2(20, 20))


func _process(_delta: float) -> void:
	if _wiebel > 0.0:
		queue_redraw()


func _draw() -> void:
	if stand == "splits":
		_teken_splits()
		return
	var schud := sin(_wiebel * 30.0) * 8.0 * _wiebel
	if stand == "weg":
		for i in range(aantal_vakken):
			var r := _stip_rect(0, i)
			r.position.x += schud
			Teken.vak(self, r, Teken.GLOED, Color(1, 1, 1, 0.04), 2.5, 10.0)
			if i < _boven_te_zien:
				_teken_stip(r, Teken.getalkleur(a), weg[i], [0, i] in _licht, _cijfers.get("0:%d" % i, 0))
		return
	for rij in [0, 1]:
		var n := a if rij == 0 else b
		var te_zien := _boven_te_zien if rij == 0 else _onder_te_zien
		if stand == "vergelijk" and gekozen != "":
			var mijn_rij := "boven" if rij == 0 else "onder"
			if gekozen == mijn_rij:
				Teken.vak(self, _rij_rect(rij), Teken.GEEL, Color(Teken.GEEL, 0.08), 3.0, 16.0)
		if stand == "teken":
			Teken.tekst(self, Vector2(_stip_rect(rij, 0).position.x - 38.0, _stip_rect(rij, 0).get_center().y), str(n), 40, _rijkleur(rij))
		for i in range(aantal_vakken):
			var r := _stip_rect(rij, i)
			Teken.vak(self, r, Color(Teken.GLOED, 0.55), Color(1, 1, 1, 0.03), 2.0, 8.0 if not _klein() else 6.0)
			if i < mini(n, te_zien):
				_teken_stip(r, _rijkleur(rij), false, [rij, i] in _licht, _cijfers.get("%d:%d" % [rij, i], 0))
	if stand == "teken":
		for k in _knoppen:
			var r: Rect2 = k[0]
			var aan: bool = gekozen == k[1]
			Teken.vak(self, r, Teken.GEEL if aan else Teken.GLOED, Color(Teken.GEEL if aan else Teken.KNOP, 0.25 if aan else 0.18), 3.0, 18.0)
			Teken.tekst(self, r.get_center(), k[1], 56, Teken.WIT)


func _teken_stip(r: Rect2, kleur: Color, is_weg: bool, licht: bool, cijfer: int) -> void:
	var straal := r.size.x * 0.32
	if is_weg:
		# kapot gesprongen: een zachte ring met een kruisje
		draw_arc(r.get_center(), straal, 0, TAU, 20, Color(Teken.MIS, 0.55), 2.0, true)
		var d := straal * 0.55
		draw_line(r.get_center() - Vector2(d, d), r.get_center() + Vector2(d, d), Color(Teken.MIS, 0.7), 2.5, true)
		draw_line(r.get_center() + Vector2(-d, d), r.get_center() + Vector2(d, -d), Color(Teken.MIS, 0.7), 2.5, true)
		return
	if licht:
		draw_circle(r.get_center(), straal * 1.7, Color(Teken.GOED, 0.3))
	Teken.stip(self, r.get_center(), straal, Teken.GOED if licht else kleur)
	if cijfer > 0:
		Teken.tekst(self, r.get_center(), str(cijfer), int(straal * 1.2), Teken.NACHT)
