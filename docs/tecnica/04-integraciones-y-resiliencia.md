# Integraciones, caché y recuperación

Cumpita combina fuentes externas y distingue entre datos recientes, copias antiguas y consultas fallidas.

## Origen de la información

| Fuente                                      | Qué aporta                                                                  | Condición relevante                                                                     |
| ------------------------------------------- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| **Google Places, opcional**                 | Lugares y estado/horario disponible                                         | Se usa cuando existe `GOOGLE_PLACES_API_KEY`; si falla, vuelve a Overpass               |
| **OpenStreetMap vía Overpass**              | Lugares y etiquetas `opening_hours`                                         | Consulta alrededor de 4 km, con cinco réplicas candidatas y 12 s de límite en el código |
| **Catálogo MINSAL incluido en el código**   | Farmacias y horarios del conjunto embebido                                  | Es una copia incorporada en `minsal-data.ts`, no una consulta viva a la API oficial     |
| **mifarmaciadeturno.cl**                    | Turnos por ciudad a partir de JSON-LD                                       | Consulta externa que puede cambiar formato o fallar; caché de 2 h                       |
| **Calendario de Calama en código**          | Turno calculado cuando se utiliza esa ruta de respaldo                      | Es una rotación local codificada, no una respuesta oficial consultada en ese momento    |
| **Supabase**                                | Reportes, etiquetas, horarios aprobados, sugerencias, bajas, roles y cachés | Las políticas RLS y las claves de servidor delimitan el acceso                          |
| **Leaflet + teselas OSM + OSRM**            | Mapa y cálculo de ruta                                                      | La carga de teselas y el cálculo de rutas dependen de servicios externos                |
| **Firebase Messaging vía conector Lovable** | Avisos web optativos                                                        | Requiere credenciales, dispositivo admitido, token, permiso y backend                   |

La búsqueda activa es textual y local. Los módulos `ai-search.functions.ts` y `ai-search.server.ts` contienen una integración de IA que la interfaz no invoca.

## Secuencia de consulta y combinación

```mermaid
sequenceDiagram
    autonumber
    actor U as Persona
    participant UI as Cliente
    participant API as getNearbyPlaces
    participant CACHE as Memoria / places_cache
    participant SOURCE as Google (opcional) u Overpass
    participant DB as Supabase y turnos
    U->>UI: Cambia zona o consulta cerca
    UI->>API: lat, lng
    API->>CACHE: Buscar zona redondeada
    alt Caché vigente (< 6 h)
        CACHE-->>API: Lista guardada
    else Caché antigua disponible
        CACHE-->>API: Lista anterior marcada stale
        API-->>SOURCE: Intentar refresco asíncrono
    else Sin caché
        API->>SOURCE: Consultar fuente
        SOURCE-->>API: Lugares o error
        API->>CACHE: Guardar si hay datos válidos
    end
    par Enriquecer resultados
        API->>DB: Locales de comunidad, horarios y exclusiones
    and Consultar turnos
        API->>DB: Obtener turnos con caché y fuente externa
    end
    API-->>UI: Lugares, indicador de turno y metadatos de frescura
    UI-->>U: Feed o mensaje de error / copia local
```

En caso de caché antigua, el código **intenta** refrescar en segundo plano; su finalización depende de la duración permitida por el runtime. No es una tarea persistente garantizada por una cola. Del mismo modo, los `Promise.race` de consultas auxiliares limitan cuánto espera el agregado, pero no necesariamente cancelan la petición externa subyacente.

## Comportamiento cuando falla algo

```mermaid
flowchart TD
    A[Consulta de una zona] --> B{¿Caché fresca?}
    B -->|Sí| C[Devolverla]
    B -->|No| D{¿Caché antigua?}
    D -->|Sí| E[Devolverla como antigua e intentar refrescar]
    D -->|No| F[Consultar proveedor]
    F --> G{¿Hay lugares?}
    G -->|Sí| H[Guardar y devolver]
    G -->|No| I{¿Hay datos de respaldo?}
    I -->|Sí| J[Mostrar copia heredada o MINSAL incorporado]
    I -->|No| K[Devolver error]
    classDef ok fill:#eef5e9,stroke:#648353,color:#263244;
    classDef stale fill:#fff3e7,stroke:#bf6930,color:#263244;
    classDef err fill:#f8eded,stroke:#a34b51,color:#263244;
    class C,H ok;
    class E,J stale;
    class K err;
```

La persistencia `places_cache` se almacena por clave de zona (`v3:lat,lng` redondeadas a dos decimales), y también conserva claves de turnos por ciudad. El cliente guarda, por separado, la última lista que obtuvo y puede usarla si la consulta falla.

## Automatizaciones y notificaciones

Los endpoints son **POST** protegidos por un secreto de cron, con posibilidad de rotación del secreto anterior:

- `/api/public/cron/refresh`: consulta turnos e intenta refrescar dos zonas antiguas por ejecución.
- `/api/public/cron/turnos`: recorre ciudades con suscripciones y envía mensajes con turnos disponibles si FCM está configurado.

El horario de invocación —por ejemplo, cada hora o a cierta hora de Chile— **no queda definido en estas funciones**. Debe verificarse en la plataforma que programa las solicitudes. Si se usan expresiones UTC, considerar horario de verano/invierno de `America/Santiago`; una hora UTC fija no equivale a las 20:00 chilenas durante todo el año.

Los avisos «voy en camino» duran 45 min y buscan reportes de cierre de los últimos 3 min antes de intentar enviar push. Las suscripciones de apertura usan avisos en primer plano y registros en `place_alerts`.

## Límites operativos

`ops_events` registra tipo, origen, resultado, duración opcional y un detalle breve, sin campos de coordenadas o identidad. Las suscripciones push almacenan tokens de dispositivo y secretos asociados; limita su acceso a las funciones de servidor correspondientes.

[Arquitectura](01-arquitectura.md) · [Operación y seguridad](../desarrollo/02-operacion-calidad-y-seguridad.md)
