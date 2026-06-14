/* HUELLA — MapaLugar
   Mapa real con Leaflet (puro JS) + tiles gratuitos de CartoDB/OSM.
   Sin API key. Sin react-leaflet (evita conflictos de versiones de React).

   Patrón: useRef para el contenedor DOM + useEffect para montar/desmontar Leaflet.
   Problema resuelto: marcador por defecto de Leaflet usa PNG con rutas que Vite
   no resuelve → usamos L.divIcon (HTML/CSS puro, sin imágenes). */

import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import Icon from "./Icon.jsx";

// ── Tiles oscuros de CartoDB Dark Matter ─────────────────────────────────
// Gratis, sin API key. Tema oscuro coherente con Huella.
const TILES_URL  = "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
const TILES_ATTR = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';

// ── Marcador coral con divIcon ────────────────────────────────────────────
// Evita las imágenes PNG de Leaflet que se rompen con bundlers como Vite.
function crearMarcador() {
  return L.divIcon({
    html: `<div style="
      width:20px; height:20px; border-radius:50%;
      background:#D2734F;
      border:3px solid rgba(255,255,255,0.95);
      box-shadow:0 3px 10px rgba(0,0,0,0.65), 0 0 0 3px rgba(210,115,79,0.25);
    "></div>`,
    className:  "",
    iconSize:   [20, 20],
    iconAnchor: [10, 10],
  });
}

// ── Hook: monta un mapa de Leaflet en un div y lo desmonta al salir ───────
// "invalidateSize" es clave: cuando el contenedor aún no tiene su tamaño final
// en el primer frame (típico en overlays fixed que acaban de aparecer), Leaflet
// pinta los tiles con dimensiones equivocadas → se ven "franjas" o repeticiones.
// Llamarlo con setTimeout tras el mount fuerza el recálculo correcto.
function useMapa(containerRef, lat, lon, opciones = {}) {
  const mapaRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;
    if (mapaRef.current)       return; // evitar doble inicialización

    const mapa = L.map(containerRef.current, {
      center:             [lat, lon],
      zoom:               15,
      zoomControl:        opciones.zoomControl     ?? false,
      scrollWheelZoom:    opciones.scrollWheelZoom ?? false,
      dragging:           opciones.dragging        ?? true,
      attributionControl: true,
    });

    L.tileLayer(TILES_URL, { attribution: TILES_ATTR }).addTo(mapa);
    L.marker([lat, lon], { icon: crearMarcador() }).addTo(mapa);

    mapaRef.current = mapa;

    // Corrección de franjas: el contenedor puede no tener su tamaño final
    // en el momento exacto de mount (especialmente overlays fixed o divs con
    // transición CSS). Dos llamadas escalonadas cubren la mayoría de casos:
    //   · 50 ms  → primer recálculo, normalmente suficiente para el mini-mapa
    //   · 300 ms → segundo recálculo, cubre contenedores con transición de entrada
    const t1 = setTimeout(() => mapa.invalidateSize(), 50);
    const t2 = setTimeout(() => mapa.invalidateSize(), 300);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      // "remove()" destruye la instancia: libera event listeners y el flag
      // interno "already initialized" para que el próximo mount funcione limpio.
      mapa.remove();
      mapaRef.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lon]);

  return mapaRef;
}

// ── Mapa mini (dentro de la ficha, 168 px de alto) ───────────────────────
// Solo tiene dos overlays: zona (pill informativo) y botón "Ampliar".
// El botón "Cómo llegar" NO está aquí: está en la barra inferior del DetailSheet,
// siempre visible, así que no hace falta duplicarlo sobre el mini-mapa.
function MapaMini({ lat, lon, zona, onExpand }) {
  const containerRef = useRef(null);
  useMapa(containerRef, lat, lon, { zoomControl: false, scrollWheelZoom: false });

  return (
    <div className="relative h-[168px] rounded-lg overflow-hidden border border-cardstroke shadow-elev1">

      {/* Contenedor donde Leaflet monta el mapa */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Etiqueta de zona/barrio — esquina inferior izquierda */}
      {zona && (
        <span
          className="glass absolute left-3 bottom-3 px-[13px] py-2 rounded-full flex items-center gap-[7px] text-[12.5px] font-medium text-ink-strong pointer-events-none"
          style={{ zIndex: 400 }}
        >
          <Icon name="pin" size={13} color="var(--accent-soft)" /> {zona}
        </span>
      )}

      {/* Botón "Ampliar" — esquina superior derecha */}
      <button
        onClick={onExpand}
        aria-label="Ver mapa en pantalla completa"
        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full grid place-items-center bg-[rgba(20,18,16,0.55)] backdrop-blur-[8px] border border-white/[0.18]"
        style={{ zIndex: 400 }}
      >
        <Icon name="expand" size={15} color="#fff" stroke={2} />
      </button>
    </div>
  );
}

