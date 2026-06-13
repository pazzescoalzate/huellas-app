/* HUELLA — variantes de tarjeta de experiencia (usadas por las direcciones de Home) */
import { useRef, useState } from "react";
import Icon from "./Icon.jsx";
// PhotoSlot solo se usa en el avatar del perfil; las imágenes de lugares son solo visuales
import { CAT } from "../data/huella.js";
import { CatSurface, MatchRing, MetaRow } from "./Shared.jsx";

/* clickable card wrapper */
function CardTap({ onClick, className = "", style, children }) {
  return (
    <div role="button" tabIndex={0} onClick={onClick}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(); } }}
      className={"cursor-pointer " + className} style={style}>
      {children}
    </div>
  );
}

/* ---- Airbnb-style heart ---- */
export function SaveBtn({ saved, onToggle }) {
  return (
    <button onClick={(e) => { e.stopPropagation(); onToggle(); }}
      className="shrink-0 grid place-items-center transition-transform duration-150 active:scale-90"
      style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.45))" }}>
      <Icon name="heart" size={27} fill={saved ? "var(--accent)" : "rgba(20,16,14,0.42)"}
        color="#fff" stroke={2} />
    </button>
  );
}

/* ---- "Favorito de huéspedes" ribbon ---- */
export function FavBadge() {
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-white text-[11px] font-semibold text-[#1c1c1c] shadow-[0_2px_8px_rgba(0,0,0,0.28)]">
      Favorito de huéspedes
    </span>
  );
}

/* ---- carrusel de imagen de lugar (solo visual, sin subida de archivos) ----
   Las imágenes de lugares vienen del sistema (gradientes de CatSurface).
   Los usuarios no pueden cambiarlas: se quitó el PhotoSlot que había aquí. */
export function PhotoCarousel({ cat, h = 250, rounded = "rounded-xl", children }) {
  const [idx, setIdx] = useState(0);
  const ref = useRef(null);
  const tints = ["transparent", "rgba(70,104,156,0.32)", "rgba(250,206,160,0.26)"];
  const go = (e, d) => {
    e.stopPropagation();
    const el = ref.current; if (!el) return;
    const w = el.clientWidth;
    const n = Math.max(0, Math.min(tints.length - 1, idx + d));
    el.scrollTo({ left: n * w, behavior: "smooth" });
    setIdx(n);
  };
  const onScroll = (e) => { const w = e.target.clientWidth; if (w) setIdx(Math.round(e.target.scrollLeft / w)); };
  return (
    <div className={"relative overflow-hidden shadow-elev1 " + rounded} style={{ height: h }}>
      <div ref={ref} onScroll={onScroll}
        className="flex w-full h-full overflow-x-auto snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ touchAction: "pan-x" }}>
        {tints.map((t, i) => (
          <div key={i} className="relative w-full h-full shrink-0 snap-start">
            <CatSurface cat={cat} className="w-full h-full">
              {/* Sin PhotoSlot: la imagen es solo visual, no editable por el usuario */}
              {t !== "transparent" && <div className="absolute inset-0 z-[2]" style={{ background: t, mixBlendMode: "soft-light" }}></div>}
            </CatSurface>
          </div>
        ))}
      </div>
      {idx > 0 && (
        <button onClick={(e) => go(e, -1)} aria-label="Anterior"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 z-[7] w-[30px] h-[30px] rounded-full grid place-items-center bg-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-transform active:scale-90">
          <Icon name="chevLeft" size={17} color="#222" stroke={2.4} />
        </button>
      )}
      {idx < tints.length - 1 && (
        <button onClick={(e) => go(e, 1)} aria-label="Siguiente"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-[7] w-[30px] h-[30px] rounded-full grid place-items-center bg-white/90 shadow-[0_2px_8px_rgba(0,0,0,0.3)] transition-transform active:scale-90">
          <Icon name="chevRight" size={17} color="#222" stroke={2.4} />
        </button>
      )}
      {children}
      <div className="absolute left-0 right-0 bottom-2.5 flex justify-center gap-[5px] z-[6] pointer-events-none">
        {tints.map((_, i) => (
          <span key={i} className="rounded-full transition-all duration-200"
            style={{ width: i === idx ? 7 : 6, height: i === idx ? 7 : 6,
              background: i === idx ? "#fff" : "rgba(255,255,255,0.5)" }}></span>
        ))}
      </div>
    </div>
  );
}

