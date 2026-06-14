/* HUELLA — Guardados
   - Invitado:   pantalla CTA para crear cuenta
   - Registrado: lista real de guardados desde Supabase (GuardadosContext) */
import { useState } from "react";
import Icon from "./Icon.jsx";
import { CatSurface } from "./Shared.jsx";
import { CardTap } from "./Cards.jsx";
import { ScreenHead } from "./Tours.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { useGuardados } from "../context/GuardadosContext.jsx";

// Etiquetas legibles para cada categoría de OSM
const CAT_LABEL = {
  naturaleza: "Naturaleza",
  cultura:    "Cultura",
  gastronomia:"Gastronomía",
  miradores:  "Miradores",
  cafes:      "Cafés",
  aventura:   "Aventura",
  bienestar:  "Bienestar",
};

/* Pantalla para invitados: los invita a registrarse para poder guardar lugares */
function PantallaGuardadosInvitado({ onCrearCuenta }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 pb-28 text-center">
      <div
        className="w-[72px] h-[72px] rounded-2xl mb-6 grid place-items-center"
        style={{ background: "rgba(210,115,79,0.10)", border: "1px solid rgba(210,115,79,0.25)" }}
      >
        <Icon name="bookmark" size={32} color="var(--accent-soft)" />
      </div>
      <h2 className="text-[21px] font-semibold text-ink-strong tracking-[-0.01em] mb-2 [text-wrap:balance]">
        Tus lugares por visitar
      </h2>
      <p className="text-[14px] font-light text-ink-soft leading-[1.6] mb-8 [text-wrap:balance]">
        Crea una cuenta gratis para guardar experiencias y volver a ellas cuando quieras.
      </p>
      <button
        onClick={onCrearCuenta}
        className="w-full h-14 rounded-full bg-accent text-white text-[16px] font-semibold shadow-[0_10px_30px_rgba(210,115,79,0.32)]"
      >
        Crear cuenta gratis
      </button>
    </div>
  );
}

export default function SavedScreen({ onOpen, onCrearCuenta }) {
  const { esInvitado } = useAuth();
  // Leemos del contexto: ya no necesitamos props "saved" ni "onSave"
  const { guardadosList, toggleGuardado } = useGuardados();
  const [scrolled, setScrolled] = useState(false);

  // Invitado → pantalla de conversión (no tiene guardados en Supabase)
  if (esInvitado) {
    return (
      <div className="flex-1 overflow-y-auto pb-24 flex flex-col">
        <PantallaGuardadosInvitado onCrearCuenta={onCrearCuenta} />
      </div>
    );
  }

  // Usuario registrado → lista real de guardados
  return (
    <div
      onScroll={(e) => setScrolled(e.target.scrollTop > 8)}
      className="flex-1 overflow-y-auto pb-24"
    >
      <ScreenHead
        title="Guardados"
        sub={
          guardadosList.length
            ? `${guardadosList.length} ${guardadosList.length === 1 ? "experiencia" : "experiencias"} por vivir`
            : null
        }
        scrolled={scrolled}
      />

      {guardadosList.length === 0 ? (
        // Estado vacío para usuarios registrados sin guardados aún
        <div className="flex flex-col items-center justify-center text-center px-11 pt-20">
          <div className="w-[72px] h-[72px] rounded-lg grid place-items-center mb-5 bg-[rgba(210,115,79,0.1)] border border-[rgba(210,115,79,0.24)]">
            <Icon name="bookmark" size={32} color="var(--accent-soft)" />
          </div>
          <h2 className="text-[19px] font-medium text-ink-strong mb-2">Aún no tienes nada por visitar</h2>
          <p className="text-[14px] font-light text-ink-soft leading-[1.5] max-w-[260px]">
            Toca la bandera en cualquier experiencia y aparecerá aquí, lista para cuando llegue el momento.
          </p>
        </div>
      ) : (
        // Lista de lugares guardados reales
        <div className="flex flex-col gap-4 px-[22px] pt-2">
          {guardadosList.map((lugar, i) => (
            <div key={lugar.id} className="rise" style={{ animationDelay: `${Math.min(i, 5) * 0.05}s` }}>
              <SavedRow
                lugar={lugar}
                onOpen={onOpen}
                onToggle={toggleGuardado}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SavedRow({ lugar, onOpen, onToggle }) {
  const catLabel = CAT_LABEL[lugar.cat] || lugar.cat || "Lugar";

  return (
    <CardTap
      onClick={() => onOpen(lugar)}
      className="flex gap-3.5 w-full text-left p-3 rounded-xl bg-white/[0.045] border border-cardstroke shadow-elev1"
    >
      {/* Miniatura de la categoría (mismo degradado que en las tarjetas) */}
      <CatSurface cat={lugar.cat} className="w-[92px] h-[92px] rounded-lg shrink-0" />

      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-start justify-between gap-2">
          <div className="text-[16px] font-semibold text-ink-strong tracking-[-0.01em] leading-[1.2] whitespace-nowrap overflow-hidden text-ellipsis">
            {lugar.title}
          </div>
          {/* Bandera coral: tocarlo quita el lugar de "Por visitar" */}
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(lugar); }}
            className="shrink-0 -mt-0.5"
          >
            <Icon name="bookmark" size={20} fill="var(--accent)" color="var(--accent)" stroke={0} />
          </button>
        </div>

        {/* Categoría como subtítulo (no guardamos rating/dist en Supabase) */}
        <div className="text-[13px] text-ink-soft mt-[3px]">{catLabel}</div>

        {/* Tagline: solo si existe (los lugares de OSM pueden no tenerlo) */}
        {lugar.tagline ? (
          <div className="text-[14px] font-semibold text-ink-strong mt-1.5">{lugar.tagline}</div>
        ) : null}
      </div>
    </CardTap>
  );
}
