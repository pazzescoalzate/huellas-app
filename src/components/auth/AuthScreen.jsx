/* HUELLA — pantallas de autenticación
   Controla tres vistas: bienvenida → registro | inicio de sesión.
   No duplica lógica de Supabase: usa el AuthContext que ya existe.
*/
import { useState } from "react";
import Icon from "../Icon.jsx";
import { useAuth } from "../../context/AuthContext.jsx";
import huellaMark    from "../../assets/huella-mark.svg";
import wordmarkWhite from "../../assets/huella-wordmark-white.svg";

/* ── Traduce los mensajes de error de Supabase a español ─────────────────── */
function traducirError(msg = "") {
  if (msg.includes("already registered") || msg.includes("User already registered"))
    return "Ya existe una cuenta con ese correo.";
  if (msg.includes("Invalid login credentials"))
    return "Correo o contraseña incorrectos.";
  if (msg.includes("Email not confirmed"))
    return "Confirma tu correo antes de iniciar sesión. Revisa tu bandeja de entrada.";
  if (msg.includes("Password should be at least"))
    return "La contraseña debe tener al menos 6 caracteres.";
  if (msg.includes("invalid format") || msg.includes("Invalid email") || msg.includes("Unable to validate email"))
    return "El formato del correo no es válido.";
  if (msg.includes("rate limit") || msg.includes("For security purposes"))
    return "Demasiados intentos. Espera un momento e inténtalo de nuevo.";
  if (msg.includes("network") || msg.includes("fetch"))
    return "Sin conexión. Comprueba tu red e inténtalo de nuevo.";
  return msg || "Ocurrió un error. Inténtalo de nuevo.";
}

/* ── Botón principal (mismo estilo que en Onboarding) ───────────────────── */
function BtnPrimario({ label, onClick, enviando, disabled }) {
  const inactivo = enviando || disabled;
  return (
    <button onClick={onClick} disabled={inactivo}
      className={"w-full h-14 rounded-full flex items-center justify-center gap-[9px] text-[16px] font-semibold transition-all duration-200 "
        + (inactivo
          ? "bg-white/[0.06] text-ink-faint opacity-70 cursor-not-allowed"
          : "bg-accent text-accent-on shadow-[0_10px_30px_rgba(210,115,79,0.32)]")}>
      {enviando
        ? <span className="opacity-70">Cargando…</span>
        : <>{label} <Icon name="arrowRight" size={19} stroke={2} /></>}
    </button>
  );
}

/* ── Campo de texto con etiqueta ─────────────────────────────────────────── */
function Campo({ label, type = "text", value, onChange, placeholder, autoComplete }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-ink-faint">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="w-full h-12 rounded-lg px-4 text-[15px] text-ink-strong placeholder:text-ink-ghost bg-white/[0.06] border border-cardstroke focus:outline-none focus:border-[rgba(232,149,113,0.7)] transition-colors"
      />
    </div>
  );
}

/* ── Campo de contraseña con botón de mostrar/ocultar ────────────────────── */
function CampoPassword({ label, value, onChange, placeholder, autoComplete }) {
  // verContrasena controla si el texto es visible (type="text") u oculto (type="password")
  const [verContrasena, setVerContrasena] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[11px] font-semibold tracking-[0.08em] uppercase text-ink-faint">
        {label}
      </label>
      {/* Contenedor relativo para poder poner el botón dentro del input */}
      <div className="relative">
        <input
          type={verContrasena ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className="w-full h-12 rounded-lg px-4 pr-11 text-[15px] text-ink-strong placeholder:text-ink-ghost bg-white/[0.06] border border-cardstroke focus:outline-none focus:border-[rgba(232,149,113,0.7)] transition-colors"
        />
        {/* Botón del ojo — type="button" evita que envíe el formulario al tocarlo */}
        <button
          type="button"
          onClick={() => setVerContrasena((v) => !v)}
          aria-label={verContrasena ? "Ocultar contraseña" : "Mostrar contraseña"}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-ink-faint hover:text-ink-soft transition-colors">
          <Icon name={verContrasena ? "eyeOff" : "eye"} size={18} stroke={1.8} />
        </button>
      </div>
    </div>
  );
}

