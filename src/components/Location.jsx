/* HUELLA — selector de ciudad (bottom sheet)
   Busca ciudades reales con Nominatim/OSM.
   Muestra ciudades recientes (Supabase para usuarios, localStorage para invitados).
   Detecta la ciudad actual via GPS (solo nivel ciudad, sin coordenadas precisas). */
import { useState, useEffect } from "react";
import Icon from "./Icon.jsx";
import { buscarCiudades, detectarCiudadActual } from "../services/ciudades.js";

/* ── Fila de ciudad en la lista ──────────────────────────────────────────── */
function CiudadFila({ ciudad, icono = "pin", activa, onClick }) {
  return (
    <button
      onClick={onClick}
      className={
        "w-full flex items-center gap-[13px] text-left px-2 py-[11px] rounded-md mb-0.5 " +
        (activa ? "bg-white/[0.05]" : "bg-transparent")
      }
    >
      {/* Ícono circular: distinto para recientes (reloj) vs sugerencias (pin) */}
      <span className="w-[42px] h-[42px] rounded-full grid place-items-center shrink-0 bg-white/[0.06] border border-cardstroke">
        <Icon name={icono} size={18} color="var(--ink-soft)" stroke={1.8} />
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-medium text-ink-strong">{ciudad.name}</span>
        <span className="block text-[12.5px] font-light text-ink-faint mt-px">{ciudad.region}</span>
      </span>
      {activa && <Icon name="check" size={20} color="var(--accent-soft)" stroke={2.4} />}
    </button>
  );
}

/* ── Etiqueta de sección ─────────────────────────────────────────────────── */
function SeccionLabel({ children }) {
  return (
    <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-faint mx-1 mb-2 mt-1">
      {children}
    </div>
  );
}

