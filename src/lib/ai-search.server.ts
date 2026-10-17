import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

export type Candidate = { id: string; name: string; category: string; dist: number; street: string | null; hours: string; open: boolean | null; turno: boolean };

export async function rankPlaces(query: string, candidates: Candidate[]) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Falta configurar la búsqueda inteligente.");
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
  });
  const list = candidates.map((c) => `${c.id} | ${c.name} | ${c.category} | ${Math.round(c.dist)} m | ${c.street ?? "-"} | ${c.hours} | abierto: ${c.open === null ? "desconocido" : c.open ? "sí" : "no"}${c.turno ? " | DE TURNO" : ""}`).join("\n");
  const result = streamText({
    model: provider.responses("openai/gpt-6-astra"),
    system: "Eres el asistente de Cumpita, app chilena de locales cercanos: farmacias, botillerías, librerías/bazares (cartulinas, útiles escolares, fotocopias) y almacenes/minimarkets (pan, abarrotes, carbón, hielo, servicentros 24h). Elige SOLO entre los locales listados los más relevantes (máximo 5) para la necesidad del usuario, priorizando que estén abiertos, cercanía y categoría. Responde únicamente JSON: {\"results\":[{\"id\":\"...\",\"reason\":\"frase breve en español\"}],\"summary\":\"una frase\"}. No inventes locales.",
    prompt: `Necesidad: ${query}\n\nLocales (id | nombre | categoría | distancia | dirección | horario | abierto):\n${list}`,
    providerOptions: { openai: { forceReasoning: true, reasoningEffort: "low", reasoningSummary: "auto", store: false, include: ["reasoning.encrypted_content"] } },
  });
  const text = await result.text;
  const json = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1)) as { results?: { id: string; reason: string }[]; summary?: string };
  const ids = new Set(candidates.map((c) => c.id));
  return { results: (json.results ?? []).filter((r) => ids.has(r.id)).slice(0, 5), summary: json.summary ?? "" };
}