/* category → icon */
export const CAT_ICON = { naturaleza: "leaf", senderismo: "route", gastronomia: "utensils",
  fotografia: "camera", cultura: "building", urbano: "compass", miradores: "mountain",
  cafes: "cup", bienestar: "sun", aventura: "bolt" };

export function CatTag({ cat }) {
  const label = (CAT[cat] || {}).label || cat;
  return (
    <span className="inline-flex items-center gap-[6px] pl-[10px] pr-[12px] py-[6px] rounded-full text-[11px] font-semibold tracking-[0.02em] text-white bg-[rgba(20,18,16,0.4)] backdrop-blur-[10px] border border-white/[0.18]">
      <Icon name={CAT_ICON[cat] || "compass"} size={14} color="#fff" stroke={1.8} />{label}
    </span>
  );
}

/* ---- Explorar: Airbnb-style listing card ---- */
export function ExploreCard({ exp, saved, onSave, onOpen }) {
  const fav = exp.rating >= 4.9;
  return (
    <CardTap onClick={() => onOpen(exp)} className="block w-full text-left">
      <PhotoCarousel cat={exp.cat} h={250}>
        <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-[6]">
          {fav ? <FavBadge /> : <span></span>}
          <SaveBtn saved={saved} onToggle={onSave} />
        </div>
      </PhotoCarousel>
      <div className="pt-3 px-0.5">
        <div className="flex items-start justify-between gap-3">
          <div className="text-[16px] font-semibold text-ink-strong tracking-[-0.01em] leading-snug whitespace-nowrap overflow-hidden text-ellipsis">{exp.title}</div>
          {/* rating: null cuando el dato viene de OSM (no inventamos calificación) */}
          {exp.rating != null && (
            <span className="inline-flex items-center gap-1 shrink-0 mt-0.5 text-[14px] font-medium text-ink-strong">
              <Icon name="star" size={13} color="var(--ink-strong)" fill="var(--ink-strong)" stroke={0} /> {exp.rating}
            </span>
          )}
        </div>
        <div className="text-[14px] text-ink-soft mt-0.5">{exp.place}</div>
        <div className="text-[14px] text-ink-faint mt-0.5">{exp.dist} de ti · {exp.time === "Menos de 2 h" ? "Disponible hoy" : exp.time}</div>
        <div className="text-[15px] font-semibold text-ink-strong mt-1.5">{exp.tagline}</div>
      </div>
    </CardTap>
  );
}

/* ---- A: large hero (editorial direction) ---- */
export function HeroCard({ exp, saved, onSave, onOpen }) {
  return (
    <CardTap onClick={() => onOpen(exp)} className="block w-full text-left rounded-xl overflow-hidden shadow-elev2">
      <CatSurface cat={exp.cat} className="h-[420px] rounded-xl flex flex-col">
        <div className="flex justify-between p-4">
          <CatTag cat={exp.cat} />
          <SaveBtn saved={saved} onToggle={onSave} />
        </div>
        <div className="mt-auto px-[18px] pt-5 pb-[18px]"
          style={{ background: "linear-gradient(to top, rgba(10,8,7,0.78), rgba(10,8,7,0.12) 70%, transparent)" }}>
          <div className="inline-flex items-center gap-1.5 mb-2.5 pl-1.5 pr-2.5 py-[5px] rounded-full bg-[rgba(245,242,237,0.14)] border border-white/[0.18]">
            <MatchRing value={exp.match} size={26} />
            <span className="text-[12px] font-semibold text-white">{exp.match}% compatible contigo</span>
          </div>
          <div className="text-[25px] font-semibold text-white tracking-[-0.015em] leading-[1.1]">{exp.title}</div>
          <div className="text-[14px] font-light text-white/80 my-2 mb-3.5 max-w-[92%]">{exp.blurb}</div>
          <MetaRow exp={exp} color="rgba(255,255,255,0.86)" />
        </div>
      </CatSurface>
    </CardTap>
  );
}

