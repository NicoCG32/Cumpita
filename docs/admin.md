# Administración

Ruta: `/revision` (solo usuarios con rol `admin`).

- **Propuestas de horario**: aprobar o rechazar horarios legales sugeridos.
- **Locales sugeridos**: al aprobar, se agregan automáticamente al feed ("Cumpitas"). El formulario avisa duplicados (nombre similar ≤400 m o mismo tipo ≤40 m) antes de enviar.
- **Locales ocultos**: desde "···" de una tarjeta, "Marcar como cerrado definitivamente". En `/revision` se listan con botón "Reactivar".

Para asignar un admin se inserta una fila en `user_roles` con el id del usuario.
