/* HUELLA — primitivas UI compartidas */
import Icon from "./Icon.jsx";
import { CAT } from "../data/huella.js";
import { sceneFor } from "../data/scenes.js";

/* ---------- iOS-style status bar ---------- */
export function StatusBar({ light = true }) {
  const c = light ? "#F5F2ED" : "#fff";
  return (
    <div className="flex justify-between items-center pt-[14px] px-[26px] pb-[6px] shrink-0 relative z-[5]">
      <span className="text-[15px] font-semibold tracking-[0.02em] text-ink-strong">9:41</span>
      <div className="flex gap-[7px] items-center">
        <svg width="18" height="12" viewBox="0 0 18 12" fill={c}><rect x="0" y="7" width="3" height="5" rx="1"/><rect x="5" y="4.5" width="3" height="7.5" rx="1"/><rect x="10" y="2" width="3" height="10" rx="1"/><rect x="15" y="0" width="3" height="12" rx="1" opacity="0.4"/></svg>
        <svg width="17" height="12" viewBox="0 0 17 12" fill={c}><path d="M8.5 2.5c2.2 0 4.2.8 5.7 2.2l1.2-1.3A10 10 0 0 0 8.5.8 10 10 0 0 0 1.6 3.4l1.2 1.3A8 8 0 0 1 8.5 2.5Z"/><path d="M8.5 6c1.2 0 2.3.5 3.1 1.2l1.2-1.3A7 7 0 0 0 8.5 4 7 7 0 0 0 4.2 5.9l1.2 1.3A4.5 4.5 0 0 1 8.5 6Z"/><circle cx="8.5" cy="10" r="1.6"/></svg>
        <svg width="26" height="12" viewBox="0 0 26 12" fill="none"><rect x="0.5" y="0.5" width="21" height="11" rx="3" stroke={c} opacity="0.5"/><rect x="2" y="2" width="16" height="8" rx="1.5" fill={c}/><rect x="23" y="4" width="1.5" height="4" rx="0.75" fill={c} opacity="0.5"/></svg>
      </div>
    </div>
  );
}

/* ---------- compatibility ring ---------- */
export function MatchRing({ value, size = 40 }) {
  const r = (size - 5) / 2, c = 2 * Math.PI * r, off = c * (1 - value / 100);
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(255,255,255,0.16)" strokeWidth="3" fill="none"/>
        <circle cx={size/2} cy={size/2} r={r} stroke="var(--accent)" strokeWidth="3" fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1)" }}/>
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[11px] font-semibold text-ink-strong">{value}</span>
    </div>
  );
}

/* ---------- category scene surface (illustrated image over gradient) ---------- */
export function CatSurface({ cat, children, className = "", style }) {
  const grad = (CAT[cat] || {}).grad || "var(--g-urbano)";
  const sceneSrc = sceneFor(cat);
  return (
    <div className={"relative overflow-hidden " + className} style={{ background: grad, ...style }}>
      <div className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${sceneSrc}")` }}/>
      <div className="absolute inset-0"
        style={{ background: "radial-gradient(90% 70% at 10% 100%, rgba(0,0,0,0.25), transparent 60%)" }}/>
      {children}
    </div>
  );
}

/* ---------- small pill chip ---------- */
export function Chip({ children, active, onClick, icon }) {
  return (
    <button onClick={onClick}
      className={"inline-flex items-center gap-[6px] whitespace-nowrap py-[9px] px-[15px] rounded-full text-[13px] font-medium transition-all duration-150 border "
        + (active ? "bg-accent text-accent-on border-transparent" : "bg-white/5 text-ink border-cardstroke")}>
      {icon && <Icon name={icon} size={15} />}{children}
    </button>
  );
}

/* ---------- meta row (distance · time · level) ---------- */
export function MetaRow({ exp, color = "var(--ink-soft)", gap = 12 }) {
  const items = [
    { icon: "pin", t: exp.dist },
    { icon: "clock", t: exp.time },
    { icon: "route", t: exp.level },
  ];
  return (
    <div className="flex items-center flex-wrap" style={{ gap }}>
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-[5px] text-[12px] font-medium whitespace-nowrap" style={{ color }}>
          <Icon name={it.icon} size={13} /> {it.t}
        </span>
      ))}
    </div>
  );
}

/* ---------- glass bottom navigation (floating pill) ---------- */
export function BottomNav({ active, onNav }) {
  const tabs = [
    { k: "home", icon: "compass", label: "Explorar" },
    { k: "tours", icon: "route", label: "Tours" },
    { k: "saved", icon: "heart", label: "Guardados" },
    { k: "profile", icon: "user", label: "Perfil" },
  ];
  return (
    <div className="absolute left-0 right-0 bottom-0 px-4 pb-3 z-30 pointer-events-none">
      <div className="glass flex rounded-full p-2 pointer-events-auto">
        {tabs.map((t) => {
          const on = active === t.k;
          return (
            <button key={t.k} onClick={() => onNav(t.k)}
              className="flex-1 flex flex-col items-center gap-[3px] py-2 rounded-full"
              style={{ backgroundColor: on ? "rgba(210,115,79,0.16)" : "transparent" }}>
              <Icon name={t.icon} size={21} stroke={on ? 2 : 1.6}
                fill={on && t.k === "saved" ? "var(--accent-soft)" : "none"}
                color={on ? "var(--accent-soft)" : "var(--ink-faint)"} />
              <span className={(on ? "font-semibold text-accent-soft" : "font-medium text-ink-faint") + " text-[10px]"}>{t.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
