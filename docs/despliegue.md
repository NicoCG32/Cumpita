# Despliegue en producción

## 1. Publicar desde Lovable (recomendado)
1. En el editor, botón **Publish** (arriba a la derecha; en móvil, abajo a la derecha en Preview).
2. Los cambios de **interfaz** requieren pulsar **Update** en el diálogo de publicación.
3. Los cambios de **backend** (migraciones, server functions, cron) se aplican de inmediato.
4. URL de producción: https://cumpita.lovable.app. Dominio propio: *Project Settings → Domains*.

> Las vistas previas (`id-preview--…`) requieren sesión de Lovable y **no** registran el service worker: la PWA y el push solo se prueban en la URL publicada.

## 2. Secretos

Se gestionan en **Lovable Cloud → Secrets** (nunca en el repositorio).

| Secreto | Uso | Origen |
| --- | --- | --- |
| `LOVABLE_API_KEY` | Llamadas al gateway de conectores (push) | Gestionado por Lovable |
| `FIREBASE_MESSAGING_API_KEY` | Envío FCM vía gateway | Conector Firebase Messaging |
| `LOVABLE_CRON_SECRET` (+ `_PREVIOUS`) | Autentica `/api/public/cron/turnos` | Gestionado por Lovable al crear el cron |
| `VITE_LOVABLE_CONNECTOR_FIREBASE_MESSAGING_*` | Config web pública de FCM | Conector Firebase Messaging |
| `VITE_SUPABASE_*` | Cliente del backend (públicas) | Lovable Cloud |

Rotación: rotar desde el panel de Secrets; el cron acepta el secreto actual y el anterior durante la transición.

## 3. Tarea programada
- `aviso-turnos-diario`: `0 23 * * *` UTC (≈20:00 Chile) → `POST /api/public/cron/turnos` con `Authorization: Bearer <LOVABLE_CRON_SECRET>`.
- Prueba manual: debe responder `401` sin token y `{"sent": N}` con token válido.

## 4. Autohospedaje (opcional)
El código es TanStack Start estándar con destino Cloudflare Workers:
```sh
bun run build   # genera .output/
```
Despliega `.output/` en Cloudflare Workers (u otro runtime compatible) configurando las mismas variables. Ver la [guía oficial de self-hosting](https://docs.lovable.dev/tips-tricks/self-hosting).

## 5. Verificar la PWA

### Checklist rápido (en la URL publicada)
1. **Manifest**: abre `/manifest.webmanifest` → debe mostrar nombre, íconos 192/512 y `display: standalone`.
2. **Service worker**: Chrome DevTools → *Application → Service Workers* → `/sw.js` activo. `?sw=off` en la URL lo desregistra (kill-switch).
3. **Lighthouse**: DevTools → *Lighthouse → PWA/Best practices* → sin errores de instalabilidad.
4. **Offline**: con la app cargada, *Network → Offline* y recargar → abre con los últimos datos y el aviso "Sin conexión".
5. **Push**: `/firebase-messaging-sw.js` registrado aparte; activa avisos en "Mi cumpita" y verifica recepción con la app en segundo plano.

### En celular real
| Plataforma | Qué comprobar |
| --- | --- |
| Android / Chrome | Aparece el banner "Instala cumpita." con botón **Instalar**; abre a pantalla completa |
| iOS / Safari | Banner con instrucción *Compartir → Agregar a inicio*; push solo funciona una vez instalada (iOS 16.4+) |
| Ambos | GPS pide permiso, el reporte se habilita a ≤300 m, vista previa de WhatsApp en `/local/:id` muestra imagen y título |

### Problemas conocidos
- Los teléfonos guardan `start_url`, `scope` y `display` al instalar: si cambian, hay que reinstalar.
- Pantalla en blanco tras un deploy: recargar; si persiste, abrir con `?sw=off`.
