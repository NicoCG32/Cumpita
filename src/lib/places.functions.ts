import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Place } from "./places";

const MIRRORS = [
  "https://overpass.kumi.systems/api/interpreter",
  "https://lz4.overpass-api.de/api/interpreter",
  "https://overpass-api.de/api/interpreter",
];

async function fromOsm(lat: number, lng: number): Promise<Place[]> {
  const q = `[out:json][timeout:25];(nwr["amenity"="pharmacy"](around:4000,${lat},${lng});nwr["shop"="alcohol"](around:4000,${lat},${lng});nwr["shop"="beverages"](around:4000,${lat},${lng}););out center tags;`;
  let json: { elements: any[] } | null = null;
  for (const url of MIRRORS) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "User-Agent": "CumpitaApp/1.0", Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
        body: "data=" + encodeURIComponent(q),
      });
      if (res.ok) { json = await res.json(); break; }
    } catch { /* try next mirror */ }
  }
  if (!json) throw new Error("No pudimos cargar los locales. Intenta de nuevo en un momento.");
  return json.elements
    .map((e): Place | null => {
      const t = e.tags ?? {};
      const plat = e.lat ?? e.center?.lat, plng = e.lon ?? e.center?.lon;
      if (plat == null || plng == null) return null;
      const category = t.amenity === "pharmacy" ? "farmacia" : "botilleria";
      const street = [t["addr:street"], t["addr:housenumber"]].filter(Boolean).join(" ");
      return {
        id: `${e.type}/${e.id}`,
        name: t.name || t.brand || (category === "farmacia" ? "Farmacia" : "Botillería"),
        category, street: street || null, city: t["addr:city"] || null,
        lat: plat, lng: plng, openingHours: t.opening_hours || null,
        phone: t.phone || t["contact:phone"] || null,
        osmUrl: `https://www.openstreetmap.org/${e.type}/${e.id}`, source: "osm",
      };
    })
    .filter((p): p is Place => p !== null);
}

async function fromGoogle(lat: number, lng: number, key: string): Promise<Place[]> {
  const fields = "places.id,places.displayName,places.shortFormattedAddress,places.location,places.rating,places.userRatingCount,places.currentOpeningHours,places.nationalPhoneNumber,places.googleMapsUri";
  const search = async (type: string) => {
    const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": key, "X-Goog-FieldMask": fields },
      body: JSON.stringify({ includedTypes: [type], maxResultCount: 20, rankPreference: "DISTANCE", languageCode: "es", locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: 4000 } } }),
    });
    if (!res.ok) throw new Error("google " + res.status);
    return ((await res.json()).places ?? []) as any[];
  };
  const [ph, lq] = await Promise.all([search("pharmacy"), search("liquor_store")]);
  const map = (g: any, category: Place["category"]): Place => {
    const wd: string[] = g.currentOpeningHours?.weekdayDescriptions ?? [];
    const today = wd[(new Date().getDay() + 6) % 7];
    return {
      id: `g/${g.id}`, name: g.displayName?.text ?? "Local", category,
      street: g.shortFormattedAddress ?? null, city: null,
      lat: g.location.latitude, lng: g.location.longitude, openingHours: null,
      phone: g.nationalPhoneNumber ?? null, osmUrl: g.googleMapsUri,
      rating: g.rating ?? null, ratingCount: g.userRatingCount ?? null,
      openNow: g.currentOpeningHours?.openNow ?? null, hoursText: today ? `Hoy: ${today.split(": ").slice(1).join(": ")}` : null,
      source: "google",
    };
  };
  return [...ph.map((g) => map(g, "farmacia")), ...lq.map((g) => map(g, "botilleria"))];
}

export const getNearbyPlaces = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ lat: z.number(), lng: z.number() }).parse(d))
  .handler(async ({ data }): Promise<Place[]> => {
    const key = process.env['GOOGLE_PLACES_API_KEY'];
    if (key) {
      try { return await fromGoogle(data.lat, data.lng, key); } catch { /* fall back */ }
    }
    return fromOsm(data.lat, data.lng);
  });
