extends Spel
## De getaltegels (Optellen en Splitsen tot 20, groep 3 en 4), naar het idee
## van Synthesis "Add within 10": insteekblokjes in torens van twee breed. Elk
## getal heeft een eigen kleur en dus ook een eigen vorm: 3 is een L, 4 een
## vierkant, 5 een vierkant met één erbovenop, 10 een staaf van 2 bij 5. Leg je
## een tegel op een andere, dan klikt hij erop vast en loopt de vorm door: de L
## van 3 past precies in de inham van 5.
##
## Eén opgave beschrijft een tafereel (zie src/lib/generatoren/tegels.ts en de
## lessen in src/lib/lessen):
##   torens   lijst torens; elke toren: { "stukken": [3, 4], "basis": 7,
##            "gat": 9, "getal": true }
##              stukken  tegels op elkaar, van onder naar boven
##              basis    een grote tegel eronder die de stukken bedekken; wat
##                       er zichtbaar blijft, is het ontbrekende stuk
##              gat      een donker silhouet van zoveel hokjes, om te vullen
##              getal    het getal van de hele toren erboven tonen
##   bak      tegels om uit te kiezen, rechts (leeg = geen bak)
##   leg      op welke toren gekozen tegels komen (standaard de eerste)
##   kies     hoeveel tegels het kind mag leggen (standaard 1)
##   knoppen  bijvoorbeeld ["klopt", "klopt niet"]: woorden om uit te kiezen
## Het antwoord: bij kiezen de gekozen tegel(s) of knop; bij typen het getal.
##
## De oude standen blijven werken: samen, dubbel en maak.

const RUIM := 5.0
## Hoe groot één hokje is; hangt af van de hoogste toren, zodat alles zo groot
## mogelijk in beeld staat.
var VAK := 52.0

var torens: Array = []      # elk: {stukken, basis, gat, getal, extra}
var bak: Array = []
var knoppen: Array = []
var leg := 0
var max_kies := 1
var gekozen: Array = []     # gekozen tegels uit de bak, op volgorde
var gekozen_knop := ""
var _bakvakken: Array = []  # [Rect2, getal]
var _knopvakken: Array = [] # [Rect2, woord]
var _tel := {}              # na Controleer: "toren:hokje" -> getal
var _groen := -1            # na fout: in deze toren zijn de gekozen tegels groen
var _wiebel := 0.0
var _beurt := 0
var _te_zien := 999         # hoeveel hokjes al ingeploft zijn


func _voorbeeld() -> Dictionary:
	return {"torens": [{"basis": 7, "stukken": [3]}], "bak": [1, 2, 3, 4, 5, 6], "kies": 1}


func _demo() -> void:
	await wacht(1.2)
	_tik_bak(2)
	await wacht(0.6)
	_tik_bak(4)
	await wacht(1.0)
	_op_bericht({"type": "fase", "fase": "goed", "antwoord": "4"})


# ---------------------------------------------------------------------------
# Een nieuwe opgave
# ---------------------------------------------------------------------------

func _begin(o: Dictionary) -> void:
	_beurt += 1
	_tel = {}
	_groen = -1
	gekozen = []
	gekozen_knop = ""
	torens = []
	var stand := str(o.get("stand", ""))
	if o.has("torens"):
		for t in o.get("torens", []):
			torens.append(_toren(t))
		bak = o.get("bak", [])
		knoppen = o.get("knoppen", [])
		leg = int(o.get("leg", 0))
		max_kies = int(o.get("kies", 1))
	else:
		# de oude standen
		var a := int(o.get("a", 3))
		var b := int(o.get("b", a))
		knoppen = []
		leg = 0
		max_kies = 1
		if stand == "maak":
			torens.append(_toren({"stukken": [a], "gat": int(o.get("doel", 10))}))
			bak = [1, 2, 3, 4, 5, 6, 7, 8, 9]
		else:
			torens.append(_toren({"stukken": [a, b]}))
			bak = []
	var rijen := 1
	for t in torens:
		rijen = maxi(rijen, int(ceil(_hoogte(t) / 2.0)))
	VAK = clampf(410.0 / rijen - RUIM, 30.0, 60.0)
	_maak_vakken()
	$Maatje.rustig()
	# de tegels ploppen erin, hokje voor hokje
	var mijn := _beurt
	var hoogst := 0
	for t in torens:
		hoogst = maxi(hoogst, _hoogte(t))
	for i in range(hoogst + 1):
		if mijn != _beurt:
			return
		_te_zien = i
		if i > 0:
			$Geluid.plop(i % 8)
		queue_redraw()
		await wacht(0.045)
	_te_zien = 999
	queue_redraw()
	if fase == "bezig" and bak.is_empty() and knoppen.is_empty():
		klaar(true)


