export const PLACE_TAGS = { card_ok: "💳 Pasa Redcompra/transferencia", cash_only: "💵 Solo efectivo", reja: "🔒 Atienden por reja", fila: "⏳ Hay fila", sin_fila: "⚡ Sin fila", hielo: "🧊 Hay hielo", cigarros: "🚬 Hay cigarros", promo: "🏷️ Buena promo", cartulinas: "🎨 Hay cartulinas", fotocopias: "🖨️ Fotocopias / impresiones", pan: "🥖 Pan fresco", carbon: "🔥 Hay carbón" } as const;
export type PlaceTagKey = keyof typeof PLACE_TAGS;
export const TAG_TTL = 3 * 60 * 60 * 1000;
