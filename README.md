# Huella

App de descubrimiento de experiencias y lugares (React + Vite), con soporte
**PWA** (instalable en el móvil y con funcionamiento sin conexión). Migrada
desde un prototipo de Claude Design a un proyecto React modular, listo para
abrir y editar en Visual Studio Code.

## Requisitos

- [Node.js](https://nodejs.org/) 18 o superior (incluye `npm`).

## Cómo abrir y ejecutar (Visual Studio Code)

1. Abre la carpeta del proyecto en VS Code: **Archivo → Abrir carpeta…** y elige `huella`.
2. Abre una terminal integrada: **Terminal → Nueva terminal**.
3. Instala las dependencias (solo la primera vez):
   ```bash
   npm install
   ```
4. Arranca el servidor de desarrollo:
   ```bash
   npm run dev
   ```
5. Abre en el navegador la dirección que aparece en la terminal
   (normalmente `http://localhost:5173`).

Cualquier cambio que guardes en el código se recarga al instante en el navegador.

## Scripts disponibles

| Comando           | Qué hace                                                        |
| ----------------- | -------------------------------------------------------------- |
| `npm run dev`     | Servidor de desarrollo con recarga en caliente.                |
| `npm run build`   | Genera la versión de producción optimizada en `dist/`.         |
| `npm run preview` | Sirve localmente la versión ya compilada (para probar la PWA). |

## Probar la PWA (instalación / offline)

El service worker solo se activa en la versión compilada:

```bash
npm run build
npm run preview
```

Abre la URL del preview; en navegadores compatibles (Chrome, Edge, Safari
móvil) verás la opción de **Instalar app** / **Añadir a pantalla de inicio**.

## Estructura del proyecto

```
huella/
├─ index.html              · punto de entrada HTML
├─ vite.config.js          · configuración de Vite + PWA
├─ tailwind.config.js      · tema de Tailwind (colores, radios, sombras)
├─ postcss.config.js
├─ public/
│  ├─ favicon.svg
│  └─ icons/               · iconos de la PWA (192/512/maskable/apple)
└─ src/
   ├─ main.jsx             · arranque de React
   ├─ App.jsx              · raíz de la app (navegación, estado, persistencia)
   ├─ index.css            · tokens de diseño + utilidades
   ├─ data/
   │  ├─ huella.js         · datos (experiencias, tours, perfil, ubicaciones…)
   │  └─ scenes.js         · imágenes de cada categoría
   ├─ assets/              · logos e imágenes de escenas
   └─ components/          · cada pantalla y pieza de UI
      ├─ Icon.jsx          · iconos (lucide-react)
      ├─ PhotoSlot.jsx     · subir foto (avatar / portada) con persistencia
      ├─ Shared.jsx        · barra de estado, navegación, chips, etc.
      ├─ Cards.jsx         · tarjetas de experiencia
      ├─ Onboarding.jsx    · alta inicial (5 pasos)
      ├─ Home.jsx          · pantalla Explorar
      ├─ Tours.jsx         · pantalla Tours
      ├─ Saved.jsx         · pantalla Guardados
      ├─ Profile.jsx       · perfil, mapa de huellas y sellos
      ├─ Settings.jsx      · ajustes del perfil
      ├─ Location.jsx      · selector de ubicación
      ├─ Detail.jsx        · ficha de una experiencia
      └─ Actions.jsx       · hojas "Cómo llegar" y "Compartir"
```

## Notas

- El estado del usuario (onboarding completado, pestaña activa, guardados,
  preferencias, ubicación) y las fotos que subas se guardan en el navegador
  mediante `localStorage`, así que persisten entre recargas.
- Para empezar de cero, borra el almacenamiento local del sitio desde las
  herramientas de desarrollo del navegador.
- Los datos (`src/data/huella.js`) son de ejemplo; puedes editarlos libremente.
