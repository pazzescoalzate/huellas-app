/* HUELLA — servicio de datos reales desde OpenStreetMap
   Sin API key. Fuentes:
     · Nominatim  → geocodifica la ciudad en lat/lon
     · Overpass   → busca lugares por categoría en un radio de 8 km

   Resiliencia ante fallos del servidor público de Overpass:
     1. Failover entre mirrors  — si uno falla, prueba el siguiente
     2. Reintentos con backoff  — ante 429/502, espera y reintenta
     3. Timeout de cliente      — aborta si un mirror tarda más de 25 s
     4. Caché en memoria        — evita repetir llamadas durante la sesión
     5. Throttle entre llamadas — no más de una petición cada 400 ms
*/

// ── Caché en memoria: evita llamadas repetidas a OSM ──────────────────────
const cache = new Map();

// ══════════════════════════════════════════════════════════════════════════════
//  CONFIGURACIÓN DE OVERPASS
// ══════════════════════════════════════════════════════════════════════════════

// Mirrors públicos de Overpass ordenados por preferencia.
// Si el primero falla (502, CORS, timeout), se prueba el siguiente.
const MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

// Tiempo máximo de espera por petición antes de abortarla (ms)
const TIMEOUT_MS = 25_000;

// Esperas entre reintentos al mismo mirror: [1.er reintento, 2.º reintento]
const BACKOFF_MS = [1_000, 2_000];

// Pausa mínima entre llamadas consecutivas a Overpass (ms)
// Evita que peticiones en ráfaga disparen el límite de tasa (429)
const THROTTLE_MS = 400;

// Momento de la última petición exitosa o fallida a Overpass
let ultimaLlamada = 0;

// Pausa simple: devuelve una Promise que se resuelve tras `ms` milisegundos
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/* ============================================================================
   fetchOverpass(query) → objeto JSON de Overpass

   Encapsula toda la lógica de resiliencia:
     · Prueba cada mirror en orden
     · Ante 429 (tasa) o error de red → reintenta con espera creciente
     · Ante 502/503/504 (mirror caído) → salta al siguiente mirror
     · Si pasan más de TIMEOUT_MS → aborta y prueba el siguiente
     · Si todos fallan → lanza un error con mensaje legible para el usuario
   ============================================================================ */
