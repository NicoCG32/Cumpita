# Arquitectura, de afuera hacia adentro

El recorrido de la aplicación responde a una pregunta: «¿qué local cercano tiene información útil ahora?». La arquitectura responde reuniendo varias fuentes sin obligar al usuario a conocer cada una. Esta página muestra **cuatro niveles complementarios**, no cuatro sistemas diferentes.

## Nivel 1 · Contexto

```mermaid
flowchart LR
    U[Persona que consulta o reporta] -->|Navegador| A[Cumpita · web / PWA]
    M[Persona administradora] -->|Panel de revisión| A
    A <-->|Lugares y turnos| X[Servicios de datos externos]
    A <-->|Cuentas y datos comunitarios| D[Supabase / PostgreSQL]
    A -->|Avisos opcionales| N[Firebase Messaging mediante conector]
    classDef product fill:#fff0e5,stroke:#d16a32,stroke-width:2px,color:#243248;
    classDef external fill:#e8eff6,stroke:#496482,color:#243248;
    class A product;
    class X,D,N external;
```

La persona que consulta también puede reportar **sin iniciar sesión**; las cuentas se usan en recorridos específicos y no son un requisito general de participación. El producto no crea por sí mismo un catastro comercial completo: combina fuentes externas, registros locales existentes y contribuciones. Esa dependencia explica por qué **frescura, procedencia y errores** forman parte de la experiencia.

## Nivel 2 · Contenedores y fronteras de confianza

```mermaid
flowchart TB
    subgraph DEVICE[Dispositivo]
        UI[React · feed, mapa, filtros y fichas]
        LOCAL[(localStorage · favoritos, ajustes y última lista)]
        SW[Service workers · PWA y FCM]
        UI <--> LOCAL
        UI --> SW
    end
    subgraph SERVER[Funciones TanStack Start · entorno servidor]
        PL[Consulta y agregado de lugares]
        PS[Push y avisos]
        CR[Endpoints cron protegidos]
        OP[Telemetría]
    end
    subgraph BACK[Supabase / PostgreSQL]
        AUTH[Auth y roles]
        DATA[(Tablas con RLS)]
    end
    EXT[Overpass / fuente de turnos / Google Places opcional]
    FCM[Gateway Firebase Messaging]
    UI <-->|Server functions| PL
    UI <-->|Auth, RLS y Realtime| AUTH
    UI <-->|Consultas e inserciones autorizadas| DATA
    PL --> EXT
    PL --> DATA
    PS --> DATA
    PS --> FCM
    CR --> PL
    CR --> PS
    OP --> DATA
    classDef front fill:#fff2e9,stroke:#bd622e,color:#263244;
    classDef back fill:#eaf1f7,stroke:#50708a,color:#263244;
    class UI,LOCAL,SW front;
    class PL,PS,CR,OP,AUTH,DATA,EXT,FCM back;
```

**Fronteras importantes:** el navegador accede a Supabase con una clave publicable y sus políticas RLS; algunas funciones servidor usan `supabaseAdmin` y una clave de servicio capaz de eludir RLS. Esa clave **no** debe exponerse ni al cliente ni a un repositorio. Las funciones que usan privilegios deben validar sus propias entradas y autorización.

El proyecto importa `@lovable.dev/vite-tanstack-config`; su configuración declara Nitro con un destino Cloudflare predeterminado. Esto no demuestra que el sitio público se ejecute allí. El ZIP no demuestra por sí mismo dónde corre la instalación pública ni qué servicios están configurados actualmente.

## Nivel 3 · Componentes de la aplicación

