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
- Hero de intención rápida: *Farmacia de turno* · *Botillería abierta*.
