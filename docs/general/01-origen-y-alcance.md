# Origen, problema y alcance

## Una idea que empezó en casa

La primera motivación para Cumpita fue una conversación con mi padre. Quería resolver algo tan sencillo como saber si una tienda estaba abierta antes de salir. Parece una pregunta menor, hasta que el horario de internet falla, la tienda cerró antes o uno necesita comprar algo de noche.

Pensé en juntar dos cosas: **información publicada** y **observaciones recientes de personas que están cerca**. Si alguien confirma que un local estaba abierto, la aplicación muestra cuándo ocurrió para que quien consulta sepa qué tan reciente es el dato.

## Cómo nació y cómo lo estoy desarrollando

Cumpita es una iniciativa **personal e independiente**. La desarrollo en **Lovable**: planteo cambios, reviso el resultado y ajusto lo necesario.

## Participar sin cuenta

Quiero que alguien que está frente a un local pueda avisar rápidamente si lo encontró abierto o cerrado, **sin tener que registrarse**. Me inspira la participación sencilla de aplicaciones comunitarias como Waze.

La participación sin cuenta forma parte del diseño. Los [controles de reporte y sus límites](../tecnica/03-reglas-y-flujos.md) se describen en la guía técnica.

## A quién quiero ayudar

Primero, a quien busca una farmacia, botillería, almacén, librería o ferretería. También a quienes aportan una confirmación o proponen corregir un horario. Los propios comercios pueden beneficiarse de aparecer con información más útil, aunque no son quienes controlan el orden de los resultados.

Las zonas predeterminadas son **Calama, La Serena y Coquimbo**. También se puede consultar mediante GPS; la cobertura depende de los datos disponibles en cada zona.

## Qué propone Cumpita

- Consultar lugares cercanos y su información disponible, con lista y mapa.
- Contrastar horarios y turnos con reportes de abierto/cerrado que duran una hora en la interfaz.
- Compartir una ficha y proponer nuevos lugares o correcciones para revisión.
- Guardar favoritos y, en determinados casos, activar avisos web.

La fuente y antigüedad de cada señal ayudan a decidir dónde ir. Un horario publicado o un reporte reciente pueden cambiar antes de llegar al local.

## Situación del proyecto

El proyecto está en fase piloto web/PWA. Las próximas mejoras se centran en la consistencia de los datos, la protección de los aportes comunitarios y las pruebas de uso. El empaquetado Android está pendiente.

Me interesa medir cuánto tardan las consultas, cuántas respuestas contienen información reciente y si el dato ayuda a las personas a decidir.

[Cómo se usa](02-experiencia-de-uso.md) · [Próximos pasos](../desarrollo/03-evolucion.md)
