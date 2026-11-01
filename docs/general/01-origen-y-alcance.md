# Origen, problema y alcance

## Una idea que empezó en casa

La primera motivación para Cumpita fue una conversación con mi padre. Quería resolver algo tan sencillo como saber si una tienda estaba abierta antes de salir. Parece una pregunta menor, hasta que el horario de internet falla, la tienda cerró antes o uno necesita comprar algo de noche.

Pensé en juntar dos cosas: **información publicada** y **observaciones recientes de personas que están cerca**. Ninguna debería hacerse pasar por infalible. Si alguien confirma que un local estaba abierto, la aplicación debe indicar cuándo ocurrió, porque mañana —o incluso en una hora— puede ser distinto.

## Cómo nació y cómo lo estoy desarrollando

Cumpita es una iniciativa **personal e independiente**. Soy el único responsable de su desarrollo y he trabajado directamente en **Lovable**, planteando cambios e iterando sobre los resultados. Mi padre me contó el problema que terminó motivando la idea; eso no lo convierte en integrante del equipo de desarrollo. No es un proyecto universitario ni la entrega de un curso.

## Participar sin cuenta

Quiero que alguien que está frente a un local pueda avisar rápidamente si lo encontró abierto o cerrado, **sin tener que registrarse**. La referencia es la colaboración ágil que conozco de aplicaciones como Waze, no una afirmación de que Cumpita tenga su mismo sistema de validación.

Este anonimato es una decisión de diseño, no una característica provisional. Su consecuencia es que debo proteger la calidad de los datos sin hacer depender la participación de una cuenta. Hoy existen controles en la interfaz, pero todavía no hay una protección de frecuencia equivalente en el servidor para todos los reportes anónimos. [Explico esa limitación con más detalle en el área técnica](../tecnica/03-reglas-y-flujos.md).

## A quién quiero ayudar

Primero, a quien busca una farmacia, botillería, almacén, librería o ferretería. También a quienes aportan una confirmación o proponen corregir un horario. Los propios comercios pueden beneficiarse de aparecer con información más útil, aunque no son quienes controlan el orden de los resultados.

En el código hay zonas predeterminadas para **Calama, La Serena y Coquimbo**. El usuario también puede utilizar GPS; esto no significa que la precisión o la cobertura de datos estén garantizadas en toda la ciudad.

## Qué propone Cumpita

- Consultar lugares cercanos y su información disponible, con lista y mapa.
- Contrastar horarios y turnos con reportes de abierto/cerrado que duran una hora en la interfaz.
- Compartir una ficha y proponer nuevos lugares o correcciones para revisión.
- Guardar favoritos y, en determinados casos, activar avisos web.

No pretendo afirmar que cada comercio está abierto con certeza. Es una ayuda para **decidir mejor, con señales y su antigüedad a la vista**, no un servicio de verificación presencial.

## Situación del proyecto

El repositorio contiene una aplicación web con soporte PWA y un backend que depende de servicios externos. El empaquetado como APK está fuera del alcance implementado en el material revisado. Además, hay diferencias entre la UI y algunas restricciones de la base de datos que deben corregirse antes de prometer una experiencia uniforme.

Para comprobar su utilidad real, me interesa medir con cuidado cuánto tardan las consultas, cuántas respuestas contienen información reciente y si las personas consideran que el dato las ayudó. **No dispongo de mediciones verificadas de viajes evitados, usuarios activos o cobertura** en este archivo; no voy a inventarlas.

[Cómo se usa](02-experiencia-de-uso.md) · [Qué falta validar](../AUDITORIA.md)