/* ── Esqueleto mientras carga ────────────────────────────────────────────── */
function Esqueleto() {
  return (
    <div className="flex flex-col gap-2 animate-pulse mt-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 py-2">
          <div className="w-[42px] h-[42px] rounded-full bg-white/[0.06] shrink-0" />
          <div className="flex-1">
            <div className="h-[14px] rounded-lg bg-white/[0.06] w-2/3 mb-1.5" />
            <div className="h-[11px] rounded-lg bg-white/[0.04] w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Componente principal ────────────────────────────────────────────────── */
export default function LocationSheet({ current, recientes = [], onPick, onClose }) {
  const [closing,   setClosing]   = useState(false);
  const [q,         setQ]         = useState("");
  const [sugerencias, setSugerencias] = useState([]);
  const [buscando,  setBuscando]  = useState(false);
  const [detectando, setDetectando] = useState(false);
  const [errorMsg,  setErrorMsg]  = useState(null);

  const close = () => { setClosing(true); setTimeout(onClose, 280); };

  // Seleccionar una ciudad: avisar al padre y cerrar el sheet
  const pick = (ciudad) => { onPick(ciudad); close(); };

  /* Debounce de 400 ms: espera a que el usuario deje de escribir
     antes de llamar a Nominatim, para no saturar el servicio */
  useEffect(() => {
    const texto = q.trim();

    // Con menos de 2 caracteres no buscamos
    if (texto.length < 2) {
      setSugerencias([]);
      setErrorMsg(null);
      setBuscando(false);
      return;
    }

    setBuscando(true);
    setErrorMsg(null);

    const timer = setTimeout(async () => {
      try {
        const resultados = await buscarCiudades(texto);
        setSugerencias(resultados);
      } catch (err) {
        setErrorMsg(err.message);
        setSugerencias([]);
      } finally {
        setBuscando(false);
      }
    }, 400);

    // Cancelar el timer si el usuario sigue escribiendo antes de los 400 ms
    return () => clearTimeout(timer);
  }, [q]);

  /* GPS: detectar la ciudad actual del dispositivo */
  const usarGPS = async () => {
    setDetectando(true);
    setErrorMsg(null);
    try {
      const ciudad = await detectarCiudadActual();
      pick(ciudad);
    } catch (err) {
      setErrorMsg(err.message);
      setDetectando(false);
    }
  };

  // Si el campo está en blanco (< 2 chars) mostramos recientes; si tiene texto, sugerencias
  const mostrandoRecientes = q.trim().length < 2;

  return (
    // "fixed inset-0" ancla el overlay al viewport, no al contenedor padre.
    // Con "absolute" el translateY(100%) inicial podía quedar fuera del clip
    // y el navegador desplazaba el contenido principal para mostrarlo.
    <div className="fixed inset-0 z-[55] flex flex-col">
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

      {/* Fondo oscuro: clic fuera cierra */}
      <div
        onClick={close}
        className={"loc-scrim absolute inset-0 bg-[rgba(8,7,6,0.62)] backdrop-blur-[2px] " +
          (closing ? "loc-scrim-out" : "loc-scrim-in")}
      />

      {/* Sheet */}
      <div className={"loc-sheet absolute left-0 right-0 bottom-0 max-h-[88%] bg-bg2 rounded-t-xl flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.5)] border-t border-glassstroke " +
        (closing ? "loc-sheet-out" : "loc-sheet-in")}>

        {/* ── Cabecera fija ───────────────────────────────────────────── */}
        <div className="pt-2.5 px-[22px] pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-ink-ghost mx-auto mb-4" />
          <div className="flex items-center justify-between mb-3.5">
            <h2 className="text-[21px] font-semibold text-ink-strong tracking-[-0.01em]">
              ¿Dónde quieres explorar?
            </h2>
            <button
              onClick={close}
              className="w-[34px] h-[34px] rounded-full grid place-items-center bg-white/[0.06] border border-cardstroke"
            >
              <Icon name="x" size={17} color="var(--ink)" />
            </button>
          </div>

          {/* Campo de búsqueda */}
          <div className="flex items-center gap-2.5 px-3.5 py-3 mb-1.5 rounded-full bg-bg0 border border-cardstroke">
            <Icon name="search" size={18} color="var(--ink-faint)" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Busca una ciudad o región"
              className="flex-1 border-none outline-none bg-transparent text-ink-strong text-[14px] placeholder:text-ink-ghost"
              // autoFocus eliminado: en móvil abría el teclado y el navegador
              // desplazaba la página para mostrar el campo, moviendo el fondo.
            />
            {q && (
              <button onClick={() => setQ("")}>
                <Icon name="x" size={15} color="var(--ink-faint)" />
              </button>
            )}
          </div>
        </div>

        {/* ── Contenido desplazable ───────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto px-[22px] pt-2 pb-6 [overscroll-behavior:contain]">

          {/* Botón GPS: siempre visible */}
          <button
            onClick={usarGPS}
            disabled={detectando}
            className="w-full flex items-center gap-[13px] text-left px-4 py-3.5 mb-4 rounded-lg bg-[rgba(210,115,79,0.1)] border border-[rgba(210,115,79,0.3)] disabled:opacity-60"
          >
            <div className="w-[42px] h-[42px] rounded-full shrink-0 grid place-items-center bg-accent shadow-[0_4px_14px_rgba(210,115,79,0.35)]">
              {detectando
                ? <span className="w-5 h-5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                : <Icon name="compass" size={21} color="var(--on-accent)" stroke={2} />
              }
            </div>
            <div className="flex-1">
              <div className="text-[15px] font-semibold text-ink-strong">Usar mi ubicación actual</div>
              <div className="text-[12.5px] font-light text-ink-soft mt-px">
                {detectando ? "Detectando ciudad…" : "Detecta tu ciudad automáticamente"}
              </div>
            </div>
            {current?.id?.startsWith("actual-") && (
              <Icon name="check" size={20} color="var(--accent-soft)" stroke={2.4} />
            )}
          </button>

          {/* Mensaje de error (GPS o búsqueda) */}
          {errorMsg && (
            <div className="flex items-center gap-2 px-3 py-2.5 mb-3 rounded-lg bg-white/[0.04] border border-cardstroke">
              <Icon name="wifi" size={16} color="var(--ink-faint)" />
              <span className="text-[13px] font-light text-ink-faint">{errorMsg}</span>
            </div>
          )}

          {/* ── Recientes (campo vacío) ────────────────────────────────── */}
          {mostrandoRecientes && (
            recientes.length > 0 ? (
              <>
                <SeccionLabel>Recientes</SeccionLabel>
                {recientes.map((c) => (
                  <CiudadFila
                    key={c.id}
                    ciudad={c}
                    icono="clock"
                    activa={c.id === current?.id}
                    onClick={() => pick(c)}
                  />
                ))}
              </>
            ) : (
              <p className="text-center text-[14px] font-light text-ink-faint py-6">
                Escribe una ciudad para empezar a explorar.
              </p>
            )
          )}

          {/* ── Sugerencias de búsqueda (campo con texto) ─────────────── */}
          {!mostrandoRecientes && (
            <>
              {buscando && <Esqueleto />}

              {!buscando && sugerencias.length > 0 && (
                <>
                  <SeccionLabel>Resultados</SeccionLabel>
                  {sugerencias.map((c) => (
                    <CiudadFila
                      key={c.id}
                      ciudad={c}
                      icono="pin"
                      activa={c.id === current?.id}
                      onClick={() => pick(c)}
                    />
                  ))}
                </>
              )}

              {!buscando && sugerencias.length === 0 && !errorMsg && (
                <div className="text-center py-10">
                  <Icon name="compass" size={32} color="var(--ink-faint)" />
                  <p className="text-[14px] font-light text-ink-faint mt-3">
                    Sin resultados para "{q.trim()}"
                  </p>
                  <p className="text-[12px] font-light text-ink-ghost mt-1">
                    Prueba con el nombre del país o en otro idioma.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