func _toren(t: Dictionary) -> Dictionary:
	var stukken: Array = []
	for n in t.get("stukken", []):
		stukken.append(int(n))
	return {
		"stukken": stukken,
		"basis": int(t.get("basis", 0)),
		"gat": int(t.get("gat", 0)),
		"getal": bool(t.get("getal", false)),
		"extra": [],
	}


## Alle tegels van een toren, van onder naar boven: [getal, is_extra].
func _alle(t: Dictionary) -> Array:
	var uit := []
	for s in t.stukken:
		uit.append([s, false])
	for s in t.extra:
		uit.append([s, true])
	return uit


func _som(t: Dictionary) -> int:
	var n := 0
	for s in _alle(t):
		n += s[0]
	return n


## Hoeveel hokjes een toren hoog is.
func _hoogte(t: Dictionary) -> int:
	return maxi(_som(t), maxi(t.basis, t.gat))


# ---------------------------------------------------------------------------
# De bak en de knoppen
# ---------------------------------------------------------------------------

func _maak_vakken() -> void:
	_bakvakken = []
	_knopvakken = []
	# de bak rechts: tegels in hun eigen vorm, klein, in twee kolommen
	var y := 14.0
	var kol := 0
	var rijhoogte := 0.0
	for n in bak:
		var rijen := int(ceil(int(n) / 2.0))
		var r := Rect2(Vector2(752.0 + kol * 96.0, y), Vector2(62.0, rijen * 24.0 + 14.0))
		_bakvakken.append([r, int(n)])
		rijhoogte = maxf(rijhoogte, r.size.y)
		kol += 1
		if kol == 2:
			kol = 0
			y += rijhoogte + 10.0
			rijhoogte = 0.0
	# de knoppen onderaan, in het midden
	var breed := 210.0
	for i in range(knoppen.size()):
		var x := _midden_x() - (knoppen.size() * (breed + 24.0) - 24.0) / 2.0 + i * (breed + 24.0)
		_knopvakken.append([Rect2(Vector2(x, 458), Vector2(breed, 68)), str(knoppen[i])])


func _midden_x() -> float:
	return 370.0 if not bak.is_empty() else 480.0


func _gui_input(event: InputEvent) -> void:
	if fase != "bezig":
		return
	if not (event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT):
		return
	for v in _bakvakken:
		if (v[0] as Rect2).grow(6).has_point(event.position):
			_tik_bak(v[1])
			accept_event()
			return
	for v in _knopvakken:
		if (v[0] as Rect2).has_point(event.position):
			gekozen_knop = v[1]
			$Geluid.plop(3)
			kies(gekozen_knop)
			queue_redraw()
			accept_event()
			return


