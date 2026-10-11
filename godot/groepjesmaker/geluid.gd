extends Node
## Korte geluidjes, door Godot zelf gemaakt (geen bestanden nodig, dus geen
## extra download). Thuisles zegt via de brug of het geluid aan of uit staat.

const RATE := 22050

var aan := true
var _spelers: Array[AudioStreamPlayer] = []
var _plop: Array[AudioStreamWAV] = []
var _klop: AudioStreamWAV
var _tring: AudioStreamWAV
var _tel: Array[AudioStreamWAV] = []
var _wiebel: AudioStreamWAV


func _ready() -> void:
	for i in range(6):
		var s := AudioStreamPlayer.new()
		s.volume_db = -8.0
		add_child(s)
		_spelers.append(s)
	for i in range(10):
		_plop.append(_toon([[620.0 + i * 40.0, 360.0 + i * 25.0]], 0.08, 0.5))
	_klop = _toon([[190.0, 120.0]], 0.09, 0.8, true)
	_tring = _toon([[880.0, 880.0], [1320.0, 1320.0]], 0.45, 0.35)
	for i in range(10):
		var f: float = 523.25 * pow(2.0, [0, 2, 4, 5, 7, 9, 11, 12, 14, 16][i] / 12.0)
		_tel.append(_toon([[f, f]], 0.16, 0.4))
	_wiebel = _toon([[220.0, 200.0]], 0.18, 0.4)


## Maakt een geluidje: per toon [beginfrequentie, eindfrequentie].
func _toon(tonen: Array, duur: float, sterk: float, ruis := false) -> AudioStreamWAV:
	var n := int(RATE * duur)
	var data := PackedByteArray()
	data.resize(n * 2)
	var fase := []
	for t in tonen:
		fase.append(0.0)
	for i in range(n):
		var t := float(i) / n
		var omhulsel: float = min(1.0, t * 40.0) * pow(1.0 - t, 2.0)
		var v := 0.0
		for j in range(tonen.size()):
			var f: float = lerp(float(tonen[j][0]), float(tonen[j][1]), t)
			fase[j] += TAU * f / RATE
			v += sin(fase[j])
		v /= tonen.size()
		if ruis:
			v = v * 0.7 + randf_range(-0.3, 0.3) * (1.0 - t)
		var s := int(clampf(v * omhulsel * sterk, -1.0, 1.0) * 32767.0)
		data.encode_s16(i * 2, s)
	var w := AudioStreamWAV.new()
	w.format = AudioStreamWAV.FORMAT_16_BITS
	w.mix_rate = RATE
	w.stereo = false
	w.data = data
	return w


func _speel(w: AudioStreamWAV) -> void:
	if not aan:
		return
	for s in _spelers:
		if not s.playing:
			s.stream = w
			s.play()
			return
	_spelers[0].stream = w
	_spelers[0].play()


func plop(i: int) -> void:
	_speel(_plop[clamp(i, 0, 9)])


func klop() -> void:
	_speel(_klop)


func tring() -> void:
	_speel(_tring)


func tel(i: int) -> void:
	_speel(_tel[clamp(i, 0, 9)])


func wiebel() -> void:
	_speel(_wiebel)
