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
import { LOCATIONS } from "./data/huella.js";
import { useAuth } from "./context/AuthContext.jsx";
import { usePerfil } from "./context/PerfilContext.jsx";
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

export default function App() {
  const stored = readState();
  const [tab,      setTab]      = useState(stored.tab   || "home");
  const [saved,    setSaved]    = useState(stored.saved || []);
  const [prefs,    setPrefs]    = useState(stored.prefs || null);
  const [open,     setOpen]     = useState(null);
  const [locId,    setLocId]    = useState(stored.locId || "actual");
  const [locSheet, setLocSheet] = useState(false);
  const loc = LOCATIONS.find((l) => l.id === locId) || LOCATIONS[0];

  // ── Sesión de Supabase ─────────────────────────────────────────────────
  const { usuario, cargando } = useAuth();

  // ── Perfil del usuario (tabla perfiles) ───────────────────────────────
  const { perfil, cargandoPerfil, guardarOnboarding } = usePerfil();

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

  // Persistir preferencias y navegación en localStorage
  useEffect(() => {
    localStorage.setItem(
      "huella_state",
      JSON.stringify({ tab, saved, prefs, locId })
    );
  }, [tab, saved, prefs, locId]);

  const toggleSave = (id) =>
    setSaved((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

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
              // Actualizamos prefs locales para el filtro "Para ti" de OpenStreetMap
              setPrefs(p);
              // Guardamos en Supabase (actualización optimista: la app avanza de inmediato)
              await guardarOnboarding({
                intereses:      p.intereses,
                forma_explorar: p.compania,
                ritmo:          p.actividad,
              });
              // Cuando perfil.onboarding_completado pasa a true, App re-renderiza
              // y entra al CASO 5 automáticamente.
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
            saved={saved}
            onSave={toggleSave}
            onOpen={setOpen}
            prefs={prefs}
            location={loc.name}
            onChangeLocation={() => setLocSheet(true)}
          />
        )}
        {tab === "tours" && <ToursScreen location={loc.name} />}
        {tab === "saved" && (
          <SavedScreen saved={saved} onSave={toggleSave} onOpen={setOpen} />
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
            onSavePrefs={setPrefs}
            onCrearCuenta={() => {
              // El invitado quiere crear cuenta → salimos del modo invitado
              setModoInvitado(false);
              localStorage.removeItem("huella_invitado");
            }}
          />
        )}
        <BottomNav active={tab} onNav={setTab} />
        {open && (
          <DetailSheet
            exp={open}
            saved={saved.includes(open.id)}
            onSave={toggleSave}
            onClose={() => setOpen(null)}
          />
        )}
        {locSheet && (
          <LocationSheet
            current={locId}
            onPick={(l) => setLocId(l.id)}
            onClose={() => setLocSheet(false)}
          />
        )}
      </div>
    </div>
  );
}
