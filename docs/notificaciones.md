# Notificaciones

## Push "en camino"
- Al marcar "Voy en camino" se crea un registro con secreto de servidor y token FCM (vigencia 45 min).
- Si llega un reporte de **cerrado** para ese local, se envía push aunque la app esté en segundo plano.
- Al llegar a ≤40 m, la app vibra y ofrece confirmar Abierto/Cerrado.

## Aviso diario de turnos
- Activable en "Mi cumpita" → "Avisarme el turno de farmacias cada día".
- Cron `aviso-turnos-diario` (`0 23 * * *` UTC ≈ 20:00 Chile) llama a `/api/public/cron/turnos`, que valida al llamador y envía las farmacias de turno de la ciudad suscrita.

## Requisitos
Solo en la versión publicada, con notificaciones permitidas en el dispositivo. En iOS requiere instalar la PWA en la pantalla de inicio.
