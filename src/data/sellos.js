/* HUELLA — catálogo de sellos (gamificación)
   Cada sello se desbloquea al marcar lugares como VISITADOS.

   Campos por sello:
   · id          → clave única; también se guarda en Supabase (columna sello_tipo)
   · label       → nombre corto visible en la insignia del perfil
   · nombre      → nombre completo visible en la celebración
   · descripcion → frase emotiva que aparece en CelebracionSello (en cursiva)
   · desc        → descripción corta que aparece bajo la insignia en el perfil
   · icono       → nombre del ícono en Icon.jsx
   · shape       → forma de la insignia: hex | shield | plaque | seal
   · tone        → color base de la insignia: terracota | azul | salvia | arena
   · condicion   → regla de desbloqueo (ver formatos abajo)

   Formatos de condición:
   · { regla: "cantidad", meta: N }
       → el usuario tiene N o más visitados en total
   · { regla: "categoria", categoria: "X", meta: N }
       → tiene N o más visitados de la categoría X
       (usa las claves exactas del campo `cat` en la app: naturaleza, gastronomia, etc.)
   · { regla: "categorias_distintas", meta: N }
       → tiene visitados en al menos N categorías diferentes */

export const SELLOS = [
  {
    id:          "pionero",
    label:       "Primera Huella",
    nombre:      "Primera Huella",
    descripcion: "El mundo empieza cuando das el primer paso.",
    desc:        "Tu primer lugar visitado",
    icono:       "footprints",
    shape:       "hex",
    tone:        "terracota",
    condicion:   { regla: "cantidad", meta: 1 },
  },
  {
    id:          "descubridor",
    label:       "Descubridor Urbano",
    nombre:      "Descubridor Urbano",
    descripcion: "Cinco rincones después, la ciudad ya es tuya.",
    desc:        "Visita 5 lugares",
    icono:       "compass",
    shape:       "hex",
    tone:        "azul",
    condicion:   { regla: "cantidad", meta: 5 },
  },
  {
    id:          "caminante",
    label:       "Caminante",
    nombre:      "Caminante",
    descripcion: "Diez experiencias que ya viven en tu memoria.",
    desc:        "Visita 10 lugares",
    icono:       "mountain",
    shape:       "shield",
    tone:        "salvia",
    condicion:   { regla: "cantidad", meta: 10 },
  },
  {
    id:          "trotamundos",
    label:       "Explorador Local",
    nombre:      "Explorador Local",
    descripcion: "Curiosidad sin fronteras: lo probaste todo.",
    desc:        "Visita 4 categorías distintas",
    icono:       "building",
    shape:       "plaque",
    tone:        "azul",
    condicion:   { regla: "categorias_distintas", meta: 4 },
  },
  {
    id:          "horizontes",
    label:       "Buscador de Horizontes",
    nombre:      "Buscador de Horizontes",
    descripcion: "Tu mirada siempre busca el horizonte más lejano.",
    desc:        "Visita 3 miradores",
    icono:       "mountain",
    shape:       "hex",
    tone:        "terracota",
    // "miradores" es la clave exacta usada en el campo `cat` de los lugares
    condicion:   { regla: "categoria", categoria: "miradores", meta: 3 },
  },
  {
    id:          "cafetero",
    label:       "Alma de Café",
    nombre:      "Alma de Café",
    descripcion: "El ritmo lento y el café perfecto son tus aliados.",
    desc:        "Visita 3 cafés",
    icono:       "cup",
    shape:       "seal",
    tone:        "arena",
    // "cafes" es la clave exacta usada en el campo `cat`
    condicion:   { regla: "categoria", categoria: "cafes", meta: 3 },
  },
  {
    id:          "bosque",
    label:       "Camino en Silencio",
    nombre:      "Camino en Silencio",
    descripcion: "Encuentras paz donde los árboles aún hablan.",
    desc:        "Visita 3 lugares de naturaleza",
    icono:       "trees",
    shape:       "seal",
    tone:        "salvia",
    // "naturaleza" es la clave exacta usada en el campo `cat`
    condicion:   { regla: "categoria", categoria: "naturaleza", meta: 3 },
  },
  {
    id:          "cultura",
    label:       "Sed de Cultura",
    nombre:      "Sed de Cultura",
    descripcion: "La historia y el arte te llaman por tu nombre.",
    desc:        "Visita 3 lugares de cultura",
    icono:       "building",
    shape:       "shield",
    tone:        "arena",
    // "cultura" es la clave exacta usada en el campo `cat`
    condicion:   { regla: "categoria", categoria: "cultura", meta: 3 },
  },
  {
    id:          "sibarita",
    label:       "Sibarita",
    nombre:      "Sibarita",
    descripcion: "Cada bocado es una historia que vale la pena contar.",
    desc:        "Visita 3 lugares de gastronomía",
    icono:       "utensils",
    shape:       "plaque",
    tone:        "azul",
    // "gastronomia" es la clave exacta usada en el campo `cat` (sin tilde)
    condicion:   { regla: "categoria", categoria: "gastronomia", meta: 3 },
  },
  {
    id:          "atardeceres",
    label:       "Cazador de Atardeceres",
    nombre:      "Cazador de Atardeceres",
    descripcion: "La adrenalina y la belleza del momento son tu combustible.",
    desc:        "Visita 2 lugares de aventura",
    icono:       "sun",
    shape:       "hex",
    tone:        "arena",
    // "aventura" es la clave exacta usada en el campo `cat`
    condicion:   { regla: "categoria", categoria: "aventura", meta: 2 },
  },
];

/* Acceso rápido por id: SELLOS_MAP["pionero"] → objeto del sello */
export const SELLOS_MAP = Object.fromEntries(SELLOS.map((s) => [s.id, s]));
