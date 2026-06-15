/* HUELLA — Ajustes del perfil (bottom sheet) */
import { useState } from "react";
import Icon from "./Icon.jsx";
import { Chip } from "./Shared.jsx";
import { PrimaryBtn, OptionRow } from "./Onboarding.jsx";
import { ONB } from "../data/huella.js";

export default function SettingsSheet({ prefs, onSave, onClose }) {
  const [closing, setClosing] = useState(false);
  const [intereses, setIntereses] = useState(prefs.intereses || []);
  const [compania, setCompania] = useState(prefs.compania || "Solo");
  const [actividad, setActividad] = useState(prefs.actividad || "Moderado");
  const close = () => { setClosing(true); setTimeout(onClose, 280); };
  const save = () => { onSave({ intereses, compania, actividad }); close(); };
  const toggle = (v) => setIntereses((arr) => arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);
  const lbl = "text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-faint";

  return (
    <div className="absolute inset-0 z-[70] flex flex-col">
      <style>{`
        .set-scrim{ opacity: 1; }
        .set-sheet{ transform: none; }
        @media (prefers-reduced-motion: no-preference){
          @keyframes set-scrim-in{from{opacity:0}to{opacity:1}}
          @keyframes set-scrim-out{from{opacity:1}to{opacity:0}}
          @keyframes set-up{from{transform:translateY(100%)}to{transform:none}}
          @keyframes set-down{from{transform:none}to{transform:translateY(100%)}}
          .set-scrim-in{animation:set-scrim-in .3s ease both}
          .set-scrim-out{animation:set-scrim-out .26s ease both}
          .set-sheet-in{animation:set-up .4s cubic-bezier(0.22,1,0.36,1) both}
          .set-sheet-out{animation:set-down .26s cubic-bezier(0.4,0,1,1) both}
        }
      `}</style>

      <div onClick={close} className={"set-scrim absolute inset-0 bg-[rgba(8,7,6,0.62)] backdrop-blur-[2px] " + (closing ? "set-scrim-out" : "set-scrim-in")}></div>

      <div className={"set-sheet absolute left-0 right-0 bottom-0 max-h-[90%] bg-bg2 rounded-t-xl flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.5)] border-t border-glassstroke " + (closing ? "set-sheet-out" : "set-sheet-in")}>

        <div className="pt-2.5 px-[22px] pb-1.5 shrink-0">
          <div className="w-10 h-1 rounded-full bg-ink-ghost mx-auto mb-4"></div>
          <div className="flex items-center justify-between">
            <h2 className="text-[21px] font-semibold text-ink-strong tracking-[-0.01em]">Tus intereses</h2>
            <button onClick={close} className="w-[34px] h-[34px] rounded-full grid place-items-center bg-white/[0.06] border border-cardstroke">
              <Icon name="x" size={17} color="var(--ink)" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto pt-3.5 px-[22px] pb-2 min-h-0 [overscroll-behavior:contain]">
          {/* intereses */}
          <div className={lbl + " mb-3"}>Tus intereses</div>
          <div className="flex flex-wrap gap-2 mb-[26px]">
            {ONB.intereses.map((it) => (
              <Chip key={it} active={intereses.includes(it)} onClick={() => toggle(it)}>{it}</Chip>
            ))}
          </div>

          {/* compañía */}
          <div className={lbl + " mb-3"}>Cómo exploras</div>
          {ONB.compania.map((o) => (
            <OptionRow key={o.k} label={o.k} desc={o.d} active={compania === o.k} onClick={() => setCompania(o.k)} />
          ))}

          {/* ritmo */}
          <div className={lbl + " mt-3.5 mb-3"}>Tu ritmo</div>
          {ONB.actividad.map((o) => (
            <OptionRow key={o.k} label={o.k} desc={o.d} active={actividad === o.k} onClick={() => setActividad(o.k)} />
          ))}
        </div>

        <div className="px-[22px] pt-3 shrink-0 border-t border-cardstroke" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}>
          <PrimaryBtn label="Guardar cambios" onClick={save} icon="check" />
        </div>
      </div>
    </div>
  );
}
