/* HUELLA — catálogo de sellos (gamificación)
   Cada sello se desbloquea al marcar lugares como VISITADOS.

   Formato de condición (campo `condicion`):
   · { regla: "cantidad", meta: N }
       → el usuario tiene N o más visitados en total
   · { regla: "categoria", categoria: "X", meta: N }
       → tiene N o más visitados de la categoría X
       (usa las claves exactas del campo `cat` en la app: naturaleza, gastronomia, etc.)
   · { regla: "categorias_distintas", meta: N }
       → tiene visitados en al menos N categorías diferentes

   El campo `tipo` es el valor que se guarda en Supabase (columna sello_tipo). */

export const SELLOS = [
  {
    tipo:        "primera_huella",
    nombre:      "Primera Huella",
    descripcion: "El mundo empieza cuando das el primer paso.",
    icono:       "footprints",
    condicion:   { regla: "cantidad", meta: 1 },
  },
  {
    tipo:        "descubridor_urbano",
    nombre:      "Descubridor Urbano",
    descripcion: "Cinco rincones después, la ciudad ya es tuya.",
    icono:       "compass",
    condicion:   { regla: "cantidad", meta: 5 },
  },
  {
    tipo:        "caminante",
    nombre:      "Caminante",
    descripcion: "Diez experiencias que ya viven en tu memoria.",
    icono:       "route",
    condicion:   { regla: "cantidad", meta: 10 },
  },
  {
    tipo:        "explorador_local",
    nombre:      "Explorador Local",
    descripcion: "Curiosidad sin fronteras: lo probaste todo.",
    icono:       "map",
    condicion:   { regla: "categorias_distintas", meta: 4 },
  },
  {
    tipo:        "buscador_horizontes",
    nombre:      "Buscador de Horizontes",
    descripcion: "Tu mirada siempre busca el horizonte más lejano.",
    icono:       "mountain",
    // "miradores" es la clave exacta usada en el campo `cat` de los lugares
    condicion:   { regla: "categoria", categoria: "miradores", meta: 3 },
  },
  {
    tipo:        "alma_de_cafe",
    nombre:      "Alma de Café",
    descripcion: "El ritmo lento y el café perfecto son tus aliados.",
    icono:       "cup",
    // "cafes" es la clave exacta usada en el campo `cat`
    condicion:   { regla: "categoria", categoria: "cafes", meta: 3 },
  },
  {
    tipo:        "camino_silencio",
    nombre:      "Camino en Silencio",
    descripcion: "Encuentras paz donde los árboles aún hablan.",
    icono:       "trees",
    // "naturaleza" es la clave exacta usada en el campo `cat`
    condicion:   { regla: "categoria", categoria: "naturaleza", meta: 3 },
  },
  {
    tipo:        "sed_de_cultura",
    nombre:      "Sed de Cultura",
    descripcion: "La historia y el arte te llaman por tu nombre.",
    icono:       "building",
    // "cultura" es la clave exacta usada en el campo `cat`
    condicion:   { regla: "categoria", categoria: "cultura", meta: 3 },
  },
  {
    tipo:        "sibarita",
    nombre:      "Sibarita",
    descripcion: "Cada bocado es una historia que vale la pena contar.",
    icono:       "utensils",
    // "gastronomia" es la clave exacta usada en el campo `cat` (sin tilde)
    condicion:   { regla: "categoria", categoria: "gastronomia", meta: 3 },
  },
  {
    tipo:        "cazador_atardeceres",
    nombre:      "Cazador de Atardeceres",
    descripcion: "La adrenalina y la belleza del momento son tu combustible.",
    icono:       "flame",
    // "aventura" es la clave exacta usada en el campo `cat`
    condicion:   { regla: "categoria", categoria: "aventura", meta: 2 },
  },
];

/* Acceso rápido por tipo: SELLOS_MAP["primera_huella"] → objeto del sello */
export const SELLOS_MAP = Object.fromEntries(SELLOS.map((s) => [s.tipo, s]));
