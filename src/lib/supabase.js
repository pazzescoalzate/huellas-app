/* HUELLA — cliente de Supabase
   Las claves vienen de las variables de entorno de Vite (.env.local).
   Nunca escribas las claves directamente aquí; ese archivo está en .gitignore.
*/
import { createClient } from "@supabase/supabase-js";

const url  = import.meta.env.VITE_SUPABASE_URL;
const key  = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Aviso en desarrollo si faltan las variables de entorno
if (!url || !key) {
  console.error(
    "[huella] Faltan las claves de Supabase.\n" +
    "Crea el archivo .env.local en la raíz del proyecto con:\n" +
    "  VITE_SUPABASE_URL=https://xxxx.supabase.co\n" +
    "  VITE_SUPABASE_ANON_KEY=eyJh..."
  );
}

export const supabase = createClient(url, key);
