extends Control
## De groepjesmaker (Tafels, groep 4): de spelregels.
##
## Alles staat als losse scènes in deze map: de kast (kast.tscn), een doosje
## (doosje.tscn), een eikel (eikel.tscn) en het maatje (maatje.tscn). Effen
## achtergrond, alleen de kast in beeld. Dit script laat alles samenspelen.
##
## Het kind kiest met − en + hoeveel eikels er in één doosje gaan (1 tot en met
## 10) en tikt op de kast: er valt een doosje op de plank en de eikels ploppen
## erin. Hoogstens 10 doosjes. Het ×-knopje op het laatste doosje haalt dat
## doosje weg; Opnieuw maakt de kast leeg. Bovenaan groeit de
## plussom mee: 3 → 3 + 3 → 3 + 3 + 3. Klopt de bouw, dan krimpt de plussom
## tot 3 × 3.
##
## Afspraak: 4 × 3 = 4 doosjes van 3. Andersom gebouwd (3 doosjes van 4) is niet
## fout: het maatje zegt dat het evenveel is.
##
## Standen (komen van Thuisles): groepjes, nul-een (0 × 4: geen enkel doosje),
## wissel (eerst voorspellen, dan draaien) en knip (7 × 8: knippen na 5 doosjes).
##
## Godot kijkt niets na. Thuisles kijkt het antwoord na en zegt via de brug
## (brug.gd) wanneer het goed was (dan springen de doosjes en tellen mee: 3, 6,
## 9, 12) of fout (dan bouwt de kast zelf rustig de goede manier).
##
## Er is geen klok, er zijn geen levens, en goed of fout komt pas na Controleer.

const DOOSJE := preload("res://groepjesmaker/doosje.tscn")
const MAX_PER := 10
const MAX_DOOSJES := 10
const PER_PLANK := 5

@onready var kast: Node2D = $Kast
@onready var maatje: Node2D = $Maatje
@onready var geluid: Node = $Geluid
@onready var ui: Control = self
@onready var som: Label = $Som

var a := 4
var b := 3
var stand := "groepjes"
var eerste_keer := true

var per := 1
var doosjes: Array = []          # de doosje-knooppunten, op volgorde
var fase := "wacht"              # wacht, bezig, gebouwd, goed, toon
var gekrompen := false
var geknipt := false
var gedraaid := false
var vraag_open := false
var bezig_met_animatie := false
var gezegd := {}
var _te_zeggen: Array = []


func _ready() -> void:
	ui.get_node("Plus").pressed.connect(func(): _knop("plus"))
	ui.get_node("Min").pressed.connect(func(): _knop("min"))
	ui.get_node("Opnieuw").pressed.connect(func(): _knop("leeg"))
	$Weg.pressed.connect(func(): _knop("weg"))
	ui.get_node("Knip").pressed.connect(func(): _knop("knip"))
	ui.get_node("Vraag/Ja").pressed.connect(func(): _knop("ja"))
	ui.get_node("Vraag/Nee").pressed.connect(func(): _knop("nee"))
	ui.get_node("Tikvlak").gui_input.connect(_tik_op_kast)
	if Stijl.synthesis:
		_kleur_synthesis()
	Brug.bericht.connect(_op_bericht)
	_ververs()
	if not OS.has_feature("web"):
		# Los gestart in de Godot-app: een voorbeeldsom, zodat je kunt spelen.
		_op_bericht({"type": "opgave", "a": 4, "b": 3, "stand": "groepjes", "eersteKeer": true})
		if "--demo" in OS.get_cmdline_user_args():
			_demo()


## Alleen om te testen (godot -- --demo): bouwt 4 × 3 en doet dan "goed".
func _demo() -> void:
	await get_tree().create_timer(0.5).timeout
	for i in range(2):
		_knop("plus")
		await get_tree().create_timer(0.2).timeout
	for i in range(5):
		_zet_doosje(per)
		_na_wijziging()
		await get_tree().create_timer(0.7).timeout
	await get_tree().create_timer(1.0).timeout
	_knop("weg")
	await get_tree().create_timer(1.5).timeout
	_goed()


# ---------------------------------------------------------------------------
# Berichten van Thuisles
# ---------------------------------------------------------------------------

