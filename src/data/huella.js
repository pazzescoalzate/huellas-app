/* HUELLA — modelo de datos (módulo ES) */

export const CAT = {
  naturaleza: { label: "Naturaleza", grad: "var(--g-naturaleza)" },
  senderismo: { label: "Senderismo", grad: "var(--g-senderismo)" },
  gastronomia: { label: "Gastronomía", grad: "var(--g-gastronomia)" },
  fotografia: { label: "Fotografía", grad: "var(--g-fotografia)" },
  cultura: { label: "Cultura", grad: "var(--g-cultura)" },
  urbano: { label: "Urbano", grad: "var(--g-urbano)" },
  miradores: { label: "Miradores", grad: "var(--g-miradores)" },
  cafes: { label: "Cafés", grad: "var(--g-cafes)" },
  bienestar: { label: "Bienestar", grad: "var(--g-bienestar)" },
  aventura: { label: "Aventura", grad: "var(--g-aventura)" },
};

// each experience
export const EXP = [
  {
    id: "laguna-niebla", title: "Laguna de la Niebla", place: "Sierra de Guara",
    cat: "naturaleza", dist: "12 km", time: "Medio día", level: "Moderado", match: 94, rating: 4.92, tagline: "Acceso libre",
    blurb: "Una laguna alpina que aparece entre la bruma justo al amanecer.",
    insight: "Las mañanas suelen ofrecer la mejor experiencia.",
    modules: { Altitud: "1.840 m", Desnivel: "+420 m", Terreno: "Sendero pedregoso", Cobertura: "Parcial", Clima: "12° · despejado" },
  },
  {
    id: "mirador-vencejos", title: "Mirador de los Vencejos", place: "Casco antiguo",
    cat: "miradores", dist: "1,4 km", time: "Menos de 2 h", level: "Relajado", match: 91, rating: 4.88, tagline: "Entrada libre",
    blurb: "El balcón de piedra donde la ciudad se vuelve dorada al caer la tarde.",
    insight: "El atardecer ofrece las mejores vistas.",
    modules: { "Golden hour": "20:14", Orientación: "Oeste", "Mejor punto": "Esquina norte" },
  },
  {
    id: "mesa-abuela", title: "La Mesa de la Abuela", place: "Barrio del Río",
    cat: "gastronomia", dist: "2,1 km", time: "Menos de 2 h", level: "Relajado", match: 88, rating: 4.79, tagline: "Desde 18 €",
    blurb: "Cocina de leña y recetas que no han cambiado en tres generaciones.",
    insight: "Los locales recomiendan visitarlo entre semana.",
    modules: { Precio: "18–24 €", Cocina: "De temporada", Espera: "~15 min", Horario: "13:30–15:30" },
  },
  {
    id: "claustro-silencio", title: "Claustro del Silencio", place: "Monasterio Viejo",
    cat: "cultura", dist: "3,0 km", time: "Menos de 2 h", level: "Relajado", match: 86, rating: 4.95, tagline: "Entrada 4 €",
    blurb: "Siglos de cantería y luz filtrada entre arcos de piedra caliza.",
    insight: "Una visita corta puede revelar siglos de historia.",
    modules: { Contexto: "S. XII", Duración: "45 min", Curiosidad: "Eco de 6 segundos" },
  },
  {
    id: "ruta-tejados", title: "Ruta de los Tejados", place: "Centro histórico",
    cat: "urbano", dist: "0,8 km", time: "Menos de 2 h", level: "Relajado", match: 84, rating: 4.71, tagline: "Ruta libre",
    blurb: "Callejones, patios escondidos y cafés que solo conocen los de aquí.",
    insight: "Muchos visitantes combinan esta ruta con cafés cercanos.",
    modules: { Seguridad: "Alta", Horario: "Mañana", Cercanos: "4 cafés", Tiempo: "1,5 h" },
  },
  {
    id: "bosque-helechos", title: "Bosque de Helechos", place: "Valle del Norte",
    cat: "senderismo", dist: "26 km", time: "Día completo", level: "Activo", match: 90, rating: 4.86, tagline: "Acceso libre",
    blurb: "Un sendero húmedo y verde que respira como un pulmón antiguo.",
    insight: "Lleva calzado impermeable: el musgo guarda el rocío hasta el mediodía.",
    modules: { Altitud: "640 m", Desnivel: "+710 m", Terreno: "Raíces y barro", Cobertura: "Nula", Clima: "16° · húmedo" },
  },
  {
    id: "cafe-litografia", title: "Café Litografía", place: "Plaza de las Letras",
    cat: "cafes", dist: "1,1 km", time: "Menos de 2 h", level: "Relajado", match: 82, rating: 4.67, tagline: "Desde 3 €",
    blurb: "Tueste propio, mesas de mármol y una luz perfecta para no hacer nada.",
    insight: "A media mañana entra una luz que enamora.",
    modules: { Precio: "3–6 €", Especialidad: "Filtrado", Wifi: "Sí", Horario: "8:00–20:00" },
  },
  {
    id: "cala-secreta", title: "Cala de los Erizos", place: "Costa Brava sur",
    cat: "aventura", dist: "48 km", time: "Fin de semana", level: "Activo", match: 79, rating: 4.63, tagline: "Acceso libre",
    blurb: "Bajada por roca hasta una cala donde el agua es de otro planeta.",
    insight: "El acceso es exigente; ve con marea baja.",
    modules: { Terreno: "Roca", Acceso: "Cuerda fija", Agua: "21°", Clima: "24° · sol" },
  },
  {
    id: "termas-piedra", title: "Termas de la Piedra", place: "Garganta del Oso",
    cat: "bienestar", dist: "33 km", time: "Día completo", level: "Moderado", match: 87, rating: 4.90, tagline: "Acceso libre",
    blurb: "Pozas naturales de agua tibia escondidas tras una cortina de vapor.",
    insight: "El mejor momento es justo antes del anochecer.",
    modules: { Temperatura: "36°", Profundidad: "1,2 m", Acceso: "Sendero 20 min" },
  },
  {
    id: "faro-viento", title: "Faro del Viento", place: "Cabo Norte",
    cat: "fotografia", dist: "54 km", time: "Fin de semana", level: "Moderado", match: 85, rating: 4.84, tagline: "Entrada libre",
    blurb: "Un faro solitario sobre acantilados donde el cielo se incendia.",
    insight: "El atardecer ofrece las mejores vistas.",
    modules: { "Golden hour": "20:31", Orientación: "Noroeste", "Mejor punto": "Base del faro" },
  },
];