// ── Mapa en pantalla completa ─────────────────────────────────────────────
// z-index 200: suficientemente alto para quedar por encima de cualquier overlay
// interno (DetailSheet z-60, botones del mini-mapa z-400 dentro de su propio
// stacking context). Con z-200 en el viewport stacking context, cubre todo.
function MapaFullscreen({ lat, lon, zona, onClose, onDirections }) {
  const containerRef = useRef(null);
  useMapa(containerRef, lat, lon, { zoomControl: true, scrollWheelZoom: true });

  return (
    <div className="fixed inset-0 flex flex-col" style={{ zIndex: 200 }}>

      {/* Contenedor donde Leaflet monta el mapa a pantalla completa */}
      <div ref={containerRef} className="w-full h-full" />

      {/* ── Botón CERRAR (X) — esquina superior derecha ─────────────────
          Fondo semiopaco oscuro para que se vea siempre sobre cualquier tile.
          Tamaño 44 px: mínimo recomendado para targets táctiles en móvil. */}
      <button
        onClick={onClose}
        aria-label="Cerrar mapa"
        className="absolute top-4 right-4 w-11 h-11 rounded-full grid place-items-center border border-white/[0.25]"
        style={{
          zIndex:     600,
          background: "rgba(0,0,0,0.65)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Icon name="x" size={20} color="#fff" stroke={2.2} />
      </button>

      {/* Etiqueta de zona — esquina superior izquierda, junto al margen */}
      {zona && (
        <div
          className="absolute top-4 left-4 pointer-events-none"
          style={{ zIndex: 600 }}
        >
          <span className="glass px-3.5 py-2 rounded-full text-[13px] font-medium text-ink-strong flex items-center gap-2">
            <Icon name="pin" size={13} color="var(--accent-soft)" /> {zona}
          </span>
        </div>
      )}

      {/* Botón "Cómo llegar" — único, grande, en la parte inferior.
          Gradiente oscuro de fondo para que se lea bien sobre cualquier tile. */}
      <div
        className="absolute left-0 right-0 bottom-0 px-5 pt-12 pb-[max(20px,env(safe-area-inset-bottom))]"
        style={{
          zIndex: 600,
          background: "linear-gradient(to top, rgba(8,7,6,0.82) 55%, transparent)",
        }}
      >
        <button
          onClick={onDirections}
          className="w-full h-[52px] rounded-full flex items-center justify-center gap-2 text-[15px] font-semibold text-white bg-accent shadow-[0_8px_24px_rgba(210,115,79,0.35)]"
        >
          <Icon name="route" size={19} color="#fff" stroke={2} /> Cómo llegar
        </button>
      </div>
    </div>
  );
}

// ── Placeholder: lugar sin coordenadas ───────────────────────────────────
// Los guardados en Supabase no siempre tienen lat/lon; no rompemos la app.
function SinUbicacion({ zona, onDirections }) {
  return (
    <div className="h-[168px] rounded-lg border border-cardstroke bg-white/[0.03] flex flex-col items-center justify-center gap-3">
      <Icon name="map" size={28} color="var(--ink-ghost)" />
      <p className="text-[13px] font-light text-ink-faint">Ubicación no disponible</p>
      {onDirections && (
        <button
          onClick={onDirections}
          className="flex items-center gap-1.5 text-[13px] font-medium text-accent-soft"
        >
          <Icon name="route" size={14} color="var(--accent-soft)" stroke={2} /> Cómo llegar
        </button>
      )}
    </div>
  );
}

// ── Componente principal exportado ────────────────────────────────────────
// Props:
//   lat, lon     → números (vienen de Overpass/OSM); pueden ser null en guardados
//   titulo       → reservado para accesibilidad futura
//   zona         → barrio/sector calculado en lugares.js (puede ser null)
//   onDirections → abre la navegación externa (NavSheet en Detail.jsx)
export default function MapaLugar({ lat, lon, titulo, zona, onDirections }) {
  const [fullscreen, setFullscreen] = useState(false);

  const coordsOk =
    typeof lat === "number" && typeof lon === "number" &&
    !isNaN(lat) && !isNaN(lon);

  if (!coordsOk) {
    return <SinUbicacion zona={zona} onDirections={onDirections} />;
  }

  return (
    <>
      <MapaMini
        lat={lat}
        lon={lon}
        zona={zona}
        onExpand={() => setFullscreen(true)}
      />

      {/* Fullscreen: se monta solo al abrir (lazy), se destruye al cerrar */}
      {fullscreen && (
        <MapaFullscreen
          lat={lat}
          lon={lon}
          zona={zona}
          onClose={() => setFullscreen(false)}
          onDirections={onDirections}
        />
      )}
    </>
  );
}
