/* HUELLA — Home (3 direcciones: editorial · calm · compact) */
import { useState, useEffect } from "react";
import Icon from "./Icon.jsx";
import { Chip } from "./Shared.jsx";
import { ExploreCard, CarouselCard, FeedCard, CompactRow } from "./Cards.jsx";
import { SECTIONS, EXP, byId } from "../data/huella.js";
import { buscarPorCategoria, buscarParaTi } from "../services/lugares.js";

function SectionHead({ title, sub, onMore }) {
  return (
    <div className="flex items-end justify-between gap-3 mb-3.5">
      <div>
        <h2 className="text-[19px] font-semibold text-ink-strong tracking-[-0.01em]">{title}</h2>
        {sub && <div className="text-[13px] font-light text-ink-soft mt-[3px]">{sub}</div>}
      </div>
      <button onClick={onMore} className="text-[13px] font-medium text-accent-soft shrink-0 inline-flex items-center gap-[3px]">
        Ver más <Icon name="chevRight" size={15} color="var(--accent-soft)" />
      </button>
    </div>
  );
}

function Carousel({ children }) {
  return (
    <div className="flex gap-3.5 overflow-x-auto px-[22px] -mx-[22px] snap-x snap-mandatory">
      {/* eslint-disable-next-line */}
      {Array.isArray(children) ? children.map((c, i) => <div key={i} className="snap-start">{c}</div>) : <div className="snap-start">{children}</div>}
      <div className="w-1.5 shrink-0" />
    </div>
  );
}

function HomeHeader({ name, location, scrolled, sticky = true, onChangeLocation }) {
  const showGlass = sticky && scrolled;
  return (
    <div className={(sticky ? "sticky" : "static") + " top-0 z-20 mb-1 pt-2.5 px-5 pb-3.5"}
      style={{
        background: showGlass ? "var(--glass-bg)" : "transparent",
        WebkitBackdropFilter: showGlass ? "var(--glass-blur)" : "none",
        backdropFilter: showGlass ? "var(--glass-blur)" : "none",
        boxShadow: showGlass ? "0 8px 24px rgba(0,0,0,0.28)" : "none" }}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[9px]">
          <button onClick={onChangeLocation} className="flex items-center gap-[7px]">
            <Icon name="pin" size={16} color="var(--accent-soft)" />
            <div className="text-left">
              <div className="text-[11px] font-normal text-ink-faint leading-none">Tu ubicación</div>
              <div className="text-[14px] font-semibold text-ink-strong flex items-center gap-1">
                {location} <Icon name="chevRight" size={13} color="var(--ink-soft)" style={{ transform: "rotate(90deg)" }} />
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

function CatChips() {
  const cats = ["Para ti", "Cerca", "Naturaleza", "Gastronomía", "Miradores", "Cafés", "Cultura"];
  const [active, setActive] = useState("Para ti");
  return (
    <div className="flex gap-2 overflow-x-auto px-[22px] pb-1">
      {cats.map((c) => <Chip key={c} active={active === c} onClick={() => setActive(c)}>{c}</Chip>)}
    </div>
  );
}

const EXPLORE_TABS = [
  { k: "para-ti", icon: "compass", label: "Para ti" },
  { k: "naturaleza", icon: "leaf", label: "Naturaleza" },
  { k: "cultura", icon: "building", label: "Cultura" },
  { k: "gastronomia", icon: "utensils", label: "Gastro" },
  { k: "miradores", icon: "mountain", label: "Miradores" },
  { k: "cafes", icon: "cup", label: "Cafés" },
  { k: "aventura", icon: "bolt", label: "Aventura" },
  { k: "bienestar", icon: "sun", label: "Bienestar" },
];

function CategoryBar({ active, onChange }) {
  return (
    <div className="flex gap-[18px] overflow-x-auto px-[20px] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {EXPLORE_TABS.map((t) => {
        const on = active === t.k;
        return (
          <button key={t.k} onClick={() => onChange(t.k)} className="shrink-0 flex flex-col items-center gap-1.5 pt-0.5 relative">
            <span className={"w-[42px] h-[42px] rounded-full grid place-items-center border transition-all duration-200 "
              + (on ? "border-transparent" : "bg-white/[0.04] border-cardstroke")}
              style={on ? { background: "color-mix(in srgb, var(--accent) 18%, transparent)" } : null}>
              <Icon name={t.icon} size={20} stroke={1.9} color={on ? "var(--accent-soft)" : "var(--ink-faint)"} />
            </span>
            <span className={"text-[11px] whitespace-nowrap transition-colors " + (on ? "font-semibold text-ink-strong" : "font-medium text-ink-faint")}>{t.label}</span>
            <span className="h-[2px] rounded-full transition-all duration-200"
              style={{ width: on ? 22 : 0, background: "var(--accent)" }}></span>
          </button>
        );
      })}
    </div>
  );
}

