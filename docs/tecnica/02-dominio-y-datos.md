# Dominio, persistencia y modelo de datos

El dominio distingue **un lugar**, **la información de sus fuentes** y **los aportes comunitarios**. La pantalla reúne esos datos en una tarjeta; la persistencia se organiza por tipo de aporte.

## Modelo conceptual

```mermaid
flowchart LR
    PLACE[Lugar · id, ubicación, categoría] --> INFO[Horario o turno procedente de una fuente]
    PLACE --> REPORT[Reportes de apertura / cierre]
    PLACE --> TAG[Etiquetas temporales]
    PLACE --> PROPOSAL[Propuestas de corrección]
    PERSON[Persona · cuenta opcional] --> REPORT
    PERSON --> TAG
    PERSON --> PROPOSAL
    ADMIN[Administrador] --> DECISION[Decisión de moderación]
    DECISION --> PROPOSAL
    classDef core fill:#fff0e5,stroke:#cf6c36,color:#263244;
    classDef side fill:#e9f0f7,stroke:#516d86,color:#263244;
    class PLACE core;
    class INFO,REPORT,TAG,PROPOSAL,PERSON,ADMIN,DECISION side;
```

La identidad de una persona es **opcional para un reporte**: `user_id` puede ser `NULL`. Esto permite participar sin cuenta; la puntuación y las funciones asociadas a una sesión son un caso distinto. El anonimato no implica que todos los datos de la aplicación carezcan de identificadores (por ejemplo, suscripciones push).

En el código, `Place` es un objeto de agregación (`src/lib/places.ts`) construido a partir de proveedores y aportes. **No existe una tabla maestra `places`** en las migraciones: los identificadores de locales son textos como `node/…`, `g/…`, `c/…` o `turno/…`. Por eso varias tablas guardan un `place_id` textual **sin clave foránea** a una entidad única.

## Modelo físico de PostgreSQL

Las migraciones `0000`–`0013` definen las siguientes tablas.

| Tabla                 | Guarda                                                      | Acceso o característica relevante                                                                              |
| --------------------- | ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `place_reports`       | Estado `open/closed`, `place_id`, fecha, `user_id` opcional | Lectura de registros recientes y creación pública; trigger limita frecuencia **solo con usuario identificado** |
| `place_tags`          | Etiqueta, local, fecha y autor opcional                     | Lectura de las últimas 3 horas; el `CHECK` SQL acepta menos etiquetas que TypeScript                           |
| `hours_proposals`     | Horarios propuestos y decisión                              | Escritura pendiente; aprobación mediante rol admin                                                             |
| `place_suggestions`   | Local faltante o feedback y revisión                        | SQL permite sugerencias de categorías `farmacia` o `botilleria`                                                |
| `hidden_places`       | Lugares excluidos de la lista y motivo                      | Lectura del listado para admins; función `get_hidden_place_ids` usada al componer el feed                      |
| `user_roles`          | Asociación de cuenta y rol                                  | Única referencia explícita a `auth.users` en estas migraciones                                                 |
| `cumpita_points`      | Apodo, puntos, cantidad de reportes                         | Escritura de puntos bloqueada al usuario por migración posterior; RPC `award_point` los recalcula              |
| `place_subscriptions` | Cuenta y local seguido                                      | RLS por propietario                                                                                            |
| `place_alerts`        | Alertas en la cuenta                                        | Creación/lectura de su propio usuario                                                                          |
| `en_route`            | Token push, local, vencimiento y secreto                    | Acceso directo reservado a service role                                                                        |
| `turno_subs`          | Token push, ciudad y secreto                                | Acceso directo reservado a service role                                                                        |
| `places_cache`        | Clave de zona, JSON de lugares y actualización              | Caché servidor con permisos de service role                                                                    |
| `ops_events`          | Métricas operativas resumidas                               | Inserción servidor; lectura administrativa                                                                     |

### Relaciones físicas relevantes

