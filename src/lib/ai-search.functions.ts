import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { rankPlaces } from "./ai-search.server";

const cand = z.object({
  id: z.string().max(200),
  name: z.string().max(200),
  category: z.string().max(20),
  dist: z.number(),
  street: z.string().max(300).nullable(),
  hours: z.string().max(300),
  open: z.boolean().nullable(),
  turno: z.boolean(),
});

export const aiSearch = createServerFn({ method: "POST" })
  .inputValidator((d) =>
    z
      .object({ query: z.string().trim().min(2).max(300), candidates: z.array(cand).max(60) })
      .parse(d),
  )
  .handler(async ({ data }) => {
    try {
      return { ok: true as const, ...(await rankPlaces(data.query, data.candidates)) };
    } catch (e: unknown) {
      const s =
        typeof e === "object" && e !== null
          ? "statusCode" in e
            ? e.statusCode
            : "status" in e
              ? e.status
              : undefined
          : undefined;
      const msg =
        s === 429
          ? "Muchas búsquedas seguidas. Intenta en un minuto."
          : s === 402
            ? "Se agotaron los créditos de IA del proyecto."
            : "No pudimos completar la búsqueda. Intenta de nuevo.";
      return { ok: false as const, error: msg, results: [], summary: "" };
    }
  });