function SearchPill({ location, prefs, onChangeLocation }) {
  const compania = (prefs && prefs.compania) || "Cualquiera";
  return (
    <button onClick={onChangeLocation}
      className="w-full flex items-center gap-3 pl-2 pr-2 py-2 rounded-full bg-bg3 border border-cardstroke shadow-elev2">
      <span className="w-[42px] h-[42px] rounded-full grid place-items-center shrink-0 bg-accent">
        <Icon name="search" size={19} color="var(--on-accent)" stroke={2.3} />
      </span>
      <span className="flex-1 min-w-0 text-left">
        <span className="block text-[15px] font-semibold text-ink-strong leading-tight">¿A dónde vas?</span>
        <span className="block text-[12.5px] text-ink-faint mt-0.5 whitespace-nowrap overflow-hidden text-ellipsis">{location} · Cuando sea · {compania}</span>
      </span>
      <span className="w-[40px] h-[40px] rounded-full grid place-items-center shrink-0 border border-cardstroke bg-white/[0.04]">
        <Icon name="sliders" size={17} color="var(--ink)" />
      </span>
    </button>
  );
}

function ExploreTopBar({ location, prefs, active, onChange, onChangeLocation, scrolled }) {
  return (
    <div className="sticky top-0 z-20 pb-3"
      style={{
        background: scrolled ? "var(--glass-bg)" : "var(--bg-1)",
        WebkitBackdropFilter: scrolled ? "var(--glass-blur)" : "none",
        backdropFilter: scrolled ? "var(--glass-blur)" : "none",
        boxShadow: scrolled ? "0 12px 32px rgba(0,0,0,0.32)" : "none",
        borderBottom: scrolled ? "1px solid var(--glass-stroke)" : "1px solid transparent" }}>
      <div className="pt-2.5 px-[18px] pb-3.5">
        <SearchPill location={location} prefs={prefs} onChangeLocation={onChangeLocation} />
      </div>
      <CategoryBar active={active} onChange={onChange} />
    </div>
  );
}

/* ── Tarjeta esqueleto mientras carga ─────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="w-full animate-pulse">
      <div className="rounded-xl bg-white/[0.07]" style={{ height: 250 }} />
      <div className="pt-3 flex flex-col gap-2.5">
        <div className="h-[18px] rounded-lg bg-white/[0.06] w-3/4" />
        <div className="h-[14px] rounded-lg bg-white/[0.04] w-1/2" />
        <div className="h-[14px] rounded-lg bg-white/[0.04] w-2/3" />
      </div>
    </div>
  );
}

/* ── Mensaje cuando no hay resultados ─────────────────────────────────── */
function EstadoVacio() {
  return (
    <div className="flex flex-col items-center py-16 px-6 text-center">
      <Icon name="compass" size={44} color="var(--ink-faint)" />
      <p className="text-[16px] font-medium text-ink-soft mt-4 mb-1">Sin resultados en esta zona</p>
      <p className="text-[13px] font-light text-ink-faint leading-relaxed">
        No encontramos lugares de esta categoría cerca de aquí. Prueba con otra ciudad.
      </p>
    </div>
  );
}

/* ── Mensaje cuando falla la conexión ─────────────────────────────────── */
function EstadoError({ mensaje }) {
  return (
    <div className="flex flex-col items-center py-12 px-6 text-center">
      <Icon name="wifi" size={40} color="var(--ink-faint)" />
      <p className="text-[15px] font-medium text-ink-soft mt-3 mb-1">No se pudo conectar</p>
      <p className="text-[12px] font-light text-ink-faint">{mensaje}</p>
    </div>
  );
}

