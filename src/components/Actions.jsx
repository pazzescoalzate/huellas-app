/* HUELLA — hojas de acciones: Cómo llegar + Compartir */
import { useState } from "react";
import Icon from "./Icon.jsx";
import { CatSurface } from "./Shared.jsx";

/* base reusable action sheet */
function ActionSheet({ title, sub, onClose, children }) {
  const [closing, setClosing] = useState(false);
  const close = () => { setClosing(true); setTimeout(onClose, 280); };
  return (
    <div className="absolute inset-0 z-[80] flex flex-col">
      <style>{`
        .act-scrim{opacity:1}.act-sheet{transform:none}
        @media (prefers-reduced-motion: no-preference){
          @keyframes act-scrim-in{from{opacity:0}to{opacity:1}}
          @keyframes act-scrim-out{from{opacity:1}to{opacity:0}}
          @keyframes act-up{from{transform:translateY(100%)}to{transform:none}}
          @keyframes act-down{from{transform:none}to{transform:translateY(100%)}}
          .act-scrim-in{animation:act-scrim-in .3s ease both}
          .act-scrim-out{animation:act-scrim-out .26s ease both}
          .act-sheet-in{animation:act-up .4s cubic-bezier(0.22,1,0.36,1) both}
          .act-sheet-out{animation:act-down .26s cubic-bezier(0.4,0,1,1) both}
        }
      `}</style>
      <div onClick={close} className={"act-scrim absolute inset-0 bg-[rgba(8,7,6,0.66)] backdrop-blur-[3px] " + (closing ? "act-scrim-out" : "act-scrim-in")}></div>
      <div className={"act-sheet absolute left-0 right-0 bottom-0 max-h-[82%] bg-bg2 rounded-t-xl flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.5)] border-t border-glassstroke " + (closing ? "act-sheet-out" : "act-sheet-in")}>
        <div className="pt-2.5 px-[22px] pb-1 shrink-0">
          <div className="w-10 h-1 rounded-full bg-ink-ghost mx-auto mb-4"></div>
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div>
              <h2 className="text-[20px] font-semibold text-ink-strong tracking-[-0.01em]">{title}</h2>
              {sub && <div className="text-[12.5px] font-light text-ink-soft mt-[3px]">{sub}</div>}
            </div>
            <button onClick={close} className="w-[34px] h-[34px] rounded-full shrink-0 grid place-items-center bg-white/[0.06] border border-cardstroke">
              <Icon name="x" size={17} color="var(--ink)" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto px-[18px] pt-2.5 [overscroll-behavior:contain]" style={{ paddingBottom: "calc(20px + env(safe-area-inset-bottom))" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function ActionItem({ logo, label, sub, onClick, accent, trailing }) {
  return (
    <button onClick={onClick} className="w-full flex items-center gap-3.5 text-left px-3.5 py-3 mb-2 rounded-lg bg-white/[0.045] border border-cardstroke">
      <span className="w-[46px] h-[46px] rounded-md shrink-0 grid place-items-center" style={{ background: accent || "rgba(255,255,255,0.06)" }}>{logo}</span>
      <span className="flex-1 min-w-0">
        <span className="block text-[15px] font-medium text-ink-strong">{label}</span>
        {sub && <span className="block text-[12.5px] font-light text-ink-faint mt-px">{sub}</span>}
      </span>
      {trailing || <Icon name="chevRight" size={18} color="var(--ink-faint)" />}
    </button>
  );
}

/* brand glyphs */
function GMapsGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 2a7 7 0 0 0-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 0 0-7-7Z" fill="#fff" fillOpacity="0.18"/>
      <path d="M12 2a7 7 0 0 1 6.1 3.5L9.2 14.4 6.4 11A7 7 0 0 1 12 2Z" fill="#4285F4"/>
      <path d="M18.1 5.5A7 7 0 0 1 19 9c0 2-1.2 4.6-2.7 6.9L9.2 14.4Z" fill="#FBBC04"/>
      <path d="M16.3 15.9C14.4 18.8 12 22 12 22s-1.6-2-3.2-4.4l-2-3.2 2.4-3 7 .5Z" fill="#34A853"/>
      <path d="M9.2 14.4 6.8 10.8a7 7 0 0 1 11.3-5.3Z" fill="#1A73E8"/>
      <circle cx="12" cy="9" r="2.4" fill="#EA4335"/>
    </svg>
  );
}
function WazeGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M12 3c4.4 0 8 3.2 8 7.2 0 4.4-3.8 7.3-8.4 7.3-.9 0-2 .6-2.7 1.2-.5.4-1.2 0-1.1-.6.1-.9-.5-1.7-1.4-2.2A7 7 0 0 1 4 10.2C4 6.2 7.6 3 12 3Z" fill="#33CCFF"/>
      <circle cx="9.3" cy="9.6" r="1.05" fill="#0B1320"/>
      <circle cx="14.4" cy="9.6" r="1.05" fill="#0B1320"/>
      <path d="M9 12.4c.7 1 1.9 1.6 3.1 1.6 1.2 0 2.3-.6 3-1.6" stroke="#0B1320" strokeWidth="1.2" strokeLinecap="round" fill="none"/>
    </svg>
  );
}
function AppleMapsGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <rect x="3" y="3" width="18" height="18" rx="5" fill="#fff" fillOpacity="0.1"/>
      <path d="M16.5 6 11 11.5 8 9l-2.4 6.4a.6.6 0 0 0 .8.8L13 14l3 3 2-11Z" fill="#34A853"/>
      <path d="M18 7 16 18l-3-3 1.5-4.5L18 7Z" fill="#EA4335"/>
    </svg>
  );
}
function WhatsAppGlyph() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
      <path d="M12 3a9 9 0 0 0-7.7 13.6L3 21l4.5-1.2A9 9 0 1 0 12 3Zm0 16.4c-1.4 0-2.8-.4-4-1.1l-.3-.2-2.7.7.7-2.6-.2-.3A7.4 7.4 0 1 1 12 19.4Zm4.1-5.5c-.2-.1-1.3-.7-1.5-.8-.2-.1-.4-.1-.5.1l-.7.9c-.1.2-.3.2-.5.1a6 6 0 0 1-3-2.6c-.2-.4.2-.4.6-1.2.1-.1 0-.3 0-.4l-.7-1.7c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.8.8-.8 2 .1 3.4a9 9 0 0 0 3.6 3.2c1.3.6 1.9.6 2.6.5.4-.1 1.3-.5 1.4-1 .2-.5.2-1 .1-1Z"/>
    </svg>
  );
}

