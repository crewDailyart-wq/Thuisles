@tool
extends Node3D
## De houten kast: twee planken met elk 5 plekken, hoogstens 10 doosjes.
## Eerst vult de bovenste plank, dan de onderste. De doosjes hangen onder
## "Doosjes"; "Spook" is het doorzichtige doosje op de plek van het volgende.

const BREED := 5.6
const VAK := BREED / 5.0
const Y_BOVEN := 2.28
const Y_ONDER := 0.14
const PER_PLANK := 5

@export var volgende := 0:
	set(waarde):
		volgende = waarde
		_zet_spook()
@export var toon_volgende := true:
	set(waarde):
		toon_volgende = waarde
		_zet_spook()
## Geknipt na 5 doosjes: elke plank een eigen kleur, en een knip ertussen.
@export var geknipt := false:
	set(waarde):
		geknipt = waarde
		_kleur_planken()

var _spookmateriaal: StandardMaterial3D
var _tijd := 0.0


func _ready() -> void:
	_spookmateriaal = StandardMaterial3D.new()
	_spookmateriaal.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	_spookmateriaal.albedo_color = Color(1, 1, 1, 0.35)
	_spookmateriaal.emission_enabled = true
	_spookmateriaal.emission = Color("#f2bb2e")
	_spookmateriaal.emission_energy_multiplier = 0.25
	var vorm := BoxMesh.new()
	vorm.size = Vector3(0.82, 1.78, 0.6)
	vorm.material = _spookmateriaal
	$Spook.mesh = vorm
	_zet_spook()
	_kleur_planken()


func _process(delta: float) -> void:
	_tijd += delta
	if _spookmateriaal:
		_spookmateriaal.albedo_color.a = 0.22 + 0.14 * sin(_tijd * 3.0)


## Waar doosje i staat: het midden van zijn onderkant.
func plek(i: int) -> Vector3:
	var rij := i / PER_PLANK
	var kol := i % PER_PLANK
	return Vector3(-BREED / 2.0 + VAK * (kol + 0.5), Y_BOVEN if rij == 0 else Y_ONDER, 0.0)


func _zet_spook() -> void:
	if not is_inside_tree():
		return
	$Spook.visible = toon_volgende and volgende < PER_PLANK * 2
	if volgende < PER_PLANK * 2:
		$Spook.position = plek(volgende) + Vector3(0, 0.89, 0)


func _kleur_planken() -> void:
	if not is_inside_tree():
		return
	var boven: StandardMaterial3D = $Middenplank.mesh.material
	var onder: StandardMaterial3D = $Onderplank.mesh.material
	boven.albedo_color = Kleuren.LUCHT if geknipt else Kleuren.HOUT
	onder.albedo_color = Kleuren.ROZE if geknipt else Kleuren.HOUT
	$Knip.visible = geknipt