func _tik_bak(n: int) -> void:
	var t: Dictionary = torens[leg]
	if n in gekozen:
		# nog een keer tikken: de tegel gaat terug in de bak
		gekozen.erase(n)
		t.extra.erase(n)
		$Geluid.plop(0)
	else:
		if gekozen.size() >= max_kies:
			if max_kies == 1:
				t.extra.erase(gekozen[0])
				gekozen.clear()
			else:
				_nee()
				return
		# past hij nog in het silhouet?
		if t.gat > 0 and _som(t) + n > t.gat:
			_nee()
			return
		gekozen.append(n)
		t.extra.append(n)
		$Geluid.klop()
	queue_redraw()
	var gesorteerd := gekozen.duplicate()
	gesorteerd.sort()
	var tekst := []
	for g in gesorteerd:
		tekst.append(str(g))
	kies(",".join(tekst))


func _nee() -> void:
	$Geluid.wiebel()
	_wiebel = 1.0
	create_tween().tween_property(self, "_wiebel", 0.0, 0.4)


# ---------------------------------------------------------------------------
# Na Controleer
# ---------------------------------------------------------------------------

func _goed(_antwoord: String) -> void:
	_beurt += 1
	_te_zien = 999
	await _tel_mee()
	$Geluid.tring()
	$Sterren.position = _hokje_rect(leg, maxi(0, _hoogte(torens[leg]) - 1)).get_center()
	$Sterren.restart()


func _fout(antwoord: String) -> void:
	_beurt += 1
	_te_zien = 999
	# bij kiezen uit de bak: de goede tegel(s) komen erop, in groen
	if not bak.is_empty() and antwoord != "":
		var t: Dictionary = torens[leg]
		t.extra = []
		for deel in antwoord.split(","):
			if deel.strip_edges().is_valid_int():
				t.extra.append(int(deel))
		_groen = leg
		queue_redraw()
		await wacht(0.4)
	await _tel_mee()


## Tel de toren waar het om gaat hokje voor hokje (bij bedekken: wat zichtbaar blijft).
func _tel_mee() -> void:
	var mijn := _beurt
	_tel = {}
	var t: Dictionary = torens[leg]
	var van := 0
	var tot := _hoogte(t)
	if t.basis > 0 and _som(t) < t.basis:
		van = _som(t)
		tot = t.basis
	var n := 0
	for i in range(van, tot):
		if mijn != _beurt:
			return
		n += 1
		_tel["%d:%d" % [leg, i]] = n
		$Geluid.tel(n)
		queue_redraw()
		await wacht(0.14)


# ---------------------------------------------------------------------------
# Tekenen
# ---------------------------------------------------------------------------

func _toren_x(ti: int) -> float:
	var stap := maxf(160.0, VAK * 2.0 + 90.0)
	return _midden_x() - (torens.size() - 1) * stap / 2.0 + ti * stap


func _hokje_rect(ti: int, k: int) -> Rect2:
	var rij := k / 2
	var kol := k % 2
	var x := _toren_x(ti) - VAK - RUIM / 2.0 + kol * (VAK + RUIM)
	var y := 446.0 - (rij + 1) * (VAK + RUIM)
	return Rect2(Vector2(x, y), Vector2(VAK, VAK))


## De kleur van hokje k: van de tegel waar het in valt, anders van de basis.
func _kleur_van(ti: int, t: Dictionary, k: int) -> Color:
	var n := 0
	for s in _alle(t):
		if k < n + s[0]:
			if s[1] and _groen == ti:
				return Teken.GOED
			return Teken.getalkleur(s[0])
		n += s[0]
	if t.basis > 0 and k < t.basis:
		return Teken.getalkleur(t.basis)
	return Color.TRANSPARENT


func _process(_delta: float) -> void:
	if _wiebel > 0.0:
		queue_redraw()