const mapsQuery = (exp) => encodeURIComponent(`${exp.title}, ${exp.place}`);
const shareText = (exp) => `Mira esta experiencia en Huella: ${exp.title} — ${exp.place}. ${exp.match}% compatible.`;
const shareUrl = (exp) => `https://huella.app/e/${exp.id}`;

export function toast(msg) {
  let t = document.getElementById("hu-toast");
  if (!t) {
    t = document.createElement("div"); t.id = "hu-toast";
    t.style.cssText = "position:absolute;left:50%;bottom:120px;transform:translateX(-50%) translateY(10px);z-index:200;" +
      "background:rgba(28,30,37,0.92);color:#F5F2ED;font:500 13px Poppins,sans-serif;padding:11px 18px;border-radius:999px;" +
      "border:1px solid rgba(245,242,237,0.14);box-shadow:0 12px 40px rgba(0,0,0,0.5);opacity:0;transition:opacity .2s,transform .2s;" +
      "-webkit-backdrop-filter:blur(20px);backdrop-filter:blur(20px);display:flex;align-items:center;gap:8px;white-space:nowrap;pointer-events:none";
    (document.querySelector(".screen") || document.body).appendChild(t);
  }
  t.innerHTML = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#E89571" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7"/></svg>' + msg;
  requestAnimationFrame(() => { t.style.opacity = "1"; t.style.transform = "translateX(-50%) translateY(0)"; });
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.style.opacity = "0"; t.style.transform = "translateX(-50%) translateY(10px)"; }, 1900);
}

