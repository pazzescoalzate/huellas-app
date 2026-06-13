/* HUELLA — servicio de datos reales desde OpenStreetMap
   Sin API key. Fuentes:
     · Nominatim  → geocodifica la ciudad en lat/lon
     · Overpass   → busca lugares por categoría en un radio de 8 km
   Los resultados se cachean en memoria durante la sesión (se pierden al recargar).
*/

// ── Caché en memoria: evita llamadas repetidas a OSM ──────────────────────
const cache = new Map();

// ── Fórmula de Haversine: distancia real en km entre dos coordenadas ──────
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

// ── Formatea kilómetros como texto: 2.35 → "2,4 km" ──────────────────────
function fmtDist(km) {
  if (km < 0.5) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1).replace(".", ",")} km`;
}

// ── Nivel de actividad según distancia al centro ──────────────────────────
function nivelActividad(km) {
  if (km < 3) return "Relajado";
  if (km < 10) return "Moderado";
  return "Activo";
}

// ── Tiempo estimado de visita por categoría ───────────────────────────────
const TIEMPO_CAT = {
  naturaleza:  "Medio día",
  cultura:     "Menos de 2 h",
  gastronomia: "Menos de 2 h",
  miradores:   "Menos de 2 h",
  cafes:       "Menos de 2 h",
  aventura:    "Día completo",
  bienestar:   "Día completo",
};

// ── Consejo genérico por categoría (placeholder mientras no haya reviews OSM) ──
const INSIGHT_CAT = {
  naturaleza:  "El amanecer suele ofrecer la mejor experiencia.",
  cultura:     "Visita entre semana para evitar aglomeraciones.",
  gastronomia: "Los locales recomiendan reservar con antelación.",
  miradores:   "El atardecer ofrece las mejores vistas.",
  cafes:       "A media mañana la terraza está más tranquila.",
  aventura:    "Consulta el tiempo antes de salir.",
  bienestar:   "El mejor momento es a primera hora de la mañana.",
};

// ── Etiquetas OSM que corresponden a cada categoría de la app ─────────────
const TAGS_OSM = {
  naturaleza:  [["leisure","park"], ["leisure","nature_reserve"], ["natural","peak"]],
  cultura:     [["tourism","museum"]],
  gastronomia: [["amenity","restaurant"]],
  miradores:   [["tourism","viewpoint"]],
  cafes:       [["amenity","cafe"]],
  aventura:    [["tourism","attraction"]],
  bienestar:   [["leisure","spa"], ["amenity","spa"]],
};

// ── Mapeo de intereses del onboarding → clave de categoría ───────────────
const INTERES_A_CAT = {
  Naturaleza:  "naturaleza",
  Cultura:     "cultura",
  Gastronomía: "gastronomia",
  Miradores:   "miradores",
  Cafés:       "cafes",
  Aventura:    "aventura",
  Bienestar:   "bienestar",
};

// ── Tagline corto usando datos reales de OSM ──────────────────────────────
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

// ── Módulos de detalle con datos reales de OSM (solo los que existen) ────
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

/* ============================================================================
   geocodificarCiudad(ciudad) → { lat, lon }
   Convierte un nombre de ciudad en coordenadas usando la API de Nominatim.
   Nominatim requiere un User-Agent identificativo; sin él puede rechazar la
   petición.
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

   Forma normalizada interna de cada elemento OSM:
     { id, nombre, tipo, lat, lon, distanciaKm, web, imagen }

   La función devuelve esa forma extendida con todos los campos que usan
   las tarjetas (title, cat, dist, time…), para no necesitar conversión
   en los componentes.

   NOTA sobre rating: OSM no tiene calificaciones de usuarios.
   El campo rating se deja en null para no mostrar un número inventado.
   El componente ExploreCard debe manejar rating === null.

   NOTA sobre match: es un placeholder (80). No calculamos compatibilidad
   real todavía. TODO: cruzar con prefs.intereses del usuario.
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
    `out center 20;`, // "center" calcula el centroide de los ways (no solo nodos)
  ].join("\n");

  // 3. Llamar a Overpass API
  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: query,
    headers: { "Content-Type": "text/plain" },
  });
  if (!res.ok) throw new Error(`Overpass devolvió ${res.status}`);

  const datos = await res.json();

  // 4. Normalizar: descartar elementos sin nombre ni coordenadas
  const lugares = datos.elements
    .filter((el) => {
      const elLat = el.lat ?? el.center?.lat;
      const elLon = el.lon ?? el.center?.lon;
      return el.tags?.name && elLat != null && elLon != null;
    })
    .map((el) => {
      const t = el.tags;
      const elLat       = el.lat ?? el.center.lat; // nodes tienen lat/lon; ways tienen center
      const elLon       = el.lon ?? el.center.lon;
      const distanciaKm = haversine(lat, lon, elLat, elLon);

      // ── Forma normalizada interna ──
      const normalizado = {
        id:          `osm-${el.type}-${el.id}`,
        nombre:      t.name,
        tipo:        categoria,
        lat:         elLat,
        lon:         elLon,
        distanciaKm,
        web:         t.website || t.url || null,
        imagen:      null, // OSM no provee fotos; CatSurface usa el gradiente de categoría
      };

      // ── Campos adicionales que usan las tarjetas y el DetailSheet ──
      return {
        ...normalizado,
        title:   normalizado.nombre,
        place:   t["addr:city"] || t["addr:suburb"] || ciudad,
        cat:     categoria,
        dist:    fmtDist(distanciaKm),
        time:    TIEMPO_CAT[categoria] || "Menos de 2 h",
        level:   nivelActividad(distanciaKm),
        match:   80,   // placeholder — ver NOTA arriba
        rating:  null, // no disponible en OSM — ver NOTA arriba
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

   Recibe la lista de intereses del usuario (de prefs.intereses), busca cada
   categoría correspondiente e intercala los resultados en un feed variado.
   Las llamadas se espacian 300 ms para respetar los límites de Overpass.
   ============================================================================ */
export async function buscarParaTi(intereses, ciudad) {
  const cacheKey = `para-ti:${intereses.join(",")}:${ciudad}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey);

  // Convertir intereses (texto del onboarding) a claves de categoría
  const cats = intereses.map((i) => INTERES_A_CAT[i]).filter(Boolean);
  if (!cats.length) return [];

  // Buscar categoría por categoría con pausa entre llamadas
  const porCategoria = [];
  for (let i = 0; i < cats.length; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 300)); // pausa cortés entre peticiones
    try {
      const lugares = await buscarPorCategoria(cats[i], ciudad);
      porCategoria.push(lugares.slice(0, 5)); // máximo 5 por categoría
    } catch (err) {
      // Si una categoría falla, continuamos con las demás
      console.warn(`[huella] No se cargó "${cats[i]}" en "${ciudad}":`, err.message);
    }
  }

  if (!porCategoria.length) return [];

  // Intercalar arrays: [cat0[0], cat1[0], cat2[0], cat0[1], cat1[1], ...]
  // Así el feed muestra variedad en lugar de agrupar todo por categoría
  const resultado = [];
  const maxLen = Math.max(...porCategoria.map((a) => a.length));
  for (let i = 0; i < maxLen; i++) {
    for (const arr of porCategoria) {
      if (arr[i]) resultado.push(arr[i]);
    }
  }

  cache.set(cacheKey, resultado);
  return resultado;
}
