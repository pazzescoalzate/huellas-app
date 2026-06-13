/* HUELLA — onboarding (5 pasos) */
import { useState } from "react";
import Icon from "./Icon.jsx";
import { Chip } from "./Shared.jsx";
import { ONB } from "../data/huella.js";
import huellaMark from "../assets/huella-mark.svg";
import wordmarkWhite from "../assets/huella-wordmark-white.svg";

function Progress({ step, total }) {
  return (
    <div className="flex gap-1.5 px-1">
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} className={"h-1 flex-1 rounded-full transition-colors duration-300 " + (i <= step ? "bg-accent" : "bg-white/[0.12]")}/>
      ))}
    </div>
  );
}

function StepShell({ children, step, total, onBack, onNext, nextLabel = "Continuar", canNext = true, eyebrow }) {
  return (
    <div className="fade flex-1 flex flex-col pt-2 px-[22px] min-h-0">
      <div className="flex items-center gap-3.5 pt-1 pb-[18px]">
        <button onClick={onBack} className="w-[38px] h-[38px] rounded-full shrink-0 grid place-items-center bg-white/5 border border-cardstroke">
          <Icon name="chevLeft" size={20} color="var(--ink)" />
        </button>
        <div className="flex-1"><Progress step={step} total={total} /></div>
      </div>
      <div className="flex-1 overflow-y-auto min-h-0">
        {eyebrow && <div className="t-eyebrow mb-2.5">{eyebrow}</div>}
        {children}
      </div>
      <div className="pt-3.5 pb-[22px]">
        <PrimaryBtn label={nextLabel} onClick={onNext} disabled={!canNext} />
      </div>
    </div>
  );
}

export function PrimaryBtn({ label, onClick, disabled, icon = "arrowRight" }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={"w-full h-14 rounded-full flex items-center justify-center gap-[9px] text-[16px] font-semibold transition-all duration-200 "
        + (disabled ? "text-ink-faint bg-white/[0.06] opacity-70" : "text-accent-on bg-accent shadow-[0_10px_30px_rgba(210,115,79,0.32)]")}>
      {label} {!disabled && <Icon name={icon} size={19} stroke={2} />}
    </button>
  );
}

export function OptionRow({ label, desc, active, onClick }) {
  return (
    <button onClick={onClick}
      className={"w-full text-left flex items-center gap-3.5 px-[18px] py-4 mb-2.5 rounded-lg border-[1.5px] transition-all duration-150 "
        + (active ? "bg-[rgba(210,115,79,0.12)] border-accent" : "bg-white/[0.045] border-cardstroke")}>
      <div className="flex-1">
        <div className="text-[16px] font-medium text-ink-strong">{label}</div>
        {desc && <div className="text-[13px] font-light text-ink-soft mt-0.5">{desc}</div>}
      </div>
      <div className={"w-6 h-6 rounded-full shrink-0 grid place-items-center border-[1.5px] transition-all duration-150 "
        + (active ? "border-accent bg-accent" : "border-ink-ghost bg-transparent")}>
        {active && <Icon name="check" size={15} color="var(--on-accent)" stroke={2.4} />}
      </div>
    </button>
  );
}

