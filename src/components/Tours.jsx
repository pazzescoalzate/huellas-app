/* HUELLA — Tours (experiencias guiadas por locales) */
import { useState } from "react";
import Icon from "./Icon.jsx";
import { Chip, CatSurface } from "./Shared.jsx";
import { CatTag, CardTap } from "./Cards.jsx";
import { CAT, TOURS } from "../data/huella.js";

export function ScreenHead({ title, sub, scrolled }) {
  return (
    <div className="sticky top-0 z-20 pt-3 px-[22px] pb-3.5"
      style={{
        background: scrolled ? "var(--glass-bg)" : "var(--bg-1)",
        WebkitBackdropFilter: scrolled ? "var(--glass-blur)" : "none",
        backdropFilter: scrolled ? "var(--glass-blur)" : "none",
        boxShadow: scrolled ? "0 12px 32px rgba(0,0,0,0.32)" : "none",
        borderBottom: scrolled ? "1px solid var(--glass-stroke)" : "1px solid transparent" }}>
      <h1 className="text-[26px] font-semibold text-ink-strong tracking-[-0.015em]">{title}</h1>
      {sub && <div className="text-[14px] font-light text-ink-soft mt-1">{sub}</div>}
    </div>
  );
}

function GuideAvatar({ initials, cat, size = 44 }) {
  const grad = (CAT[cat] || {}).grad || "var(--g-urbano)";
  return (
    <div className="rounded-full shrink-0 grid place-items-center text-white border border-white/[0.18] shadow-elev1"
      style={{ width: size, height: size, background: grad, fontSize: size * 0.34, fontWeight: 600 }}>{initials}</div>
  );
}

function TourCard({ tour, onOpen }) {
  return (
    <CardTap onClick={() => onOpen && onOpen(tour)}
      className="block w-full text-left rounded-xl overflow-hidden bg-white/[0.045] border border-cardstroke shadow-elev1">
      <CatSurface cat={tour.cat} className="h-[150px] flex flex-col">
        <div className="flex justify-between items-start p-3">
          {tour.tag
            ? <span className="text-[11px] font-semibold text-accent-on bg-accent px-[11px] py-[5px] rounded-full shadow-[0_4px_12px_rgba(210,115,79,0.3)]">{tour.tag}</span>
            : <span />}
          <span className="inline-flex items-center gap-[5px] px-2.5 py-[5px] rounded-full bg-[rgba(20,18,16,0.42)] backdrop-blur-[8px] border border-white/[0.16] text-[12px] font-semibold text-white">
            <Icon name="clock" size={13} color="#fff" /> {tour.time}
          </span>
        </div>
        <div className="mt-auto px-3 py-2.5" style={{ background: "linear-gradient(to top, rgba(10,8,7,0.6), transparent)" }}>
          <CatTag cat={tour.cat} />
        </div>
      </CatSurface>

      <div className="px-[15px] pt-3.5 pb-[15px]">
        <div className="text-[17px] font-semibold text-ink-strong tracking-[-0.01em] leading-[1.25]">{tour.title}</div>
        <p className="text-[13.5px] font-light text-ink-soft mt-[7px] mb-[13px] leading-[1.5]">{tour.summary}</p>

        <div className="flex items-center gap-[11px] pb-[13px] border-b border-cardstroke">
          <GuideAvatar initials={tour.initials} cat={tour.cat} size={40} />
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-medium text-ink-strong">{tour.guide}</div>
            <div className="text-[12px] font-light text-ink-faint">{tour.guideRole}</div>
          </div>
          <span className="inline-flex items-center gap-1 text-[13px] font-semibold text-ink-strong">
            <Icon name="star" size={14} color="var(--arena)" fill="var(--arena)" stroke={0} /> {tour.rating}
            <span className="text-[11px] font-light text-ink-faint">({tour.reviews})</span>
          </span>
        </div>

        <div className="flex items-center justify-between pt-[13px]">
          <div className="flex gap-3.5">
            <span className="inline-flex items-center gap-[5px] text-[12.5px] font-medium text-ink-soft whitespace-nowrap">
              <Icon name="clock" size={14} /> {tour.duration}
            </span>
            <span className="inline-flex items-center gap-[5px] text-[12.5px] font-medium text-ink-soft whitespace-nowrap">
              <Icon name="user" size={14} /> {tour.group}
            </span>
          </div>
          <div className="text-right">
            <span className="text-[17px] font-semibold text-ink-strong">{tour.price} €</span>
            <span className="text-[11px] font-light text-ink-faint"> /persona</span>
          </div>
        </div>
      </div>
    </CardTap>
  );
}

export default function ToursScreen({ location }) {
  const [scope, setScope] = useState("Cerca de ti");
  const scopes = ["Cerca de ti", "Este finde", "Medio día", "Día completo"];
  const [scrolled, setScrolled] = useState(false);
  return (
    <div onScroll={(e) => setScrolled(e.target.scrollTop > 8)} className="flex-1 overflow-y-auto pb-24">
      <ScreenHead title="Tours" sub={`Guiados por locales${location ? " · " + location : ""}`} scrolled={scrolled} />
      <div className="flex gap-2 overflow-x-auto px-[22px] pb-1">
        {scopes.map((s) => <Chip key={s} active={scope === s} onClick={() => setScope(s)}>{s}</Chip>)}
      </div>

      <div className="mx-[22px] mt-4 mb-1 px-[15px] py-[13px] rounded-md flex gap-[11px] items-center bg-[rgba(138,165,144,0.1)] border border-[rgba(138,165,144,0.24)]">
        <Icon name="shield" size={19} color="var(--salvia)" style={{ flexShrink: 0 }} />
        <span className="text-[12.5px] font-light text-ink leading-[1.45]">
          Ningún guía paga por aparecer antes. El orden lo deciden las experiencias reales.
        </span>
      </div>

      <div className="flex flex-col gap-4 px-[22px] pt-4">
        {TOURS.map((tour, i) => (
          <div key={tour.id} className="rise" style={{ animationDelay: `${Math.min(i, 5) * 0.05}s` }}>
            <TourCard tour={tour} />
          </div>
        ))}
      </div>
    </div>
  );
}