```mermaid
flowchart LR
    I[UI index / local / revision] --> Q[places.functions.ts]
    I --> R[Estado comunitario · places.ts y Supabase]
    I --> P[push.functions.ts]
    Q --> CACHE[Memoria y places_cache]
    Q --> SOURCES[Adaptadores OSM / Google / MINSAL / turnos]
    Q --> HOURS[Horarios aprobados y locales comunitarios]
    Q --> HIDDEN[Exclusiones administrativas]
    I --> CATS[categories.ts y tags.ts]
    REV[Panel revision.tsx] --> MOD[Propuestas, roles y locales ocultos]
    classDef app fill:#fff1e7,stroke:#c66a35,color:#263244;
    classDef module fill:#e9eff5,stroke:#516c84,color:#263244;
    class I,REV app;
    class Q,R,P,CACHE,SOURCES,HOURS,HIDDEN,CATS,MOD module;
```

| Módulo                                          | Responsabilidad comprobable                                                    |
| ----------------------------------------------- | ------------------------------------------------------------------------------ |
| `src/routes/index.tsx`                          | Pantalla principal, filtros, estado comunitario, suscripciones y acciones      |
| `src/routes/local.$.tsx`                        | Ficha compartible de un lugar                                                  |
| `src/routes/revision.tsx`                       | Revisión de horarios/sugerencias, bajas y telemetría                           |
| `src/lib/places.functions.ts`                   | Consulta, fuente opcional Google, Overpass, MINSAL, caché y agregación         |
| `src/lib/places.ts`, `categories.ts`, `tags.ts` | Tipos de lugar, cálculo geográfico, estados temporales, categorías y etiquetas |
| `src/lib/turnos*.ts`, `botillerias.ts`          | Turnos, horarios y heurísticas específicas                                     |
| `src/lib/push.functions.ts`                     | Registro de avisos y envío a través del conector                               |
| `src/lib/ops.server.ts`                         | Eventos operativos sin coordenadas ni identidad en la estructura del evento    |
| `src/lib/ai-search.*`                           | Módulos existentes de IA, **sin flujo activo de búsqueda** en el UI            |

## Nivel 4 · Despliegue y distribución

```mermaid
flowchart TB
    DEV[Repositorio y CI] -->|Build Vite / TanStack Start| OUT[Artefacto .output]
    OUT -->|Despliegue configurado| HOST[Hosting con runtime de servidor]
    HOST --> WEB[Web y PWA en navegador]
    HOST --> ENV[Variables y secretos de servidor]
    HOST <-->|REST / Realtime / Auth| DB[Backend Supabase]
    SCHED[Programador externo · por configurar/verificar] -->|POST con Bearer| CRON[Endpoints /api/public/cron/*]
    CRON --> HOST
    CI[Workflow de GitHub Releases] -->|Tag v*| SRC[Release de fuentes y notas]
    classDef release fill:#fff2e9,stroke:#bb6233,color:#263244;
    classDef infra fill:#e9f0f6,stroke:#506c86,color:#263244;
    class DEV,OUT,CI,SRC release;
    class HOST,WEB,ENV,DB,SCHED,CRON infra;
```

En el repositorio hay dos rutas HTTP para tareas programadas: refrescar datos y enviar turnos. **La programación horaria se configura fuera de estas rutas**; el código del endpoint no demuestra que exista un cron activo. GitHub Releases tampoco despliega la web ni genera APK.

## Decisiones con consecuencias

- **Datos con fechas:** no persistir «abierto para siempre» por una observación puntual.
- **Backend obligatorio para agregación:** no describir la app como una web estática autónoma.
- **Supabase directo desde navegador:** RLS es una frontera de seguridad indispensable para tablas comunitarias.
- **Funciones privilegiadas:** los secretos y la autorización servidor requieren revisión específica, especialmente antes de ampliar el piloto.
- **Un módulo no equivale a una funcionalidad activa:** `ai-search.*` no aparece en el recorrido de búsqueda actual.

[Modelo de datos](02-dominio-y-datos.md) · [Integraciones y fallas](04-integraciones-y-resiliencia.md) · [Despliegue](../desarrollo/01-entorno-y-despliegue.md)
