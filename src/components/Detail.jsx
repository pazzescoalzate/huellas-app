/* HUELLA — detail sheet (glass overlay) */
import { useState } from "react";
import Icon from "./Icon.jsx";
import { MatchRing, MetaRow } from "./Shared.jsx";
import { PhotoCarousel, CatTag, CAT_ICON } from "./Cards.jsx";
import { NavSheet, ShareSheet } from "./Actions.jsx";
import { CAT } from "../data/huella.js";

function ModuleGrid({ exp }) {
  const entries = Object.entries(exp.modules || {});
  const iconFor = { Altitud: "mountain", Desnivel: "route", Terreno: "compass", Cobertura: "wifi", Clima: "sun",
    "Golden hour": "sun", Orientación: "compass", "Mejor punto": "eye", Precio: "star", Cocina: "star", Espera: "clock",
    Horario: "clock", Contexto: "shield", Duración: "clock", Curiosidad: "sparkles", Seguridad: "shield", Cercanos: "pin",
    Tiempo: "clock", Especialidad: "star", Wifi: "wifi", Acceso: "route", Agua: "thermometer", Temperatura: "thermometer",
    Profundidad: "route" };
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {entries.map(([k, v]) => (
        <div key={k} className="px-3.5 py-[13px] rounded-md bg-white/[0.045] border border-cardstroke">
          <div className="flex items-center gap-[7px] mb-1.5">
            <Icon name={iconFor[k] || "compass"} size={15} color="var(--accent-soft)" />
            <span className="text-[11px] text-ink-faint">{k}</span>
          </div>
          <div className="text-[15px] font-medium text-ink-strong">{v}</div>
        </div>
      ))}
    </div>
  );
}

function Review({ initial, name, when, text, tags }) {
  return (
    <div className="py-4 border-t border-cardstroke">
      <div className="flex items-center gap-2.5 mb-[9px]">
        <div className="w-[34px] h-[34px] rounded-full shrink-0 grid place-items-center text-[13px] font-semibold text-white"
          style={{ background: "linear-gradient(135deg,#557A5E,#3E5C82)" }}>{initial}</div>
        <div className="flex-1">
          <div className="text-[14px] font-medium text-ink-strong">{name}</div>
          <div className="text-[12px] font-light text-ink-faint">{when}</div>
        </div>
        <div className="flex gap-px">
          {[0,1,2,3,4].map((i) => <Icon key={i} name="star" size={13} color="var(--arena)" fill="var(--arena)" stroke={0} />)}
        </div>
      </div>
      <p className="text-[14px] font-light text-ink mb-2.5 leading-[1.55]">{text}</p>
      <div className="flex gap-[7px] flex-wrap">
        {tags.map((t) => (
          <span key={t} className="text-[11px] font-medium text-ink-soft px-2.5 py-1 rounded-full bg-white/5 border border-cardstroke">{t}</span>
        ))}
      </div>
    </div>
  );
}

