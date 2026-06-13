/* HUELLA — funciones para leer y escribir el perfil en Supabase (tabla perfiles) */
import { supabase } from "../lib/supabase.js";

// Devuelve el perfil completo del usuario, o null si todavía no existe la fila
export async function obtenerPerfil(userId) {
  const { data, error } = await supabase
    .from("perfiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    // PGRST116 = "no se encontró ninguna fila" → es normal para usuarios recién registrados
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

// Actualiza campos del perfil; usa upsert por si el trigger aún no creó la fila
export async function actualizarPerfil(userId, datos) {
  const { data, error } = await supabase
    .from("perfiles")
    .upsert({ id: userId, ...datos }, { onConflict: "id" })
    .select()
    .single();

  if (error) throw error;
  return data;
}
