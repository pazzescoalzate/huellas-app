/* HUELLA — estado global de lugares visitados
   Gemelo de GuardadosContext; misma estructura pero tabla y semántica distintas.
   "Guardar" ≠ "Visitar": son listas independientes con propósitos diferentes.

   Proporciona:
   · estaVisitado(id)        → boolean en O(1)
   · toggleVisitado(lugar)   → marca o desmarca con actualización optimista
   · avisoVisitadoInvitado   → true si un invitado intentó marcar sin cuenta
   · cerrarAvisoVisitado     → cierra ese modal
   · sellosNuevos            → cola de sellos recién desbloqueados (para celebración)
   · cerrarCelebracion       → descarta el primer sello de la cola */

import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { obtenerVisitados, marcarVisitado, quitarVisitado } from "../services/visitados.js";
import { revisarSellosNuevos } from "../services/sellos.js";

const VisitadosContext = createContext(null);

// Construye una fila en el mismo formato que devuelve Supabase.
// Se usa para las actualizaciones optimistas (antes de que Supabase confirme).
function construirFila(userId, lugar) {
  return {
    user_id:         userId,
    lugar_id:        lugar.id,
    lugar_nombre:    lugar.title  || lugar.nombre || "Lugar sin nombre",
    lugar_categoria: lugar.cat    || lugar.tipo   || "aventura",
    lugar_lat:       lugar.lat    ?? null,
    lugar_lon:       lugar.lon    ?? null,
    visitado_en:     new Date().toISOString(),
  };
}

export function VisitadosProvider({ children }) {
  const { usuario } = useAuth();

  // Set de lugar_ids: saber en O(1) si un lugar fue visitado
  const [visitadosIds, setVisitadosIds] = useState(new Set());

  // Lista completa de filas (necesaria para calcular las estadísticas de sellos)
  // Cada fila tiene lugar_id, lugar_categoria, visitado_en, etc.
  const [visitadosList, setVisitadosList] = useState([]);

  // true cuando un invitado intenta marcar sin cuenta
  const [avisoVisitadoInvitado, setAvisoVisitadoInvitado] = useState(false);

  // Cola de sellos recién desbloqueados. Se muestran uno a uno.
  // El componente CelebracionSello muestra siempre el primero ([0]).
  const [sellosNuevos, setSellosNuevos] = useState([]);

  // Carga los visitados al iniciar sesión; limpia al cerrar sesión
  useEffect(() => {
    if (!usuario) {
      setVisitadosIds(new Set());
      setVisitadosList([]);
      return;
    }
    obtenerVisitados(usuario.id)
      .then((filas) => {
        setVisitadosIds(new Set(filas.map((f) => f.lugar_id)));
        setVisitadosList(filas); // guardamos la lista completa para los sellos
      })
      .catch((err) => console.error("[huella] Error cargando visitados:", err.message));
  }, [usuario]);

  // Devuelve true si ese lugar_id ya fue visitado
  function estaVisitado(id) {
    return visitadosIds.has(id);
  }

  // Marca o desmarca un lugar como visitado (toggle con actualización optimista)
  async function toggleVisitado(lugar) {
    if (!usuario) {
      setAvisoVisitadoInvitado(true);
      return;
    }

    if (visitadosIds.has(lugar.id)) {
      // ── DESMARCAR ─────────────────────────────────────────────────────
      // Actualizamos la UI antes de que Supabase confirme
      setVisitadosIds((prev) => { const n = new Set(prev); n.delete(lugar.id); return n; });
      setVisitadosList((prev) => prev.filter((f) => f.lugar_id !== lugar.id));
      try {
        await quitarVisitado(usuario.id, lugar.id);
      } catch (err) {
        console.error("[huella] Error desmarcando visitado:", err.message);
        // Revertir si Supabase falla
        const fila = construirFila(usuario.id, lugar);
        setVisitadosIds((prev) => new Set(prev).add(lugar.id));
        setVisitadosList((prev) => [fila, ...prev]);
      }

    } else {
      // ── MARCAR COMO VISITADO ──────────────────────────────────────────

      // Construimos la fila nueva ANTES de la llamada asíncrona,
      // así la tenemos disponible tanto para el optimismo como para los sellos.
      const nuevaFila = construirFila(usuario.id, lugar);

      // La lista actualizada incluye el lugar recién marcado al principio.
      // Se usa para evaluar los sellos con datos ya correctos.
      const listaActualizada = [nuevaFila, ...visitadosList];

      // Actualización optimista: la UI responde de inmediato
      setVisitadosIds((prev) => new Set(prev).add(lugar.id));
      setVisitadosList(listaActualizada);

      try {
        // 1. Guardar la visita en Supabase
        await marcarVisitado(usuario.id, lugar);

        // 2. Revisar si se desbloquea algún sello con la lista ya actualizada.
        //    revisarSellosNuevos maneja sus propios errores internamente y devuelve []
        //    si algo falla, así que no puede romper este flujo.
        const nuevos = await revisarSellosNuevos(usuario.id, listaActualizada);

        // 3. Si hay sellos nuevos, los añadimos a la cola de celebraciones
        if (nuevos.length > 0) {
          setSellosNuevos((prev) => [...prev, ...nuevos]);
        }

      } catch (err) {
        // marcarVisitado falló → revertir la actualización optimista
        console.error("[huella] Error marcando visitado:", err.message);
        setVisitadosIds((prev) => { const n = new Set(prev); n.delete(lugar.id); return n; });
        setVisitadosList((prev) => prev.filter((f) => f.lugar_id !== lugar.id));
      }
    }
  }

  // Quita el primer sello de la cola: el usuario cerró esa celebración
  function cerrarCelebracion() {
    setSellosNuevos((prev) => prev.slice(1));
  }

  function cerrarAvisoVisitado() {
    setAvisoVisitadoInvitado(false);
  }

  return (
    <VisitadosContext.Provider
      value={{
        estaVisitado,
        toggleVisitado,
        avisoVisitadoInvitado,
        cerrarAvisoVisitado,
        sellosNuevos,       // cola de sellos para la celebración
        cerrarCelebracion,  // cierra el primero de la cola
      }}
    >
      {children}
    </VisitadosContext.Provider>
  );
}

export function useVisitados() {
  const ctx = useContext(VisitadosContext);
  if (!ctx) throw new Error("useVisitados() debe usarse dentro de <VisitadosProvider>. Revisa main.jsx.");
  return ctx;
}
