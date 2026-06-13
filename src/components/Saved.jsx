/* HUELLA — Guardados */
import { useState } from "react";
import Icon from "./Icon.jsx";
import { CatSurface } from "./Shared.jsx";
import { CardTap } from "./Cards.jsx";
import { ScreenHead } from "./Tours.jsx";
import { byId } from "../data/huella.js";

export default function SavedScreen({ saved, onSave, onOpen }) {
  const items = saved.map((id) => byId(id)).filter(Boolean);
  const [scrolled, setScrolled] = useState(false);

  return (
    <div onScroll={(e) => setScrolled(e.target.scrollTop > 8)} className="flex-1 overflow-y-auto pb-24">
      <ScreenHead title="Guardados" sub={items.length ? `${items.length} ${items.length === 1 ? "experiencia" : "experiencias"} por vivir` : null} scrolled={scrolled} />

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center px-11 pt-20">
          <div className="w-[72px] h-[72px] rounded-lg grid place-items-center mb-5 bg-[rgba(210,115,79,0.1)] border border-[rgba(210,115,79,0.24)]">
            <Icon name="heart" size={32} color="var(--accent-soft)" />
          </div>
          <h2 className="text-[19px] font-medium text-ink-strong mb-2">Aún no guardas nada</h2>
          <p className="text-[14px] font-light text-ink-soft leading-[1.5] max-w-[260px]">
            Toca el corazón en cualquier experiencia y aparecerá aquí, lista para cuando llegue el momento.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 px-[22px] pt-2">
          {items.map((exp, i) => (
            <div key={exp.id} className="rise" style={{ animationDelay: `${Math.min(i, 5) * 0.05}s` }}>
              <SavedRow exp={exp} onSave={() => onSave(exp.id)} onOpen={onOpen} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SavedRow({ exp, onSave, onOpen }) {
  return (
    <CardTap onClick={() => onOpen(exp)}
      className="flex gap-3.5 w-full text-left p-3 rounded-xl bg-white/[0.045] border border-cardstroke shadow-elev1">
      <CatSurface cat={exp.cat} className="w-[92px] h-[92px] rounded-lg shrink-0" />
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-start justify-between gap-2">
          <div className="text-[16px] font-semibold text-ink-strong tracking-[-0.01em] leading-[1.2] whitespace-nowrap overflow-hidden text-ellipsis">{exp.title}</div>
          <button onClick={(e) => { e.stopPropagation(); onSave(); }} className="shrink-0 -mt-0.5">
            <Icon name="heart" size={20} fill="var(--accent)" color="var(--accent)" />
          </button>
        </div>
        <div className="flex items-center gap-1 text-[13px] text-ink-soft mt-[3px]">
          <Icon name="star" size={12} color="var(--ink-strong)" fill="var(--ink-strong)" stroke={0} />
          <span className="font-medium text-ink-strong">{exp.rating}</span>
          <span className="text-ink-ghost mx-0.5">·</span>
          <span className="whitespace-nowrap overflow-hidden text-ellipsis">{exp.place}</span>
        </div>
        <div className="text-[13px] text-ink-faint mt-0.5">{exp.dist} de ti</div>
        <div className="text-[14px] font-semibold text-ink-strong mt-1.5">{exp.tagline}</div>
      </div>
    </CardTap>
  );
}
