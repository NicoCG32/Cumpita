// Registro de notificaciones push en el navegador (Firebase Cloud Messaging).
export type PushResult =
  | { status: "registered"; token: string }
  | { status: "not-configured" | "unsupported" | "open-in-new-tab" | "denied" };

const TOKEN_KEY = "cumpita-push-token";
export const savedPushToken = () => (typeof window === "undefined" ? null : localStorage.getItem(TOKEN_KEY));

export async function enablePush(): Promise<PushResult> {
  const appId = import.meta.env["VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_APP_ID"] as string | undefined;
  const vapidKey = import.meta.env["VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_VAPID_KEY"] as string | undefined;
  const config = {
    apiKey: (import.meta.env["VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_WEB_API_KEY"] as string | undefined) ?? "",
    projectId: (import.meta.env["VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_PROJECT_ID"] as string | undefined) ?? "",
    appId: appId ?? "",
    messagingSenderId: appId?.split(":")[1] ?? "",
  };
  if (!config.apiKey || !config.projectId || !config.appId || !vapidKey || !config.messagingSenderId) return { status: "not-configured" };
  const { isSupported, getMessaging, getToken } = await import("firebase/messaging");
  if (!("Notification" in window) || !(await isSupported())) return { status: "unsupported" };
  if (window.top !== window.self) return { status: "open-in-new-tab" };
  const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
  if (permission !== "granted") return { status: "denied" };
  const { initializeApp, getApps } = await import("firebase/app");
  const app = getApps()[0] ?? initializeApp(config);
  const reg = await navigator.serviceWorker.register(`/firebase-messaging-sw.js?${new URLSearchParams(config).toString()}`, { scope: "/firebase-cloud-messaging-push-scope" });
  const token = await getToken(getMessaging(app), { vapidKey, serviceWorkerRegistration: reg });
  if (!token) return { status: "denied" };
  localStorage.setItem(TOKEN_KEY, token);
  return { status: "registered", token };
}

export const pushMessage: Record<Exclude<PushResult["status"], "registered">, string> = {
  "not-configured": "Las notificaciones aún no están listas en la app.",
  unsupported: "Tu navegador no permite notificaciones. Te avisaremos solo con la app abierta.",
  "open-in-new-tab": "Abre la app en su propia pestaña (o la versión publicada) para activar notificaciones.",
  denied: "Bloqueaste las notificaciones. Actívalas en los ajustes del sitio de tu navegador.",
};
