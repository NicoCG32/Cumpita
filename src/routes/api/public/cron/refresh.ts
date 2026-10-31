import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { cityTurnos, TURNO_SLUGS } from "@/lib/turnos-live";
import { refreshStalestZones } from "@/lib/places.functions";
import { logOps } from "@/lib/ops.server";

/** Precarga turnos oficiales y las zonas con datos más antiguos, sin esperar a que alguien abra la app. */
export const Route = createFileRoute("/api/public/cron/refresh")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await authenticateCronRequest(request);
        if (denied) return denied;
        const t0 = Date.now();
        const turnos = await Promise.all(
          TURNO_SLUGS.map((s) => cityTurnos(s, true).then((r) => (r ? r.length : -1))),
        );
        const zones = await refreshStalestZones(2);
        await logOps(
          "refresh",
          "cron",
          turnos.every((n) => n >= 0),
          Date.now() - t0,
          `zonas: ${zones.join(", ") || "ninguna"}`,
        );
        return Response.json({ turnos, zones });
      },
    },
  },
});