// onboarding option sets
export const ONB = {
  intereses: ["Naturaleza", "Senderismo", "Cultura", "Gastronomía", "Fotografía", "Historia", "Urbano", "Miradores", "Cafés", "Bicicleta", "Aventura", "Bienestar"],
  compania: [
    { k: "Solo", d: "A tu ritmo, en silencio" },
    { k: "Con amigos", d: "Planes para compartir" },
    { k: "Con pareja", d: "Momentos para dos" },
    { k: "En familia", d: "Para todas las edades" },
    { k: "Con guía local", d: "Mirada de quien conoce" },
  ],
  actividad: [
    { k: "Relajado", d: "Sin prisa, disfrutar" },
    { k: "Moderado", d: "Algo de movimiento" },
    { k: "Activo", d: "Aventura y esfuerzo" },
  ],
};

// home section composition (ids reference EXP)
export const SECTIONS = [
  { id: "cerca", title: "Cerca de ti hoy", sub: "Pensadas para tu tarde", ids: ["mirador-vencejos", "cafe-litografia", "ruta-tejados"] },
  { id: "gustar", title: "Porque te puede gustar", sub: "Por tu forma de explorar", ids: ["laguna-niebla", "bosque-helechos", "termas-piedra"] },
  { id: "huella", title: "Lugares que están dejando huella", sub: "Lo que otros sintieron esta semana", ids: ["claustro-silencio", "mesa-abuela", "faro-viento"] },
  { id: "escapada", title: "Escapadas para este finde", sub: "A una hora o menos", ids: ["cala-secreta", "faro-viento", "termas-piedra"] },
];

// guided tours — led by local guides
export const TOURS = [
  {
    id: "amanecer-laguna", title: "Amanecer en la Laguna de la Niebla", cat: "naturaleza",
    guide: "Marta Eslava", guideRole: "Guía de montaña · 9 años", initials: "ME",
    rating: 4.97, reviews: 142, duration: "5 h", group: "Máx. 8", price: 38, level: "Moderado",
    tag: "Más reservado", time: "Salida 6:00",
    summary: "Subimos en la oscuridad para ver romper el día sobre la laguna. Café de altura incluido.",
  },
  {
    id: "sabores-rio", title: "Sabores del Barrio del Río", cat: "gastronomia",
    guide: "Quim Bertrán", guideRole: "Cocinero local · 12 años", initials: "QB",
    rating: 4.91, reviews: 208, duration: "3 h", group: "Máx. 10", price: 45, level: "Relajado",
    tag: "Favorito local", time: "13:00",
    summary: "Cuatro paradas, tres generaciones de recetas y una sobremesa que no querrás terminar.",
  },
  {
    id: "piedra-historia", title: "Piedra y Silencio: el casco antiguo", cat: "cultura",
    guide: "Inés Carrasco", guideRole: "Historiadora · 7 años", initials: "IC",
    rating: 4.95, reviews: 96, duration: "2,5 h", group: "Máx. 12", price: 22, level: "Relajado",
    tag: null, time: "11:00 · 18:00",
    summary: "Del claustro del s. XII a los patios escondidos que solo conocen los de aquí.",
  },
  {
    id: "luz-faro", title: "La luz del Faro del Viento", cat: "fotografia",
    guide: "Dani Olmo", guideRole: "Fotógrafo de paisaje", initials: "DO",
    rating: 4.89, reviews: 73, duration: "4 h", group: "Máx. 6", price: 52, level: "Moderado",
    tag: "Grupos pequeños", time: "Salida 18:30",
    summary: "Llegamos a la hora dorada con tu cámara y volvemos con el cielo en llamas.",
  },
  {
    id: "termas-ocaso", title: "Termas de la Piedra al ocaso", cat: "bienestar",
    guide: "Lara Vidal", guideRole: "Guía de bienestar", initials: "LV",
    rating: 4.93, reviews: 118, duration: "Día completo", group: "Máx. 8", price: 60, level: "Moderado",
    tag: null, time: "Salida 15:00",
    summary: "Sendero entre vapor hasta pozas tibias. Picnic de temporada y baño al anochecer.",
  },
];

