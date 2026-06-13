/* HUELLA — Perfil: datos reales de Supabase + mapa de huellas + sellos */
import { useRef, useState } from "react";
import Icon from "./Icon.jsx";
import { CatSurface } from "./Shared.jsx";
import { CAT_ICON } from "./Cards.jsx";
import PhotoSlot from "./PhotoSlot.jsx";
import SettingsSheet from "./Settings.jsx";
import { CAT, PROFILE } from "../data/huella.js";
import { useAuth } from "../context/AuthContext.jsx";
import { usePerfil } from "../context/PerfilContext.jsx";

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

/* ---------- mapa interactivo ---------- */
const MAP_POS = {
  "mirador-vencejos": { x: 34, y: 36 },
  "cafe-litografia":  { x: 56, y: 58 },
  "claustro-silencio":{ x: 44, y: 22 },
  "ruta-tejados":     { x: 68, y: 38 },
  "mesa-abuela":      { x: 24, y: 66 },
};

function MapTerrain() {
  return (
    <svg viewBox="0 0 300 240" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 w-full h-full">
      <rect width="300" height="240" fill="#14181E"></rect>
      <path d="M226 0 C238 52 266 84 300 92 L300 240 L196 240 C214 186 208 96 226 0 Z" fill="#1B2736"></path>
      <path d="M226 0 C238 52 266 84 300 92" fill="none" stroke="#27394E" strokeWidth="2"></path>
      <path d="M0 150 C60 142 120 160 170 178 C190 185 204 196 210 214" fill="none" stroke="#1F2E40" strokeWidth="7" strokeLinecap="round"></path>
      <ellipse cx="70" cy="48" rx="44" ry="28" fill="#1B231C"></ellipse>
      <ellipse cx="160" cy="120" rx="34" ry="22" fill="#19211B"></ellipse>
      <ellipse cx="40" cy="200" rx="38" ry="24" fill="#1A221C"></ellipse>
      <circle cx="70" cy="48" r="58" fill="none" stroke="rgba(245,242,237,0.03)" strokeWidth="1"></circle>
      <circle cx="70" cy="48" r="74" fill="none" stroke="rgba(245,242,237,0.025)" strokeWidth="1"></circle>
      <path d="M0 96 C70 90 150 104 224 92" fill="none" stroke="rgba(245,242,237,0.12)" strokeWidth="2.4"></path>
      <path d="M96 0 C104 70 92 150 110 240" fill="none" stroke="rgba(245,242,237,0.09)" strokeWidth="2"></path>
      <path d="M0 170 C50 168 90 150 130 130 C160 116 190 112 212 116" fill="none" stroke="rgba(245,242,237,0.06)" strokeWidth="1.6"></path>
      <path d="M30 0 C46 40 80 60 96 96 M150 0 C146 36 130 70 110 96" fill="none" stroke="rgba(245,242,237,0.05)" strokeWidth="1.3"></path>
      <path d="M0 130 L60 124 M140 200 L196 188 M170 60 L224 50" fill="none" stroke="rgba(245,242,237,0.045)" strokeWidth="1.2"></path>
      <g fill="rgba(245,242,237,0.035)">
        <rect x="118" y="46" width="14" height="10" rx="1.5"></rect>
        <rect x="136" y="44" width="10" height="12" rx="1.5"></rect>
        <rect x="120" y="62" width="11" height="9" rx="1.5"></rect>
        <rect x="136" y="60" width="13" height="10" rx="1.5"></rect>
        <rect x="154" y="50" width="10" height="9" rx="1.5"></rect>
        <rect x="60" y="120" width="12" height="9" rx="1.5"></rect>
        <rect x="76" y="118" width="9" height="11" rx="1.5"></rect>
        <rect x="62" y="134" width="10" height="8" rx="1.5"></rect>
      </g>
    </svg>
  );
}

