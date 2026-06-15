/* HUELLA — servicio de sellos (gamificación)
   Evalúa qué sellos se desbloquean cuando el usuario marca lugares como visitados
   y los guarda en la tabla `sellos` de Supabase.

   Flujo principal:
     marcar visitado → revisarSellosNuevos() → evalúa condiciones → guarda en Supabase
                                              → devuelve sellos nuevos → UI celebra

   ESCALABILIDAD: para agregar una nueva regla de desbloqueo en el futuro,
   solo hay que añadir una función al objeto EVALUADORES. No hay que tocar
   nada más en este archivo. */

import { supabase } from "../lib/supabase.js";
import { SELLOS } from "../data/sellos.js";

// ─────────────────────────────────────────────────────────────────────────────
// EVALUADORES
// Cada clave es el valor de `condicion.regla` en el catálogo de sellos.
// Cada función recibe (condicion, stats) y devuelve true/false.
//
// Para agregar una regla nueva en el futuro:
//   1. Define el nuevo formato en sellos.js (ej: { regla: "racha", meta: 7 })
//   2. Agrega aquí: racha: (c, s) => s.rachaDias >= c.meta
//   ¡Listo! El resto del código lo detecta automáticamente.
// ─────────────────────────────────────────────────────────────────────────────
const EVALUADORES = {
  // El usuario tiene en total N o más visitados
  cantidad: (condicion, stats) =>
    stats.total >= condicion.meta,

  // El usuario tiene N o más visitados de UNA categoría específica
  categoria: (condicion, stats) =>
    (stats.porCategoria[condicion.categoria] || 0) >= condicion.meta,

  // El usuario tiene visitados en al menos N categorías distintas
  categorias_distintas: (condicion, stats) =>
    stats.categoriasDistintas >= condicion.meta,
};

// ─────────────────────────────────────────────────────────────────────────────
// calcularStats (función interna, no exportada)
// Recibe el array de filas de la tabla "visitados" y devuelve un resumen
// con todo lo que necesitan los evaluadores.
//
// Cada fila de "visitados" tiene: lugar_id, lugar_nombre, lugar_categoria, etc.
// Usamos lugar_categoria porque es el valor que guardamos al marcar visitado.
// ─────────────────────────────────────────────────────────────────────────────
function calcularStats(listaVisitados) {
  // Cuenta cuántos visitados hay de cada categoría
  const porCategoria = {};
  for (const fila of listaVisitados) {
    const cat = fila.lugar_categoria || "sin_categoria";
    porCategoria[cat] = (porCategoria[cat] || 0) + 1;
  }

  return {
    total:              listaVisitados.length,
    porCategoria,                                      // ej: { naturaleza: 3, cafes: 1 }
    categoriasDistintas: Object.keys(porCategoria).length,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// evaluarCondicion (exportada para poder testearla en el futuro de forma aislada)
// Recibe la condición de UN sello y las estadísticas calculadas.
// Devuelve true si el usuario cumple esa condición, false si no.
// ─────────────────────────────────────────────────────────────────────────────
export function evaluarCondicion(condicion, stats) {
  const evaluar = EVALUADORES[condicion.regla];

  // Si la regla no existe en EVALUADORES, avisamos en consola y no bloqueamos
  if (!evaluar) {
    console.warn(
      `[huella] Regla desconocida: "${condicion.regla}". ` +
      `Agrégala al objeto EVALUADORES en sellos.js para que funcione.`
    );
    return false;
  }

  return evaluar(condicion, stats);
}

// ─────────────────────────────────────────────────────────────────────────────
// obtenerSellosObtenidos
// Lee de Supabase los sellos que el usuario ya tiene desbloqueados.
// Devuelve un array de strings con los tipos: ["primera_huella", "caminante", ...]
// ─────────────────────────────────────────────────────────────────────────────
export async function obtenerSellosObtenidos(userId) {
  const { data, error } = await supabase
    .from("sellos")
    .select("sello_tipo")
    .eq("user_id", userId);

  if (error) throw error;

  // Devolvemos solo los tipos, no las filas completas, para facilitar el lookup
  return (data || []).map((fila) => fila.sello_tipo);
}

// ─────────────────────────────────────────────────────────────────────────────
// revisarSellosNuevos  ← función principal, se llama al marcar un visitado
//
// Parámetros:
//   userId        → id del usuario autenticado
//   listaVisitados → array completo de filas de la tabla "visitados" del usuario
//                    (el que ya tiene en memoria el VisitadosContext)
//
// Qué hace:
//   1. Consulta qué sellos ya tiene el usuario (para no duplicar)
//   2. Calcula las estadísticas de sus visitados
//   3. Recorre el catálogo; por cada sello que aún no tiene, evalúa su condición
//   4. Si se cumple, lo inserta en Supabase
//   5. Devuelve solo los sellos que se desbloquearon AHORA (array de objetos del catálogo)
//
// Si Supabase falla en algún paso, registra el error en consola y devuelve []
// para no interrumpir el flujo de marcar un lugar como visitado.
// ─────────────────────────────────────────────────────────────────────────────
export async function revisarSellosNuevos(userId, listaVisitados) {
  try {
    // Paso 1 — sellos que el usuario ya tiene (para no duplicarlos)
    const tiposYaObtenidos = await obtenerSellosObtenidos(userId);
    const yaObtenidosSet   = new Set(tiposYaObtenidos); // Set para búsqueda en O(1)

    // Paso 2 — estadísticas actuales del usuario
    const stats = calcularStats(listaVisitados);

    // Paso 3 — revisar cada sello del catálogo
    const sellosNuevos = [];

    for (const sello of SELLOS) {
      // Saltar si ya lo tiene
      if (yaObtenidosSet.has(sello.id)) continue;

      // Evaluar si la condición se cumple ahora
      if (!evaluarCondicion(sello.condicion, stats)) continue;

      // Paso 4 — insertar en Supabase
      const { error } = await supabase
        .from("sellos")
        .insert({
          user_id:    userId,
          sello_tipo: sello.id,
          obtenido_en: new Date().toISOString(),
        });

      if (error) {
        // Error al guardar este sello específico: lo registramos pero seguimos
        // revisando el resto del catálogo
        console.error(
          `[huella] Error guardando sello "${sello.id}":`,
          error.message
        );
        continue;
      }

      // Paso 5 — acumular para devolver a la UI
      sellosNuevos.push(sello);
    }

    // Devuelve objetos completos del catálogo (con nombre, descripción, ícono)
    // para que la UI pueda mostrar la celebración sin consultas adicionales
    return sellosNuevos;

  } catch (err) {
    // Error grave (ej: no hay conexión): solo lo logueamos
    // El flujo de "marcar visitado" no debe romperse por esto
    console.error("[huella] Error en revisarSellosNuevos:", err.message);
    return [];
  }
}