func _op_bericht(d: Dictionary) -> void:
	match str(d.get("type", "")):
		"opgave":
			a = int(d.get("a", 4))
			b = int(d.get("b", 3))
			stand = str(d.get("stand", "groepjes"))
			eerste_keer = bool(d.get("eersteKeer", false))
			_begin()
		"fase":
			match str(d.get("fase", "")):
				"goed":
					_goed()
				"fout":
					_toon()
		"geluid":
			geluid.aan = bool(d.get("aan", true))


func _begin() -> void:
	for d in doosjes:
		d.queue_free()
	doosjes.clear()
	per = 1
	fase = "bezig"
	gekrompen = false
	geknipt = false
	gedraaid = false
	vraag_open = false
	bezig_met_animatie = false
	gezegd = {}
	kast.geknipt = false
	kast.scale = Vector2.ONE
	kast.position = Vector2(160, 70)
	ui.get_node("Vraag").visible = false
	ui.get_node("Knip").visible = false
	som.text = ""
	som.modulate = Color.WHITE
	som.label_settings.font_color = Stijl.WIT if Stijl.synthesis else Kleuren.INKT
	maatje.rustig()
	_ververs()
	_meld_bouw()


# ---------------------------------------------------------------------------
# Tikken en knoppen
# ---------------------------------------------------------------------------

func _mag_bouwen() -> bool:
	return (fase == "bezig" or fase == "gebouwd") and not vraag_open and not geknipt and not bezig_met_animatie


func _tik_op_kast(event: InputEvent) -> void:
	if not (event is InputEventMouseButton and event.pressed and event.button_index == MOUSE_BUTTON_LEFT):
		return
	if not _mag_bouwen():
		return
	if doosjes.size() >= MAX_DOOSJES:
		_wiebel_kast()
		return
	_zet_doosje(per)
	_na_wijziging()


func _knop(naam: String) -> void:
	var knop: Control = {"plus": ui.get_node("Plus"), "min": ui.get_node("Min"), "leeg": ui.get_node("Opnieuw"), "weg": $Weg, "knip": ui.get_node("Knip"), "ja": ui.get_node("Vraag/Ja"), "nee": ui.get_node("Vraag/Nee")}[naam]
	_indruk(knop)
	match naam:
		"plus":
			if _mag_bouwen() and per < MAX_PER:
				per += 1
				_tel_getal_op()
				_na_wijziging()
		"min":
			if _mag_bouwen() and per > 1:
				per -= 1
				_tel_getal_op()
				_na_wijziging()
		"leeg":
			if _mag_bouwen() and doosjes.size() > 0:
				_maak_leeg()
				_na_wijziging()
		"weg":
			if _mag_bouwen() and doosjes.size() > 0:
				_haal_weg(doosjes.pop_back())
				_ververs()
				_na_wijziging()
		"ja", "nee":
			if vraag_open:
				vraag_open = false
				ui.get_node("Vraag").visible = false
				Brug.stuur({"type": "voorspelling", "keuze": naam})
				_draai(naam)
		"knip":
			if not geknipt and fase == "bezig":
				_knip()


func _indruk(knop: Control) -> void:
	knop.pivot_offset = knop.size / 2.0
	var t := create_tween()
	t.tween_property(knop, "scale", Vector2(0.88, 0.88), 0.06)
	t.tween_property(knop, "scale", Vector2.ONE, 0.18).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)


func _tel_getal_op() -> void:
	var getal: Label = ui.get_node("Aantal/Getal")
	_toon_per()
	geluid.plop(per - 1)
	var t := create_tween()
	t.tween_property(getal, "scale", Vector2(1.35, 1.35), 0.07)
	t.tween_property(getal, "scale", Vector2.ONE, 0.2).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)


# ---------------------------------------------------------------------------
# Doosjes
# ---------------------------------------------------------------------------

## Een doosje valt met een stuiter op zijn plek, daarna ploppen de eikels erin.
func _zet_doosje(inhoud: int) -> Node2D:
	var i := doosjes.size()
	var d: Node2D = DOOSJE.instantiate()
	d.inhoud = inhoud
	var doel: Vector2 = kast.plek(i)
	if geknipt and i >= PER_PLANK:
		doel.y += 8
	d.position = doel - Vector2(0, 360)
	kast.get_node("Doosjes").add_child(d)
	doosjes.append(d)
	var t := create_tween()
	t.tween_property(d, "position", doel, 0.45).set_trans(Tween.TRANS_BOUNCE).set_ease(Tween.EASE_OUT)
	t.tween_callback(func(): geluid.klop())
	t.tween_callback(func(): d.vul(geluid))
	_ververs()
	return d