export default function Home({ direction, saved, onSave, onOpen, prefs, location, onChangeLocation }) {
  const name = "Mara";
  const cardProps = (exp) => ({ exp, saved: saved.includes(exp.id), onSave: () => onSave(exp.id), onOpen });
  const [scrolled, setScrolled] = useState(false);
  const [cat, setCat] = useState("para-ti");
  const onScroll = (e) => setScrolled(e.target.scrollTop > 8);

  // ── Estado del feed de la dirección "editorial" ────────────────────────
  // feed = null → todavía no se completó ninguna carga (muestra skeletons)
  // feed = []   → carga terminada pero sin resultados
  // feed = [...] → resultados reales
  const [feed, setFeed] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Clave de intereses: si cambia la selección en Perfil, este string cambia
  // y el efecto se vuelve a ejecutar para "Para ti".
  const interesKey = prefs?.intereses?.join(",") ?? "";

  useEffect(() => {
    // Solo aplica a la dirección "editorial"; calm/compact usan datos estáticos
    if (direction !== "editorial") return;

    let cancelado = false;

    const cargar = async () => {
      setCargando(true);
      setErrorMsg(null);
      try {
        let resultados;
        if (cat === "para-ti") {
          // Usar los intereses del perfil si existen, si no unos por defecto
          const intereses = prefs?.intereses?.length
            ? prefs.intereses
            : ["Cafés", "Naturaleza", "Cultura"];
          resultados = await buscarParaTi(intereses, location);
        } else {
          resultados = await buscarPorCategoria(cat, location);
        }
        if (!cancelado) setFeed(resultados);
      } catch (err) {
        if (!cancelado) {
          setFeed([]);       // deja de ser null para que el error se muestre
          setErrorMsg(err.message);
        }
      } finally {
        if (!cancelado) setCargando(false);
      }
    };

    cargar();
    // Limpieza: si el usuario cambia de categoría antes de que termine, ignoramos el resultado anterior
    return () => { cancelado = true; };
  }, [cat, location, interesKey, direction]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div onScroll={onScroll} className="flex-1 overflow-y-auto pb-24">
      {direction !== "editorial" && (
        <HomeHeader name={name} location={location} scrolled={scrolled} sticky={true} onChangeLocation={onChangeLocation} />
      )}

      {/* ---------- EDITORIAL (Explorar) ---------- */}
      {direction === "editorial" && (<>
        <ExploreTopBar location={location} prefs={prefs} active={cat} onChange={setCat} onChangeLocation={onChangeLocation} scrolled={scrolled} />
        <div className="flex flex-col gap-7 px-[18px] pt-5">
          {/* Estado: cargando O primer render antes de que lleguen datos */}
          {(cargando || feed === null) && [0, 1, 2].map((i) => <SkeletonCard key={i} />)}
          {/* Estado: error de red */}
          {!cargando && feed !== null && errorMsg && <EstadoError mensaje={errorMsg} />}
          {/* Estado: sin resultados */}
          {!cargando && feed !== null && !errorMsg && feed.length === 0 && <EstadoVacio />}
          {/* Estado: resultados reales */}
          {!cargando && feed !== null && !errorMsg && feed.map((exp, i) => (
            <div key={exp.id} className="rise" style={{ animationDelay: `${Math.min(i, 5) * 0.04}s` }}>
              <ExploreCard {...cardProps(exp)} />
            </div>
          ))}
        </div>
      </>)}

      {/* ---------- CALM ---------- */}
      {direction === "calm" && (<>
        <div className="p-6">
          <div className="text-[15px] font-light text-ink-soft mb-1.5">Buenas tardes, {name}</div>
          <h1 className="text-[30px] font-light text-ink-strong tracking-[-0.015em] leading-[1.22] [text-wrap:balance]">
            Respira. <span className="text-accent-soft font-medium">Algo cercano</span> te está esperando.
          </h1>
        </div>
        <div className="flex flex-col gap-[34px] px-[22px]">
          {SECTIONS.map((sec, i) => {
            const exp = byId(sec.ids[i % sec.ids.length]);
            return (
              <div key={sec.id} className="rise" style={{ animationDelay: `${i * 0.04}s` }}>
                <div className="text-[12px] font-semibold tracking-[0.1em] uppercase text-ink-faint mb-3">{sec.title}</div>
                <FeedCard {...cardProps(exp)} />
              </div>
            );
          })}
        </div>
      </>)}

      {/* ---------- COMPACT ---------- */}
      {direction === "compact" && (<>
        <div className="pt-4 px-[22px] pb-3">
          <div className="text-[14px] font-light text-ink-soft">Buenas tardes, {name}</div>
          <h1 className="text-[24px] font-medium text-ink-strong tracking-[-0.01em] mt-[3px] mb-3.5">
            ¿Qué te apetece hoy?
          </h1>
          <button className="w-full flex items-center gap-[11px] px-4 py-3.5 rounded-full bg-white/[0.045] border border-cardstroke">
            <Icon name="search" size={19} color="var(--ink-soft)" />
            <span className="text-[14px] text-ink-faint">Busca lugares, rutas, sabores…</span>
            <span className="ml-auto"><Icon name="sliders" size={18} color="var(--accent-soft)" /></span>
          </button>
        </div>
        <div className="mb-[18px]"><CatChips /></div>
        <div className="px-[22px]">
          <SectionHead title={SECTIONS[0].title} sub={SECTIONS[0].sub} />
        </div>
        <Carousel>{SECTIONS[0].ids.map((id) => <CarouselCard key={id} w={208} {...cardProps(byId(id))} />)}</Carousel>
        {SECTIONS.slice(1).map((sec) => (
          <div key={sec.id} className="px-[22px] mt-7">
            <SectionHead title={sec.title} sub={sec.sub} />
            <div className="flex flex-col gap-2.5">
              {sec.ids.map((id) => <CompactRow key={id} {...cardProps(byId(id))} />)}
            </div>
          </div>
        ))}
      </>)}
    </div>
  );
}
