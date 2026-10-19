/** Registro liviano de salud de fuentes y cargas. Nunca guarda ubicación ni datos personales. */
export type OpsKind = "source" | "cache" | "slow" | "retry" | "load_error" | "refresh";

export async function logOps(kind: OpsKind, source: string, ok: boolean, ms?: number, detail?: string) {
  try {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    await supabaseAdmin.from("ops_events").insert({
      kind, source: source.slice(0, 60), ok,
      ms: ms == null ? null : Math.max(0, Math.min(600000, Math.round(ms))),
      detail: detail ? detail.slice(0, 200) : null,
    });
  } catch { /* el monitoreo nunca rompe la app */ }
}