function AIBlock({ exp }) {
  const items = [
    { q: "Qué esperar", a: exp.blurb },
    { q: "Qué llevar", a: exp.cat === "gastronomia" ? "Reserva y ganas; el resto lo ponen ellos." : "Agua, calzado cómodo y algo de abrigo para el final del día." },
    { q: "Mejor momento", a: exp.insight },
  ];
  return (
    <div className="rounded-lg overflow-hidden border border-[rgba(210,115,79,0.22)] p-[18px]"
      style={{ background: "linear-gradient(160deg, rgba(210,115,79,0.14), rgba(92,127,176,0.08))" }}>
      <div className="flex items-center gap-[9px] mb-3.5">
        <Icon name="sparkles" size={19} color="var(--accent-soft)" />
        <span className="text-[15px] font-semibold text-ink-strong">Antes de ir</span>
        <span className="ml-auto text-[11px] text-ink-faint">según reviews reales</span>
      </div>
      <div className="flex flex-col gap-3.5">
        {items.map((it, i) => (
          <div key={i}>
            <div className="text-[13px] font-medium text-accent-soft mb-[3px]">{it.q}</div>
            <div className="text-[14px] font-light text-ink leading-[1.5]">{it.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------- mini-mapa de ubicación (ficha) ---------- */
function DetailMap({ exp, onDirections }) {
  const grad = (CAT[exp.cat] || {}).grad || "var(--g-urbano)";
  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-[16px] font-semibold text-ink-strong">Ubicación</h3>
        {/* zona: barrio/sector real de OSM. Omitido si no hay dato. */}
        {exp.zona && (
          <span className="inline-flex items-center gap-[5px] text-[13px] font-light text-ink-soft">
            <Icon name="pin" size={14} color="var(--accent-soft)" /> {exp.zona}
          </span>
        )}
      </div>
      <button onClick={onDirections} className="block w-full h-[168px] relative rounded-lg overflow-hidden border border-cardstroke shadow-elev1">
        <svg viewBox="0 0 360 168" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
          <rect width="360" height="168" fill="#14181E"></rect>
          <path d="M276 0 C288 40 320 56 360 60 L360 168 L250 168 C268 120 262 70 276 0 Z" fill="#1B2736"></path>
          <path d="M0 110 C70 102 140 120 200 132 C238 140 256 150 262 168" fill="none" stroke="#1F2E40" strokeWidth="7" strokeLinecap="round"></path>
          <ellipse cx="84" cy="40" rx="50" ry="30" fill="#1A221C"></ellipse>
          <ellipse cx="200" cy="92" rx="38" ry="24" fill="#19211B"></ellipse>
          <path d="M0 70 C90 64 180 78 276 66" fill="none" stroke="rgba(245,242,237,0.12)" strokeWidth="2.4"></path>
          <path d="M120 0 C128 60 116 120 134 168" fill="none" stroke="rgba(245,242,237,0.09)" strokeWidth="2"></path>
          <path d="M0 130 C60 126 110 108 160 92 C196 80 220 80 250 86" fill="none" stroke="rgba(245,242,237,0.06)" strokeWidth="1.6"></path>
          <path d="M40 0 C56 36 92 56 110 92 M210 0 C206 40 196 70 180 92" fill="none" stroke="rgba(245,242,237,0.05)" strokeWidth="1.3"></path>
          <g fill="rgba(245,242,237,0.035)">
            <rect x="150" y="40" width="16" height="11" rx="1.5"></rect>
            <rect x="170" y="38" width="11" height="13" rx="1.5"></rect>
            <rect x="152" y="56" width="12" height="10" rx="1.5"></rect>
            <rect x="170" y="55" width="14" height="11" rx="1.5"></rect>
          </g>
        </svg>
        <span className="absolute left-1/2 top-1/2 flex flex-col items-center" style={{ transform: "translate(-50%, -100%)" }}>
          <span className="w-[38px] h-[38px] grid place-items-center"
            style={{ borderRadius: "50% 50% 50% 4px", background: grad, border: "2px solid rgba(255,255,255,0.9)", boxShadow: "0 6px 16px rgba(0,0,0,0.5)", transform: "rotate(-45deg)" }}>
            <span className="grid place-items-center" style={{ transform: "rotate(45deg)" }}>
              <Icon name={CAT_ICON[exp.cat] || "pin"} size={17} color="#fff" stroke={2} />
            </span>
          </span>
          <span className="w-[7px] h-[3px] rounded-[50%] bg-black/50 mt-0.5 blur-[1px]"></span>
        </span>
        <span className="glass absolute left-3 bottom-3 px-[13px] py-2 rounded-full flex items-center gap-[7px] text-[12.5px] font-medium text-ink-strong">
          <Icon name="pin" size={13} color="var(--accent-soft)" /> {exp.place}
        </span>
        <span className="glass absolute right-3 bottom-3 px-[13px] py-2 rounded-full flex items-center gap-1.5 text-[12.5px] font-semibold text-accent-soft">
          <Icon name="route" size={14} color="var(--accent-soft)" stroke={2} /> Cómo llegar
        </span>
      </button>
    </div>
  );
}

export default function DetailSheet({ exp, saved, onSave, onClose }) {
  const [closing, setClosing] = useState(false);
  const [nav, setNav] = useState(false);
  const [share, setShare] = useState(false);
  const close = () => { setClosing(true); setTimeout(onClose, 280); };
  if (!exp) return null;

  return (
    <div className="absolute inset-0 z-[60] flex flex-col">
      <style>{`
        .hu-scrim{ opacity: 1; }
        .hu-sheet{ transform: none; }
        @media (prefers-reduced-motion: no-preference){
          @keyframes hu-scrim-in{from{opacity:0}to{opacity:1}}
          @keyframes hu-scrim-out{from{opacity:1}to{opacity:0}}
          @keyframes sheet-up{from{transform:translateY(100%)}to{transform:none}}
          @keyframes sheet-down{from{transform:none}to{transform:translateY(100%)}}
          .hu-scrim-in{ animation: hu-scrim-in .3s ease both; }
          .hu-scrim-out{ animation: hu-scrim-out .28s ease both; }
          .hu-sheet-in{ animation: sheet-up .42s cubic-bezier(0.22,1,0.36,1) both; }
          .hu-sheet-out{ animation: sheet-down .28s cubic-bezier(0.4,0,1,1) both; }
        }
      `}</style>
      <div onClick={close} className={"hu-scrim absolute inset-0 bg-[rgba(8,7,6,0.6)] backdrop-blur-[2px] " + (closing ? "hu-scrim-out" : "hu-scrim-in")} />
      <div className={"hu-sheet absolute inset-0 bg-bg1 flex flex-col " + (closing ? "hu-sheet-out" : "hu-sheet-in")}>

        <div className="flex-1 overflow-y-auto pb-[100px]">
          <PhotoCarousel cat={exp.cat} h={340} rounded="rounded-none">
            <div className="px-[18px] py-4 flex justify-between absolute top-0 left-0 right-0 z-[8]">
              <button onClick={close} className="w-10 h-10 rounded-full grid place-items-center bg-[rgba(20,18,16,0.42)] backdrop-blur-[10px] border border-white/[0.18]">
                <Icon name="chevLeft" size={20} color="#fff" />
              </button>
              <button onClick={() => setShare(true)} className="w-10 h-10 rounded-full grid place-items-center bg-[rgba(20,18,16,0.42)] backdrop-blur-[10px] border border-white/[0.18]">
                <Icon name="share" size={18} color="#fff" />
              </button>
            </div>
            <div className="absolute bottom-0 left-0 right-0 px-5 pt-10 pb-[26px] z-[5] pointer-events-none"
              style={{ background: "linear-gradient(to top, rgba(10,8,7,0.8), transparent)" }}>
              <CatTag cat={exp.cat} />
              <h1 className="text-[27px] font-semibold text-white tracking-[-0.015em] mt-3 mb-1.5 leading-[1.1]">{exp.title}</h1>
              <div className="flex items-center gap-1.5 text-[14px] font-light text-white/[0.82]">
                <Icon name="pin" size={14} color="rgba(255,255,255,0.82)" /> {exp.place}
              </div>
            </div>
          </PhotoCarousel>

          <div className="px-[22px] py-5 flex flex-col gap-6">
            {/* Bloque de compatibilidad: oculto si no hay intereses (invitado o perfil vacío) */}
            {exp.match != null && (
              <div className="flex items-center gap-3.5 px-4 py-3.5 rounded-lg bg-[rgba(210,115,79,0.1)] border border-[rgba(210,115,79,0.24)]">
                <MatchRing value={exp.match} size={48} />
                <div className="flex-1">
                  <div className="text-[15px] font-semibold text-ink-strong">{exp.match}% compatible contigo</div>
                  <div className="text-[12.5px] font-light text-ink-soft mt-0.5">Por tus intereses y tu forma de explorar</div>
                </div>
              </div>
            )}

            <MetaRow exp={exp} color="var(--ink)" gap={18} />

            <p className="text-[15px] font-light text-ink leading-[1.6]">{exp.blurb}</p>

            <div>
              <h3 className="text-[16px] font-semibold text-ink-strong mb-3">Lo que debes saber</h3>
              <ModuleGrid exp={exp} />
            </div>

            <DetailMap exp={exp} onDirections={() => setNav(true)} />

            <div className="flex gap-3 px-4 py-3.5 rounded-md bg-white/[0.045] border border-cardstroke">
              <Icon name="sun" size={20} color="var(--arena)" style={{ flexShrink: 0, marginTop: 1 }} />
              <span className="text-[14px] font-light text-ink leading-[1.5] italic">“{exp.insight}”</span>
            </div>

            <AIBlock exp={exp} />

            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-[16px] font-semibold text-ink-strong">Experiencias reales</h3>
                <span className="inline-flex items-center gap-[5px] text-[14px] font-semibold text-ink-strong">
                  <Icon name="star" size={15} color="var(--arena)" fill="var(--arena)" stroke={0} /> 4,8
                  <span className="text-[12px] font-light text-ink-faint">· 126</span>
                </span>
              </div>
              <Review initial="L" name="Lucía" when="hace 3 días"
                text="Llegamos al amanecer como sugería la app y fue mágico. La niebla se levantó justo cuando llegábamos arriba."
                tags={["Seguridad alta", "Coincidió con lo esperado"]} />
              <Review initial="D" name="Diego" when="la semana pasada"
                text="El camino es más exigente de lo que parece, pero las vistas compensan cada paso. Llevad agua de sobra."
                tags={["Accesibilidad media", "Mejor por la mañana"]} />
            </div>
          </div>
        </div>

        <div className="glass absolute left-0 right-0 bottom-0 z-[5] rounded-none border-x-0 border-b-0 flex items-center gap-3"
          style={{ padding: "12px 18px calc(12px + env(safe-area-inset-bottom))" }}>
          <button onClick={() => onSave(exp.id)}
            className={"w-[52px] h-[52px] rounded-md shrink-0 grid place-items-center border " + (saved ? "bg-[rgba(210,115,79,0.16)] border-accent" : "bg-white/[0.06] border-cardstroke")}>
            <Icon name="heart" size={22} fill={saved ? "var(--accent-soft)" : "none"} color={saved ? "var(--accent-soft)" : "var(--ink)"} />
          </button>
          <button onClick={() => setShare(true)} className="w-[52px] h-[52px] rounded-md shrink-0 grid place-items-center bg-white/[0.06] border border-cardstroke">
            <Icon name="share" size={22} color="var(--ink)" />
          </button>
          <button onClick={() => setNav(true)}
            className="flex-1 h-[52px] rounded-md flex items-center justify-center gap-2 text-[15px] font-semibold text-accent-on bg-accent shadow-[0_8px_24px_rgba(210,115,79,0.3)]">
            <Icon name="route" size={19} color="var(--on-accent)" stroke={2} /> Cómo llegar
          </button>
        </div>
      </div>
      {nav && <NavSheet exp={exp} onClose={() => setNav(false)} />}
      {share && <ShareSheet exp={exp} onClose={() => setShare(false)} />}
    </div>
  );
}