func _maak_leeg() -> void:
	for d in doosjes:
		_haal_weg(d)
	doosjes.clear()
	_ververs()


## Eén doosje vliegt omhoog de kast uit.
func _haal_weg(d: Node2D) -> void:
	geluid.wiebel()
	var t: Tween = d.create_tween().set_parallel()
	t.tween_property(d, "position:y", d.position.y - 80, 0.3).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_IN)
	t.tween_property(d, "modulate:a", 0.0, 0.3)
	t.chain().tween_callback(d.queue_free)


func _wiebel_kast() -> void:
	geluid.wiebel()
	var x := kast.position.x
	var t := create_tween()
	for i in range(4):
		t.tween_property(kast, "position:x", x + (8 if i % 2 == 0 else -8), 0.05)
	t.tween_property(kast, "position:x", x, 0.05)


# ---------------------------------------------------------------------------
# De bouw nakijken (alleen of hij af is; het antwoord kijkt Thuisles na)
# ---------------------------------------------------------------------------

func _gelijk() -> bool:
	for d in doosjes:
		if d.inhoud != doosjes[0].inhoud:
			return false
	return true


## "" = nog niet af, "recht" = a doosjes van b, "andersom" = b doosjes van a.
func _staat() -> String:
	var n := doosjes.size()
	if a == 0:
		return "recht" if n == 0 and per == b else ""
	if n == 0 or not _gelijk():
		return ""
	var k: int = doosjes[0].inhoud
	if n == a and k == b:
		return "recht"
	if n == b and k == a and a != b:
		return "andersom"
	return ""


func _zeg(sleutel: String) -> void:
	if gezegd.has(sleutel):
		return
	gezegd[sleutel] = true
	_te_zeggen.append(sleutel)


func _stuur_zinnen() -> void:
	if _te_zeggen.is_empty():
		return
	Brug.stuur({"type": "zeg", "sleutels": _te_zeggen, "a": a, "b": b})
	_te_zeggen = []


func _na_wijziging() -> void:
	var st := _staat()
	if st == "":
		if fase == "gebouwd":
			fase = "bezig"
			Brug.stuur({"type": "gebouwd", "klaar": false})
		gekrompen = false
		_toon_plussom()
		_hints()
	elif stand == "knip" and st == "recht" and a > PER_PLANK and not geknipt:
		_toon_plussom()
		ui.get_node("Knip").visible = true
		_pop_in(ui.get_node("Knip"))
		maatje.wijs()
		_zeg("knippen")
	elif stand == "wissel" and not gedraaid and a > 0:
		_toon_plussom()
		vraag_open = true
		ui.get_node("Vraag").visible = true
		_pop_in(ui.get_node("Vraag"))
		maatje.denk()
		_zeg("voorspellen")
	else:
		_af(st)
	_ververs()
	_meld_bouw()
	_stuur_zinnen()


func _af(st: String) -> void:
	if fase == "gebouwd":
		return
	fase = "gebouwd"
	if eerste_keer and a > 1 and doosjes.size() > 1:
		_zeg("krimpen")
	if st == "andersom":
		_zeg("andersom")
	_zeg("gebouwd")
	_krimp(_keersom(st == "andersom"), 1.4 if eerste_keer else 0.5)
	Brug.stuur({"type": "gebouwd", "klaar": true, "andersom": st == "andersom"})


func _hints() -> void:
	var n := doosjes.size()
	if a == 0:
		if n > 0:
			_zeg("nul")
			maatje.wijs()
		return
	if n >= 2 and not _gelijk():
		_zeg("ongelijk")
		maatje.wijs()
	elif n > max(a, b):
		_zeg("teveel")
		maatje.wijs()
	elif n == a and _gelijk() and doosjes[0].inhoud != b:
		_zeg("per")
		maatje.wijs()


func _meld_bouw() -> void:
	var inhoud := []
	for d in doosjes:
		inhoud.append(d.inhoud)
	Brug.stuur({"type": "bouw", "per": per, "doosjes": inhoud, "som": _plussom()})


# ---------------------------------------------------------------------------
# De som bovenaan
# ---------------------------------------------------------------------------

func _plussom() -> String:
	var delen := []
	for d in doosjes:
		delen.append(str(d.inhoud))
	return " + ".join(delen)


func _keersom(andersom := false) -> String:
	if geknipt:
		return "%d × %d + %d × %d" % [PER_PLANK, b, a - PER_PLANK, b]
	if andersom:
		return "%d × %d" % [b, a]
	return "%d × %d" % [a, b]


