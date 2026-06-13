/* HUELLA — contexto de autenticación
   Provee el estado de sesión a toda la app.
   Cualquier componente puede llamar a useAuth() para saber
   si hay usuario, si está cargando, y para registrarse/entrar/salir.
*/
import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase.js";

// ── Creamos el contexto vacío ──────────────────────────────────────────────
const AuthContext = createContext(null);

/* ============================================================================
   AuthProvider
   Envuelve la app en main.jsx. Escucha cambios de sesión de Supabase
   y los propaga a todos los componentes hijos.
   ============================================================================ */
export function AuthProvider({ children }) {
  const [usuario, setUsuario]   = useState(null);    // objeto User de Supabase, o null
  const [cargando, setCargando] = useState(true);    // true mientras comprueba la sesión inicial
  const [avisoPendiente, setAvisoPendiente] = useState(false); // true → mostrar aviso de "crea cuenta"

  useEffect(() => {
    // 1. Obtener la sesión que ya existe al abrir la app (p.ej., si el usuario ya había entrado antes)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUsuario(session?.user ?? null);
      setCargando(false);
    });

    // 2. Escuchar eventos futuros: login, logout, expiración de token, etc.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_evento, session) => {
      setUsuario(session?.user ?? null);
    });

    // Limpieza al desmontar
    return () => subscription.unsubscribe();
  }, []);

  /* ── Registro con correo y contraseña ──────────────────────────────────── */
  async function registrar(email, password, nombre) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // "nombre" viaja como metadata; el trigger de Supabase lo copia a la tabla perfiles
        data: { nombre },
      },
    });
    if (error) throw error;
    return data;
  }

  /* ── Inicio de sesión con correo y contraseña ──────────────────────────── */
  async function entrar(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  /* ── Inicio de sesión con Google (OAuth) ───────────────────────────────── */
  // Redirige al usuario a Google y luego de vuelta a la app.
  // Requiere configuración previa en el panel de Supabase (ver pasos manuales).
  async function entrarConGoogle() {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        // Después de autenticar con Google, vuelve a la misma URL de la app
        redirectTo: window.location.origin,
      },
    });
    if (error) throw error;
    return data;
  }

  /* ── Cerrar sesión ─────────────────────────────────────────────────────── */
  async function salir() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }

  /* ── Modo invitado ─────────────────────────────────────────────────────── */
  // Un usuario es "invitado" si no tiene sesión activa.
  const esInvitado = !usuario;

  /* ── Bloquear acciones que requieren cuenta ────────────────────────────── */
  // Llama a esta función antes de ejecutar acciones restringidas (guardar, marcar visitado…).
  // Devuelve true si el usuario tiene cuenta → la acción puede continuar.
  // Devuelve false si es invitado → activa el aviso "crea una cuenta" y para la acción.
  //
  // Uso en un componente:
  //   const { pedirCuenta } = useAuth();
  //   function handleGuardar() {
  //     if (!pedirCuenta()) return;   // si es invitado, muestra aviso y sale
  //     // … lógica de guardado
  //   }
  function pedirCuenta() {
    if (esInvitado) {
      setAvisoPendiente(true); // el componente que muestre el modal lo leerá
      return false;
    }
    return true;
  }

  // Llama a esto para cerrar el aviso (cuando el usuario lo descarte o se registre)
  function cerrarAviso() {
    setAvisoPendiente(false);
  }

  // ── Valores expuestos al resto de la app ──────────────────────────────────
  const valor = {
    usuario,           // objeto User de Supabase (null si no hay sesión)
    cargando,          // true mientras Supabase comprueba si hay sesión activa
    esInvitado,        // true = no hay sesión → acceso limitado
    avisoPendiente,    // true → mostrar modal/aviso de "crea una cuenta"
    pedirCuenta,       // función para bloquear acciones de invitados
    cerrarAviso,       // función para cerrar el aviso
    registrar,
    entrar,
    entrarConGoogle,
    salir,
  };

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

/* ============================================================================
   useAuth — hook para consumir el contexto desde cualquier componente
   Ejemplo de uso:
     import { useAuth } from "../context/AuthContext.jsx";
     const { usuario, esInvitado, entrar } = useAuth();
   ============================================================================ */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth() debe usarse dentro de <AuthProvider>. Revisa main.jsx.");
  }
  return ctx;
}
