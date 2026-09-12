/**
 * Het maatje van Thuisles: een eigen getekend vosje met rugzak.
 *
 * Volledig zelf opgebouwd uit SVG-vormen. Geen bestaand personage nagetekend
 * en geen externe illustratie. De vorm is bewust simpel gehouden, zodat het
 * figuurtje later makkelijk andere houdingen of gezichtsuitdrukkingen kan
 * krijgen zonder tekenwerk van buitenaf.
 */

function Vosje({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 152" className={className} aria-hidden="true">
      {/* staart, met lichte punt */}
      <path
        d="M34 132 C 8 126 2 96 20 84 C 26 102 36 116 50 122 Z"
        fill="#e8843c"
      />
      <path d="M20 84 C 12 90 10 100 13 108 C 20 104 24 96 24 90 Z" fill="#fdf2e2" />

      {/* rugzak achter het lijf */}
      <rect x={22} y={100} width={22} height={34} rx={9} fill="#46299f" />
      <rect x={96} y={100} width={22} height={34} rx={9} fill="#46299f" />

      {/* lijf */}
      <path
        d="M46 150 C 32 150 28 128 36 112 C 44 96 58 90 70 90 C 82 90 96 96 104 112 C 112 128 108 150 94 150 Z"
        fill="#e8843c"
      />
      {/* buik */}
      <path
        d="M70 104 C 82 104 90 116 90 128 C 90 142 82 150 70 150 C 58 150 50 142 50 128 C 50 116 58 104 70 104 Z"
        fill="#fdf2e2"
      />
      {/* schouderbanden van de rugzak */}
      <path d="M55 100 C 52 114 52 126 54 138 L62 138 C 60 124 60 112 63 100 Z" fill="#5b3fd6" />
      <path d="M85 100 C 88 114 88 126 86 138 L78 138 C 80 124 80 112 77 100 Z" fill="#5b3fd6" />

      {/* oren */}
      <path d="M41 48 L33 16 L61 33 Z" fill="#e8843c" />
      <path d="M99 48 L107 16 L79 33 Z" fill="#e8843c" />
      <path d="M44 44 L39 25 L56 35 Z" fill="#c9536f" />
      <path d="M96 44 L101 25 L84 35 Z" fill="#c9536f" />

      {/* kop */}
      <path
        d="M70 26 C 93 26 108 44 108 64 C 108 84 91 98 70 98 C 49 98 32 84 32 64 C 32 44 47 26 70 26 Z"
        fill="#e8843c"
      />
      {/* snuit */}
      <path
        d="M70 58 C 85 58 96 70 96 80 C 96 91 84 98 70 98 C 56 98 44 91 44 80 C 44 70 55 58 70 58 Z"
        fill="#fdf2e2"
      />

      {/* ogen */}
      <circle cx={57} cy={62} r={5.4} fill="#2c2545" />
      <circle cx={83} cy={62} r={5.4} fill="#2c2545" />
      <circle cx={58.8} cy={60} r={1.8} fill="#ffffff" />
      <circle cx={84.8} cy={60} r={1.8} fill="#ffffff" />

      {/* neus en mond */}
      <path d="M70 74 C 74 74 76 76.5 76 79 C 76 81.5 73.5 83 70 83 C 66.5 83 64 81.5 64 79 C 64 76.5 66 74 70 74 Z" fill="#2c2545" />
      <path
        d="M70 83 v4 M70 87 c -4 0 -6 -2 -7 -3.5 M70 87 c 4 0 6 -2 7 -3.5"
        stroke="#2c2545"
        strokeWidth={2}
        strokeLinecap="round"
        fill="none"
      />

      {/* wangetjes */}
      <ellipse cx={48} cy={76} rx={6} ry={4} fill="#f6b39a" opacity={0.75} />
      <ellipse cx={92} cy={76} rx={6} ry={4} fill="#f6b39a" opacity={0.75} />

      {/* pootjes */}
      <ellipse cx={54} cy={148} rx={11} ry={7} fill="#d9762f" />
      <ellipse cx={86} cy={148} rx={11} ry={7} fill="#d9762f" />
    </svg>
  );
}

export function Mascotte() {
  return (
    <section aria-label="Je maatje" className="mt-8 flex items-end gap-3">
      <Vosje className="h-28 w-auto shrink-0 drop-shadow-[0_10px_18px_rgba(44,37,69,0.18)] sm:h-32" />

      <div className="relative mb-4 min-w-0 max-w-[15rem] rounded-kaart rounded-bl-md border border-rand bg-kaart px-4 py-3 shadow-zacht sm:max-w-xs">
        {/* Puntje van de tekstballon, wijzend naar het vosje. */}
        <span
          aria-hidden="true"
          className="absolute -left-1.5 bottom-3 size-3 rotate-45 border-b border-l border-rand bg-kaart"
        />
        <p className="text-sm font-extrabold leading-snug">
          Zullen we samen iets nieuws leren?
        </p>
        <p className="mt-0.5 text-xs font-semibold text-inkt-zacht">
          Vos loopt met je mee tijdens het oefenen.
        </p>
      </div>
    </section>
  );
}
