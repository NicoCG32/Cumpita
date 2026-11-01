# Experiencia de uso y funciones

## De la duda al local

Al entrar por primera vez se presenta un recorrido de tres pasos: elegir una zona o el GPS, conocer la lógica comunitaria y escoger un apodo. Luego se llega al feed. En visitas posteriores el asistente inicial se omite según una marca guardada en el navegador.

```mermaid
flowchart TD
    A([Primera visita]) --> B[Elegir zona o GPS]
    B --> C[Conocer cómo funcionan los reportes]
    C --> D[Elegir apodo]
    D --> E[Feed de locales]
    R([Visita posterior]) --> E
    E --> F{¿Qué necesito?}
    F -->|Explorar| G[Filtrar por categoría, horario o cercanía]
    F -->|Ubicar| H[Ver mapa y ruta]
    F -->|Compartir| I[Abrir ficha compartible]
    G --> J[Consultar estado, fuente y antigüedad]
    H --> J
    I --> J
    J --> K{¿Estoy cerca y tengo GPS?}
    K -->|Sí| L[Reportar abierto o cerrado]
    K -->|No| M[Consultar sin reportar]
    L --> N[La comunidad ve el nuevo dato]
    classDef action fill:#fff3e9,stroke:#c65f29,color:#263244;
    classDef decision fill:#e8eef5,stroke:#476381,color:#263244;
    class B,C,D,E,G,H,I,J,L,M,N action;
    class F,K decision;
```

Se puede **reportar sin crear una cuenta**. El apodo se guarda en el navegador; los puntos y otras funciones de cuenta requieren iniciar sesión.

## Capacidades y condiciones

| Acción                   | Cómo está planteada                                          | Qué hay que tener presente                                                                                     |
| ------------------------ | ------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------- |
| Consultar lugares        | Feed ordenado por distancia, búsqueda textual y categorías   | Se muestran hasta 40 resultados en la lista construida por la pantalla; los datos proceden de fuentes y cachés |
| Ubicarse                 | Zonas manuales o geolocalización                             | El permiso GPS es opcional para consultar, pero necesario para habilitar el botón de reporte                   |
| Consultar estados        | Horario, turno disponible o reporte reciente                 | Un reporte vence a la hora; el horario publicado puede estar incompleto                                        |
| Reportar abierto/cerrado | Sin cuenta, a 300 m o menos según la ubicación del navegador | Requiere permiso de ubicación; consulta los [controles de reporte](../tecnica/03-reglas-y-flujos.md)           |
| Añadir una etiqueta      | Información breve sobre pago, fila o productos               | Algunas etiquetas visibles todavía no tienen soporte en el `CHECK` de la base de datos                         |
| Sugerir un local         | Formulario con advertencia de posibles duplicados            | La base de datos solo acepta actualmente dos categorías para nuevas sugerencias                                |
| Corregir horarios        | Propuesta con nota de evidencia                              | La publicación requiere revisión administrativa                                                                |
| Guardar favoritos        | Preferencia local del navegador                              | No se sincroniza automáticamente entre dispositivos                                                            |
| Activar avisos           | Suscripciones, aviso en camino y turnos diarios              | Depende de permisos, FCM y de la ejecución del backend y tareas programadas                                    |
| Instalar la PWA          | Instalación desde el navegador                               | Depende de la compatibilidad del navegador y el sistema operativo                                              |

La búsqueda con IA no está activada en la interfaz, aunque existen módulos `ai-search.*`. La búsqueda que se usa es textual, normalizada para ignorar tildes y mayúsculas.

## Sobre la confianza del estado

La tarjeta distingue horarios, turnos y reportes comunitarios. Cada reporte indica cuándo se observó el estado del local. Si faltan datos, se muestra el estado como desconocido.

El mapa permite ubicar un local y consultar una ruta para llegar.

## Sin conexión

La PWA dispone de service worker y conserva la última lista de lugares en el navegador. Si una consulta falla, puede mostrar esa copia con un aviso de desconexión. Para usarla, los datos y la navegación deben haberse guardado previamente; pueden estar desactualizados.

[Reglas exactas](../tecnica/03-reglas-y-flujos.md) · [Datos y su origen](../tecnica/04-integraciones-y-resiliencia.md)
