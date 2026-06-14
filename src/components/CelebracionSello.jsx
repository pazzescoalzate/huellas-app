/* HUELLA — CelebracionSello
   Modal de celebración que aparece cuando el usuario desbloquea un sello nuevo.

   Props:
     sello     → objeto del catálogo (tipo, nombre, descripcion, icono)
     onCerrar  → función que se llama al tocar "¡Genial!" (descarta de la cola)

   Si hay varios sellos en cola, App.jsx pasa siempre el [0] y al cerrar
   el contexto hace slice(1), mostrando el siguiente automáticamente. */

import Icon from "./Icon.jsx";

export default function CelebracionSello({ sello, onCerrar }) {
  if (!sello) return null;

  return (
    <div className="absolute inset-0 z-[90] flex items-center justify-center px-7">
      <style>{`
        @keyframes sello-fondo {
          from { opacity: 0 }
          to   { opacity: 1 }
        }
        @keyframes sello-tarjeta {
          from { opacity: 0; transform: scale(0.82) translateY(12px); }
          to   { opacity: 1; transform: scale(1)    translateY(0);    }
        }
        .sello-fondo   { animation: sello-fondo   0.28s ease both; }
        .sello-tarjeta { animation: sello-tarjeta 0.38s cubic-bezier(0.22,1,0.36,1) both; }
      `}</style>

      {/* Fondo oscuro semitransparente — NO cierra al tocar (es un logro, no un error) */}
      <div className="sello-fondo absolute inset-0 bg-[rgba(8,7,6,0.72)] backdrop-blur-[4px]" />

      {/* Tarjeta central */}
      <div className="sello-tarjeta relative w-full max-w-[320px] bg-bg1 rounded-2xl border border-cardstroke shadow-[0_24px_60px_rgba(0,0,0,0.6)] overflow-hidden">

        {/* Franja decorativa superior en degradado coral */}
        <div
          className="h-[6px] w-full"
          style={{ background: "linear-gradient(90deg, var(--accent), #E8A87C, var(--accent))" }}
        />

        <div className="px-7 pt-7 pb-8 flex flex-col items-center text-center">

          {/* Destellos decorativos arriba del ícono */}
          <div className="flex items-center gap-2 mb-5 text-[var(--accent-soft)] opacity-80">
            <Icon name="sparkles" size={14} color="var(--accent-soft)" />
            <span className="text-[11px] font-semibold tracking-[0.08em] uppercase">
              ¡Nuevo sello desbloqueado!
            </span>
            <Icon name="sparkles" size={14} color="var(--accent-soft)" />
          </div>

          {/* Ícono del sello en círculo coral */}
          <div
            className="w-[80px] h-[80px] rounded-full grid place-items-center mb-5 shadow-[0_8px_28px_rgba(210,115,79,0.35)]"
            style={{
              background: "linear-gradient(145deg, rgba(210,115,79,0.28), rgba(210,115,79,0.12))",
              border: "1.5px solid rgba(210,115,79,0.4)",
            }}
          >
            <Icon name={sello.icono} size={36} color="var(--accent-soft)" stroke={1.6} />
          </div>

          {/* Nombre del sello */}
          <h2 className="text-[22px] font-semibold text-ink-strong tracking-[-0.02em] leading-tight mb-2">
            {sello.nombre}
          </h2>

          {/* Descripción corta y emotiva */}
          <p className="text-[14px] font-light text-ink-soft leading-[1.6] italic mb-8">
            "{sello.descripcion}"
          </p>

          {/* Botón de cierre */}
          <button
            onClick={onCerrar}
            className="w-full h-[52px] rounded-full bg-accent text-white text-[16px] font-semibold shadow-[0_8px_24px_rgba(210,115,79,0.32)]"
          >
            ¡Genial!
          </button>
        </div>
      </div>
    </div>
  );
}