```mermaid
erDiagram
    AUTH_USERS ||--o{ USER_ROLES : "FK user_id"
    AUTH_USERS {
        uuid id PK
    }
    USER_ROLES {
        uuid id PK
        uuid user_id FK
        app_role role
    }
    PLACE_REPORTS {
        uuid id PK
        text place_id
        text status
        uuid user_id
        timestamptz created_at
    }
    PLACE_TAGS {
        uuid id PK
        text place_id
        text tag
        uuid user_id
        timestamptz created_at
    }
    HOURS_PROPOSALS {
        uuid id PK
        text place_id
        text status
        timestamptz reviewed_at
    }
    PLACE_SUGGESTIONS {
        uuid id PK
        text kind
        text category
        text status
    }
    HIDDEN_PLACES {
        text place_id PK
        text reason
    }
```

La clave foránea explícita relaciona `user_roles.user_id` con `auth.users.id`. Los demás campos `place_id` y `user_id` se asocian mediante consultas, sin restricciones de clave foránea declaradas en estas migraciones.

### Suscripciones, caché y operación

```mermaid
erDiagram
    PLACE_SUBSCRIPTIONS {
        uuid id PK
        uuid user_id
        text place_id
    }
    PLACE_ALERTS {
        uuid id PK
        uuid user_id
        text place_id
        text status
    }
    CUMPITA_POINTS {
        uuid id PK
        uuid user_id UK
        int points
        int reports_count
    }
    EN_ROUTE {
        uuid id PK
        text token
        text place_id
        timestamptz expires_at
    }
    TURNO_SUBS {
        uuid id PK
        text token UK
        text city
    }
    PLACES_CACHE {
        text key PK
        jsonb places
        timestamptz updated_at
    }
    OPS_EVENTS {
        uuid id PK
        text kind
        text source
        timestamptz created_at
    }
```

Se muestran sin relaciones porque la base no declara claves foráneas entre estas tablas. La asociación se resuelve por valores compartidos en el código.

## Referencias lógicas que no son claves foráneas

Los registros comparten identificadores de texto o UUID. El siguiente diagrama muestra esas asociaciones lógicas, resueltas mediante consultas y código.

```mermaid
flowchart LR
    P["Lugar agregado en memoria\nPlace / id textual"]
    R[(place_reports)]
    T[(place_tags)]
    H[(hours_proposals)]
    S[(place_suggestions)]
    SUB[(place_subscriptions)]
    C[(places_cache)]
    P -. "place_id" .-> R
    P -. "place_id" .-> T
    P -. "place_id" .-> H
    P -. "place_id" .-> SUB
    S -. "c/id cuando se aprueba" .-> P
    C -. "lista agregada por zona" .-> P
    classDef virtual fill:#FFF1E5,stroke:#C56A35,color:#243248,stroke-width:2px;
    classDef store fill:#E8F0F6,stroke:#52718B,color:#243248;
    class P virtual;
    class R,T,H,S,SUB,C store;
```

El código resuelve las asociaciones por `place_id`; PostgreSQL no comprueba la existencia del lugar en un catálogo maestro.

## Persistencia en el dispositivo

`localStorage` mantiene favoritos, apodo de onboarding, preferencias, la última lista de lugares, ventanas de frecuencia de reportes/etiquetas y secretos de suscripciones push. Es almacenamiento del navegador, **no** parte de PostgreSQL, y puede perderse al limpiar datos o cambiar de dispositivo.

## Autorización y evolución del esquema

Las migraciones SQL definen el esquema, los permisos, las políticas RLS, las funciones y los triggers. `drizzle/schema.ts` no contiene el modelado completo. Los tipos en `src/integrations/supabase/types.ts` permiten consumir los datos desde TypeScript; mantén ambos en consonancia con las migraciones aplicadas.

Antes de introducir categorías, etiquetas o notificaciones, actualiza de forma coordinada la interfaz, los validadores, las restricciones SQL y las pruebas. Los desajustes pendientes se recogen en [operación y calidad](../desarrollo/02-operacion-calidad-y-seguridad.md).

[Reglas del dominio](03-reglas-y-flujos.md) · [Seguridad y operaciones](../desarrollo/02-operacion-calidad-y-seguridad.md)