function copy(text, msg) {
  const fallback = () => {
    try {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.cssText = "position:fixed;top:-9999px;opacity:0";
      (document.querySelector(".screen") || document.body).appendChild(ta);
      ta.focus(); ta.select();
      document.execCommand("copy");
      ta.remove();
    } catch (e) { /* noop */ }
  };
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(fallback);
    } else { fallback(); }
  } catch (e) { fallback(); }
  toast(msg || "Copiado");
}

/* ---------- Cómo llegar ---------- */
export function NavSheet({ exp, onClose }) {
  const q = mapsQuery(exp);
  const go = (url) => { try { window.open(url, "_blank"); } catch (e) { /* noop */ } };
  return (
    <ActionSheet title="Cómo llegar" sub={`${exp.title} · ${exp.place}`} onClose={onClose}>
      <ActionItem logo={<GMapsGlyph />} label="Google Maps" sub="Indicaciones paso a paso"
        onClick={() => go(`https://www.google.com/maps/dir/?api=1&destination=${q}`)} />
      <ActionItem logo={<WazeGlyph />} label="Waze" sub="Ruta con tráfico en tiempo real"
        onClick={() => go(`https://waze.com/ul?q=${q}&navigate=yes`)} />
      <ActionItem logo={<AppleMapsGlyph />} label="Apple Maps" sub="Para dispositivos Apple"
        onClick={() => go(`https://maps.apple.com/?q=${q}`)} />
      <div className="h-px bg-cardstroke mt-1.5 mb-3.5 mx-1"></div>
      <ActionItem
        logo={<Icon name="pin" size={22} color="var(--accent-soft)" />}
        accent="rgba(210,115,79,0.14)"
        label="Copiar dirección" sub={`${exp.title}, ${exp.place}`}
        trailing={<Icon name="download" size={18} color="var(--ink-faint)" />}
        onClick={() => copy(`${exp.title}, ${exp.place}`, "Dirección copiada")} />
    </ActionSheet>
  );
}

/* ---------- Compartir ---------- */
export function ShareSheet({ exp, onClose }) {
  const url = shareUrl(exp), text = shareText(exp);
  const go = (u) => { try { window.open(u, "_blank"); } catch (e) { /* noop */ } };
  const native = async () => {
    if (navigator.share) { try { await navigator.share({ title: exp.title, text, url }); } catch (e) { /* noop */ } }
    else copy(url, "Enlace copiado");
  };
  return (
    <ActionSheet title="Compartir experiencia" sub={exp.title} onClose={onClose}>
      <div className="flex items-center gap-[13px] p-2.5 mb-4 rounded-lg bg-white/[0.045] border border-cardstroke">
        <CatSurface cat={exp.cat} className="w-[58px] h-[58px] rounded-md shrink-0"></CatSurface>
        <div className="flex-1 min-w-0">
          <div className="text-[15px] font-semibold text-ink-strong whitespace-nowrap overflow-hidden text-ellipsis">{exp.title}</div>
          <div className="text-[12.5px] font-light text-ink-faint mt-0.5">{url.replace("https://", "")}</div>
        </div>
      </div>

      <ActionItem logo={<WhatsAppGlyph />} label="WhatsApp" sub="Enviar a un chat"
        onClick={() => go(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`)} />
      <ActionItem
        logo={<Icon name="download" size={22} color="var(--accent-soft)" />} accent="rgba(210,115,79,0.14)"
        label="Copiar enlace" sub={url.replace("https://", "")}
        trailing={<span className="text-[12px] font-medium text-accent-soft">Copiar</span>}
        onClick={() => copy(url, "Enlace copiado")} />
      <ActionItem
        logo={<Icon name="share" size={22} color="var(--ink)" />}
        label="Más opciones" sub="Mensajes, correo, redes…"
        onClick={native} />
    </ActionSheet>
  );
}