func _draw() -> void:
	# het legbord: een rooster met stippellijnen, even groot als de hokjes
	var stap := VAK + RUIM
	var nul := Vector2.ZERO
	if not torens.is_empty():
		nul = _hokje_rect(0, 0).position - Vector2(RUIM / 2.0, -VAK - RUIM / 2.0)
	var lijn := Color(1, 1, 1, 0.08)
	var links := _midden_x() - 330.0
	var rechts := _midden_x() + 330.0
	var x: float = nul.x - floor((nul.x - links) / stap) * stap
	while x <= rechts:
		_stippel(Vector2(x, 12), Vector2(x, nul.y), lijn)
		x += stap
	var y: float = nul.y
	while y >= 12.0:
		_stippel(Vector2(links, y), Vector2(rechts, y), lijn)
		y -= stap

	var schud := sin(_wiebel * 30.0) * 8.0 * _wiebel
	for ti in range(torens.size()):
		var t: Dictionary = torens[ti]
		var hoog := _hoogte(t)
		# het silhouet: lege hokjes met een lichte rand
		if t.gat > 0:
			for k in range(t.gat):
				var r := _hokje_rect(ti, k)
				r.position.x += schud if ti == leg else 0.0
				draw_rect(r, Color(0, 0, 0, 0.35))
				draw_rect(r, Color(Teken.ZACHT, 0.55), false, 2.0)
		for k in range(hoog):
			if k >= _te_zien:
				break
			var kleur := _kleur_van(ti, t, k)
			if kleur.a <= 0.0:
				continue
			var r := _hokje_rect(ti, k)
			r.position.x += schud if ti == leg else 0.0
			_teken_hokje(r, kleur)
			var tel: int = _tel.get("%d:%d" % [ti, k], 0)
			if tel > 0:
				Teken.tekst(self, r.get_center(), str(tel), 20, Teken.NACHT)
		# het getal boven de toren
		if t.getal and _te_zien >= hoog:
			var boven := _hokje_rect(ti, maxi(0, hoog - 1))
			Teken.tekst(self, Vector2(_toren_x(ti), boven.position.y - 26), str(maxi(_som(t), t.basis)), 34, Teken.WIT)

	for v in _bakvakken:
		_teken_bakstuk(v[0], v[1], v[1] in gekozen)

	for v in _knopvakken:
		var r: Rect2 = v[0]
		var aan: bool = gekozen_knop == v[1]
		Teken.vak(self, r, Teken.GEEL if aan else Teken.GLOED, Color(Teken.GEEL if aan else Teken.KNOP, 0.25 if aan else 0.18), 3.0, 18.0)
		Teken.tekst(self, r.get_center(), v[1], 30, Teken.WIT)


func _stippel(van: Vector2, naar: Vector2, kleur: Color) -> void:
	var lengte := van.distance_to(naar)
	var t := 0.0
	while t < lengte:
		draw_line(van.lerp(naar, t / lengte), van.lerp(naar, minf(t + 4.0, lengte) / lengte), kleur, 1.0)
		t += 9.0


## Eén insteekblokje: gekleurd, met een donker gaatje in het midden.
func _teken_hokje(r: Rect2, kleur: Color) -> void:
	draw_rect(r, kleur)
	draw_rect(Rect2(r.position, Vector2(r.size.x, 4)), Color(1, 1, 1, 0.25))
	draw_rect(Rect2(r.position + Vector2(0, r.size.y - 4), Vector2(r.size.x, 4)), Color(0, 0, 0, 0.18))
	draw_circle(r.get_center(), r.size.x * 0.17, Color(0.04, 0.08, 0.18, 0.85))


## Een tegel in de bak, in zijn eigen vorm (twee breed, van onder naar boven).
func _teken_bakstuk(r: Rect2, n: int, weg: bool) -> void:
	var kleur := Teken.getalkleur(n)
	if weg:
		kleur = Color(kleur, 0.22)
	var hokje := 22.0
	var onder := r.position + Vector2(8, r.size.y - 7)
	for k in range(n):
		var h := Rect2(onder + Vector2((k % 2) * (hokje + 2.0), -((k / 2) + 1) * (hokje + 2.0)), Vector2(hokje, hokje))
		draw_rect(h, kleur)
		draw_circle(h.get_center(), hokje * 0.17, Color(0.04, 0.08, 0.18, 0.2 if weg else 0.6))
	if weg:
		draw_rect(r, Color(1, 1, 1, 0.25), false, 1.5)