/* ---- B: carousel tile ---- */
export function CarouselCard({ exp, saved, onSave, onOpen, w = 232 }) {
  return (
    <CardTap onClick={() => onOpen(exp)} className="block shrink-0 text-left" style={{ width: w }}>
      <PhotoCarousel cat={exp.cat} h={150} rounded="rounded-xl">
        <div className="absolute top-2.5 right-2.5 z-[6]"><SaveBtn saved={saved} onToggle={onSave} /></div>
      </PhotoCarousel>
      <div className="pt-2.5 px-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="text-[14.5px] font-semibold text-ink-strong tracking-[-0.01em] whitespace-nowrap overflow-hidden text-ellipsis">{exp.title}</div>
          {exp.rating != null && (
            <span className="inline-flex items-center gap-0.5 shrink-0 text-[13px] font-medium text-ink-strong">
              <Icon name="star" size={12} color="var(--ink-strong)" fill="var(--ink-strong)" stroke={0} /> {exp.rating}
            </span>
          )}
        </div>
        <div className="text-[13px] text-ink-faint mt-0.5">{exp.place}</div>
        <div className="text-[13.5px] font-semibold text-ink-strong mt-1">{exp.tagline}</div>
      </div>
    </CardTap>
  );
}

/* ---- C: full-bleed feed card ---- */
export function FeedCard({ exp, saved, onSave, onOpen }) {
  return (
    <CardTap onClick={() => onOpen(exp)} className="block w-full text-left rounded-xl overflow-hidden shadow-elev1">
      <CatSurface cat={exp.cat} className="h-[300px] rounded-xl flex flex-col">
        <div className="flex justify-between p-[15px]">
          <CatTag cat={exp.cat} />
          <SaveBtn saved={saved} onToggle={onSave} />
        </div>
        <div className="mt-auto px-4 pt-[18px] pb-4"
          style={{ background: "linear-gradient(to top, rgba(10,8,7,0.74), transparent)" }}>
          <div className="text-[13px] font-light text-accent-soft mb-1.5 italic">“{exp.insight}”</div>
          <div className="flex items-end justify-between gap-3">
            <div>
              <div className="text-[22px] font-semibold text-white tracking-[-0.015em] leading-[1.12]">{exp.title}</div>
              <div className="mt-2.5"><MetaRow exp={exp} color="rgba(255,255,255,0.84)" /></div>
            </div>
            <div className="flex flex-col items-center gap-[3px]">
              <MatchRing value={exp.match} size={42} />
              <span className="text-[9px] font-medium text-white/70">compatible</span>
            </div>
          </div>
        </div>
      </CatSurface>
    </CardTap>
  );
}

/* ---- C: compact list row ---- */
export function CompactRow({ exp, saved, onSave, onOpen }) {
  return (
    <CardTap onClick={() => onOpen(exp)}
      className="flex gap-[13px] w-full text-left p-2.5 rounded-lg bg-white/[0.045] border border-cardstroke">
      <CatSurface cat={exp.cat} className="w-[84px] h-[84px] rounded-md shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex justify-between items-center gap-2">
          <span className="text-[15px] font-semibold text-ink-strong tracking-[-0.01em] whitespace-nowrap overflow-hidden text-ellipsis">{exp.title}</span>
          <span className="inline-flex items-center gap-1 shrink-0 text-[11px] font-semibold text-accent-soft">
            <span className="w-[5px] h-[5px] rounded-full bg-accent-soft"/>{exp.match}%</span>
        </div>
        <div className="text-[12px] text-ink-faint mt-0.5 mb-[7px]">{exp.place}</div>
        <MetaRow exp={exp} gap={10} />
      </div>
    </CardTap>
  );
}

export { CardTap };
