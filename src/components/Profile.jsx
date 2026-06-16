/* HUELLA — Perfil: datos reales de Supabase + sellos + ya estuve */
import { useState, useEffect } from "react";
import Icon from "./Icon.jsx";
import { CatSurface, Chip } from "./Shared.jsx";
import { ONB } from "../data/huella.js";
import PhotoSlot from "./PhotoSlot.jsx";
import SettingsSheet from "./Settings.jsx";
import { SELLOS } from "../data/sellos.js";
import { obtenerSellosObtenidos } from "../services/sellos.js";
import { actualizarPerfil } from "../services/perfil.js";
import Patch from "./Patch.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { usePerfil } from "../context/PerfilContext.jsx";
import { useVisitados } from "../context/VisitadosContext.jsx";
import { useGuardados } from "../context/GuardadosContext.jsx";

/* Familias de categorías para las estadísticas del perfil.
   Edita estas listas para mover una categoría de grupo sin tocar el resto. */
const FAMILIA_NATURALEZA = new Set(["naturaleza", "miradores", "aventura"]);
const FAMILIA_URBANO     = new Set(["cultura", "gastronomia", "cafes", "bienestar"]);

// Cambiar a true cuando se implemente la subida de foto con Supabase Storage.
const FOTO_PERFIL_ACTIVA = false;

/* Íconos para cada opción de compañía y ritmo */
const ICON_COMPANIA = {
  "Solo":            "user",
  "Con amigos":      "users",
  "Con pareja":      "heart",
  "En familia":      "users",
  "Con guía local":  "compass",
};
const ICON_ACTIVIDAD = {
  "Relajado": "leaf",
  "Moderado": "activity",
  "Activo":   "mountain",
};

/* Genera las iniciales del nombre real del usuario:
   - Sin nombre       → "?"
   - Una sola palabra → primera letra ("Kevin" → "K")
   - Dos o más        → primera letra de la primera y última palabra
                        ("Kevin Alzate" → "KA", "Kevin Juan Alzate" → "KA") */
function generarIniciales(nombre = "") {
  const partes = nombre.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0][0].toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

