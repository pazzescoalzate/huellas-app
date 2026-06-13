/* HUELLA — estado global de favoritos (guardados)
   Proporciona: lista completa, check rápido si un lugar está guardado,
   toggle guardar/quitar con actualización optimista, y aviso para invitados. */
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { obtenerGuardados, guardarLugar, quitarGuardado } from "../services/guardados.js";

const GuardadosContext = createContext(null);

// Convierte un registro de la tabla "guardados" al objeto mínimo que necesitan las tarjetas
function filaALugar(g) {
  return {
    id:          g.lugar_id,
    title:       g.lugar_nombre,
    nombre:      g.lugar_nombre,
    cat:         g.lugar_categoria,
    tipo:        g.lugar_categoria,
    lat:         g.lugar_lat,
    lon:         g.lugar_lon,
    // Los campos de OSM no se almacenan en Supabase: quedan vacíos o null.
    // "zona" reemplaza "dist" (campo renombrado en toda la app).
    // "match" es null porque aquí no tenemos el contexto de intereses del usuario;
    // las tarjetas de guardados no muestran compatibilidad (null-guard en Cards/Detail).
    place:       "",
    zona:        null,
    time:        "",
    level:       "",
    match:       null,
    rating:      null,
    tagline:     "",
    blurb:       g.lugar_nombre,
    insight:     "",
    modules:     {},
    _guardadoEn: g.creado_en,
  };
}

export function GuardadosProvider({ children }) {
  const { usuario } = useAuth();

  // Set de lugar_ids: permite saber en O(1) si un lugar está guardado
  const [guardadosIds, setGuardadosIds] = useState(new Set());
  // Lista completa para renderizar la pantalla Guardados
  const [guardadosList, setGuardadosList] = useState([]);
  // true cuando un usuario no autenticado intenta guardar un lugar
  const [avisoInvitado, setAvisoInvitado] = useState(false);

  // Carga los guardados cuando el usuario inicia sesión; limpia al cerrar
  useEffect(() => {
    if (!usuario) {
      setGuardadosIds(new Set());
      setGuardadosList([]);
      return;
    }
    obtenerGuardados(usuario.id)
      .then((filas) => {
        setGuardadosIds(new Set(filas.map((f) => f.lugar_id)));
        setGuardadosList(filas.map(filaALugar));
      })
      .catch((err) => console.error("[huella] Error cargando guardados:", err.message));
  }, [usuario]);

  // Devuelve true si el lugar con ese id está en la lista de guardados
  function estaGuardado(id) {
    return guardadosIds.has(id);
  }

  // Guarda o quita un lugar (toggle). Recibe el objeto completo del lugar.
  async function toggleGuardado(lugar) {
    // Si no hay sesión activa, mostramos el aviso para crear cuenta
    if (!usuario) {
      setAvisoInvitado(true);
      return;
    }

    if (guardadosIds.has(lugar.id)) {
      // ── QUITAR ────────────────────────────────────────────────────────
      // Actualización optimista: quitamos de la UI antes de que Supabase confirme
      setGuardadosIds((prev) => { const n = new Set(prev); n.delete(lugar.id); return n; });
      setGuardadosList((prev) => prev.filter((g) => g.id !== lugar.id));
      try {
        await quitarGuardado(usuario.id, lugar.id);
      } catch (err) {
        console.error("[huella] Error quitando guardado:", err.message);
        // Revertir si Supabase falló
        setGuardadosIds((prev) => new Set(prev).add(lugar.id));
        setGuardadosList((prev) => [
          filaALugar({
            lugar_id:        lugar.id,
            lugar_nombre:    lugar.title  || lugar.nombre || "",
            lugar_categoria: lugar.cat    || "aventura",
            lugar_lat:       lugar.lat    ?? null,
            lugar_lon:       lugar.lon    ?? null,
            creado_en:       new Date().toISOString(),
          }),
          ...prev,
        ]);
      }
    } else {
      // ── GUARDAR ───────────────────────────────────────────────────────
      const nuevaFila = {
        lugar_id:        lugar.id,
        lugar_nombre:    lugar.title  || lugar.nombre || "Lugar sin nombre",
        lugar_categoria: lugar.cat    || lugar.tipo   || "aventura",
        lugar_lat:       lugar.lat    ?? null,
        lugar_lon:       lugar.lon    ?? null,
        creado_en:       new Date().toISOString(),
      };
      // Actualización optimista
      setGuardadosIds((prev) => new Set(prev).add(lugar.id));
      setGuardadosList((prev) => [filaALugar(nuevaFila), ...prev]);
      try {
        await guardarLugar(usuario.id, lugar);
      } catch (err) {
        console.error("[huella] Error guardando lugar:", err.message);
        // Revertir
        setGuardadosIds((prev) => { const n = new Set(prev); n.delete(lugar.id); return n; });
        setGuardadosList((prev) => prev.filter((g) => g.id !== lugar.id));
      }
    }
  }

  function cerrarAviso() {
    setAvisoInvitado(false);
  }

  return (
    <GuardadosContext.Provider value={{ guardadosList, estaGuardado, toggleGuardado, avisoInvitado, cerrarAviso }}>
      {children}
    </GuardadosContext.Provider>
  );
}

export function useGuardados() {
  const ctx = useContext(GuardadosContext);
  if (!ctx) throw new Error("useGuardados() debe usarse dentro de <GuardadosProvider>. Revisa main.jsx.");
  return ctx;
}
