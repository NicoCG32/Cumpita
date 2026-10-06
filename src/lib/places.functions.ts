import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Place } from "./places";

export const getNearbyPlaces = createServerFn({ method: "GET" })
  .inputValidator((d) => z.object({ lat: z.number(), lng: z.number() }).parse(d))
  .handler(async ({ data }): Promise<Place[]> => {
    const { lat, lng } = data;
    const q = `[out:json][timeout:25];(nwr["amenity"="pharmacy"](around:3000,${lat},${lng});nwr["shop"="alcohol"](around:3000,${lat},${lng}););out center tags;`;
    const res = await fetch("https://overpass-api.de/api/interpreter", {
      method: "POST",
      headers: { "User-Agent": "CumpitaApp/1.0", Accept: "application/json", "Content-Type": "application/x-www-form-urlencoded" },
      body: "data=" + encodeURIComponent(q),
    });
    if (!res.ok) throw new Error("No pudimos cargar los locales. Intenta de nuevo en un momento.");
    const json = (await res.json()) as { elements: any[] };
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
          osmUrl: `https://www.openstreetmap.org/${e.type}/${e.id}`,
        };
      })
      .filter((p): p is Place => p !== null);
  });