## Zet de tekst bovenaan; lange plussommen (tien keer 10) passen er altijd op.
func _past(tekst: String) -> void:
	som.text = tekst
	var maat := 42
	var font := ThemeDB.fallback_font
	while maat > 18 and font.get_string_size(tekst, HORIZONTAL_ALIGNMENT_LEFT, -1, maat).x > som.size.x - 10:
		maat -= 2
	som.label_settings.font_size = maat


func _toon_plussom() -> void:
	var nieuw := _plussom()
	if nieuw == som.text:
		return
	_past(nieuw)
	som.modulate.a = 1.0
	som.label_settings.font_color = Stijl.WIT if Stijl.synthesis else Kleuren.INKT
	if nieuw != "":
		var t := create_tween()
		t.tween_property(som, "scale", Vector2(1.12, 1.12), 0.08)
		t.tween_property(som, "scale", Vector2.ONE, 0.2).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)


## De plussom krimpt tot de keersom, met sterretjes.
func _krimp(keer: String, duur: float) -> void:
	gekrompen = true
	var t := create_tween()
	if som.text != "":
		t.tween_property(som, "scale", Vector2(0.4, 0.4), duur * 0.5).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_IN)
		t.parallel().tween_property(som, "modulate:a", 0.0, duur * 0.5)
	t.tween_callback(func():
		_past(keer)
		som.scale = Vector2(1.4, 1.4)
		geluid.tring()
		ui.get_node("Sterren").restart())
	t.tween_property(som, "modulate:a", 1.0, duur * 0.3)
	t.parallel().tween_property(som, "scale", Vector2.ONE, duur * 0.5).set_trans(Tween.TRANS_ELASTIC).set_ease(Tween.EASE_OUT)


# ---------------------------------------------------------------------------
# Wisselen en knippen
# ---------------------------------------------------------------------------

func _draai(voorspelling: String) -> void:
	bezig_met_animatie = true
	_ververs()
	var t := create_tween()
	# de kast draait om (smal worden, wisselen, weer breed)
	t.tween_property(kast, "scale:x", 0.0, 0.3).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	t.parallel().tween_property(kast, "position:x", 160.0 + 215.0, 0.3).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)
	t.tween_callback(_wissel_om)
	t.tween_property(kast, "scale:x", 1.0, 0.4).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	t.parallel().tween_property(kast, "position:x", 160.0, 0.4).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)
	t.tween_callback(func():
		bezig_met_animatie = false
		gedraaid = true
		_zeg("toch_evenveel" if voorspelling == "nee" else "evenveel")
		maatje.lach()
		_af("recht" if doosjes.size() == a else "andersom")
		_ververs()
		_meld_bouw()
		_stuur_zinnen())


## Halverwege het draaien: 4 doosjes van 3 worden 3 doosjes van 4.
func _wissel_om() -> void:
	var n := doosjes.size()
	var k: int = doosjes[0].inhoud
	for d in doosjes:
		d.queue_free()
	doosjes.clear()
	for i in range(k):
		var d: Node2D = DOOSJE.instantiate()
		d.inhoud = n
		d.position = kast.plek(i)
		kast.get_node("Doosjes").add_child(d)
		d.toon_meteen()
		doosjes.append(d)
	per = n


func _knip() -> void:
	geknipt = true
	kast.geknipt = true
	ui.get_node("Knip").visible = false
	geluid.klop()
	for i in range(PER_PLANK, doosjes.size()):
		var d: Node2D = doosjes[i]
		create_tween().tween_property(d, "position:y", kast.plek(i).y + 8, 0.25).set_trans(Tween.TRANS_BACK)
	_zeg("geknipt")
	maatje.lach()
	_af("recht")
	_ververs()
	_meld_bouw()
	_stuur_zinnen()


func _pop_in(ding: Control) -> void:
	ding.scale = Vector2(0.6, 0.6)
	ding.pivot_offset = ding.size / 2.0
	create_tween().tween_property(ding, "scale", Vector2.ONE, 0.3).set_trans(Tween.TRANS_BACK).set_ease(Tween.EASE_OUT)


# ---------------------------------------------------------------------------
# Goed en fout (komt van Thuisles, na Controleer)
# ---------------------------------------------------------------------------

func _goed() -> void:
	fase = "goed"
	_ververs()
	maatje.lach()
	await _tel_mee()
	_klaar_som()