function MapPin({ exp, pos, active, onClick }) {
  const grad = (CAT[exp.cat] || {}).grad || "var(--g-urbano)";
  return (
    <button onClick={(e) => { e.stopPropagation(); onClick(); }}
      className="absolute flex flex-col items-center"
      style={{
        left: pos.x + "%", top: pos.y + "%",
        transform: `translate(-50%, -100%) scale(${active ? 1.22 : 1})`,
        transformOrigin: "50% 100%", transition: "transform 0.22s cubic-bezier(0.22,1,0.36,1)",
        zIndex: active ? 6 : 4,
      }}>
      <span className="w-[34px] h-[34px] grid place-items-center"
        style={{
          borderRadius: "50% 50% 50% 4px", background: grad,
          border: `2px solid ${active ? "var(--accent-soft)" : "rgba(255,255,255,0.85)"}`,
          boxShadow: active ? "0 6px 18px rgba(210,115,79,0.45)" : "0 4px 12px rgba(0,0,0,0.45)",
          transform: "rotate(-45deg)",
        }}>
        <span className="grid place-items-center" style={{ transform: "rotate(45deg)" }}>
          <Icon name={CAT_ICON[exp.cat] || "pin"} size={15} color="#fff" stroke={2} />
        </span>
      </span>
      <span className="w-1.5 h-[3px] rounded-[50%] bg-black/50 mt-0.5 blur-[1px]"></span>
    </button>
  );
}

