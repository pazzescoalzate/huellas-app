/* HUELLA — búsqueda de ciudades con Nominatim (OpenStreetMap)
   Nominatim es gratuito pero requiere:
     1. Un User-Agent identificable en cada petición.
     2. No saturar: 1 petición por segundo máximo (el debounce está en el componente).
   Política: https://operations.osmfoundation.org/policies/nominatim/ */

const USER_AGENT = "HuellaApp/1.0 (kev.alzate.b@gmail.com)";
const NOMINATIM  = "https://nominatim.openstreetmap.org";

// Tipos de entidad OSM que consideramos "ciudad o región"
// (filtramos calles, comercios, puntos de interés, etc.)
const TIPOS_CIUDAD = new Set([
  "city", "town", "village", "municipality", "borough",
  "county", "state", "region", "province", "district", "administrative",
]);

/* Convierte un resultado crudo de Nominatim al formato interno de Huella:
   { id, name, region, lat, lon } */
function parsearResultado(r) {
  const addr = r.address || {};

  // Nombre corto: tomamos el nivel más específico disponible
  const name =
    addr.city         ||
    addr.town         ||
    addr.village      ||
    addr.municipality ||
    addr.county       ||
    r.name            ||
    "";

  // Región: estado/provincia + país
  const region = [addr.state, addr.country].filter(Boolean).join(", ");

  return {
    id:     String(r.place_id),
    name,
    region,
    lat:    parseFloat(r.lat),
    lon:    parseFloat(r.lon),
  };
}

/* buscarCiudades(query)
   Llama a Nominatim con el texto escrito y devuelve un array de ciudades.
   El DEBOUNCE debe hacerlo el componente (400 ms recomendados).
   Devuelve [] si la query tiene menos de 2 caracteres. */
export async function buscarCiudades(query) {
  if (!query || query.trim().length < 2) return [];

  const params = new URLSearchParams({
    q:               query.trim(),
    format:          "json",
    addressdetails:  "1",
    limit:           "10",
    featuretype:     "city",        // Nominatim filtra núcleos de población
    "accept-language": "es",
  });

  const res = await fetch(`${NOMINATIM}/search?${params}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  if (!res.ok) throw new Error("No se pudo conectar a OpenStreetMap. Revisa tu conexión.");

  const datos = await res.json();

  return datos
    .filter((r) => TIPOS_CIUDAD.has(r.type))  // solo ciudades/regiones
    .map(parsearResultado)
    .filter((r) => r.name);                   // descartamos resultados sin nombre
}

/* detectarCiudadActual()
   Pide permiso de geolocalización, toma la posición del dispositivo
   y hace una geocodificación inversa al NIVEL DE CIUDAD (zoom=10).
   No devuelve ni guarda las coordenadas precisas del usuario. */
export function detectarCiudadActual() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Tu navegador no soporta geolocalización."));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        try {
          const params = new URLSearchParams({
            format:          "json",
            lat:             String(coords.latitude),
            lon:             String(coords.longitude),
            zoom:            "10",    // nivel ciudad, no dirección precisa
            addressdetails:  "1",
            "accept-language": "es",
          });
          const res = await fetch(`${NOMINATIM}/reverse?${params}`, {
            headers: { "User-Agent": USER_AGENT },
          });
          if (!res.ok) throw new Error("No se pudo identificar la ciudad.");
          const data = await res.json();
          resolve(parsearResultado(data));
        } catch (err) {
          reject(err);
        }
      },
      () => reject(new Error("No pudimos obtener tu ubicación. ¿Diste permiso al navegador?")),
      { timeout: 10_000, maximumAge: 60_000 }
    );
  });
}