async function fetchOverpass(query) {
  // Respetar el throttle: si la última llamada fue hace menos de THROTTLE_MS, esperamos
  const ahora = Date.now();
  const tiempoDesdeUltima = ahora - ultimaLlamada;
  if (tiempoDesdeUltima < THROTTLE_MS) {
    await sleep(THROTTLE_MS - tiempoDesdeUltima);
  }
  ultimaLlamada = Date.now();

  let ultimoError = null;

  // Iteramos sobre cada mirror
  for (const mirror of MIRRORS) {
    // Dentro de cada mirror, hasta 3 intentos (inmediato + 2 reintentos)
    for (let intento = 0; intento < 3; intento++) {
      // Antes del 2.º y 3.er intento esperamos (backoff)
      if (intento > 0) {
        const espera = BACKOFF_MS[intento - 1] ?? 2_000;
        console.warn(
          `[huella] Overpass: esperando ${espera / 1000} s antes del intento ${intento + 1} en ${mirror}`
        );
        await sleep(espera);
        ultimaLlamada = Date.now(); // actualizamos para no sumar espera extra al throttle
      }

      // AbortController permite cancelar la petición si el mirror no responde
      const ctrl  = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);

      try {
        const res = await fetch(mirror, {
          method:  "POST",
          body:    query,
          headers: { "Content-Type": "text/plain" },
          signal:  ctrl.signal,
        });
        clearTimeout(timer);

        if (res.ok) {
          // ¡Éxito! Devolvemos el JSON parseado
          return await res.json();
        }

        if (res.status === 429) {
          // El servidor nos pide que esperemos: reintentamos el mismo mirror
          console.warn(`[huella] Overpass ${mirror}: 429 Too Many Requests → reintentando`);
          ultimoError = new Error(
            "OpenStreetMap recibe demasiadas solicitudes ahora mismo. Intenta de nuevo en unos segundos."
          );
          continue; // siguiente intento (con backoff)
        }

        if ([502, 503, 504].includes(res.status)) {
          // Mirror caído o sobrecargado: pasamos al siguiente mirror directamente
          console.warn(`[huella] Overpass ${mirror}: ${res.status} → probando siguiente mirror`);
          ultimoError = new Error(`Servidor de OpenStreetMap no disponible (${res.status})`);
          break; // salimos del bucle de intentos de este mirror
        }

        // Cualquier otro código HTTP inesperado: también saltamos al siguiente mirror
        console.warn(`[huella] Overpass ${mirror}: HTTP ${res.status}`);
        ultimoError = new Error(`Overpass devolvió ${res.status}`);
        break;

      } catch (err) {
        clearTimeout(timer);

        if (err.name === "AbortError") {
          // La petición tardó más de TIMEOUT_MS: el mirror está demasiado lento
          console.warn(`[huella] Overpass ${mirror}: timeout (>${TIMEOUT_MS / 1000} s)`);
          ultimoError = new Error(
            "La petición a OpenStreetMap tardó demasiado. Prueba con otra ciudad o espera un momento."
          );
          break; // no tiene sentido reintentar un mirror que ya tardó tanto
        }

        // Error de red o CORS: el mirror no es accesible desde este navegador
        console.warn(`[huella] Overpass ${mirror}: error de red →`, err.message);
        ultimoError = new Error(
          "No pudimos cargar experiencias ahora. Revisa tu conexión e intenta de nuevo."
        );
        break; // saltamos al siguiente mirror
      }
    } // fin bucle de intentos
  } // fin bucle de mirrors

  // Todos los mirrors y reintentos fallaron
  throw ultimoError ?? new Error("No pudimos cargar experiencias ahora. Intenta de nuevo en un momento.");
}

// ══════════════════════════════════════════════════════════════════════════════
//  FUNCIONES DE UTILIDAD (sin cambios respecto a la versión anterior)
// ══════════════════════════════════════════════════════════════════════════════