function WelcomeScene() {
  const chips = [
    { icon: "leaf", label: "Naturaleza", cls: "left-[2%] top-[16%]" },
    { icon: "mountain", label: "Miradores", cls: "right-[3%] top-[30%]" },
    { icon: "cup", label: "Cafés", cls: "left-[8%] bottom-[16%]" },
  ];
  return (
    <div className="relative w-full h-[330px] rounded-xl overflow-hidden border border-white/[0.08] shadow-elev2"
      style={{ background: "linear-gradient(180deg, #EBCBA6 0%, #E0A06C 26%, #C8693E 48%, #8A4327 72%, #3E2417 100%)" }}>
      <svg viewBox="0 0 320 330" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
        <circle cx="232" cy="78" r="34" fill="#F7E2C4" opacity="0.85"></circle>
        <circle cx="232" cy="78" r="50" fill="none" stroke="#F7E2C4" strokeWidth="1.5" opacity="0.25"></circle>
        <circle cx="232" cy="78" r="66" fill="none" stroke="#F7E2C4" strokeWidth="1.5" opacity="0.14"></circle>
        <g fill="none" stroke="#3E2417" strokeWidth="2.4" strokeLinecap="round" opacity="0.55">
          <path d="M44 66 q9 -8 18 0 q9 -8 18 0"></path>
          <path d="M74 86 q7 -6 14 0 q7 -6 14 0"></path>
        </g>
        <path d="M0 214 C64 178 132 196 196 210 C248 221 290 214 320 202 L320 330 L0 330 Z" fill="#B85A33"></path>
        <path d="M0 256 C70 226 128 250 188 264 C240 276 288 270 320 260 L320 330 L0 330 Z" fill="#7C3C22"></path>
        <path d="M0 300 C58 292 110 252 160 252 C210 252 262 292 320 300 L320 330 L0 330 Z" fill="#4A2818"></path>
        <path d="M0 232 C64 198 132 214 196 226" fill="none" stroke="rgba(255,240,225,0.16)" strokeWidth="2"></path>
        <path d="M150 322 C150 304 120 296 132 282 C144 268 176 272 166 258" fill="none"
          stroke="rgba(247,226,196,0.85)" strokeWidth="3" strokeLinecap="round" strokeDasharray="1 11"></path>
      </svg>

      <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 grid place-items-center">
        <div className="absolute w-[150px] h-[150px] rounded-full" style={{ background: "radial-gradient(circle, rgba(255,240,222,0.4), transparent 64%)" }}></div>
        <img src={huellaMark} alt="" className="relative w-[80px]" style={{ filter: "brightness(0) saturate(100%) invert(9%) sepia(38%) saturate(2200%) hue-rotate(345deg) drop-shadow(0 8px 18px rgba(0,0,0,0.4))" }} />
      </div>

      {chips.map((c) => (
        <div key={c.label} className={"absolute " + c.cls + " inline-flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full border border-white/[0.16] shadow-[0_6px_18px_rgba(0,0,0,0.35)]"}
          style={{ background: "rgba(26,16,11,0.6)" }}>
          <span className="w-[26px] h-[26px] rounded-full grid place-items-center bg-accent">
            <Icon name={c.icon} size={15} color="var(--on-accent)" stroke={2} />
          </span>
          <span className="text-[13px] font-semibold text-white">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

// initialStep: desde qué paso arrancar.
//   0 → flujo original (bienvenida → intereses → ...)
//   1 → saltar la bienvenida y empezar directo en intereses (para usuarios registrados)
export default function Onboarding({ onComplete, initialStep = 0 }) {
  const [step, setStep] = useState(initialStep);
  const [intereses, setIntereses] = useState(["Naturaleza", "Miradores", "Cafés"]);
  const [compania, setCompania] = useState("Con pareja");
  const [actividad, setActividad] = useState("Moderado");

  const total = 4;
  // "back" no retrocede más allá del primer paso disponible
  // (evita que desde el paso 1 el usuario retroceda al step 0 de bienvenida)
  const back = () => setStep((s) => Math.max(initialStep, s - 1));
  const next = () => setStep((s) => s + 1);
  const toggle = (arr, set, v) => set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  if (step === 0) {
    return (
      <div className="fade flex-1 flex flex-col bg-bg1 px-[26px] pt-2 pb-9">
        <div className="rise flex justify-center pt-3 pb-1 shrink-0">
          <img src={wordmarkWhite} alt="Huella" className="h-[30px] opacity-95" />
        </div>

        <div className="rise flex-1 flex items-center min-h-0" style={{ animationDelay: "0.06s" }}>
          <WelcomeScene />
        </div>

        <div className="flex justify-center gap-1.5 pt-1 pb-4">
          <span className="h-1.5 w-5 rounded-full bg-accent"></span>
          <span className="h-1.5 w-1.5 rounded-full bg-white/20"></span>
          <span className="h-1.5 w-1.5 rounded-full bg-white/20"></span>
        </div>

        <div className="rise shrink-0" style={{ animationDelay: "0.12s" }}>
          <h1 className="text-[30px] font-light text-white leading-[1.16] tracking-[-0.01em] [text-wrap:balance]">
            Cada lugar tiene algo que <span className="font-semibold text-accent-soft">enseñarte.</span>
          </h1>
          <p className="text-[14.5px] font-light text-white/[0.7] mt-3 mb-6 leading-[1.5]">
            Recomendaciones honestas, construidas a partir de experiencias reales. Sin anuncios, sin patrocinios.
          </p>
          <PrimaryBtn label="Comenzar" onClick={next} />
          <div className="text-center mt-4">
            <span className="text-[13px] text-white/60">
              ¿Ya tienes cuenta? <span className="text-white font-medium">Inicia sesión</span>
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (step === 1) {
    return (
      <StepShell step={0} total={total} onBack={back} onNext={next} canNext={intereses.length > 0} eyebrow="Tus intereses">
        <h2 className="text-[25px] font-medium text-ink-strong mb-2 tracking-[-0.01em] [text-wrap:balance]">
          ¿Qué tipo de experiencias disfrutas?
        </h2>
        <p className="text-[14px] font-light text-ink-soft mb-[22px]">
          Elige todas las que conecten contigo. Afinaremos a medida que explores.
        </p>
        <div className="flex flex-wrap gap-[9px]">
          {ONB.intereses.map((it) => (
            <Chip key={it} active={intereses.includes(it)} onClick={() => toggle(intereses, setIntereses, it)}>{it}</Chip>
          ))}
        </div>
      </StepShell>
    );
  }

  if (step === 2) {
    return (
      <StepShell step={1} total={total} onBack={back} onNext={next} eyebrow="Tu forma de explorar">
        <h2 className="text-[25px] font-medium text-ink-strong mb-2 tracking-[-0.01em]">¿Cómo te gusta explorar?</h2>
        <p className="text-[14px] font-light text-ink-soft mb-[22px]">Adaptaremos el ritmo y las sugerencias a tu compañía.</p>
        {ONB.compania.map((o) => (
          <OptionRow key={o.k} label={o.k} desc={o.d} active={compania === o.k} onClick={() => setCompania(o.k)} />
        ))}
      </StepShell>
    );
  }

  if (step === 3) {
    return (
      <StepShell step={2} total={total} onBack={back} onNext={next} eyebrow="Tu ritmo">
        <h2 className="text-[25px] font-medium text-ink-strong mb-2 tracking-[-0.01em]">¿Qué nivel de actividad prefieres?</h2>
        <p className="text-[14px] font-light text-ink-soft mb-[22px]">Desde paseos tranquilos hasta rutas que ponen a prueba.</p>
        {ONB.actividad.map((o) => (
          <OptionRow key={o.k} label={o.k} desc={o.d} active={actividad === o.k} onClick={() => setActividad(o.k)} />
        ))}
        <div className="mt-[18px] px-4 py-3.5 rounded-md bg-white/[0.04] border border-cardstroke flex gap-[11px] items-center">
          <Icon name="pin" size={18} color="var(--accent-soft)" />
          <span className="text-[13px] font-light text-ink">
            Usaremos tu ubicación para encontrar lo que está cerca. Puedes cambiarlo cuando quieras.
          </span>
        </div>
      </StepShell>
    );
  }

  return (
    <div className="fade flex-1 flex flex-col pt-2 px-[22px]">
      <div className="flex items-center gap-3.5 pt-1 pb-[18px]">
        <button onClick={back} className="w-[38px] h-[38px] rounded-full shrink-0 grid place-items-center bg-white/5 border border-cardstroke">
          <Icon name="chevLeft" size={20} color="var(--ink)" />
        </button>
        <div className="flex-1"><Progress step={3} total={total} /></div>
      </div>
      <div className="flex-1 flex flex-col justify-center pb-[30px]">
        <div className="rise w-[70px] h-[70px] rounded-lg mb-[26px] grid place-items-center bg-[rgba(210,115,79,0.12)] border border-[rgba(210,115,79,0.3)]">
          <Icon name="sparkles" size={32} color="var(--accent-soft)" stroke={1.6} />
        </div>
        <h1 className="rise text-[29px] font-light text-ink-strong leading-[1.2] tracking-[-0.01em] mb-3.5 [text-wrap:balance]" style={{ animationDelay: "0.05s" }}>
          Encontramos experiencias que se ajustan a <span className="font-medium text-accent-soft">tu forma de explorar.</span>
        </h1>
        <p className="rise text-[15px] font-light text-ink-soft mb-6" style={{ animationDelay: "0.1s" }}>
          Esto es lo que recordaremos sobre ti:
        </p>
        <div className="rise flex flex-col gap-2.5" style={{ animationDelay: "0.15s" }}>
          <SummaryLine icon="heart" label="Te interesa" value={intereses.slice(0, 3).join(" · ") + (intereses.length > 3 ? "…" : "")} />
          <SummaryLine icon="user" label="Exploras" value={compania} />
          <SummaryLine icon="route" label="Tu ritmo" value={actividad} />
        </div>
      </div>
      <div className="pb-[22px]">
        <PrimaryBtn label="Empezar a descubrir" onClick={() => onComplete({ intereses, compania, actividad })} icon="arrowRight" />
      </div>
    </div>
  );
}

function SummaryLine({ icon, label, value }) {
  return (
    <div className="flex items-center gap-[13px] px-4 py-3.5 rounded-md bg-white/[0.045] border border-cardstroke">
      <div className="w-[38px] h-[38px] rounded-full shrink-0 grid place-items-center bg-white/5">
        <Icon name={icon} size={18} color="var(--accent-soft)" />
      </div>
      <div className="flex-1">
        <div className="text-[12px] text-ink-faint">{label}</div>
        <div className="text-[15px] font-medium text-ink-strong mt-px">{value}</div>
      </div>
    </div>
  );
}
