/* HUELLA — operaciones sobre la tabla "guardados" de Supabase
   Cada función recibe el userId del usuario autenticado y los datos del lugar.
   Las políticas RLS de Supabase garantizan que cada usuario
   solo puede leer y modificar sus propios registros. */
import { supabase } from "../lib/supabase.js";

// Trae todos los lugares guardados del usuario, ordenados del más reciente al más antiguo
export async function obtenerGuardados(userId) {
  const { data, error } = await supabase
    .from("guardados")
    .select("*")
    .eq("user_id", userId)
    .order("creado_en", { ascending: false });

  if (error) throw error;
  return data || [];
}

// Guarda un lugar en la tabla. "lugar" es el objeto que devuelve OpenStreetMap.
export async function guardarLugar(userId, lugar) {
  const { error } = await supabase
    .from("guardados")
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

// Quita un lugar guardado por su lugar_id (no por el id interno de la fila)
export async function quitarGuardado(userId, lugarId) {
  const { error } = await supabase
    .from("guardados")
    .delete()
    .eq("user_id", userId)
    .eq("lugar_id", lugarId);

  if (error) throw error;
}
