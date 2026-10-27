extends Node2D
## Drie gloeiende parels op een donkere achtergrond die je met muis of vinger
## kunt slepen (27 oktober 2026). De gloed is de ingebouwde glow van Godot
## (WorldEnvironment met glow aan, 2D), net als het Glow-filter bij Phaser.

const KLEUREN := [Color("7fe9ff"), Color("ffd36e"), Color("ff8ad8")]
const PLEKKEN := [Vector2(0.3, 0.45), Vector2(0.5, 0.6), Vector2(0.7, 0.45)]
const STRAAL := 34.0

var parels: Array[Sprite2D] = []
var gesleept: Sprite2D = null
var verschuiving := Vector2.ZERO

func _ready() -> void:
	# Even groot als bij Phaser: op een telefoon met een scherp scherm (2x) alles 2x zo groot tekenen.
	get_window().content_scale_factor = DisplayServer.screen_get_scale()
	# De ingebouwde gloed: alles wat feller is dan de drempel straalt licht uit.
	var omgeving := Environment.new()
	omgeving.background_mode = Environment.BG_CANVAS
	omgeving.glow_enabled = true
	omgeving.background_canvas_max_layer = 0
	omgeving.glow_intensity = 4.0
	omgeving.glow_strength = 1.6
	omgeving.glow_bloom = 0.0
	omgeving.glow_hdr_threshold = 0.35
	omgeving.glow_hdr_scale = 4.0
	omgeving.glow_blend_mode = Environment.GLOW_BLEND_MODE_ADDITIVE
	for i in range(7):
		omgeving.set_glow_level(i, 1.0 if i >= 2 else 0.0)
	var wereld := WorldEnvironment.new()
	wereld.environment = omgeving
	add_child(wereld)

	var plaatje := _parel_plaatje()
	var krans := _krans_plaatje()
	var maat := get_viewport_rect().size
	for i in range(3):
		var p := Sprite2D.new()
		p.texture = plaatje
		p.modulate = KLEUREN[i]
		p.position = Vector2(maat.x * PLEKKEN[i].x, maat.y * PLEKKEN[i].y)
		# De lichtkrans achter de parel: in de browser (Compatibility) is de
		# ingebouwde gloed hierboven maar zwak, dus een zachte krans erbij die
		# licht optelt (additief), met Godots eigen GradientTexture2D.
		var k := Sprite2D.new()
		k.texture = krans
		k.show_behind_parent = true
		var mat := CanvasItemMaterial.new()
		mat.blend_mode = CanvasItemMaterial.BLEND_MODE_ADD
		k.material = mat
		p.add_child(k)
		add_child(p)
		parels.append(p)

	get_viewport().size_changed.connect(_herschik)
	# Voor de meting in de browser: het eerste beeld staat er.
	if OS.has_feature("web"):
		await get_tree().process_frame
		JavaScriptBridge.eval("window.__godot = { eersteBeeld: performance.now() }; window.parent && window.parent.postMessage({ godotParels: performance.now(), versie: '%s' }, '*');" % Engine.get_version_info().string.split("-stable")[0])

## Eén parel-plaatje: van een grijze rand naar een wit midden (iets naar linksboven), met een lichtje.
func _parel_plaatje() -> ImageTexture:
	var d := int(STRAAL * 2)
	var beeld := Image.create(d, d, false, Image.FORMAT_RGBA8)
	var midden := Vector2(STRAAL, STRAAL)
	var licht := midden - Vector2(STRAAL, STRAAL) * 0.3
	for y in range(d):
		for x in range(d):
			var p := Vector2(x + 0.5, y + 0.5)
			var r := p.distance_to(midden)
			if r > STRAAL:
				continue
			var t := clampf(p.distance_to(licht) / (STRAAL * 1.25), 0.0, 1.0)
			var grijs := (165.0 + 90.0 * (1.0 - t * t)) / 255.0
			var a := clampf(STRAAL - r, 0.0, 1.0)
			if p.distance_to(Vector2(STRAAL * 0.66, STRAAL * 0.62)) < STRAAL * 0.16:
				grijs = 1.0
			beeld.set_pixel(x, y, Color(grijs, grijs, grijs, a))
	return ImageTexture.create_from_image(beeld)

## Een zachte, ronde lichtkrans (wit, van fel naar doorzichtig), ingekleurd door de parel.
func _krans_plaatje() -> GradientTexture2D:
	var verloop := Gradient.new()
	verloop.offsets = PackedFloat32Array([0.0, 0.42, 0.6, 1.0])
	verloop.colors = PackedColorArray([Color(1, 1, 1, 0.9), Color(1, 1, 1, 0.75), Color(1, 1, 1, 0.25), Color(1, 1, 1, 0)])
	var t := GradientTexture2D.new()
	t.gradient = verloop
	t.fill = GradientTexture2D.FILL_RADIAL
	t.fill_from = Vector2(0.5, 0.5)
	t.fill_to = Vector2(1.0, 0.5)
	t.width = int(STRAAL * 4)
	t.height = int(STRAAL * 4)
	return t

func _herschik() -> void:
	pass

func _unhandled_input(event: InputEvent) -> void:
	if event is InputEventMouseButton and event.button_index == MOUSE_BUTTON_LEFT:
		if event.pressed:
			for i in range(parels.size() - 1, -1, -1):
				var p := parels[i]
				if p.position.distance_to(event.position) <= STRAAL * 1.1:
					gesleept = p
					verschuiving = p.position - event.position
					p.scale = Vector2(1.12, 1.12)
					break
		elif gesleept:
			gesleept.scale = Vector2.ONE
			gesleept = null
	elif event is InputEventMouseMotion and gesleept:
		gesleept.position = event.position + verschuiving