// profile — el mapa de huellas
export const PROFILE = {
  name: "Mara Soler", handle: "@marasoler", since: "2024", initials: "MS",
  stats: { lugares: 47, ciudades: 9, tours: 6, reviews: 23 },
  visited: ["mirador-vencejos", "cafe-litografia", "claustro-silencio", "ruta-tejados", "mesa-abuela"],
  badges: [
    { id: "pionero", icon: "footprints", label: "Pionero", desc: "Primera huella dejada", got: true, shape: "hex", tone: "terracota", date: "noviembre de 2025" },
    { id: "madrugador", icon: "sun", label: "Madrugador", desc: "5 amaneceres", got: true, shape: "hex", tone: "terracota", date: "marzo de 2026" },
    { id: "sibarita", icon: "utensils", label: "Sibarita", desc: "10 sabores locales", got: true, shape: "plaque", tone: "azul", date: "enero de 2026" },
    { id: "senderista", icon: "mountain", label: "Senderista", desc: "100 km recorridos", got: true, shape: "seal", tone: "salvia", date: "mayo de 2026" },
    { id: "memoria", icon: "building", label: "Memoria viva", desc: "8 visitas culturales", got: true, shape: "shield", tone: "arena", date: "abril de 2026" },
    { id: "cafetero", icon: "cup", label: "Cafetero", desc: "12 cafés descubiertos", got: true, shape: "plaque", tone: "arena", date: "febrero de 2026" },
    { id: "fotografo", icon: "camera", label: "Ojo de luz", desc: "30 fotos compartidas", got: true, shape: "seal", tone: "azul", date: "mayo de 2026" },
    { id: "resenador", icon: "star", label: "Voz local", desc: "20 reseñas escritas", got: true, shape: "shield", tone: "salvia", date: "marzo de 2026" },
    { id: "trotamundos", icon: "compass", label: "Trotamundos", desc: "5 ciudades exploradas", got: true, shape: "hex", tone: "azul", date: "diciembre de 2025" },
    { id: "nocturno", icon: "moon", label: "Cazador de estrellas", desc: "5 noches despejadas", got: false, shape: "seal", tone: "terracota" },
    { id: "mareas", icon: "waves", label: "Hijo de la marea", desc: "3 calas remotas", got: false, shape: "hex", tone: "azul" },
    { id: "campista", icon: "tent", label: "Bajo las estrellas", desc: "3 noches de acampada", got: false, shape: "plaque", tone: "salvia" },
    { id: "ciclista", icon: "bike", label: "Rueda libre", desc: "50 km en bici", got: false, shape: "seal", tone: "arena" },
    { id: "tribu", icon: "users", label: "En tribu", desc: "5 tours en grupo", got: false, shape: "shield", tone: "terracota" },
    { id: "coleccionista", icon: "heart", label: "Coleccionista", desc: "30 lugares guardados", got: false, shape: "hex", tone: "arena" },
    { id: "gema", icon: "gem", label: "Gema oculta", desc: "5 lugares secretos", got: false, shape: "plaque", tone: "terracota" },
    { id: "racha", icon: "flame", label: "Racha viva", desc: "7 días seguidos explorando", got: false, shape: "seal", tone: "salvia" },
    { id: "invernal", icon: "snowflake", label: "Explorador invernal", desc: "5 huellas en invierno", got: false, shape: "shield", tone: "azul" },
    { id: "bosque", icon: "trees", label: "Guardabosques", desc: "10 rutas de bosque", got: false, shape: "hex", tone: "salvia" },
    { id: "leyenda", icon: "crown", label: "Leyenda local", desc: "Top del mes en tu ciudad", got: false, shape: "plaque", tone: "arena" },
  ],
};

// ubicaciones — para el selector tipo Rappi
export const LOCATIONS = [
  { id: "actual", name: "Valle de Tena", region: "Tu ubicación actual", cat: "naturaleza", current: true },
  { id: "madrid", name: "Madrid", region: "Comunidad de Madrid", cat: "urbano" },
  { id: "barcelona", name: "Barcelona", region: "Cataluña", cat: "cultura" },
  { id: "sansebastian", name: "San Sebastián", region: "País Vasco", cat: "gastronomia" },
  { id: "granada", name: "Granada", region: "Andalucía", cat: "miradores" },
  { id: "valencia", name: "Valencia", region: "Comunitat Valenciana", cat: "cafes" },
  { id: "picos", name: "Picos de Europa", region: "Asturias", cat: "senderismo" },
  { id: "sevilla", name: "Sevilla", region: "Andalucía", cat: "cultura" },
  { id: "costabrava", name: "Costa Brava", region: "Girona", cat: "aventura" },
];

export const byId = (id) => EXP.find((e) => e.id === id);