/* ── Cajita de error ─────────────────────────────────────────────────────── */
function CajaError({ texto }) {
  if (!texto) return null;
  return (
    <div className="px-4 py-3 rounded-lg text-[13.5px] leading-snug"
      style={{ background:"rgba(220,60,60,0.12)", border:"1px solid rgba(220,60,60,0.25)", color:"#ff8a8a" }}>
      {texto}
    </div>
  );
}

/* ── Separador + botón de Google ─────────────────────────────────────────── */
function BtnGoogle({ onClick, enviando }) {
  return (
    <>
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-white/[0.10]" />
        <span className="text-[12px] text-ink-faint shrink-0">o continúa con</span>
        <div className="flex-1 h-px bg-white/[0.10]" />
      </div>
      <button onClick={onClick} disabled={enviando}
        className="w-full h-12 rounded-full flex items-center justify-center gap-3 text-[15px] font-medium text-ink-strong bg-white/[0.06] border border-cardstroke transition-colors active:bg-white/[0.10]">
        {/* Logomark de Google en SVG puro, sin dependencias externas */}
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Google
      </button>
    </>
  );
}

/* ── Escena visual de bienvenida (réplica fiel del Onboarding step 0) ─────── */
function EscenaBienvenida() {
  const chips = [
    { icon: "leaf",     label: "Naturaleza", cls: "left-[2%] top-[16%]"   },
    { icon: "mountain", label: "Miradores",  cls: "right-[3%] top-[30%]"  },
    { icon: "cup",      label: "Cafés",      cls: "left-[8%] bottom-[16%]"},
  ];
  return (
    <div className="relative w-full h-[290px] rounded-xl overflow-hidden border border-white/[0.08] shadow-elev2"
      style={{ background: "linear-gradient(180deg,#EBCBA6 0%,#E0A06C 26%,#C8693E 48%,#8A4327 72%,#3E2417 100%)" }}>
      <svg viewBox="0 0 320 290" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
        <circle cx="232" cy="68" r="32" fill="#F7E2C4" opacity="0.85"/>
        <circle cx="232" cy="68" r="48" fill="none" stroke="#F7E2C4" strokeWidth="1.5" opacity="0.25"/>
        <circle cx="232" cy="68" r="64" fill="none" stroke="#F7E2C4" strokeWidth="1.5" opacity="0.14"/>
        <g fill="none" stroke="#3E2417" strokeWidth="2.4" strokeLinecap="round" opacity="0.55">
          <path d="M44 64q9-8 18 0q9-8 18 0"/>
          <path d="M72 84q7-6 14 0q7-6 14 0"/>
        </g>
        <path d="M0 198C64 166 132 184 196 196 248 206 290 200 320 188L320 290 0 290Z" fill="#B85A33"/>
        <path d="M0 238C70 210 128 232 188 244 240 254 288 248 320 238L320 290 0 290Z" fill="#7C3C22"/>
        <path d="M0 278C58 270 110 232 160 232 210 232 262 270 320 278L320 290 0 290Z" fill="#4A2818"/>
        <path d="M0 216C64 184 132 200 196 212" fill="none" stroke="rgba(255,240,225,0.16)" strokeWidth="2"/>
      </svg>
      {/* Icono central con halo */}
      <div className="absolute left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2 grid place-items-center">
        <div className="absolute w-[140px] h-[140px] rounded-full"
          style={{ background:"radial-gradient(circle,rgba(255,240,222,0.4),transparent 64%)" }}/>
        <img src={huellaMark} alt="" className="relative w-[72px]"
          style={{ filter:"brightness(0) saturate(100%) invert(9%) sepia(38%) saturate(2200%) hue-rotate(345deg) drop-shadow(0 8px 18px rgba(0,0,0,0.4))" }}/>
      </div>
      {/* Chips de categoría flotantes */}
      {chips.map((c) => (
        <div key={c.label} className={"absolute " + c.cls + " inline-flex items-center gap-2 pl-2 pr-3.5 py-1.5 rounded-full border border-white/[0.16] shadow-[0_6px_18px_rgba(0,0,0,0.35)]"}
          style={{ background:"rgba(26,16,11,0.6)" }}>
          <span className="w-[26px] h-[26px] rounded-full grid place-items-center bg-accent">
            <Icon name={c.icon} size={15} color="var(--on-accent)" stroke={2}/>
          </span>
          <span className="text-[13px] font-semibold text-white">{c.label}</span>
        </div>
      ))}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   VISTA 1 — BIENVENIDA
   Misma estructura que Onboarding step 0, pero con los botones de auth conectados.
   ════════════════════════════════════════════════════════════════════════════ */
function VistaBienvenida({ onComenzar, onIniciarSesion, onExplorar }) {
  return (
    <div className="fade flex-1 flex flex-col bg-bg1 px-[26px] pt-2 pb-9 overflow-y-auto">
      {/* Logotipo */}
      <div className="rise flex justify-center pt-3 pb-1 shrink-0">
        <img src={wordmarkWhite} alt="Huella" className="h-[30px] opacity-95"/>
      </div>

      {/* Ilustración central */}
      <div className="rise flex-1 flex items-center min-h-0 py-5" style={{ animationDelay:"0.06s" }}>
        <EscenaBienvenida />
      </div>

      {/* Texto y botones */}
      <div className="rise shrink-0" style={{ animationDelay:"0.12s" }}>
        <h1 className="text-[30px] font-light text-white leading-[1.16] tracking-[-0.01em] [text-wrap:balance]">
          Cada lugar tiene algo que{" "}
          <span className="font-semibold text-accent-soft">enseñarte.</span>
        </h1>
        <p className="text-[14.5px] font-light text-white/[0.7] mt-3 mb-6 leading-[1.5]">
          Recomendaciones honestas, construidas a partir de experiencias reales.
          Sin anuncios, sin patrocinios.
        </p>

        {/* CTA principal → ir a registro */}
        <BtnPrimario label="Comenzar" onClick={onComenzar} />

        {/* Link de login */}
        <div className="text-center mt-4">
          <button onClick={onIniciarSesion} className="text-[13px] text-white/60">
            ¿Ya tienes cuenta?{" "}
            <span className="text-white font-medium">Inicia sesión</span>
          </button>
        </div>

        {/* Modo invitado — discreto, debajo */}
        <div className="text-center mt-3">
          <button onClick={onExplorar}
            className="text-[12.5px] text-white/35 hover:text-white/55 transition-colors">
            Explorar sin cuenta
          </button>
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   VISTA 2 — REGISTRO
   ════════════════════════════════════════════════════════════════════════════ */
function VistaRegistro({ onVolver, onIrLogin }) {
  const { registrar, entrarConGoogle } = useAuth();

  const [nombre,   setNombre]   = useState("");
  const [email,    setEmail]    = useState("");
  const [pass,     setPass]     = useState("");
  const [passConf, setPassConf] = useState("");
  const [error,    setError]    = useState("");
  const [enviando, setEnviando] = useState(false);
  // true cuando el registro fue exitoso pero se requiere confirmar el correo
  const [esperandoConfirm, setEsperandoConfirm] = useState(false);

  async function handleRegistro() {
    setError("");
    // Validaciones locales antes de ir a Supabase
    if (!nombre.trim())       return setError("Escribe tu nombre.");
    if (!email.trim())        return setError("Escribe tu correo.");
    if (pass.length < 6)      return setError("La contraseña debe tener al menos 6 caracteres.");
    if (pass !== passConf)    return setError("Las contraseñas no coinciden.");

    setEnviando(true);
    try {
      const { session } = await registrar(email.trim(), pass, nombre.trim());
      // Si Supabase requiere confirmar el correo, session llega null aquí.
      // Si la confirmación está desactivada (recomendado en desarrollo),
      // onAuthStateChange dispara inmediatamente y App.jsx navega al inicio.
      if (!session) setEsperandoConfirm(true);
    } catch (err) {
      setError(traducirError(err.message));
    } finally {
      setEnviando(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setEnviando(true);
    try {
      await entrarConGoogle();
      // entrarConGoogle redirige a Google; si llegamos aquí hubo un error
    } catch (err) {
      setError(traducirError(err.message));
      setEnviando(false);
    }
  }

  /* ── Pantalla de "revisa tu correo" ──────────────────────────────────── */
  if (esperandoConfirm) {
    return (
      <div className="fade flex-1 flex flex-col px-[26px] pt-6 pb-9">
        <button onClick={onVolver}
          className="w-[38px] h-[38px] rounded-full shrink-0 grid place-items-center bg-white/5 border border-cardstroke mb-8">
          <Icon name="chevLeft" size={20} color="var(--ink)"/>
        </button>
        <div className="flex-1 flex flex-col justify-center items-center text-center pb-8">
          <div className="w-[72px] h-[72px] rounded-xl mb-6 grid place-items-center bg-[rgba(210,115,79,0.12)] border border-[rgba(210,115,79,0.3)]">
            <Icon name="sparkles" size={32} color="var(--accent-soft)" stroke={1.6}/>
          </div>
          <h2 className="text-[26px] font-medium text-ink-strong tracking-[-0.01em] leading-[1.2] mb-3 [text-wrap:balance]">
            Revisa tu correo
          </h2>
          <p className="text-[14.5px] font-light text-ink-soft leading-[1.55]">
            Te enviamos un enlace de confirmación a{" "}
            <span className="text-ink font-medium">{email}</span>.
            Ábrelo para activar tu cuenta y volver aquí.
          </p>
          <div className="mt-5 px-4 py-3 rounded-lg bg-white/[0.04] border border-cardstroke text-[12.5px] text-ink-faint leading-relaxed">
            ¿No llegó? Revisa la carpeta de spam.
          </div>
        </div>
        <button onClick={onIrLogin}
          className="w-full h-12 rounded-full text-[15px] font-medium text-ink border border-cardstroke bg-white/[0.04]">
          Ya confirmé · Iniciar sesión
        </button>
      </div>
    );
  }

  /* ── Formulario principal de registro ──────────────────────────────────── */
  return (
    <div className="fade flex-1 flex flex-col px-[26px] pt-6 pb-9 overflow-y-auto">
      {/* Botón volver */}
      <button onClick={onVolver}
        className="w-[38px] h-[38px] rounded-full shrink-0 grid place-items-center bg-white/5 border border-cardstroke mb-5">
        <Icon name="chevLeft" size={20} color="var(--ink)"/>
      </button>

      <h1 className="text-[28px] font-medium text-ink-strong tracking-[-0.01em] leading-[1.18] mb-1">
        Crea tu cuenta
      </h1>
      <p className="text-[14px] font-light text-ink-soft mb-7">
        Guarda tus lugares y deja huella donde vayas.
      </p>

      <div className="flex flex-col gap-4 mb-5">
        <Campo label="Nombre" value={nombre} onChange={setNombre}
          placeholder="¿Cómo te llamamos?" autoComplete="name"/>
        <Campo label="Correo" type="email" value={email} onChange={setEmail}
          placeholder="tu@correo.com" autoComplete="email"/>
        <CampoPassword label="Contraseña" value={pass} onChange={setPass}
          placeholder="Mínimo 6 caracteres" autoComplete="new-password"/>
        <CampoPassword label="Confirmar contraseña" value={passConf} onChange={setPassConf}
          placeholder="Repite la contraseña" autoComplete="new-password"/>
      </div>

      <CajaError texto={error} />
      {error && <div className="mb-4" />}

      <BtnPrimario label="Crear cuenta" onClick={handleRegistro} enviando={enviando}/>
      <BtnGoogle onClick={handleGoogle} enviando={enviando}/>

      <p className="text-center text-[13px] text-ink-faint mt-5">
        ¿Ya tienes cuenta?{" "}
        <button onClick={onIrLogin} className="text-accent-soft font-medium">
          Inicia sesión
        </button>
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   VISTA 3 — INICIO DE SESIÓN
   ════════════════════════════════════════════════════════════════════════════ */
function VistaLogin({ onVolver, onIrRegistro }) {
  const { entrar, entrarConGoogle } = useAuth();

  const [email,    setEmail]    = useState("");
  const [pass,     setPass]     = useState("");
  const [error,    setError]    = useState("");
  const [enviando, setEnviando] = useState(false);

  async function handleLogin() {
    setError("");
    if (!email.trim()) return setError("Escribe tu correo.");
    if (!pass)         return setError("Escribe tu contraseña.");

    setEnviando(true);
    try {
      await entrar(email.trim(), pass);
      // Si llegamos aquí sin error, onAuthStateChange ya actualizó el usuario
      // en el AuthContext → App.jsx detecta el cambio y muestra la app.
      // No necesitamos llamar nada más aquí.
    } catch (err) {
      setError(traducirError(err.message));
    } finally {
      setEnviando(false);
    }
  }

  async function handleGoogle() {
    setError("");
    setEnviando(true);
    try {
      await entrarConGoogle();
    } catch (err) {
      setError(traducirError(err.message));
      setEnviando(false);
    }
  }

  return (
    <div className="fade flex-1 flex flex-col px-[26px] pt-6 pb-9 overflow-y-auto">
      {/* Botón volver */}
      <button onClick={onVolver}
        className="w-[38px] h-[38px] rounded-full shrink-0 grid place-items-center bg-white/5 border border-cardstroke mb-5">
        <Icon name="chevLeft" size={20} color="var(--ink)"/>
      </button>

      <h1 className="text-[28px] font-medium text-ink-strong tracking-[-0.01em] leading-[1.18] mb-1">
        Bienvenido de nuevo
      </h1>
      <p className="text-[14px] font-light text-ink-soft mb-7">
        Entra para ver tus guardados y seguir explorando.
      </p>

      <div className="flex flex-col gap-4 mb-5">
        <Campo label="Correo" type="email" value={email} onChange={setEmail}
          placeholder="tu@correo.com" autoComplete="email"/>
        <CampoPassword label="Contraseña" value={pass} onChange={setPass}
          placeholder="Tu contraseña" autoComplete="current-password"/>
      </div>

      <CajaError texto={error} />
      {error && <div className="mb-4" />}

      <BtnPrimario label="Iniciar sesión" onClick={handleLogin} enviando={enviando}/>
      <BtnGoogle onClick={handleGoogle} enviando={enviando}/>

      <p className="text-center text-[13px] text-ink-faint mt-5">
        ¿Sin cuenta aún?{" "}
        <button onClick={onIrRegistro} className="text-accent-soft font-medium">
          Regístrate gratis
        </button>
      </p>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════════
   COMPONENTE RAÍZ — AuthScreen
   Gestiona qué vista se muestra. App.jsx lo monta cuando no hay sesión.

   Props:
     onExplorar — callback cuando el usuario elige "Explorar sin cuenta"
   ════════════════════════════════════════════════════════════════════════════ */
export default function AuthScreen({ onExplorar }) {
  // "bienvenida" | "registro" | "login"
  const [vista, setVista] = useState("bienvenida");

  if (vista === "bienvenida") {
    return (
      <VistaBienvenida
        onComenzar       ={() => setVista("registro")}
        onIniciarSesion  ={() => setVista("login")}
        onExplorar       ={onExplorar}
      />
    );
  }

  if (vista === "registro") {
    return (
      <VistaRegistro
        onVolver  ={() => setVista("bienvenida")}
        onIrLogin ={() => setVista("login")}
      />
    );
  }

  return (
    <VistaLogin
      onVolver      ={() => setVista("bienvenida")}
      onIrRegistro  ={() => setVista("registro")}
    />
  );
}
