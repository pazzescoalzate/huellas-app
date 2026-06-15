/* HUELLA — app root */
import { useState, useEffect } from "react";
import { BottomNav } from "./components/Shared.jsx";
import Onboarding from "./components/Onboarding.jsx";
import Home from "./components/Home.jsx";
import ToursScreen from "./components/Tours.jsx";
import SavedScreen from "./components/Saved.jsx";
import ProfileScreen from "./components/Profile.jsx";
import DetailSheet from "./components/Detail.jsx";
import LocationSheet from "./components/Location.jsx";
import AuthScreen from "./components/auth/AuthScreen.jsx";
import CelebracionSello from "./components/CelebracionSello.jsx";
import Icon from "./components/Icon.jsx";
import { actualizarPerfil } from "./services/perfil.js";
import { useAuth } from "./context/AuthContext.jsx";
import { usePerfil } from "./context/PerfilContext.jsx";
import { useGuardados } from "./context/GuardadosContext.jsx";
import { useVisitados } from "./context/VisitadosContext.jsx";
import wordmarkWhite from "./assets/huella-wordmark-white.svg";

function readState() {
  try {
    return JSON.parse(localStorage.getItem("huella_state") || "{}");
  } catch {
    return {};
  }
}

/* Pantalla mientras Supabase comprueba la sesión o carga el perfil. */
function SplashCarga() {
  return (
    <div className="flex-1 grid place-items-center bg-bg1">
      <img src={wordmarkWhite} alt="Huella" className="h-8 opacity-40 animate-pulse" />
    </div>
  );
}

/* Modal reutilizable de "necesitas cuenta" para guardados, visitados y otras acciones.
   Cada instancia puede personalizar el icono, el título y la descripción. */
