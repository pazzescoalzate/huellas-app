/* HUELLA — Patch: insignia visual de un sello
   Dibuja la forma, color e ícono del sello según sus campos:
     b.shape  → hex | shield | plaque | seal
     b.tone   → terracota | azul | salvia | arena
     b.icono  → nombre del ícono (en Icon.jsx)
     b.label  → nombre corto que aparece dentro de la forma
     b.desc   → descripción corta debajo de la forma
     b.got    → true = obtenido (a color) | false = bloqueado (gris, punteado)
     b.date   → fecha de obtención (se muestra si got=true)
   El parámetro w controla el ancho en px (default 150). */

import Icon from "./Icon.jsx";

const PATCH_TONES = {
  terracota: "#D2734F",
  azul:      "#6E92C4",
  salvia:    "#8AA590",
  arena:     "#D9C2A3",
};

const PATCH_SHAPES = {
  hex:    "M75 7 L129 35 L129 81 L75 109 L21 81 L21 35 Z",
  plaque: "M9 58 L36 15 L114 15 L141 58 L114 101 L36 101 Z",
  seal:   "M75 8 A50 50 0 1 1 74.9 8 Z",
  shield: "M75 9 L127 27 L127 62 C127 86 104 102 75 109 C46 102 23 86 23 62 L23 27 Z",
};

export default function Patch({ b, w = 150 }) {
  const locked = !b.got;
  const tone   = locked ? "#7A8088" : (PATCH_TONES[b.tone] || PATCH_TONES.terracota);
  const h      = Math.round(w * 0.773);
  return (
    <div className="shrink-0 flex flex-col items-center" style={{ width: w + 8, opacity: locked ? 0.62 : 1 }}>
      <div className="relative" style={{ width: w, height: h }}>
        <svg viewBox="0 0 150 116" className="absolute inset-0 w-full h-full">
          <path d={PATCH_SHAPES[b.shape] || PATCH_SHAPES.hex} fill={tone} fillOpacity="0.06"
            stroke={tone} strokeWidth="3.5" strokeLinejoin="round" strokeDasharray={locked ? "7 5" : "none"} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[5px] pt-0.5">
          <div className="text-center" style={{ fontWeight: 600, fontSize: Math.max(12, Math.round(w * 0.092)), color: tone, letterSpacing: "-0.01em", maxWidth: "64%", lineHeight: 1.12 }}>{b.label}</div>
          <Icon name={locked ? "lock" : (b.icono || b.icon)} size={Math.round(w * 0.19)} color={tone} stroke={1.7} />
        </div>
        {!locked && (<>
          <span className="absolute top-1/2 -translate-y-1/2 text-[9.5px] font-semibold opacity-85" style={{ left: b.shape === "plaque" ? 22 : 30, color: tone }}>HU</span>
          <span className="absolute top-1/2 -translate-y-1/2 opacity-85 grid" style={{ right: b.shape === "plaque" ? 22 : 30 }}>
            <Icon name="pin" size={11} color={tone} stroke={2} />
          </span>
        </>)}
      </div>
      <div className="text-center mt-[9px]">
        <div className="text-[12.5px] font-medium text-ink">{b.desc}</div>
        <div className="text-[11px] font-light text-ink-faint mt-px">{locked ? "Por conseguir" : b.date}</div>
      </div>
    </div>
  );
}
