/* HUELLA — contexto del perfil de usuario
   Carga los datos del usuario desde la tabla "perfiles" de Supabase
   y los pone a disposición de toda la app a través de usePerfil().

   Debe estar dentro de <AuthProvider> (en main.jsx) porque necesita
   leer useAuth() para saber cuándo hay un usuario activo. */
import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext.jsx";
import { obtenerPerfil, actualizarPerfil } from "../services/perfil.js";

const PerfilContext = createContext(null);

export function PerfilProvider({ children }) {
  const { usuario } = useAuth();
  const [perfil, setPerfil] = useState(null);
  const [cargandoPerfil, setCargandoPerfil] = useState(false);

  // Cada vez que cambia el usuario (login / logout) recargamos su perfil
  useEffect(() => {
    if (!usuario) {
      setPerfil(null);
      return;
    }

    let cancelado = false;
    setCargandoPerfil(true);

    obtenerPerfil(usuario.id)
      .then((data) => {
        if (!cancelado) setPerfil(data);
      })
      .catch((err) => {
        console.error("[huella] Error cargando perfil:", err.message);
      })
      .finally(() => {
        if (!cancelado) setCargandoPerfil(false);
      });

    // Si el usuario cambia antes de que termine la carga, ignoramos el resultado
    return () => { cancelado = true; };
  }, [usuario]);

  /* Guarda las respuestas del onboarding en Supabase y marca que ya se completó.
     Usa actualización optimista: la app avanza de inmediato en la pantalla mientras
     Supabase confirma el guardado en segundo plano. */
  async function guardarOnboarding({ intereses, forma_explorar, ritmo }) {
    if (!usuario) return;

    // Actualización optimista: el componente que lee perfil.onboarding_completado
    // verá el cambio inmediatamente y la app pasará a la pantalla principal
    setPerfil((prev) => ({
      ...prev,
      intereses,
      forma_explorar,
      ritmo,
      onboarding_completado: true,
    }));

    try {
      const datos = await actualizarPerfil(usuario.id, {
        intereses,
        forma_explorar,
        ritmo,
        onboarding_completado: true,
      });
      setPerfil(datos); // sincronizamos con la respuesta real del servidor
    } catch (err) {
      console.error("[huella] No se pudo guardar el onboarding:", err.message);
      // La actualización optimista sigue activa; el usuario puede usar la app.
      // Si recarga la página sin que Supabase confirmara, verá el onboarding de nuevo.
    }
  }

  return (
    <PerfilContext.Provider value={{ perfil, cargandoPerfil, guardarOnboarding, setPerfil }}>
      {children}
    </PerfilContext.Provider>
  );
}

/* Hook para consumir el contexto desde cualquier componente.
   Uso:
     import { usePerfil } from "../context/PerfilContext.jsx";
     const { perfil, cargandoPerfil, guardarOnboarding } = usePerfil(); */
export function usePerfil() {
  const ctx = useContext(PerfilContext);
  if (!ctx) {
    throw new Error("usePerfil() debe usarse dentro de <PerfilProvider>. Revisa main.jsx.");
  }
  return ctx;
}
