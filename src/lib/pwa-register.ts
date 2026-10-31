// Registro único del service worker de la app (offline). Nunca registra en
// dev ni en las vistas previas de Lovable; en esos contextos desregistra.
const SW_URL = "/sw.js";

function isPreviewHost(hostname: string): boolean {
  return (
    hostname.startsWith("id-preview--") ||
    hostname.startsWith("preview--") ||
    hostname === "lovableproject.com" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname === "lovableproject-dev.com" ||
    hostname.endsWith(".lovableproject-dev.com") ||
    hostname === "beta.lovable.dev" ||
    hostname.endsWith(".beta.lovable.dev")
  );
}

async function unregisterAppSw() {
  if (!("serviceWorker" in navigator)) return;
  const regs = await navigator.serviceWorker.getRegistrations();
  await Promise.all(
    regs.filter((r) => r.active?.scriptURL.endsWith(SW_URL)).map((r) => r.unregister()),
  );
}

export async function registerAppSw() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
  const blocked =
    !import.meta.env.PROD ||
    window.self !== window.top ||
    isPreviewHost(window.location.hostname) ||
    new URLSearchParams(window.location.search).get("sw") === "off";
  if (blocked) {
    await unregisterAppSw();
    return;
  }
  const { registerSW } = await import("virtual:pwa-register");
  registerSW({ immediate: true });
}
