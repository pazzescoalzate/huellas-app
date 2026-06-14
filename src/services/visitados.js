/* HUELLA — operaciones sobre la tabla "visitados" de Supabase
   Gemelo de guardados.js; misma estructura, tabla y columnas distintas.
   Las políticas RLS garantizan que cada usuario solo lee y modifica lo suyo. */
import { supabase } from "../lib/supabase.js";

// Trae todos los lugares visitados del usuario, del más reciente al más antiguo
export async function obtenerVisitados(userId) {
  const { data, error } = await supabase
    .from("visitados")
    .select("*")
    .eq("user_id", userId)
    .order("visitado_en", { ascending: false });

  if (error) throw error;
  return data || [];
}

// Registra un lugar como visitado. "lugar" es el objeto que devuelve OpenStreetMap.
export async function marcarVisitado(userId, lugar) {
  const { error } = await supabase
    .from("visitados")
    .insert({
      user_id:         userId,
      lugar_id:        lugar.id,
      lugar_nombre:    lugar.title  || lugar.nombre || "Lugar sin nombre",
      lugar_categoria: lugar.cat    || lugar.tipo   || "aventura",
      lugar_lat:       lugar.lat    ?? null,
      lugar_lon:       lugar.lon    ?? null,
    });

  if (error) throw error;
}

// Quita un lugar de visitados por su lugar_id (no por el id interno de la fila)
export async function quitarVisitado(userId, lugarId) {
  const { error } = await supabase
    .from("visitados")
    .delete()
    .eq("user_id", userId)
    .eq("lugar_id", lugarId);

  if (error) throw error;
}