function AvisoInvitado({
  onCerrar,
  onCrearCuenta,
  icono      = "bookmark",
  titulo     = "Guarda este lugar",
  descripcion = "Crea una cuenta gratis para guardar experiencias.",
}) {
  return (
    <div className="absolute inset-0 z-[80] flex flex-col">
      {/* Fondo oscuro: clic fuera cierra el modal */}
      <div
        onClick={onCerrar}
        className="absolute inset-0 bg-[rgba(8,7,6,0.6)] backdrop-blur-[2px]"
      />
      {/* Sheet deslizable desde abajo */}
      <div className="absolute left-0 right-0 bottom-0 bg-bg1 rounded-t-xl px-[22px] pt-5 pb-[max(32px,env(safe-area-inset-bottom))] border-t border-cardstroke shadow-[0_-20px_60px_rgba(0,0,0,0.5)]">
        {/* Indicador de arrastre */}
        <div className="w-10 h-1 rounded-full bg-ink-ghost mx-auto mb-5" />

        <div className="flex items-center gap-4 mb-5">
          <div
            className="w-[52px] h-[52px] rounded-xl grid place-items-center shrink-0"
            style={{ background: "rgba(210,115,79,0.12)", border: "1px solid rgba(210,115,79,0.25)" }}
          >
            <Icon name={icono} size={24} color="var(--accent-soft)" />
          </div>
          <div>
            <div className="text-[17px] font-semibold text-ink-strong">{titulo}</div>
            <div className="text-[13.5px] font-light text-ink-soft mt-0.5">{descripcion}</div>
          </div>
        </div>

        <button
          onClick={onCrearCuenta}
          className="w-full h-14 rounded-full bg-accent text-white text-[15.5px] font-semibold shadow-[0_8px_24px_rgba(210,115,79,0.28)] mb-3"
        >
          Crear cuenta gratis
        </button>
        <button onClick={onCerrar} className="w-full h-11 text-[14px] text-ink-soft">
          Ahora no
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const stored = readState();
  const [tab,      setTab]      = useState(stored.tab   || "home");
  const [prefs,    setPrefs]    = useState(stored.prefs || null);
  const [open,     setOpen]     = useState(null);
  const [locSheet, setLocSheet] = useState(false);

  // Ciudad activa: objeto { id, name, region, lat, lon } o null si aún no eligió
  // Se persiste en localStorage para recordarla entre sesiones
  const [ciudad, setCiudad] = useState(stored.ciudad || null);

  // Ciudades recientes para invitados (localStorage); los usuarios las tienen en Supabase
  const [recientesGuest, setRecientesGuest] = useState(
    () => {
      try { return JSON.parse(localStorage.getItem("huella_recientes_ciudad") || "[]"); }
      catch { return []; }
    }
  );

  // ── Sesión de Supabase ─────────────────────────────────────────────────
  const { usuario, cargando, esInvitado } = useAuth();

  // ── Perfil del usuario (tabla perfiles) ───────────────────────────────
  const { perfil, cargandoPerfil, guardarOnboarding, agregarCiudadReciente, setPerfil } = usePerfil();

  // ── Favoritos del usuario (tabla guardados) ───────────────────────────
  const { estaGuardado, toggleGuardado, avisoInvitado, cerrarAviso } = useGuardados();

  // ── Visitados del usuario (tabla visitados) ───────────────────────────
  const {
    estaVisitado, toggleVisitado,
    avisoVisitadoInvitado, cerrarAvisoVisitado,
    sellosNuevos, cerrarCelebracion,   // cola de sellos para celebración
  } = useVisitados();

  // ── Modo invitado: eligió entrar sin cuenta ────────────────────────────
  const [modoInvitado, setModoInvitado] = useState(
    () => localStorage.getItem("huella_invitado") === "1"
  );

  // Si el usuario inicia sesión (o regresa de OAuth), salimos del modo invitado
  useEffect(() => {
    if (usuario) {
      setModoInvitado(false);
      localStorage.removeItem("huella_invitado");
    }
  }, [usuario]);

  // Cuando se carga el perfil, sincronizamos "prefs" con los intereses guardados
  // para que la pantalla "Para ti" use los datos reales de Supabase
  useEffect(() => {
    if (perfil?.intereses?.length && !prefs?.intereses?.length) {
      setPrefs({
        intereses: perfil.intereses,
        compania:  perfil.forma_explorar || "Con pareja",
        actividad: perfil.ritmo          || "Moderado",
      });
    }
  }, [perfil]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persistir preferencias, navegación y ciudad activa en localStorage
  useEffect(() => {
    localStorage.setItem(
      "huella_state",
      JSON.stringify({ tab, prefs, ciudad })
    );
  }, [tab, prefs, ciudad]);

  /* Guarda una ciudad en la lista de recientes:
     - Usuario registrado → Supabase (PerfilContext)
     - Invitado → localStorage de la sesión */
  function agregarReciente(c) {
    const MAX = 5;
    if (!esInvitado) {
      agregarCiudadReciente(c); // actualiza Supabase + perfil en memoria
    } else {
      const sinRepetir = recientesGuest.filter((r) => r.id !== c.id);
      const nueva = [c, ...sinRepetir].slice(0, MAX);
      setRecientesGuest(nueva);
      localStorage.setItem("huella_recientes_ciudad", JSON.stringify(nueva));
    }
  }

  /* Cuando el usuario selecciona una ciudad en el LocationSheet */
  function handlePickCiudad(c) {
    setCiudad(c);
    agregarReciente(c);
  }

  // Lista de recientes que se pasa al LocationSheet
  const recientes = esInvitado
    ? recientesGuest
    : (perfil?.ciudades_recientes || []);

  /* Guarda las preferencias del usuario:
     1. Actualiza "prefs" en memoria → se persiste en localStorage vía el useEffect.
     2. Si hay sesión, guarda también en Supabase (mapeando compania→forma_explorar,
        actividad→ritmo) y refresca el PerfilContext para que el Perfil refleje
        los cambios de inmediato sin recargar la página.
     3. Si es invitado (sin usuario), solo se actualiza el paso 1. */
  async function guardarPrefs(p) {
    setPrefs(p); // actualiza prefs en memoria + localStorage

    if (!usuario) return; // invitado: solo localStorage, sin Supabase

    // Actualización optimista: el Perfil ve los nuevos intereses al instante
    setPerfil((prev) => ({
      ...prev,
      intereses:      p.intereses,
      forma_explorar: p.compania,   // compania → forma_explorar
      ritmo:          p.actividad,  // actividad → ritmo
    }));

    try {
      const datos = await actualizarPerfil(usuario.id, {
        intereses:      p.intereses,
        forma_explorar: p.compania,
        ritmo:          p.actividad,
      });
      setPerfil(datos); // sincroniza con los datos confirmados por Supabase
    } catch (err) {
      console.error("[huella] Error guardando preferencias en Supabase:", err.message);
      // La actualización optimista sigue activa; si el usuario recarga verá los datos viejos.
    }
  }

  // ── CASO 1: Supabase comprobando si hay sesión guardada ────────────────
  if (cargando) {
    return <div className="room"><div className="screen"><SplashCarga /></div></div>;
  }

  // ── CASO 2: Sin sesión y sin modo invitado → pantallas de autenticación ─
  if (!usuario && !modoInvitado) {
    return (
      <div className="room">
        <div className="screen">
          <AuthScreen
            onExplorar={() => {
              setModoInvitado(true);
              localStorage.setItem("huella_invitado", "1");
            }}
          />
        </div>
      </div>
    );
  }

  // ── CASO 3: Usuario autenticado — esperando la carga del perfil ─────────
  if (usuario && cargandoPerfil) {
    return <div className="room"><div className="screen"><SplashCarga /></div></div>;
  }

  // ── CASO 4: Usuario autenticado — onboarding no completado ──────────────
  // (perfil null = el trigger aún no creó la fila → también mostramos onboarding)
  if (usuario && !perfil?.onboarding_completado) {
    return (
      <div className="room">
        <div className="screen">
          {/* initialStep={1} salta la pantalla de bienvenida del onboarding
              (step 0), que es visualmente igual a la de registro y confunde
              al usuario. Para registrados empezamos directo en "intereses". */}
          <Onboarding
            initialStep={1}
            onComplete={async (p) => {
              setPrefs(p);
              await guardarOnboarding({
                intereses:      p.intereses,
                forma_explorar: p.compania,
                ritmo:          p.actividad,
              });
            }}
          />
        </div>
      </div>
    );
  }

  // ── CASO 5 y 6: Autenticado con onboarding completo, o modo invitado ────
  return (
    <div className="room">
      <div className="screen">
        {tab === "home" && (
          <Home
            direction="editorial"
            saved={estaGuardado}
            onSave={toggleGuardado}
            onOpen={setOpen}
            prefs={prefs}
            location={ciudad?.name || null}
            onChangeLocation={() => setLocSheet(true)}
          />
        )}
        {tab === "tours" && <ToursScreen location={ciudad?.name || ""} />}
        {/* SavedScreen usa GuardadosContext directamente; onCrearCuenta lo necesita el invitado */}
        {tab === "saved" && (
          <SavedScreen
            onOpen={setOpen}
            onCrearCuenta={() => {
              setModoInvitado(false);
              localStorage.removeItem("huella_invitado");
            }}
          />
        )}
        {tab === "profile" && (
          <ProfileScreen
            prefs={
              prefs || {
                intereses: [],
                compania:  "Con pareja",
                actividad: "Moderado",
              }
            }
            onSavePrefs={guardarPrefs}
            onCrearCuenta={() => {
              setModoInvitado(false);
              localStorage.removeItem("huella_invitado");
            }}
          />
        )}
        <BottomNav active={tab} onNav={setTab} />
        {open && (
          <DetailSheet
            exp={open}
            saved={estaGuardado(open.id)}
            /* Envolvemos toggleGuardado con el lugar completo para que
               Detail.jsx pueda llamar onSave() sin conocer el objeto */
            onSave={() => toggleGuardado(open)}
            visited={estaVisitado(open.id)}
            onVisit={() => toggleVisitado(open)}
            onClose={() => setOpen(null)}
          />
        )}
        {locSheet && (
          <LocationSheet
            current={ciudad}
            recientes={recientes}
            onPick={handlePickCiudad}
            onClose={() => setLocSheet(false)}
          />
        )}

        {/* Modal de invitado: aparece cuando toca el corazón (guardar) */}
        {avisoInvitado && (
          <AvisoInvitado
            onCerrar={cerrarAviso}
            onCrearCuenta={() => {
              cerrarAviso();
              setModoInvitado(false);
              localStorage.removeItem("huella_invitado");
            }}
          />
        )}

        {/* Modal de invitado: aparece cuando toca "Ya estuve aquí" (visitar) */}
        {avisoVisitadoInvitado && (
          <AvisoInvitado
            icono="footprints"
            titulo="Registra tus visitas"
            descripcion="Crea una cuenta para llevar tu historial de lugares vividos."
            onCerrar={cerrarAvisoVisitado}
            onCrearCuenta={() => {
              cerrarAvisoVisitado();
              setModoInvitado(false);
              localStorage.removeItem("huella_invitado");
            }}
          />
        )}

        {/* Celebración de sello: se muestra cuando el usuario desbloquea uno nuevo.
            Siempre muestra sellosNuevos[0]; al cerrar, el contexto hace slice(1)
            y el siguiente sello (si hay) aparece automáticamente. */}
        {sellosNuevos.length > 0 && (
          <CelebracionSello
            sello={sellosNuevos[0]}
            onCerrar={cerrarCelebracion}
          />
        )}
      </div>
    </div>
  );
}