// Fórmula de Haversine: distancia real en km entre dos coordenadas GPS
// Sigue siendo necesaria para ordenar los resultados de más cercanos a más lejanos
// y para el cálculo de zona cuando no hay etiqueta de barrio en OSM.
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// Ángulo (en grados, 0 = Norte, 90 = Este, 180 = Sur, 270 = Oeste) desde el
// centro de la ciudad hasta el lugar. Sirve para el fallback de zona cardinal.
function calcularBearing(lat1, lon1, lat2, lon2) {
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const rlat1 = (lat1 * Math.PI) / 180;
  const rlat2 = (lat2 * Math.PI) / 180;
  const y = Math.sin(dLon) * Math.cos(rlat2);
  const x = Math.cos(rlat1) * Math.sin(rlat2) - Math.sin(rlat1) * Math.cos(rlat2) * Math.cos(dLon);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

// Devuelve el nombre de la dirección cardinal en español
// Usamos "oriente/occidente" porque la app está pensada para Latinoamérica
function dirCardinal(bearing) {
  if (bearing >= 315 || bearing < 45)  return "norte";
  if (bearing >= 45  && bearing < 135) return "oriente";
  if (bearing >= 135 && bearing < 225) return "sur";
  return "occidente";
}

// Zona calculada como fallback cuando OSM no trae etiqueta de barrio.
// Umbrales elegidos para ser razonables en ciudades medianas (tipo Pereira o Manizales).
// Para ciudades muy grandes (Bogotá, Buenos Aires) el umbral de "Centro" puede quedar
// pequeño; para pueblos pequeños "Afueras" puede sonar exagerado. Es una aproximación.
//   < 1 km del centro → "Centro"
//   1–4 km            → "Zona norte/sur/oriente/occidente"
//   4–8 km            → "Afueras norte/sur/oriente/occidente"
function zonaDescrita(distKm, bearing) {
  if (distKm < 1.0)  return "Centro";
  const dir = dirCardinal(bearing);
  if (distKm < 4.0)  return `Zona ${dir}`;
  return `Afueras ${dir}`;
}

// Determina la zona de referencia del lugar. Prioridad:
//   1. addr:neighbourhood  → barrio específico (ej: "Chapinero", "Usaquén")
//   2. addr:suburb         → colonia o barrio más amplio
//   3. addr:quarter        → sector o cuartel
//   4. addr:district       → distrito
//   5. is_in:suburb        → etiqueta legacy de OSM, menos frecuente
//   6. Zona calculada      → fallback usando distancia y ángulo desde el centro
// Si ninguna opción está disponible, devuelve null para no mostrar nada.
function zonaDeReferencia(tags, distKm, latCiudad, lonCiudad, latLugar, lonLugar) {
  const osm =
    tags["addr:neighbourhood"] ||
    tags["addr:suburb"]        ||
    tags["addr:quarter"]       ||
    tags["addr:district"]      ||
    tags["is_in:suburb"]       ||
    null;
  if (osm) return osm;

  // Fallback: calcular zona desde el centro de la ciudad
  const bearing = calcularBearing(latCiudad, lonCiudad, latLugar, lonLugar);
  return zonaDescrita(distKm, bearing);
}

// Nivel de actividad según la categoría del lugar.
// Antes se derivaba de la distancia al centro (lo cual no tiene sentido semántico:
// un parque lejano no es más "activo" que uno cercano). Ahora refleja la naturaleza
// de la actividad: aventura/naturaleza requieren más esfuerzo que un café o mirador.
const NIVEL_CAT = {
  aventura:    "Activo",
  naturaleza:  "Activo",
  senderismo:  "Activo",    // cat de datos mock, no mapeada a OSM pero puede aparecer
  cultura:     "Moderado",
  bienestar:   "Moderado",
  fotografia:  "Moderado",  // cat de datos mock
  gastronomia: "Relajado",
  miradores:   "Relajado",
  cafes:       "Relajado",
  urbano:      "Relajado",  // cat de datos mock
};
function nivelPorCategoria(cat) {
  return NIVEL_CAT[cat] || "Relajado";
}

// Categorías relacionadas entre sí (comparten perfil de usuario).
// Se usan para calcular una compatibilidad parcial cuando el lugar no coincide
// exactamente con ningún interés del usuario pero sí con algo cercano.
const CAT_RELACIONADAS = {
  naturaleza:  ["aventura", "senderismo"],
  aventura:    ["naturaleza", "senderismo"],
  senderismo:  ["naturaleza", "aventura"],
  cultura:     ["miradores", "fotografia"],
  miradores:   ["cultura", "fotografia"],
  fotografia:  ["miradores", "naturaleza"],
  gastronomia: ["cafes"],
  cafes:       ["gastronomia", "bienestar"],
  bienestar:   ["cafes"],
  urbano:      ["cultura", "cafes"],
};

// Calcula la compatibilidad real del lugar con los intereses del usuario.
//   • null           → usuario sin intereses (invitado o perfil vacío): no mostrar %
//   • 92             → coincidencia directa: la categoría del lugar está en sus intereses
//   • 74             → coincidencia relacionada fuerte (≥ 2 categorías relacionadas en sus intereses)
//   • 62             → coincidencia relacionada débil (1 categoría relacionada)
//   • 45             → sin relación con ningún interés del usuario
// Los valores son consecuencia del cálculo, no números inventados.
export function calcularMatch(cat, intereses) {
  if (!intereses?.length) return null;

  // Convertir etiquetas de interés (del onboarding) a claves de categoría OSM
  const catsInteres = intereses.map((i) => INTERES_A_CAT[i]).filter(Boolean);
  if (!catsInteres.length) return null;

  // Coincidencia directa
  if (catsInteres.includes(cat)) return 92;

  // Coincidencia relacionada: contar cuántas categorías relacionadas tiene el usuario
  const relacionadas = CAT_RELACIONADAS[cat] || [];
  const coincRelacionadas = relacionadas.filter((r) => catsInteres.includes(r)).length;
  if (coincRelacionadas >= 2) return 74;
  if (coincRelacionadas === 1) return 62;

  // Sin relación
  return 45;
}

// Tiempo estimado de visita por categoría
const TIEMPO_CAT = {
  naturaleza:  "Medio día",
  cultura:     "Menos de 2 h",
  gastronomia: "Menos de 2 h",
  miradores:   "Menos de 2 h",
  cafes:       "Menos de 2 h",
  aventura:    "Día completo",
  bienestar:   "Día completo",
};

// Consejo genérico por categoría (placeholder mientras no haya reseñas OSM)
const INSIGHT_CAT = {
  naturaleza:  "El amanecer suele ofrecer la mejor experiencia.",
  cultura:     "Visita entre semana para evitar aglomeraciones.",
  gastronomia: "Los locales recomiendan reservar con antelación.",
  miradores:   "El atardecer ofrece las mejores vistas.",
  cafes:       "A media mañana la terraza está más tranquila.",
  aventura:    "Consulta el tiempo antes de salir.",
  bienestar:   "El mejor momento es a primera hora de la mañana.",
};

// Etiquetas OSM que corresponden a cada categoría de la app
const TAGS_OSM = {
  naturaleza:  [["leisure","park"], ["leisure","nature_reserve"], ["natural","peak"]],
  cultura:     [["tourism","museum"]],
  gastronomia: [["amenity","restaurant"]],
  miradores:   [["tourism","viewpoint"]],
  cafes:       [["amenity","cafe"]],
  aventura:    [["tourism","attraction"]],
  bienestar:   [["leisure","spa"], ["amenity","spa"]],
};

// Mapeo de intereses del onboarding → clave de categoría OSM
const INTERES_A_CAT = {
  Naturaleza:  "naturaleza",
  Cultura:     "cultura",
  Gastronomía: "gastronomia",
  Miradores:   "miradores",
  Cafés:       "cafes",
  Aventura:    "aventura",
  Bienestar:   "bienestar",
};

// Tagline corto usando datos reales de OSM
function buildTagline(cat, tags) {
  if (tags.fee === "yes") return "Entrada de pago";
  if (tags.fee === "no")  return "Entrada libre";
  const defaults = {
    gastronomia: "Restaurante",
    cafes:       "Cafetería",
    bienestar:   "Spa · Bienestar",
    miradores:   "Mirador",
    cultura:     "Museo",
    naturaleza:  "Espacio natural",
    aventura:    "Atracción",
  };
  return defaults[cat] || "Visita libre";
}

// Módulos de detalle con datos reales de OSM (solo los que existen)
function construirModulos(tags) {
  const m = {};
  if (tags.opening_hours)  m["Horario"]   = tags.opening_hours;
  if (tags.cuisine)        m["Cocina"]    = tags.cuisine;
  if (tags["addr:street"]) m["Dirección"] = tags["addr:street"];
  if (tags.ele)            m["Altitud"]   = `${tags.ele} m`;
  if (tags.phone)          m["Teléfono"]  = tags.phone;
  if (tags.wheelchair)     m["Acceso"]    = tags.wheelchair === "yes" ? "Accesible" : "Consultar";
  return m;
}

// ══════════════════════════════════════════════════════════════════════════════
//  FUNCIONES PÚBLICAS EXPORTADAS
// ══════════════════════════════════════════════════════════════════════════════

/* ============================================================================
   geocodificarCiudad(ciudad) → { lat, lon }
   Convierte un nombre de ciudad en coordenadas usando Nominatim.
   Requiere un User-Agent identificativo; sin él puede rechazar la petición.
   ============================================================================ */
export async function geocodificarCiudad(ciudad) {
  const cacheKey = `geo:${ciudad}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  const url =
    `https://nominatim.openstreetmap.org/search` +
    `?q=${encodeURIComponent(ciudad)}&format=json&limit=1`;

  const res = await fetch(url, {
    headers: {
      // Nominatim exige un User-Agent que identifique la aplicación
      "User-Agent":      "huella-app/1.0 (exploracion-local)",
      "Accept-Language": "es",
    },
  });
  if (!res.ok) throw new Error(`Nominatim devolvió ${res.status}`);

  const datos = await res.json();
  if (!datos.length) throw new Error(`No se encontró "${ciudad}" en OpenStreetMap`);

  const coords = { lat: parseFloat(datos[0].lat), lon: parseFloat(datos[0].lon) };
  cache.set(cacheKey, coords);
  return coords;
}

/* ============================================================================
   buscarPorCategoria(categoria, ciudad) → Array<lugar>

   Forma normalizada de cada lugar (compatible con ExploreCard, CarouselCard...):
     { id, nombre, tipo, lat, lon, distanciaKm, web, imagen,
       title, place, cat, zona, time, level, match, rating, tagline, blurb,
       insight, modules }

   NOTA rating: OSM no tiene calificaciones. Siempre null (ExploreCard lo omite).
   NOTA match:  null aquí; se aplica desde fuera cuando hay intereses del usuario.
                Usa calcularMatch(cat, intereses) exportada desde este módulo.
   NOTA zona:   reemplaza el anterior campo "dist". Muestra barrio OSM o zona
                cardinal calculada. No dice "X km de ti" porque no es la distancia
                al usuario, sino al centro de la ciudad.

   Usa fetchOverpass() que aplica failover, backoff y timeout.
   ============================================================================ */
export async function buscarPorCategoria(categoria, ciudad) {
  const cacheKey = `cat:${categoria}:${ciudad}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  // 1. Obtener coordenadas de la ciudad
  const { lat, lon } = await geocodificarCiudad(ciudad);

  // 2. Construir la consulta Overpass con todas las etiquetas de la categoría
  const tagsDeCat = TAGS_OSM[categoria];
  if (!tagsDeCat) throw new Error(`Categoría desconocida: "${categoria}"`);

  const RADIO_M = 8000; // 8 km alrededor del centro de la ciudad
  const lineas = tagsDeCat.flatMap(([k, v]) => [
    `node["${k}"="${v}"](around:${RADIO_M},${lat},${lon});`,
    `way["${k}"="${v}"](around:${RADIO_M},${lat},${lon});`,
  ]);
  const query = [
    `[out:json][timeout:25];`,
    `(`,
    ...lineas,
    `);`,
    `out center 20;`, // "center" calcula el centroide de los ways, no solo nodos
  ].join("\n");

  // 3. Llamar a Overpass con failover, backoff y timeout
  //    Si todos los mirrors fallan, fetchOverpass lanza un Error con mensaje amigable
  const datos = await fetchOverpass(query);

  // 4. Normalizar: descartar elementos sin nombre ni coordenadas
  const lugares = datos.elements
    .filter((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      return el.tags?.name && elLat != null && elLon != null;
    })
    .map((el) => {
      const t      = el.tags;
      const elLat  = el.lat ?? el.center.lat; // nodes: lat/lon directos; ways: en .center
      const elLon  = el.lon ?? el.center.lon;
      const distKm = haversine(lat, lon, elLat, elLon);

      const normalizado = {
        id:          `osm-${el.type}-${el.id}`,
        nombre:      t.name,
        tipo:        categoria,
        lat:         elLat,
        lon:         elLon,
        distanciaKm: distKm,
        web:         t.website || t.url || null,
        imagen:      null, // OSM no provee fotos; CatSurface usa el gradiente de categoría
      };

      return {
        ...normalizado,
        title:   normalizado.nombre,
        place:   t["addr:city"] || t["addr:suburb"] || ciudad,
        cat:     categoria,
        // zona: barrio/sector real de OSM, o zona cardinal calculada como fallback.
        // Reemplaza el antiguo "dist" (que mostraba km desde el centro de la ciudad,
        // lo cual era engañoso porque no es la distancia al usuario).
        zona:    zonaDeReferencia(t, distKm, lat, lon, elLat, elLon),
        time:    TIEMPO_CAT[categoria] || "Menos de 2 h",
        // level: ahora refleja la naturaleza de la actividad, no la distancia
        level:   nivelPorCategoria(categoria),
        // match: null aquí; buscarParaTi y Home.jsx lo calculan con intereses reales
        match:   null,
        rating:  null, // no disponible en OSM
        tagline: buildTagline(categoria, t),
        blurb:   t.description || `${t.name}, en ${t["addr:city"] || ciudad}.`,
        insight: INSIGHT_CAT[categoria] || "Disfruta este lugar con tranquilidad.",
        modules: construirModulos(t),
      };
    })
    .sort((a, b) => a.distanciaKm - b.distanciaKm); // más cercanos primero

  cache.set(cacheKey, lugares);
  return lugares;
}

/* ============================================================================
   buscarParaTi(intereses, ciudad) → Array<lugar>

   Recibe los intereses del usuario, busca cada categoría y devuelve un feed
   variado intercalando resultados de todas las categorías.

   Las llamadas son secuenciales (no en paralelo) para no disparar el 429.
   fetchOverpass añade además un throttle interno entre peticiones.
   ============================================================================ */
export async function buscarParaTi(intereses, ciudad) {
  const cacheKey = `para-ti:${intereses.join(",")}:${ciudad}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  // Convertir intereses (texto del onboarding) a claves de categoría OSM
  const cats = intereses.map((i) => INTERES_A_CAT[i]).filter(Boolean);
  if (!cats.length) return [];

  // Buscar una categoría por vez — el throttle de fetchOverpass ya espacia las
  // peticiones, pero añadimos 100 ms extra de margen entre categorías
  const porCategoria = [];
  for (let i = 0; i < cats.length; i++) {
    if (i > 0) await sleep(100);
    try {
      const lugares = await buscarPorCategoria(cats[i], ciudad);
      porCategoria.push(lugares.slice(0, 5)); // máximo 5 por categoría
    } catch (err) {
      // Si una categoría concreta falla, continuamos con las demás
      // (así el feed muestra algo en vez de quedarse completamente vacío)
      console.warn(`[huella] No se cargó "${cats[i]}" en "${ciudad}":`, err.message);
    }
  }

  if (!porCategoria.length) return [];

  // Intercalar arrays: [cat0[0], cat1[0], cat2[0], cat0[1], cat1[1], ...]
  // Así el feed muestra variedad en lugar de agrupar todo por categoría
  const intercalado = [];
  const maxLen = Math.max(...porCategoria.map((a) => a.length));
  for (let i = 0; i < maxLen; i++) {
    for (const arr of porCategoria) {
      if (arr[i]) intercalado.push(arr[i]);
    }
  }

  // Aplicar compatibilidad real ahora que tenemos los intereses del usuario.
  // Cada lugar tiene su propia categoría, así que el % varía según qué tan
  // cerca está esa categoría de lo que le gusta al usuario.
  const resultado = intercalado.map((r) => ({
    ...r,
    match: calcularMatch(r.cat, intereses),
  }));

  cache.set(cacheKey, resultado);
  return resultado;
}
