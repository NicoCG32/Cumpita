import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/firebase_messaging";
const admin = async () => (await import("@/integrations/supabase/client.server")).supabaseAdmin;

const secretSchema = z.string().min(32).max(128);
const newSecret = () => Array.from(crypto.getRandomValues(new Uint8Array(24)), (b) => b.toString(16).padStart(2, "0")).join("");

// Registra "voy en camino" a un local para este dispositivo (45 min).
// Solo quien tiene el secreto emitido por el servidor puede reemplazar o borrar su registro.
export const startEnRoute = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string().min(20).max(4096), placeId: z.string().min(1).max(200), placeName: z.string().min(1).max(200), secret: secretSchema.optional() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    if (data.secret) await db.from("en_route").delete().eq("token", data.token).eq("secret", data.secret);
    const secret = newSecret();
    const { error } = await db.from("en_route").insert({ token: data.token, place_id: data.placeId, place_name: data.placeName, secret });
    return { ok: !error, secret: error ? null : secret };
  });

export const stopEnRoute = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string().min(20).max(4096), secret: secretSchema }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    await db.from("en_route").delete().eq("token", data.token).eq("secret", data.secret);
    return { ok: true };
  });

// Avisa por push a quienes van en camino. Solo envía si existe un reporte "cerrado" real de hace < 3 min.
export const notifyClosed = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ placeId: z.string().min(1).max(200), senderToken: z.string().max(4096).optional() }).parse(d))
  .handler(async ({ data }) => {
    const lovableKey = process.env["LOVABLE_API_KEY"];
    const connKey = process.env["FIREBASE_MESSAGING_API_KEY"];
    if (!lovableKey || !connKey) return { sent: 0 };
    const db = await admin();
    const { data: rep } = await db.from("place_reports").select("id").eq("place_id", data.placeId).eq("status", "closed")
      .gte("created_at", new Date(Date.now() - 3 * 60 * 1000).toISOString()).limit(1);
    if (!rep?.length) return { sent: 0 };
    const { data: rows } = await db.from("en_route").select("id,token,place_name").eq("place_id", data.placeId).gt("expires_at", new Date().toISOString());
    let sent = 0;
    for (const r of rows ?? []) {
      if (r.token === data.senderToken) continue;
      const res = await fetch(`${GATEWAY_URL}/v1/projects/_/messages:send`, {
        method: "POST",
        headers: { Authorization: `Bearer ${lovableKey}`, "X-Connection-Api-Key": connKey, "Content-Type": "application/json" },
        body: JSON.stringify({ message: { token: r.token,
          notification: { title: "¡Ojo! Cerró el local", body: `Un cumpita acaba de reportar que ${r.place_name} cerró mientras ibas en camino.` },
          webpush: { notification: { icon: "/icons/icon-192.png", vibrate: [300, 150, 300], tag: `closed-${data.placeId}` }, fcm_options: { link: "/" } } } }),
      });
      if (res.ok) sent++;
      else console.error(`FCM send failed [${res.status}]: ${await res.text()}`);
      await db.from("en_route").delete().eq("id", r.id);
    }
    return { sent };
  });

// Suscripción al aviso diario de farmacias de turno (cron 20:00 Chile).
const citySchema = z.enum(["calama", "la-serena", "coquimbo"]);
export const subscribeTurnos = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string().min(20).max(4096), city: citySchema, secret: secretSchema.optional() }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    const { data: row } = await db.from("turno_subs").select("secret").eq("token", data.token).maybeSingle();
    if (row && row.secret !== data.secret) return { ok: false, secret: null };
    const secret = row?.secret ?? newSecret();
    const { error } = await db.from("turno_subs").upsert({ token: data.token, city: data.city, secret }, { onConflict: "token" });
    return { ok: !error, secret: error ? null : secret };
  });

export const unsubscribeTurnos = createServerFn({ method: "POST" })
  .inputValidator((d) => z.object({ token: z.string().min(20).max(4096), secret: secretSchema }).parse(d))
  .handler(async ({ data }) => {
    const db = await admin();
    await db.from("turno_subs").delete().eq("token", data.token).eq("secret", data.secret);
    return { ok: true };
  });