function InteractiveMap({ visited }) {
  const [sel, setSel] = useState(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [hinted, setHinted] = useState(false);
  const start = useRef(null);

  const lim = 60 * zoom;
  const clamp = (v) => Math.max(-lim, Math.min(lim, v));
  const down = (e) => { start.current = { x: e.clientX - pan.x, y: e.clientY - pan.y, moved: false }; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e) => {
    if (!start.current) return;
    const nx = clamp(e.clientX - start.current.x), ny = clamp(e.clientY - start.current.y);
    if (Math.abs(nx - pan.x) > 2 || Math.abs(ny - pan.y) > 2) { start.current.moved = true; setHinted(true); }
    setPan({ x: nx, y: ny });
  };
  const up = () => { start.current = null; };

  return (
    <div className="relative h-[270px] rounded-xl overflow-hidden border border-cardstroke shadow-elev2">
      <div onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up}
        onClick={() => setSel(null)}
        className="absolute -left-1/4 -top-1/4 w-[150%] h-[150%] cursor-grab"
        style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`, transformOrigin: "center", touchAction: "none" }}>
        <MapTerrain />
        <span className="absolute w-3.5 h-3.5 rounded-full bg-accent"
          style={{ left: "48%", top: "48%", border: "2.5px solid #fff", boxShadow: "0 0 0 6px rgba(210,115,79,0.25)", transform: "translate(-50%,-50%)" }}></span>
        {visited.map((exp) => MAP_POS[exp.id] && (
          <MapPin key={exp.id} exp={exp} pos={MAP_POS[exp.id]} active={sel && sel.id === exp.id}
            onClick={() => setSel(sel && sel.id === exp.id ? null : exp)} />
        ))}
      </div>

      <div className="glass absolute top-3 left-3 px-3 py-[7px] rounded-full flex items-center gap-1.5 text-[12px] font-semibold text-ink-strong pointer-events-none">
        <Icon name="pin" size={13} color="var(--accent-soft)" /> {visited.length} huellas aquí
      </div>
      {!hinted && (
        <div className="glass absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[11px] font-light text-ink-soft pointer-events-none whitespace-nowrap">
          Arrastra el mapa · toca un pin
        </div>
      )}

      <div className="absolute top-3 right-3 flex flex-col gap-1.5">
        {[{ s: "+", f: () => setZoom((z) => Math.min(1.7, z + 0.35)) }, { s: "−", f: () => setZoom((z) => Math.max(1, z - 0.35)) }].map((b, i) => (
          <button key={i} onClick={b.f} className="glass w-8 h-8 rounded-md grid place-items-center text-[17px] font-medium text-ink-strong">{b.s}</button>
        ))}
      </div>

      {sel && (
        <div className="glass absolute left-3 right-3 bottom-3 rounded-lg p-[11px] flex items-center gap-3">
          <CatSurface cat={sel.cat} className="w-[46px] h-[46px] rounded-md shrink-0"></CatSurface>
          <div className="flex-1 min-w-0">
            <div className="text-[14px] font-semibold text-ink-strong whitespace-nowrap overflow-hidden text-ellipsis">{sel.title}</div>
            <div className="text-[12px] font-light text-ink-soft mt-px">{sel.place}</div>
          </div>
          <button onClick={() => setSel(null)} className="w-[30px] h-[30px] rounded-full shrink-0 grid place-items-center bg-white/[0.07]">
            <Icon name="x" size={15} color="var(--ink)" />
          </button>
        </div>
      )}
    </div>
  );
}

/* ---------- sellos: parches ilustrados ---------- */
const PATCH_TONES  = { terracota: "#D2734F", azul: "#6E92C4", salvia: "#8AA590", arena: "#D9C2A3" };
const PATCH_SHAPES = {
  hex:    "M75 7 L129 35 L129 81 L75 109 L21 81 L21 35 Z",
  plaque: "M9 58 L36 15 L114 15 L141 58 L114 101 L36 101 Z",
  seal:   "M75 8 A50 50 0 1 1 74.9 8 Z",
  shield: "M75 9 L127 27 L127 62 C127 86 104 102 75 109 C46 102 23 86 23 62 L23 27 Z",
};

function Patch({ b, w = 150 }) {
  const locked = !b.got;
  const tone = locked ? "#7A8088" : (PATCH_TONES[b.tone] || PATCH_TONES.terracota);
  const h = Math.round(w * 0.773);
  return (
    <div className="shrink-0 flex flex-col items-center" style={{ width: w + 8, opacity: locked ? 0.62 : 1 }}>
      <div className="relative" style={{ width: w, height: h }}>
        <svg viewBox="0 0 150 116" className="absolute inset-0 w-full h-full">
          <path d={PATCH_SHAPES[b.shape] || PATCH_SHAPES.hex} fill={tone} fillOpacity="0.06"
            stroke={tone} strokeWidth="3.5" strokeLinejoin="round" strokeDasharray={locked ? "7 5" : "none"}></path>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-[5px] pt-0.5">
          <div className="text-center" style={{ fontWeight: 600, fontSize: Math.max(12, Math.round(w * 0.092)), color: tone, letterSpacing: "-0.01em", maxWidth: "64%", lineHeight: 1.12 }}>{b.label}</div>
          <Icon name={locked ? "lock" : b.icon} size={Math.round(w * 0.19)} color={tone} stroke={1.7} />
        </div>
        {!locked && (<>
          <span className="absolute top-1/2 -translate-y-1/2 text-[9.5px] font-semibold opacity-85" style={{ left: b.shape === "plaque" ? 22 : 30, color: tone }}>HU</span>
          <span className="absolute top-1/2 -translate-y-1/2 opacity-85 grid" style={{ right: b.shape === "plaque" ? 22 : 30 }}>
            <Icon name="pin" size={11} color={tone} stroke={2} />
          </span>
        </>)}
      </div>
      <div className="text-center mt-[9px]">
        <div className="text-[12.5px] font-medium text-ink">{b.desc}</div>
        <div className="text-[11px] font-light text-ink-faint mt-px">{locked ? "Por conseguir" : b.date}</div>
      </div>
    </div>
  );
}

/* ---------- pantalla para usuarios invitados ---------- */
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

/* ---------- componente principal ---------- */
export default function ProfileScreen({ prefs, onSavePrefs, onCrearCuenta }) {
  const { usuario, esInvitado, salir } = useAuth();
  const { perfil } = usePerfil();

  const [settings,  setSettings]  = useState(false);
  const [allBadges, setAllBadges] = useState(false);
  const [scrolled,  setScrolled]  = useState(false);

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

  // Estadísticas: todo en 0 hasta que conectemos guardados/visitados a Supabase
  const stats = { lugares: 0, ciudades: 0, tours: 0, reviews: 0 };

  // Visitados: vacío por ahora (se conectará a la tabla "visitados" en el futuro)
  const visitedExps = [];

  // Sellos: usamos el catálogo de PROFILE.badges pero todos bloqueados (got: false)
  // porque ningún usuario nuevo ha desbloqueado sellos aún
  const badgesCatalogo = PROFILE.badges.map((b) => ({ ...b, got: false }));
  const earned = []; // nadie tiene sellos aún
  const locked = badgesCatalogo;

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

      {/* Cabecera fija (se activa con scroll) */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-5 py-2.5"
        style={{
          background: scrolled ? "var(--glass-bg)" : "transparent",
          WebkitBackdropFilter: scrolled ? "var(--glass-blur)" : "none",
          backdropFilter: scrolled ? "var(--glass-blur)" : "none",
          boxShadow: scrolled ? "0 8px 24px rgba(0,0,0,0.28)" : "none",
          borderBottom: scrolled ? "1px solid var(--glass-stroke)" : "1px solid transparent",
        }}>
        <div className="text-[17px] font-semibold text-ink-strong tracking-[-0.01em]"
          style={{ opacity: scrolled ? 1 : 0 }}>
          {nombre}
        </div>
        <div className="flex gap-2.5">
          <button className="w-10 h-10 rounded-full grid place-items-center bg-white/5 border border-cardstroke">
            <Icon name="share" size={18} color="var(--ink)" />
          </button>
          <button onClick={() => setSettings(true)} className="w-10 h-10 rounded-full grid place-items-center bg-white/5 border border-cardstroke">
            <Icon name="sliders" size={18} color="var(--ink)" />
          </button>
        </div>
      </div>

      {/* Avatar y nombre */}
      <div className="flex flex-col items-center pt-2 px-[22px] pb-5">
        <div className="relative w-[86px] h-[86px]">
          <div className="absolute inset-0 rounded-full grid place-items-center text-white text-[32px] font-semibold border-2 border-white/[0.16] shadow-elev2"
            style={{ background: "linear-gradient(135deg, #C05A34, #7A3E55)" }}>
            {iniciales}
          </div>
          <PhotoSlot id="avatar-photo" shape="circle"
            style={{ position: "absolute", inset: 0, width: 86, height: 86, zIndex: 2 }} />
          <span className="absolute -right-0.5 bottom-0.5 w-7 h-7 rounded-full grid place-items-center bg-accent z-[3] pointer-events-none"
            style={{ border: "2px solid var(--bg-1)" }}>
            <Icon name="camera" size={14} color="var(--on-accent)" stroke={2} />
          </span>
        </div>
        <div className="text-[22px] font-semibold text-ink-strong tracking-[-0.01em] mt-3.5">{nombre}</div>
        <div className="text-[13px] font-light text-ink-faint mt-0.5">{handle} · Explorando desde {anio}</div>

        {/* Chips de intereses (vacío si no tiene ninguno) */}
        {intereses.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {intereses.slice(0, 5).map((i) => (
              <span key={i}
                className="text-[12px] font-medium text-ink-soft px-3 py-1 rounded-full border border-cardstroke"
                style={{ background: "rgba(255,255,255,0.05)" }}>
                {i}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Estadísticas */}
      <div className="mx-[22px] px-3.5 py-4 rounded-lg flex bg-white/[0.045] border border-cardstroke">
        <StatCell value={stats.lugares}  label="Lugares"  />
        <div className="w-px bg-cardstroke"></div>
        <StatCell value={stats.ciudades} label="Ciudades" />
        <div className="w-px bg-cardstroke"></div>
        <StatCell value={stats.tours}    label="Tours"    />
        <div className="w-px bg-cardstroke"></div>
        <StatCell value={stats.reviews}  label="Reseñas"  />
      </div>

      {/* Mapa de huellas */}
      <div className="pt-6 px-[22px]">
        <h2 className="text-[18px] font-semibold text-ink-strong mb-[13px]">Tu mapa de huellas</h2>
        <InteractiveMap visited={visitedExps} />
      </div>

      {/* Sellos */}
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
          {/* Sin sellos ganados aún — solo mostramos el botón de "por conseguir" */}
          <button onClick={() => setAllBadges(true)}
            className="w-[150px] shrink-0 self-stretch flex flex-col items-center justify-center gap-2 rounded-lg border-[1.5px] border-dashed border-ink-ghost my-1 mb-[30px] py-6">
            <span className="text-[19px] font-semibold text-ink-soft">+{locked.length}</span>
            <span className="text-[12px] text-ink-faint">por conseguir</span>
          </button>
        </div>
      </div>

      {/* Visitados recientemente */}
      <div className="pt-7 px-[22px]">
        <h2 className="text-[18px] font-semibold text-ink-strong mb-3">Visitados recientemente</h2>
        {visitedExps.length === 0 ? (
          <p className="text-[14px] font-light text-ink-faint py-2">
            Aún no has marcado ningún lugar como visitado.
          </p>
        ) : (
          visitedExps.map((exp, i) => (
            <div key={exp.id} className={i ? "border-t border-cardstroke" : ""}>
              <VisitedRow exp={exp} />
            </div>
          ))
        )}
      </div>

      {/* Cerrar sesión */}
      <div className="px-[22px] pt-8 pb-2">
        <button
          onClick={async () => {
            try { await salir(); }
            catch (err) { console.error("[huella] Error cerrando sesión:", err.message); }
          }}
          className="w-full h-12 rounded-full flex items-center justify-center gap-2.5 text-[14.5px] font-medium text-ink-soft border border-cardstroke"
          style={{ background: "rgba(255,255,255,0.04)" }}>
          <Icon name="arrowRight" size={16} color="var(--ink-soft)" style={{ transform: "rotate(180deg)" }} />
          Cerrar sesión
        </button>
      </div>

      {settings && <SettingsSheet prefs={prefs} onSave={onSavePrefs} onClose={() => setSettings(false)} nombre={nombre} iniciales={iniciales} />}
      {allBadges && <BadgesSheet badges={badgesCatalogo} onClose={() => setAllBadges(false)} />}
    </div>
  );
}

/* ---------- VisitedRow (se usará cuando conectemos tabla visitados) ---------- */
function VisitedRow({ exp }) {
  return (
    <div className="flex items-center gap-3 py-[9px]">
      <CatSurface cat={exp.cat} className="w-12 h-12 rounded-md shrink-0"></CatSurface>
      <div className="flex-1 min-w-0">
        <div className="text-[14px] font-medium text-ink-strong">{exp.title}</div>
        <div className="text-[12px] font-light text-ink-faint">{exp.place}</div>
      </div>
    </div>
  );
}

/* ---------- sheet: todos los sellos ---------- */
function BadgesSheet({ badges, onClose }) {
  const [closing, setClosing] = useState(false);
  const close = () => { setClosing(true); setTimeout(onClose, 280); };
  const earned = badges.filter((b) => b.got);
  const locked = badges.filter((b) => !b.got);
  return (
    <div className="absolute inset-0 z-[70] flex flex-col">
      <style>{`
        .bdg-scrim{ opacity: 1; } .bdg-sheet{ transform: none; }
        @media (prefers-reduced-motion: no-preference){
          @keyframes bdg-scrim-in{from{opacity:0}to{opacity:1}}
          @keyframes bdg-scrim-out{from{opacity:1}to{opacity:0}}
          @keyframes bdg-up{from{transform:translateY(100%)}to{transform:none}}
          @keyframes bdg-down{from{transform:none}to{transform:translateY(100%)}}
          .bdg-scrim-in{animation:bdg-scrim-in .3s ease both}
          .bdg-scrim-out{animation:bdg-scrim-out .26s ease both}
          .bdg-sheet-in{animation:bdg-up .4s cubic-bezier(0.22,1,0.36,1) both}
          .bdg-sheet-out{animation:bdg-down .26s cubic-bezier(0.4,0,1,1) both}
        }
      `}</style>
      <div onClick={close} className={"bdg-scrim absolute inset-0 bg-[rgba(8,7,6,0.62)] backdrop-blur-[2px] " + (closing ? "bdg-scrim-out" : "bdg-scrim-in")}></div>
      <div className={"bdg-sheet absolute left-0 right-0 bottom-0 max-h-[88%] bg-bg2 rounded-t-xl flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.5)] border-t border-glassstroke " + (closing ? "bdg-sheet-out" : "bdg-sheet-in")}>
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
