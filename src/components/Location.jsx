/* HUELLA — selector de ubicación (bottom sheet) */
import { useState } from "react";
import Icon from "./Icon.jsx";
import { CatSurface } from "./Shared.jsx";
import { LOCATIONS } from "../data/huella.js";

export default function LocationSheet({ current, onPick, onClose }) {
  const [closing, setClosing] = useState(false);
  const [q, setQ] = useState("");
  const close = () => { setClosing(true); setTimeout(onClose, 280); };
  const pick = (loc) => { onPick(loc); close(); };

  const actual = LOCATIONS.find((l) => l.current);
  const others = LOCATIONS.filter((l) => !l.current);
  const filtered = q.trim()
    ? LOCATIONS.filter((l) => (l.name + " " + l.region).toLowerCase().includes(q.trim().toLowerCase()))
    : null;

  return (
    <div className="absolute inset-0 z-[55] flex flex-col">
      <style>{`
        .loc-scrim{ opacity: 1; }
        .loc-sheet{ transform: none; }
        @media (prefers-reduced-motion: no-preference){
          @keyframes loc-scrim-in{from{opacity:0}to{opacity:1}}
          @keyframes loc-scrim-out{from{opacity:1}to{opacity:0}}
          @keyframes loc-up{from{transform:translateY(100%)}to{transform:none}}
          @keyframes loc-down{from{transform:none}to{transform:translateY(100%)}}
          .loc-scrim-in{animation:loc-scrim-in .3s ease both}
          .loc-scrim-out{animation:loc-scrim-out .26s ease both}
          .loc-sheet-in{animation:loc-up .4s cubic-bezier(0.22,1,0.36,1) both}
          .loc-sheet-out{animation:loc-down .26s cubic-bezier(0.4,0,1,1) both}
        }
      `}</style>

      <div onClick={close} className={"loc-scrim absolute inset-0 bg-[rgba(8,7,6,0.62)] backdrop-blur-[2px] " + (closing ? "loc-scrim-out" : "loc-scrim-in")} />

      <div className={"loc-sheet absolute left-0 right-0 bottom-0 max-h-[86%] bg-bg2 rounded-t-xl flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.5)] border-t border-glassstroke " + (closing ? "loc-sheet-out" : "loc-sheet-in")}>

        <div className="pt-2.5 px-[22px] pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-ink-ghost mx-auto mb-4" />
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-[21px] font-semibold text-ink-strong tracking-[-0.01em]">¿Dónde quieres explorar?</h2>
            <button onClick={close} className="w-[34px] h-[34px] rounded-full grid place-items-center bg-white/[0.06] border border-cardstroke">
              <Icon name="x" size={17} color="var(--ink)" />
            </button>
          </div>
          <div className="flex items-center gap-2.5 px-3.5 py-3 mb-1.5 rounded-full bg-bg0 border border-cardstroke">
            <Icon name="search" size={18} color="var(--ink-faint)" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Busca una ciudad o región"
              className="flex-1 border-none outline-none bg-transparent text-ink-strong text-[14px]" />
            {q && <button onClick={() => setQ("")}><Icon name="x" size={15} color="var(--ink-faint)" /></button>}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-[22px] pt-2 pb-6 [overscroll-behavior:contain]">
          {filtered ? (
            filtered.length ? filtered.map((l) => <LocationRow key={l.id} loc={l} active={l.id === current} onClick={() => pick(l)} />)
              : <div className="text-center py-10 text-[14px] font-light text-ink-faint">Sin resultados para “{q}”.</div>
          ) : (<>
            <button onClick={() => pick(actual)}
              className="w-full flex items-center gap-[13px] text-left px-4 py-3.5 mb-[18px] rounded-lg bg-[rgba(210,115,79,0.1)] border border-[rgba(210,115,79,0.3)]">
              <div className="w-[42px] h-[42px] rounded-full shrink-0 grid place-items-center bg-accent shadow-[0_4px_14px_rgba(210,115,79,0.35)]">
                <Icon name="compass" size={21} color="var(--on-accent)" stroke={2} />
              </div>
              <div className="flex-1">
                <div className="text-[15px] font-semibold text-ink-strong">Usar mi ubicación actual</div>
                <div className="text-[12.5px] font-light text-ink-soft mt-px">{actual.name} · GPS activado</div>
              </div>
              {current === actual.id && <Icon name="check" size={20} color="var(--accent-soft)" stroke={2.4} />}
            </button>

            <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-faint mx-1 mb-3">
              Explorar otras ciudades
            </div>
            {others.map((l) => <LocationRow key={l.id} loc={l} active={l.id === current} onClick={() => pick(l)} />)}
          </>)}
        </div>
      </div>
    </div>
  );
}

function LocationRow({ loc, active, onClick }) {
  return (
    <button onClick={onClick}
      className={"w-full flex items-center gap-[13px] text-left px-2 py-[11px] rounded-md mb-0.5 " + (active ? "bg-white/[0.05]" : "bg-transparent")}>
      <CatSurface cat={loc.cat} className="w-11 h-11 rounded-md shrink-0 grid place-items-center">
        <Icon name="pin" size={18} color="#fff" />
      </CatSurface>
      <div className="flex-1 min-w-0">
        <div className="text-[15px] font-medium text-ink-strong">{loc.name}</div>
        <div className="text-[12.5px] font-light text-ink-faint mt-px">{loc.region}</div>
      </div>
      {active && <Icon name="check" size={20} color="var(--accent-soft)" stroke={2.4} />}
    </button>
  );
}
