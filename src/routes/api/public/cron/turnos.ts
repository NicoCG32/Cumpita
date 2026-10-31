import { createFileRoute } from "@tanstack/react-router";
import { authenticateCronRequest } from "@/integrations/supabase/cron-auth";
import { cityTurnos } from "@/lib/turnos-live";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/firebase_messaging";
const NAMES: Record<string, string> = {
  calama: "Calama",
  "la-serena": "La Serena",
  coquimbo: "Coquimbo",
};

export const Route = createFileRoute("/api/public/cron/turnos")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const denied = await authenticateCronRequest(request);
        if (denied) return denied;
        const lovableKey = process.env["LOVABLE_API_KEY"];
        const connKey = process.env["FIREBASE_MESSAGING_API_KEY"];
        if (!lovableKey || !connKey)
          return Response.json({ sent: 0, reason: "push not configured" });
        const { supabaseAdmin: db } = await import("@/integrations/supabase/client.server");
        let sent = 0;
        for (const slug of Object.keys(NAMES)) {
          const turnos = await cityTurnos(slug);
          if (!turnos?.length) continue;
          const { data: subs } = await db.from("turno_subs").select("id,token").eq("city", slug);
          if (!subs?.length) continue;
          const top = turnos
            .slice(0, 3)
            .map((t) => `${t.name} (${t.street})`)
            .join(" · ");
          for (const s of subs) {
            const res = await fetch(`${GATEWAY_URL}/v1/projects/_/messages:send`, {
              method: "POST",
              headers: {
                Authorization: `Bearer ${lovableKey}`,
                "X-Connection-Api-Key": connKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                message: {
                  token: s.token,
                  notification: { title: `💊 Turno hoy en ${NAMES[slug]}`, body: top },
                  webpush: {
                    notification: { icon: "/icons/icon-192.png", tag: `turno-${slug}` },
                    fcm_options: { link: "/" },
                  },
                },
              }),
            });
            if (res.ok) sent++;
            else if (res.status === 404 || res.status === 400)
              await db.from("turno_subs").delete().eq("id", s.id);
          }
        }
        return Response.json({ sent });
      },
    },
  },
});