function StatCell({ value, label }) {
  return (
    <div className="flex-1 text-center">
      <div className="text-[22px] font-semibold text-ink-strong">{value}</div>
      <div className="text-[11px] text-ink-faint mt-0.5">{label}</div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   CARD "YA ESTUVE"
   ───────────────────────────────────────────────────────────────────────── */

/* Etiquetas legibles de categoría (igual que en Saved.jsx) */
const CAT_LABEL_V = {
  naturaleza:  "Naturaleza",
  cultura:     "Cultura",
  gastronomia: "Gastronomía",
  miradores:   "Miradores",
  cafes:       "Cafés",
  aventura:    "Aventura",
  bienestar:   "Bienestar",
};

/* Formatea "2025-06-14T10:22:00Z" → "14 jun. 2025" */
function formatearFecha(isoStr) {
  if (!isoStr) return "";
  return new Date(isoStr).toLocaleDateString("es", {
    day: "numeric", month: "short", year: "numeric",
  });
}

/* Card horizontal "Ya estuve".
   PLACEHOLDER DE IMAGEN: categoría "miradores" da un degradado cálido de viajes.
   Para reemplazar por imagen real: cambia CAT_PREVIEW por otra categoría,
   o sustituye <CatSurface> por <img src={...} className="w-[96px] h-[96px] rounded-md object-cover shrink-0" />. */
const CAT_PREVIEW = "miradores";

function CardYaEstuve({ visitados, onVerTodos }) {
  const hayVisitados = visitados.length > 0;
  const ultimoNombre = visitados[0]?.lugar_nombre;

  return (
    <div className="mx-[22px] pt-6">
      <div
        role={hayVisitados ? "button" : undefined}
        tabIndex={hayVisitados ? 0 : undefined}
        onClick={hayVisitados ? onVerTodos : undefined}
        onKeyDown={(e) => {
          if (hayVisitados && (e.key === "Enter" || e.key === " ")) onVerTodos();
        }}
        className={"flex items-center gap-3 p-3 rounded-xl border border-cardstroke shadow-elev1 bg-white/[0.04]" +
          (hayVisitados ? " cursor-pointer active:opacity-75 transition-opacity duration-150" : "")}
      >
        {/* Imagen placeholder — CatSurface 96×96 con esquinas redondeadas */}
        <CatSurface cat={CAT_PREVIEW} className="w-[96px] h-[96px] rounded-md shrink-0" />

        {/* Texto central */}
        <div className="flex-1 min-w-0">
          <div className="text-[17px] font-medium text-ink-strong leading-tight">
            Lugares donde estuve
          </div>
          <div className="text-[13px] text-ink-soft mt-1 whitespace-nowrap overflow-hidden text-ellipsis">
            {hayVisitados
              ? `Último: ${ultimoNombre}`
              : "Marca los lugares donde ya estuviste"}
          </div>
        </div>

        {/* Flecha indicando que es tocable */}
        <Icon name="chevRight" size={18} color="var(--ink-faint)" />
      </div>
    </div>
  );
}

/* Página completa de visitados — mismo patrón que Detail.jsx:
   absolute inset-0 + slide desde abajo + encabezado con flecha de volver */
function PaginaVisitados({ visitados, onClose }) {
  const [closing, setClosing] = useState(false);
  const close = () => { setClosing(true); setTimeout(onClose, 300); };

  return (
    <div className="absolute inset-0 z-[65] flex flex-col">
      <style>{`
        @media (prefers-reduced-motion: no-preference){
          @keyframes pv-in  { from{transform:translateY(100%)} to{transform:none} }
          @keyframes pv-out { from{transform:none} to{transform:translateY(100%)} }
          .pv-in  { animation: pv-in  .42s cubic-bezier(0.22,1,0.36,1) both }
          .pv-out { animation: pv-out .3s  cubic-bezier(0.4,0,1,1) both }
        }
      `}</style>

      {/* Página: cubre toda la pantalla, fondo sólido */}
      <div className={"absolute inset-0 bg-bg1 flex flex-col " + (closing ? "pv-out" : "pv-in")}>

        {/* Encabezado con botón de volver ← */}
        <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-3.5 border-b border-cardstroke">
          <button
            onClick={close}
            className="w-10 h-10 rounded-full grid place-items-center bg-white/5 border border-cardstroke shrink-0">
            <Icon name="chevLeft" size={20} color="var(--ink-strong)" />
          </button>
          <div className="min-w-0">
            <h1 className="text-[18px] font-semibold text-ink-strong tracking-[-0.01em] leading-tight">
              Ya estuve
            </h1>
            <div className="text-[12px] font-light text-ink-faint mt-px">
              {visitados.length} {visitados.length === 1 ? "lugar visitado" : "lugares visitados"}
            </div>
          </div>
        </div>

        {/* Lista de lugares — tarjetas iguales al diseño anterior */}
        <div className="flex-1 overflow-y-auto px-[22px] pt-4 pb-8 flex flex-col gap-2.5 [overscroll-behavior:contain]">
          {visitados.map((fila) => (
            <div
              key={fila.lugar_id}
              className="flex gap-3.5 p-3 rounded-xl bg-white/[0.045] border border-cardstroke shadow-elev1"
            >
              {/* Miniatura con el degradado de la categoría */}
              <CatSurface
                cat={fila.lugar_categoria}
                className="w-[72px] h-[72px] rounded-lg shrink-0"
              />
              <div className="flex-1 min-w-0 flex flex-col justify-center">
                <div className="text-[15px] font-semibold text-ink-strong leading-[1.2] whitespace-nowrap overflow-hidden text-ellipsis">
                  {fila.lugar_nombre}
                </div>
                <div className="text-[12.5px] text-ink-soft mt-0.5">
                  {CAT_LABEL_V[fila.lugar_categoria] || fila.lugar_categoria}
                </div>
                {fila.visitado_en && (
                  <div className="text-[11.5px] text-ink-faint mt-[3px] flex items-center gap-1">
                    <Icon name="clock" size={11} color="var(--ink-faint)" />
                    {formatearFecha(fila.visitado_en)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PANTALLA INVITADO
   ───────────────────────────────────────────────────────────────────────── */
function PantallaInvitado({ onCrearCuenta }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-8 pb-28 text-center">
      <div className="w-[80px] h-[80px] rounded-2xl mb-7 grid place-items-center"
        style={{ background: "rgba(210,115,79,0.10)", border: "1px solid rgba(210,115,79,0.25)" }}>
        <Icon name="user" size={36} color="var(--accent-soft)" stroke={1.5} />
      </div>
      <h2 className="text-[22px] font-semibold text-ink-strong tracking-[-0.01em] mb-2 [text-wrap:balance]">
        Crea una cuenta gratis
      </h2>
      <p className="text-[14.5px] font-light text-ink-soft leading-[1.6] mb-8 [text-wrap:balance]">
        Guarda tus lugares favoritos, registra cada visita y desbloquea sellos al explorar.
      </p>
      <button
        onClick={onCrearCuenta}
        className="w-full h-14 rounded-full bg-accent text-accent-on text-[16px] font-semibold shadow-[0_10px_30px_rgba(210,115,79,0.32)]">
        Empezar ahora
      </button>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   COMPONENTE PRINCIPAL
   ───────────────────────────────────────────────────────────────────────── */
export default function ProfileScreen({ prefs, onSavePrefs, onCrearCuenta }) {
  const { usuario, esInvitado, salir } = useAuth();
  const { perfil } = usePerfil();
  const { visitadosList } = useVisitados();
  const { guardadosList } = useGuardados();

  const [menu,             setMenu]             = useState(false);
  const [allBadges,        setAllBadges]        = useState(false);
  const [verVisitados,     setVerVisitados]     = useState(false);
  const [directoIntereses, setDirectoIntereses] = useState(false);
  const [scrolled,         setScrolled]         = useState(false);

  // ids de sellos obtenidos leídos desde Supabase (["pionero", "descubridor", ...])
  const [sellosObtenidos, setSellosObtenidos] = useState([]);

  // ── Carga de sellos reales desde Supabase ─────────────────────────────
  useEffect(() => {
    if (!usuario) return;
    obtenerSellosObtenidos(usuario.id)
      .then((ids) => setSellosObtenidos(ids))
      .catch((err) => console.error("[huella] Error cargando sellos del perfil:", err.message));
  }, [usuario]);

  // ── Datos del perfil real ──────────────────────────────────────────────
  const nombre    = perfil?.nombre || usuario?.email?.split("@")[0] || "Explorador";
  const iniciales = generarIniciales(nombre);
  const handle    = perfil?.username
    ? `@${perfil.username}`
    : `@${usuario?.email?.split("@")[0] || "explorador"}`;
  const anio      = perfil?.creado_en
    ? new Date(perfil.creado_en).getFullYear()
    : new Date().getFullYear();
  const intereses = perfil?.intereses || [];

  // Datos de preferencias para la sección "Mis intereses" (arrays desde Supabase JSONB)
  const formaExplorar     = Array.isArray(perfil?.forma_explorar) ? perfil.forma_explorar : [];
  const ritmo             = Array.isArray(perfil?.ritmo)          ? perfil.ritmo          : [];
  const opcionesCompania  = ONB.compania.filter((o) => formaExplorar.includes(o.k));
  const opcionesActividad = ONB.actividad.filter((o) => ritmo.includes(o.k));
  const tieneAlgoDato     = intereses.length > 0 || formaExplorar.length > 0 || ritmo.length > 0;

  // Estadísticas reales calculadas desde los contextos de visitados y guardados
  const statNaturaleza = visitadosList.filter((v) => FAMILIA_NATURALEZA.has(v.lugar_categoria)).length;
  const statUrbano     = visitadosList.filter((v) => FAMILIA_URBANO.has(v.lugar_categoria)).length;
  const statGuardados  = guardadosList.length;

  // Sellos: catálogo real con `got` calculado desde los ids de Supabase
  const obtenidosSet   = new Set(sellosObtenidos);
  const badgesCatalogo = SELLOS.map((s) => ({
    id:    s.id,
    label: s.label,
    desc:  s.desc,
    icono: s.icono,
    shape: s.shape,
    tone:  s.tone,
    got:   obtenidosSet.has(s.id),
    date:  "",
  }));
  const earned = badgesCatalogo.filter((b) => b.got);
  const locked = badgesCatalogo.filter((b) => !b.got);

  // ── Si es invitado, mostramos pantalla de conversión ──────────────────
  if (esInvitado) {
    return (
      <div className="flex-1 flex flex-col overflow-y-auto pb-24">
        <PantallaInvitado onCrearCuenta={onCrearCuenta} />
      </div>
    );
  }

  // ── Pantalla de perfil real ────────────────────────────────────────────
  return (
    <div onScroll={(e) => setScrolled(e.target.scrollTop > 8)} className="flex-1 overflow-y-auto pb-24">

      {/* Encabezado — mismo estilo que Tours y Guardados */}
      <div className="sticky top-0 z-20 pt-3 px-[22px] pb-3.5 flex items-start justify-between"
        style={{
          background: scrolled ? "var(--glass-bg)" : "var(--bg-1)",
          WebkitBackdropFilter: scrolled ? "var(--glass-blur)" : "none",
          backdropFilter: scrolled ? "var(--glass-blur)" : "none",
          boxShadow: scrolled ? "0 12px 32px rgba(0,0,0,0.32)" : "none",
          borderBottom: scrolled ? "1px solid var(--glass-stroke)" : "1px solid transparent",
        }}>
        <h1 className="text-[26px] font-semibold text-ink-strong tracking-[-0.015em]">Perfil</h1>
        <button
          onClick={() => setMenu(true)}
          className="w-10 h-10 rounded-full grid place-items-center bg-white/5 border border-cardstroke mt-0.5">
          <Icon name="menu" size={20} color="var(--ink)" />
        </button>
      </div>

      {/* ── a) BLOQUE DE IDENTIDAD ─────────────────────────────────────── */}

      {/* Avatar y nombre */}
      <div className="flex flex-col items-center pt-2 px-[22px] pb-5">
        <div className="relative w-[86px] h-[86px]">
          <div className="absolute inset-0 rounded-full grid place-items-center text-white text-[32px] font-semibold border-2 border-white/[0.16] shadow-elev2"
            style={{ background: "linear-gradient(135deg, #C05A34, #7A3E55)" }}>
            {iniciales}
          </div>
          {FOTO_PERFIL_ACTIVA && (
            <PhotoSlot id="avatar-photo" shape="circle"
              style={{ position: "absolute", inset: 0, width: 86, height: 86, zIndex: 2 }} />
          )}
          {FOTO_PERFIL_ACTIVA && (
            <span className="absolute -right-0.5 bottom-0.5 w-7 h-7 rounded-full grid place-items-center bg-accent z-[3] pointer-events-none"
              style={{ border: "2px solid var(--bg-1)" }}>
              <Icon name="camera" size={14} color="var(--on-accent)" stroke={2} />
            </span>
          )}
        </div>
        <div className="text-[22px] font-semibold text-ink-strong tracking-[-0.01em] mt-3.5">{nombre}</div>
        <div className="text-[13px] font-light text-ink-faint mt-0.5">{handle} · Explorando desde {anio}</div>
      </div>

      {/* Estadísticas reales */}
      <div className="mx-[22px] px-3.5 py-4 rounded-lg flex bg-white/[0.045] border border-cardstroke">
        <StatCell value={statNaturaleza} label="Naturaleza" />
        <div className="w-px bg-cardstroke"></div>
        <StatCell value={statUrbano}     label="Urbano"     />
        <div className="w-px bg-cardstroke"></div>
        <StatCell value={statGuardados}  label="Guardados"  />
      </div>

      {/* ── b) CARD DE YA ESTUVE ──────────────────────────────────────── */}
      <CardYaEstuve
        visitados={visitadosList}
        onVerTodos={() => setVerVisitados(true)}
      />

      {/* ── c) SELLOS ─────────────────────────────────────────────────── */}
      <div className="pt-7">
        <div className="flex items-center justify-between mx-[22px] mb-4">
          <h2 className="text-[18px] font-semibold text-ink-strong">
            Sellos{" "}
            <span className="text-[13px] font-normal text-ink-faint ml-1.5">
              {earned.length} de {badgesCatalogo.length}
            </span>
          </h2>
          <button onClick={() => setAllBadges(true)}
            className="text-[13px] font-medium text-accent-soft inline-flex items-center gap-[3px]">
            Ver más <Icon name="chevRight" size={15} color="var(--accent-soft)" />
          </button>
        </div>
        <div className="flex gap-3 overflow-x-auto px-[22px] pb-1 snap-x snap-mandatory">
          {earned.map((b) => (
            <div key={b.id} className="shrink-0 snap-start">
              <Patch b={b} w={130} />
            </div>
          ))}
          {locked.length > 0 && (
            <button onClick={() => setAllBadges(true)}
              className="w-[130px] shrink-0 self-stretch flex flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-ink-ghost my-1 mb-[30px] py-6 snap-start">
              <span className="text-[19px] font-semibold text-ink-soft">+{locked.length}</span>
              <span className="text-[12px] text-ink-faint">por conseguir</span>
            </button>
          )}
        </div>
      </div>

      {/* ── d) MIS INTERESES ──────────────────────────────────────────── */}
      <div className="pt-8 pb-4 mx-[22px]">
        <h2 className="text-[18px] font-semibold text-ink-strong mb-4">Mis intereses</h2>

        {tieneAlgoDato ? (
          <>
            {/* 1. Chips de intereses seleccionados por el usuario */}
            {intereses.length > 0 && (
              <div className="mb-5">
                <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-faint mb-2.5">
                  Intereses
                </div>
                <div className="flex flex-wrap gap-2">
                  {intereses.map((it) => (
                    <Chip key={it} active>{it}</Chip>
                  ))}
                </div>
              </div>
            )}

            {/* 2. Cómo explora — mismo estilo que Intereses, sin tarjeta */}
            {opcionesCompania.length > 0 && (
              <div className="mb-5">
                <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-faint mb-2.5">
                  Cómo explora
                </div>
                <div className="flex flex-wrap gap-2">
                  {opcionesCompania.map((o) => <Chip key={o.k} active>{o.k}</Chip>)}
                </div>
              </div>
            )}

            {/* 3. Su ritmo — mismo estilo que Intereses, sin tarjeta */}
            {opcionesActividad.length > 0 && (
              <div className="mb-5">
                <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-faint mb-2.5">
                  Su ritmo
                </div>
                <div className="flex flex-wrap gap-2">
                  {opcionesActividad.map((o) => <Chip key={o.k} active>{o.k}</Chip>)}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Estado vacío — el usuario no ha configurado sus intereses todavía */
          <div className="rounded-xl border border-dashed border-cardstroke/60 bg-white/[0.02] px-5 py-6 flex flex-col items-center text-center gap-3">
            <div className="w-10 h-10 rounded-full grid place-items-center"
              style={{ background: "rgba(210,115,79,0.08)", border: "1px solid rgba(210,115,79,0.18)" }}>
              <Icon name="sparkles" size={18} color="var(--accent-soft)" stroke={1.6} />
            </div>
            <div>
              <div className="text-[15px] font-medium text-ink-strong">Personaliza tu perfil</div>
              <div className="text-[13px] font-light text-ink-soft mt-1 leading-snug [text-wrap:balance]">
                Cuéntanos qué te gusta y cómo exploras. Las recomendaciones serán más tuyas.
              </div>
            </div>
            <button
              onClick={() => setDirectoIntereses(true)}
              className="mt-1 px-5 py-2.5 rounded-full text-[13.5px] font-semibold text-accent-soft border border-accent/40"
              style={{ background: "rgba(210,115,79,0.08)" }}>
              Configurar intereses
            </button>
          </div>
        )}
      </div>

      {/* Modales y sheets */}
      {menu && (
        <PaginaMenu
          prefs={prefs}
          onSavePrefs={onSavePrefs}
          onClose={() => setMenu(false)}
          salir={salir}
        />
      )}
      {/* Sheet de intereses abierto directo desde el estado vacío */}
      {directoIntereses && (
        <SettingsSheet
          prefs={prefs}
          onSave={(p) => { onSavePrefs(p); setDirectoIntereses(false); }}
          onClose={() => setDirectoIntereses(false)}
        />
      )}
      {allBadges && (
        <BadgesSheet badges={badgesCatalogo} onClose={() => setAllBadges(false)} />
      )}
      {verVisitados && (
        <PaginaVisitados
          visitados={visitadosList}
          onClose={() => setVerVisitados(false)}
        />
      )}
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   PÁGINA: MENÚ DEL PERFIL
   Lista de acciones: editar perfil, intereses, cerrar sesión.
   Fácil de extender: añade una <FilaMenu> más y su lógica de navegación.
   ───────────────────────────────────────────────────────────────────────── */

/* Fila reutilizable de menú: ícono + texto + chevron */
function FilaMenu({ icono, label, danger, onClick }) {
  const color = danger ? "#E05555" : "var(--ink-strong)";
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-4 w-full py-4 border-b border-cardstroke/40 active:opacity-60 transition-opacity">
      <Icon name={icono} size={20} color={color} stroke={1.6} />
      <span className="flex-1 text-left text-[16px] font-medium" style={{ color }}>
        {label}
      </span>
      <Icon name="chevRight" size={16} color={danger ? "#E05555" : "var(--ink-faint)"} />
    </button>
  );
}


function PaginaMenu({ prefs, onSavePrefs, onClose, salir }) {
  const [closing,       setClosing]       = useState(false);
  const [subPagina,     setSubPagina]     = useState(null); // null | "intereses" | "editarPerfil"
  const [confirmarSalir, setConfirmarSalir] = useState(false);

  const close = () => { setClosing(true); setTimeout(onClose, 300); };

  return (
    <div className="absolute inset-0 z-[65] flex flex-col">
      <style>{`
        @media (prefers-reduced-motion: no-preference){
          @keyframes mn-in  { from{transform:translateY(100%)} to{transform:none} }
          @keyframes mn-out { from{transform:none} to{transform:translateY(100%)} }
          .mn-in  { animation: mn-in  .42s cubic-bezier(0.22,1,0.36,1) both }
          .mn-out { animation: mn-out .3s  cubic-bezier(0.4,0,1,1) both }
        }
      `}</style>

      {/* Página completa — fondo sólido, slide desde abajo */}
      <div className={"absolute inset-0 bg-bg1 flex flex-col " + (closing ? "mn-out" : "mn-in")}>

        {/* Encabezado con botón volver ← */}
        <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-3.5 border-b border-cardstroke">
          <button
            onClick={close}
            className="w-10 h-10 rounded-full grid place-items-center bg-white/5 border border-cardstroke shrink-0">
            <Icon name="chevLeft" size={20} color="var(--ink-strong)" />
          </button>
          <h1 className="text-[18px] font-semibold text-ink-strong tracking-[-0.01em]">Menú</h1>
        </div>

        {/* Lista de filas */}
        <div className="flex-1 overflow-y-auto px-[22px] pt-2 pb-8 [overscroll-behavior:contain]">
          <FilaMenu
            icono="userEdit"
            label="Editar perfil"
            onClick={() => setSubPagina("editarPerfil")}
          />
          <FilaMenu
            icono="heart"
            label="Configuración de intereses"
            onClick={() => setSubPagina("intereses")}
          />
          <FilaMenu
            icono="logOut"
            label="Cerrar sesión"
            danger
            onClick={() => setConfirmarSalir(true)}
          />
        </div>
      </div>

      {/* Sub-páginas que se apilan encima del menú */}
      {subPagina === "editarPerfil" && (
        <PaginaEditarPerfil onClose={() => setSubPagina(null)} />
      )}
      {subPagina === "intereses" && (
        <SettingsSheet
          prefs={prefs}
          onSave={(p) => { onSavePrefs(p); setSubPagina(null); }}
          onClose={() => setSubPagina(null)}
        />
      )}
      {confirmarSalir && (
        <SheetConfirmarSalir
          onCancelar={() => setConfirmarSalir(false)}
          onConfirmar={async () => {
            try { await salir(); }
            catch (err) { console.error("[huella] Error cerrando sesión:", err.message); }
          }}
        />
      )}
    </div>
  );
}

/* Pantalla "Editar perfil" — permite cambiar nombre y username (guardado en Supabase) */
function PaginaEditarPerfil({ onClose }) {
  const { perfil, setPerfil } = usePerfil();
  const { usuario } = useAuth();
  const [closing,   setClosing]   = useState(false);
  const [nombre,         setNombre]         = useState(perfil?.nombre         || "");
  const [username,       setUsername]       = useState(perfil?.username       || "");
  const [destinoSonado,  setDestinoSonado]  = useState(perfil?.destino_sonado || "");
  const [tiempoLibre,    setTiempoLibre]    = useState(perfil?.tiempo_libre   || "");
  const [guardando,      setGuardando]      = useState(false);
  const [error,          setError]          = useState(null);

  const close = () => { setClosing(true); setTimeout(onClose, 300); };

  const guardar = async () => {
    if (!usuario || guardando) return;
    setGuardando(true);
    setError(null);
    try {
      const datos = await actualizarPerfil(usuario.id, {
        nombre:          nombre.trim()        || null,
        username:        username.trim()      || null,
        destino_sonado:  destinoSonado.trim() || null,
        tiempo_libre:    tiempoLibre.trim()   || null,
      });
      setPerfil(datos);
      close();
    } catch (err) {
      console.error("[huella] Error editando perfil:", err.message);
      setError("No se pudo guardar. Intenta de nuevo.");
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div className="absolute inset-0 z-[70] flex flex-col">
      <style>{`
        @media (prefers-reduced-motion: no-preference){
          @keyframes ep-in  { from{transform:translateY(100%)} to{transform:none} }
          @keyframes ep-out { from{transform:none} to{transform:translateY(100%)} }
          .ep-in  { animation: ep-in  .42s cubic-bezier(0.22,1,0.36,1) both }
          .ep-out { animation: ep-out .3s  cubic-bezier(0.4,0,1,1) both }
        }
      `}</style>

      <div className={"absolute inset-0 bg-bg1 flex flex-col " + (closing ? "ep-out" : "ep-in")}>

        {/* Encabezado con botón volver ← */}
        <div className="shrink-0 flex items-center gap-3 px-4 pt-3 pb-3.5 border-b border-cardstroke">
          <button
            onClick={close}
            className="w-10 h-10 rounded-full grid place-items-center bg-white/5 border border-cardstroke shrink-0">
            <Icon name="chevLeft" size={20} color="var(--ink-strong)" />
          </button>
          <h1 className="text-[18px] font-semibold text-ink-strong tracking-[-0.01em]">Editar perfil</h1>
        </div>

        {/* Campos del formulario */}
        <div className="flex-1 overflow-y-auto px-[22px] pt-6 pb-8 [overscroll-behavior:contain]">

          {/* Nombre */}
          <div className="mb-5">
            <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-faint block mb-2">
              Nombre
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              placeholder="Tu nombre o apodo"
              maxLength={60}
              className="w-full bg-white/[0.04] border border-cardstroke rounded-xl px-4 py-3.5 text-[15px] text-ink-strong placeholder:text-ink-ghost outline-none focus:border-accent/60"
            />
          </div>

          {/* Usuario (@handle) */}
          <div className="mb-6">
            <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-faint block mb-2">
              Usuario
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[15px] font-medium text-ink-faint select-none">
                @
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  // Solo letras minúsculas, números y guiones bajos — limpiamos al tipear
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""));
                  setError(null);
                }}
                placeholder="tu_usuario"
                maxLength={30}
                className="w-full bg-white/[0.04] border border-cardstroke rounded-xl pl-8 pr-4 py-3.5 text-[15px] text-ink-strong placeholder:text-ink-ghost outline-none focus:border-accent/60"
              />
            </div>
            <div className="text-[11.5px] font-light text-ink-faint mt-1.5">
              Solo letras minúsculas, números y guiones bajos.
            </div>
          </div>

          {/* Destino soñado */}
          <div className="mb-5">
            <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-faint block mb-2">
              ¿A dónde siempre quisiste ir?
            </label>
            <textarea
              value={destinoSonado}
              onChange={(e) => setDestinoSonado(e.target.value)}
              placeholder="Ese lugar que sueñas conocer…"
              maxLength={150}
              rows={2}
              className="w-full bg-white/[0.04] border border-cardstroke rounded-xl px-4 py-3.5 text-[15px] text-ink-strong placeholder:text-ink-ghost outline-none focus:border-accent/60 resize-none"
            />
            <div className="text-[11px] font-light text-ink-ghost mt-1 text-right">
              {destinoSonado.length}/150
            </div>
          </div>

          {/* Tiempo libre */}
          <div className="mb-6">
            <label className="text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-faint block mb-2">
              ¿Qué haces en tu tiempo libre?
            </label>
            <textarea
              value={tiempoLibre}
              onChange={(e) => setTiempoLibre(e.target.value)}
              placeholder="Lo que disfrutas hacer…"
              maxLength={150}
              rows={2}
              className="w-full bg-white/[0.04] border border-cardstroke rounded-xl px-4 py-3.5 text-[15px] text-ink-strong placeholder:text-ink-ghost outline-none focus:border-accent/60 resize-none"
            />
            <div className="text-[11px] font-light text-ink-ghost mt-1 text-right">
              {tiempoLibre.length}/150
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="text-[13px] text-[#E05555] mb-4 bg-[rgba(210,60,60,0.08)] rounded-xl px-4 py-3 border border-[rgba(210,60,60,0.18)]">
              {error}
            </div>
          )}
        </div>

        {/* Botón guardar — pegado al fondo */}
        <div
          className="px-[22px] pt-3 shrink-0 border-t border-cardstroke"
          style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}
        >
          <button
            onClick={guardar}
            disabled={guardando}
            className="w-full h-[52px] rounded-full bg-accent text-accent-on text-[16px] font-semibold shadow-[0_8px_24px_rgba(210,115,79,0.28)] disabled:opacity-50"
          >
            {guardando ? "Guardando…" : "Guardar cambios"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SHEET: CONFIRMACIÓN DE CERRAR SESIÓN
   ───────────────────────────────────────────────────────────────────────── */
function SheetConfirmarSalir({ onCancelar, onConfirmar }) {
  const [closing, setClosing] = useState(false);
  const cancelar  = () => { setClosing(true); setTimeout(onCancelar,  280); };
  const confirmar = () => { setClosing(true); setTimeout(onConfirmar, 280); };

  return (
    <div className="absolute inset-0 z-[75] flex flex-col">
      <style>{`
        @media (prefers-reduced-motion: no-preference){
          @keyframes cs-scrim-in  { from{opacity:0} to{opacity:1} }
          @keyframes cs-scrim-out { from{opacity:1} to{opacity:0} }
          @keyframes cs-up   { from{transform:translateY(100%)} to{transform:none} }
          @keyframes cs-down { from{transform:none} to{transform:translateY(100%)} }
          .cs-scrim-in  { animation: cs-scrim-in  .3s ease both }
          .cs-scrim-out { animation: cs-scrim-out .26s ease both }
          .cs-sheet-in  { animation: cs-up   .38s cubic-bezier(0.22,1,0.36,1) both }
          .cs-sheet-out { animation: cs-down .24s cubic-bezier(0.4,0,1,1) both }
        }
      `}</style>

      {/* Fondo oscuro — tocar fuera cancela */}
      <div
        onClick={cancelar}
        className={"absolute inset-0 bg-[rgba(8,7,6,0.62)] backdrop-blur-[2px] " +
          (closing ? "cs-scrim-out" : "cs-scrim-in")}
      />

      {/* Sheet */}
      <div className={"absolute left-0 right-0 bottom-0 bg-bg2 rounded-t-xl " +
        "shadow-[0_-20px_60px_rgba(0,0,0,0.5)] border-t border-glassstroke " +
        (closing ? "cs-sheet-out" : "cs-sheet-in")}>

        {/* Tirador */}
        <div className="w-10 h-1 rounded-full bg-ink-ghost mx-auto mt-3 mb-5" />

        <div className="px-[22px] pb-[max(28px,env(safe-area-inset-bottom))]">
          {/* Encabezado */}
          <h2 className="text-[20px] font-semibold text-ink-strong tracking-[-0.01em] mb-1">
            ¿Cerrar sesión?
          </h2>
          <p className="text-[14px] font-light text-ink-soft mb-7">
            ¿Seguro que quieres salir?
          </p>

          {/* Botón principal: destructivo en rojo */}
          <button
            onClick={confirmar}
            className="w-full h-[52px] rounded-full text-[15.5px] font-semibold mb-3"
            style={{ background: "rgba(210,60,60,0.18)", color: "#E05555", border: "1px solid rgba(210,60,60,0.3)" }}>
            Sí, cerrar sesión
          </button>

          {/* Botón secundario: cancelar */}
          <button
            onClick={cancelar}
            className="w-full h-[48px] rounded-full text-[15px] font-medium text-ink-soft border border-cardstroke"
            style={{ background: "rgba(255,255,255,0.04)" }}>
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────
   SHEET: TODOS LOS SELLOS
   ───────────────────────────────────────────────────────────────────────── */
function BadgesSheet({ badges, onClose }) {
  const [closing, setClosing] = useState(false);
  const close = () => { setClosing(true); setTimeout(onClose, 280); };
  const earned = badges.filter((b) => b.got);
  const locked = badges.filter((b) => !b.got);
  return (
    <div className="absolute inset-0 z-[70] flex flex-col">
      <style>{`
        @media (prefers-reduced-motion: no-preference){
          @keyframes bdg-scrim-in  { from{opacity:0} to{opacity:1} }
          @keyframes bdg-scrim-out { from{opacity:1} to{opacity:0} }
          @keyframes bdg-up   { from{transform:translateY(100%)} to{transform:none} }
          @keyframes bdg-down { from{transform:none} to{transform:translateY(100%)} }
          .bdg-scrim-in  { animation: bdg-scrim-in  .3s ease both }
          .bdg-scrim-out { animation: bdg-scrim-out .26s ease both }
          .bdg-sheet-in  { animation: bdg-up   .4s cubic-bezier(0.22,1,0.36,1) both }
          .bdg-sheet-out { animation: bdg-down .26s cubic-bezier(0.4,0,1,1) both }
        }
      `}</style>
      <div onClick={close} className={"absolute inset-0 bg-[rgba(8,7,6,0.62)] backdrop-blur-[2px] " + (closing ? "bdg-scrim-out" : "bdg-scrim-in")} />
      <div className={"absolute left-0 right-0 bottom-0 max-h-[88%] bg-bg2 rounded-t-xl flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.5)] border-t border-glassstroke " + (closing ? "bdg-sheet-out" : "bdg-sheet-in")}>
        <div className="pt-2.5 px-[22px] pb-2 shrink-0">
          <div className="w-10 h-1 rounded-full bg-ink-ghost mx-auto mb-4"></div>
          <div className="flex items-center justify-between">
            <h2 className="text-[21px] font-semibold text-ink-strong tracking-[-0.01em]">
              Tus sellos{" "}
              <span className="text-[14px] font-normal text-ink-faint ml-1">
                {earned.length} de {badges.length}
              </span>
            </h2>
            <button onClick={close} className="w-[34px] h-[34px] rounded-full grid place-items-center bg-white/[0.06] border border-cardstroke">
              <Icon name="x" size={17} color="var(--ink)" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-[22px] pt-2.5 pb-7 min-h-0 [overscroll-behavior:contain]">
          {earned.length > 0 && (
            <div className="grid grid-cols-2 gap-x-2.5 gap-y-[18px] justify-items-center mb-6">
              {earned.map((b) => <Patch key={b.id} b={b} w={150} />)}
            </div>
          )}
          <div className="text-[11px] font-semibold tracking-[0.12em] uppercase text-ink-faint mt-[10px] mb-4">
            Por conseguir · {locked.length}
          </div>
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-[18px] justify-items-center">
            {locked.map((b) => <Patch key={b.id} b={b} w={150} />)}
          </div>
        </div>
      </div>
    </div>
  );
}
