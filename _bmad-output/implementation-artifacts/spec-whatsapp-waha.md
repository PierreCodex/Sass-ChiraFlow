---
title: 'WhatsApp por WAHA y quien oculta su número (@lid)'
type: 'fix'
created: '2026-11-11'
status: 'review'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

# WhatsApp por WAHA y quien oculta su número (`@lid`)

Arreglo de la Story 4.8 (AD-22), encontrado al conectar producción tras la
4.8b.

## Qué pasó

Al escribir `AYUDA` al número del equipo no contestó nada. El mensaje llegaba a
Evolution y se descifraba, pero venía de `…@lid`, sin `senderPn` ni
`remoteJidAlt`. Con los nombres de usuario de WhatsApp, **cada vez más gente
escribe así y no deja ver su número**. El lector de la 4.8b descartaba el
mensaje sin registrarlo.

Evolution 2.3.7 tampoco da el teléfono de un número (`whatsappNumbers` sin
`lid`), y no envía a un `@lid`: `onWhatsApp` dice `exists: false` y corta el
envío. Eso se corrige en su 2.4.0-rc2, que es un prelanzamiento y trae
licencia.

## Decisiones

- **WAHA sustituye a Evolution**, con el motor GOWS:
  - `GET /api/{sesión}/lids/{lid}` da el teléfono detrás de un `@lid`;
  - envía a `…@lid`;
  - sesiones ilimitadas en la versión gratis desde la 2026.6.1;
  - webhook por sesión con cabeceras propias, y evento `session.status` para
    la X-2.
- Cada número es una sesión: `canales_whatsapp.instancia` = nombre de la
  sesión. `proveedor` pasa a texto, con `waha | meta | kapso`, y los números
  de Evolution se migran a `waha`.
- **El chat es la identidad, el teléfono es un dato.** `MensajeEntrante` lleva:
  - `chat` (`…@c.us` o `…@lid`), que es a donde se contesta;
  - `telefono`, si se conoce.
- **ACTIVAR:**
  - Si se conoce el teléfono, sea directo o porque WAHA lo resolvió, el código
    tiene que ser de ese número, como en la 4.8b.
  - Si no se conoce, basta el código, y el chat queda en
    `whatsapp_equipo.chat_id`.
  - **Los avisos van a `chat_id`**: le llegan a quien envió el código, que es
    quien consiente, y nunca al dueño de un número ajeno escrito en Mi perfil.
  - `whatsapp_equipo.telefono_verificado` dice si el código llegó desde ese
    teléfono. **Solo un teléfono comprobado bloquea**: quien activa desde un
    `@lid` sin teléfono no le quita el número a su dueño real, que puede darlo
    de alta y activarlo desde su teléfono. Los activos de la 4.8b se marcan
    comprobados en la migración.
- **Contra probar códigos:**
  - 5 fallos por chat y hora; después ni el correcto activa;
  - los códigos pendientes no se repiten;
  - si dos coincidieran, no se activa ninguno.
- AYUDA y BAJA reconocen a la persona por su chat o por su teléfono
  comprobado.
- El tope de respuestas (5 por hora) va por chat.
- `notificacion_envios.destinatario_telefono` pasa a 80 caracteres, en la
  central y en cada negocio: un `@lid` no cabe en 20.
- Si WAHA no responde al pedir el teléfono, el mensaje se atiende igual, sin
  teléfono.

## Contrato

Sin cambios para el frontend: `WhatsappEquipo` sigue igual.

## Pruebas (backend)

`tests/Feature/Avisos/WhatsappEquipoTest.php` y `WhatsappTest.php`; 70 en
Avisos y Provisioning, en verde:

- payloads de WAHA;
- `@lid` con teléfono resuelto (activa y escribe al chat);
- `@lid` con teléfono de otro (no activa);
- `@lid` sin teléfono (activa por código, BAJA desde el chat);
- un teléfono activado sin comprobar no bloquea a su dueño;
- WAHA caído;
- tope de intentos;
- el adaptador (`sendText` y `sendImage`, sesión, `X-Api-Key`, chat `@c.us`
  y `@lid`).

## Para producción

`docs/despliegue-coolify.md` (backend), sección WhatsApp. El recurso `waha`
se crea con `docs/infra/waha/docker-compose.yml`, y después:

1. variables `WAHA_URL` y `WAHA_API_KEY` en el backend;
2. una sesión por número;
3. el webhook de cada sesión;
4. borrar el recurso `evolution` y sus variables.

## Depende de

- 4.8a, 4.8b.