func _toon() -> void:
	## Fout: de kast bouwt zelf rustig de goede manier, a doosjes van b.
	fase = "toon"
	geknipt = false
	kast.geknipt = false
	ui.get_node("Knip").visible = false
	ui.get_node("Vraag").visible = false
	vraag_open = false
	for d in doosjes:
		d.queue_free()
	doosjes.clear()
	per = b
	som.text = ""
	_ververs()
	maatje.wijs()
	for i in range(a):
		await get_tree().create_timer(0.5).timeout
		_zet_doosje(b)
		_toon_plussom()
	await get_tree().create_timer(0.8).timeout
	if a > 0:
		_krimp(_keersom(), 0.6)
		await get_tree().create_timer(0.7).timeout
	await _tel_mee()
	_klaar_som()


func _tel_mee() -> void:
	for i in range(doosjes.size()):
		await get_tree().create_timer(0.45).timeout
		var d: Node2D = doosjes[i]
		d.tel((i + 1) * int(d.inhoud))
		geluid.tel(i)


func _klaar_som() -> void:
	_past(_keersom() + " = %d" % (a * b))
	som.label_settings.font_color = Kleuren.GROEN
	som.modulate.a = 1.0
	ui.get_node("Sterren").restart()
	geluid.tring()


# ---------------------------------------------------------------------------
# Wat er aan of uit staat
# ---------------------------------------------------------------------------

func _ververs() -> void:
	var bouwen := _mag_bouwen()
	ui.get_node("Plus").disabled = not (bouwen and per < MAX_PER)
	ui.get_node("Min").disabled = not (bouwen and per > 1)
	ui.get_node("Opnieuw").disabled = not (bouwen and doosjes.size() > 0)
	_toon_per()
	kast.volgende = doosjes.size()
	# het ×-knopje op de rechterbovenhoek van het laatste doosje
	var weg: Button = $Weg
	weg.visible = bouwen and doosjes.size() > 0
	if weg.visible:
		var hoek: Vector2 = kast.position + kast.plek(doosjes.size() - 1) + Vector2(37, -172)
		weg.position = hoek - Vector2(30, 18)
	kast.toon_volgende = bouwen and fase == "bezig" and doosjes.size() < MAX_DOOSJES


func _toon_per() -> void:
	ui.get_node("Aantal/Getal").text = str(per)



## Synthesis-stijl: donkerblauw, witte cijfers, felle knoppen met gloed.
func _kleur_synthesis() -> void:
	som.label_settings.font_color = Stijl.WIT
	$InEenDoosje.label_settings = $InEenDoosje.label_settings.duplicate()
	$InEenDoosje.label_settings.font_color = Stijl.ZACHT
	var knop := StyleBoxFlat.new()
	knop.bg_color = Stijl.KNOP
	knop.set_corner_radius_all(20)
	knop.shadow_color = Color(Stijl.KNOP, 0.45)
	knop.shadow_size = 10
	var in_ := knop.duplicate()
	in_.bg_color = Stijl.KNOP_DIEP
	var uit := knop.duplicate()
	uit.bg_color = Color(Stijl.KNOP, 0.3)
	uit.shadow_size = 0
	for naam in ["Plus", "Min", "Opnieuw", "Knip", "Vraag/Ja", "Vraag/Nee", "Weg"]:
		var b: Button = get_node(naam)
		b.add_theme_stylebox_override("normal", knop)
		b.add_theme_stylebox_override("hover", knop)
		b.add_theme_stylebox_override("pressed", in_)
		b.add_theme_stylebox_override("disabled", uit)
	var vak := StyleBoxFlat.new()
	vak.bg_color = Stijl.NACHT_OP
	vak.border_color = Stijl.GLOED
	vak.set_border_width_all(2)
	vak.set_corner_radius_all(14)
	$Aantal.add_theme_stylebox_override("panel", vak)
	$Aantal/Getal.label_settings = $Aantal/Getal.label_settings.duplicate()
	$Aantal/Getal.label_settings.font_color = Stijl.WIT
	var paneel := StyleBoxFlat.new()
	paneel.bg_color = Stijl.NACHT_OP
	paneel.border_color = Stijl.GLOED
	paneel.set_border_width_all(2)
	paneel.set_corner_radius_all(18)
	$Vraag.add_theme_stylebox_override("panel", paneel)
	$Vraag/Tekst.label_settings = $Vraag/Tekst.label_settings.duplicate()
	$Vraag/Tekst.label_settings.font_color = Stijl.WIT
	$Sterren.color = Stijl.GLOED
