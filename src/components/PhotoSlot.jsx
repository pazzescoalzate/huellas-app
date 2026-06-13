/* HUELLA — PhotoSlot
   Reemplaza el <image-slot> del editor por una subida de imagen real.
   El usuario toca el área y elige una foto (galería o cámara). La imagen se
   guarda como data URL en localStorage bajo la clave `id`, de modo que
   persiste entre sesiones. Pensado para superponerse sobre un fondo
   (avatar o foto de portada). */
import { useEffect, useRef, useState } from "react";

const KEY = (id) => `huella_img_${id}`;

function readStored(id) {
  try {
    return localStorage.getItem(KEY(id)) || null;
  } catch {
    return null;
  }
}

export default function PhotoSlot({
  id,
  shape = "rect",
  radius = 12,
  fit = "cover",
  className = "",
  style,
}) {
  const [src, setSrc] = useState(() => readStored(id));
  const inputRef = useRef(null);

  // re-sync if the id changes
  useEffect(() => {
    setSrc(readStored(id));
  }, [id]);

  const borderRadius =
    shape === "circle"
      ? "50%"
      : shape === "pill"
      ? "999px"
      : shape === "rect"
      ? 0
      : radius;

  const onPick = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result);
      setSrc(data);
      try {
        localStorage.setItem(KEY(id), data);
      } catch {
        /* almacenamiento lleno o no disponible: la imagen sigue en memoria */
      }
    };
    reader.readAsDataURL(file);
    // permite volver a elegir el mismo archivo
    e.target.value = "";
  };

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current && inputRef.current.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          inputRef.current && inputRef.current.click();
        }
      }}
      className={"overflow-hidden cursor-pointer " + className}
      style={{ borderRadius, ...style }}
      aria-label="Cambiar imagen"
    >
      {src && (
        <img
          src={src}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: fit, display: "block" }}
        />
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={onPick}
        style={{ display: "none" }}
      />
    </div>
  );
}
