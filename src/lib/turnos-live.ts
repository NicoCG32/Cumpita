import { distanceM, type Place } from "./places";

/** Turnos en vivo leídos del boletín diario MINSAL publicado por mifarmaciadeturno.cl (datos JSON-LD). */
const CITIES = [
  { slug: "calama", lat: -22.46, lng: -68.93 },
  { slug: "la-serena", lat: -29.905, lng: -71.25 },
];
const TTL = 2 * 60 * 60 * 1000;
const cache = new Map<string, { at: number; data: Place[] }>();

const title = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim().replace(/(^|[\s(])(\p{L})/gu, (_m, a, b) => a + b.toUpperCase());

async function scrape(slug: string): Promise<Place[]> {
  const res = await fetch(`https://www.mifarmaciadeturno.cl/farmacia-de-turno-${slug}`, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; CumpitaApp/1.0)", Accept: "text/html" },
  });
  if (!res.ok) throw new Error("turnos " + res.status);
  const html = await res.text();
  const blocks = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  const out: Place[] = [];
  for (const b of blocks) {
    let j: any;
    try { j = JSON.parse(b[1]!); } catch { continue; }
    if (j?.["@type"] !== "ItemList") continue;
    for (const li of j.itemListElement ?? []) {
      const it = li.item;
      if (it?.["@type"] !== "Pharmacy" || !it.geo) continue;
      const h = it.openingHoursSpecification?.[0];
      const from = h?.opens ?? "00:00", to = h?.closes ?? "23:59";
      const lat = Number(it.geo.latitude), lng = Number(it.geo.longitude);
      out.push({
        id: `turno/${slug}/${lat.toFixed(5)},${lng.toFixed(5)}`,
        name: title(it.name ?? "Farmacia"), category: "farmacia",
        street: title(it.address?.streetAddress ?? ""), city: title(it.address?.addressLocality ?? ""),
        lat, lng, openingHours: null, phone: it.telephone ?? null,
        osmUrl: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`,
        hoursText: from === "00:00" && to === "23:59" ? "De turno: 24 horas" : `De turno: ${from} – ${to}`,
        source: "turno", liveTurno: { from, to },
      });
    }
  }
  return out;
}

/** Turnos de hoy de la ciudad más cercana (≤ 40 km). null si no se pudo obtener. */
export async function liveTurnos(lat: number, lng: number): Promise<Place[] | null> {
  const city = CITIES.find((c) => distanceM(c, { lat, lng }) < 40000);
  if (!city) return [];
  const hit = cache.get(city.slug);
  if (hit && Date.now() - hit.at < TTL) return hit.data;
  try {
    const data = await scrape(city.slug);
    cache.set(city.slug, { at: Date.now(), data });
    return data;
  } catch {
    return hit?.data ?? null;
  }
}

/** Marca como de turno los locales a < 80 m de un turno vivo; agrega los que no existan. */
export function mergeTurnos(places: Place[], turnos: Place[]): Place[] {
  const used = new Set<string>();
  const merged = places.map((p) => {
    if (p.category !== "farmacia") return p;
    const t = turnos.find((t) => distanceM(t, p) < 80);
    if (!t) return p;
    used.add(t.id);
    return { ...p, liveTurno: t.liveTurno, hoursText: t.hoursText, phone: p.phone ?? t.phone };
  });
  return [...turnos.filter((t) => !used.has(t.id)), ...merged];
}
