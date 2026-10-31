# 03 · Flujo de usuario

## Journey principal

```text
Primera visita ─► Onboarding (3 pasos) ─► Feed ─► Tarjeta ─► Ir / Compartir
                    1. Ciudad o GPS                    │
                    2. Pacto cumpita (≤300 m)          ▼
                    3. Apodo editable          En el local: reportar
                                               Abierto / Cerrado + tags
```

Visitas siguientes: entran directo al feed; el onboarding **no se repite** y la pantalla principal no vuelve a pedir GPS, acceso ni zona.

## Estado de una tarjeta

```text
            ┌─────────────┐  reporte reciente   ┌──────────────────┐
            │  Oficial    │ ──────────────────► │ Confirmado por   │
            │ (horario o  │                     │ cumpitas         │
            │  turno)     │ ◄────────────────── │ abierto/cerrado  │
            └─────┬───────┘   caduca (1 h)      └──────────────────┘
                  │ sin horario ni reporte
            ┌─────▼───────┐
            │ Desconocido │  "Horario no informado"
            └─────────────┘
```

Prioridad de lectura: reporte comunitario vigente > turno oficial > horario publicado > desconocido.

## Reporte "Último Cumpita"

```text
Pulsar reportar ─► ¿GPS ≤300 m? ── no ─► bloqueado ("acércate al local")
                        │ sí
                        ▼
                 ¿último reporte < 10 min? ── sí ─► bloqueado (espera)
                        │ no
                        ▼
                 Guardar en servidor ─► Realtime a todos ─► caduca a la hora
```

## Navegación móvil

- Barra inferior: **Locales · Mapa · Favoritos · Ranking**.
- Cuenta, cambio de ubicación y filtros avanzados en **bottom sheets** cerrables con gesto o botón.
- Acciones secundarias de cada tarjeta en el menú **"···"**.
- Hero de intención rápida: _Farmacia de turno_ · _Botillería abierta_.

## Recorrido operativo y estados

1. Elegir zona o conceder ubicación.
2. Filtrar categoría y revisar procedencia/vigencia.
3. Abrir ficha y decidir desplazamiento.
4. Reportar desde proximidad cuando corresponda.
5. Recibir avisos consentidos o volver a consultar tras caducidad.

### Confirmación y resultado

Distancias y geofencing usan ubicación con incertidumbre; denegar GPS permite una zona manual.

Los puntos y privilegios no se aceptan como una afirmación editable del cliente.

### Criterio de aceptación del recorrido

Viajes evitados y proporción de consultas con dato vigente, medidos con consentimiento; latencia y cobertura por zona/categoría.

Validar inicio, camino principal, error relevante, cancelación y reapertura según la plataforma; registrar también los escenarios aún no ejecutados. Para cumpita., atender especialmente: baja participación o reportes falsos.

## Código y documentación relacionada

[README.md](../README.md) · [docs/01-arquitectura-general.md](01-arquitectura-general.md) · [docs/04-base-de-datos.md](04-base-de-datos.md) · [docs/05-motor-o-nucleo-de-negocio.md](05-motor-o-nucleo-de-negocio.md) · [docs/06-integraciones-externas-y-resiliencia.md](06-integraciones-externas-y-resiliencia.md) · [docs/releases.md](releases.md).
