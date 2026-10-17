import type { Category } from "./places";

/** Metadatos visibles de cada categoría (etiqueta, plural y emoji). */
export const CATEGORIES: Record<Category, { label: string; plural: string; emoji: string; short: string }> = {
  farmacia: { label: "Farmacia", plural: "Farmacias", emoji: "💊", short: "Farmacias" },
  botilleria: { label: "Botillería", plural: "Botillerías", emoji: "🍻", short: "Botis" },
  libreria: { label: "Librería & Bazar", plural: "Librerías & Bazares", emoji: "✂️", short: "Librerías" },
  minimarket: { label: "Almacén & Minimarket", plural: "Almacenes & Minimarkets", emoji: "🛒", short: "Almacenes" },
};
export const CATEGORY_KEYS = Object.keys(CATEGORIES) as Category[];
export const asCategory = (s: string | null | undefined): Category => (s && s in CATEGORIES ? (s as Category) : "botilleria");
export const catLabel = (c: string) => CATEGORIES[asCategory(c)].label;

/** Clasifica tags OSM. null = no nos interesa. */
export function osmCategory(t: Record<string, string>): Category | null {
  if (t.amenity === "pharmacy") return "farmacia";
  if (t.shop === "alcohol" || t.shop === "beverages") return "botilleria";
  if (t.shop === "stationery" || t.shop === "copyshop" || t.shop === "books") return "libreria";
  if (t.shop === "convenience" || t.shop === "supermarket" || t.shop === "general" || t.shop === "kiosk") return "minimarket";
  if (t.amenity === "fuel" && (t.shop || t["brand"])) return "minimarket";
  return null;
}
