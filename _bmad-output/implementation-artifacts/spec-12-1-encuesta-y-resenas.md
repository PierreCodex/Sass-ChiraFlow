---
title: 'Story 12.1 — Encuesta de satisfacción y reseñas'
type: 'feature'
created: '2026-11-26'
status: 'in-progress'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

# Story 12.1 — Encuesta de satisfacción y reseñas

Épica 12 (lo que Premium promete y aún no existe). Función de plan
`encuesta_satisfaccion`, que ya está en `CatalogoFunciones::PREMIUM_EXTRA`.
Decisiones y textos aprobados por Jean el 2026-11-26.

## Decisiones (2026-11-26)

1. **Publicación: todas las que el cliente permita.** En la encuesta el cliente
   marca «Pueden mostrar mi opinión…» (nace **desmarcada**, Ley 29733: el
   consentimiento es expreso). Si la marca, sale sola en la tienda, buena o
   mala, como «Luis J.». El negocio **responde en público pero no borra**; solo
   soporte de tivu puede ocultar un abuso.
2. **La media de la tienda cuenta todas las respuestas**, también las que no
   dieron permiso (solo se publica su número, no su texto ni su nombre). Así
   la media no se maquilla. La encuesta se lo dice al cliente.
3. **Momento:** 2 h después de marcar la cita como **atendida**. Si esa hora
   cae entre las 21:00 y las 8:00 del negocio, sale a las **9:00** del día
   siguiente. **Una encuesta cada 30 días** por cliente como máximo.
4. **No a citas viejas:** si la cita se marca atendida más de 48 h después de
   su hora, no se envía (cerrar citas atrasadas en bloque no dispara encuestas).
5. **Textos aprobados** (abajo). La encuesta es: estrellas 1–5, comentario
   opcional (máx. 500) y el permiso para publicarla.

## Qué hace

### Envío

- `CitaService`, al pasar una cita a `completada` (junto a sellos y stock):
  `AgendaDeEncuestas::sincronizar()` programa una `TareaProgramada` tipo
  `encuesta`, clave `encuesta:cita:{id}`. Si la cita sale de `completada`, se
  anula (idempotente, como `AgendaDeRecordatorios`).
- Requisitos para programar **y otra vez al ejecutar** (`EjecutarTarea`):
  - el plan incluye `encuesta_satisfaccion` (en vivo);
  - el negocio no apagó la preferencia de clientes `encuesta` (defecto: sí);
  - la cita sigue `completada`, tiene cliente y no tiene ya encuesta;
  - el cliente no recibió otra en los últimos 30 días;
  - la cita empezó hace menos de 48 h al marcarse atendida.
- Al ejecutar: crea la fila `encuestas` (`enviada_el`, `vence_el` = +14 días)
  y anota el evento `encuesta.creada`. El Notificador manda **E-1** por correo
  y, si el cliente aceptó WhatsApp y hay cupo, por WhatsApp (el silencio de la
  noche ya lo respeta `EnviarNotificacion`).
- **Enlace:** como `EnlaceDeCita`: cada mensaje crea el suyo (40 caracteres al
  azar, en la base solo su sha256, tabla `accesos_encuesta`). Sin ids:
  `{tienda}/opinion/{secreto}`. Vale hasta `vence_el` y **una sola respuesta**.

### La encuesta (pública, sin sesión)

- `{slug}.tivuapp.store/opinion/{secreto}` con la marca del negocio
  (Apariencia): servicio, profesional, fecha y sede; estrellas; comentario;
  casilla de permiso.
- Las estrellas del correo llevan `?nota=1..5`: abren la encuesta con esa nota
  marcada. **Abrir no guarda nada** (GET sin efectos).
- Ya respondida: «Ya nos diste tu opinión. ¡Gracias!» con lo que respondió.
  Vencida: 410 con el contacto del negocio.

### Reseñas en la tienda

- `GET /publico/{slug}/sucursal/{sede}`: si el plan trae la función,
  `resenas` = `{ promedio, total, distribucion }` de **todas** las respuestas
  de esa sede (menos las ocultas por soporte), y `ultimas_resenas` = las 6
  últimas **publicadas** (`publicar` y no ocultas), con su respuesta. Sin
  respuestas: `resenas: null` (como hoy: nunca números de ejemplo).
- `cliente` = nombre + inicial del apellido («Luis J.»), nunca el teléfono.

### Panel: Clientes → Opiniones

- Función `encuesta_satisfaccion` (sin ella, 403 `{ funcion }`). Permiso
  `clientes` ver para leer y gestionar para responder. Quien tiene
  `solo_propios` ve solo las de sus citas; el alcance de sedes se respeta.
- Resumen (media, total, distribución, enviadas y tasa de respuesta) y lista
  filtrable por sede, profesional y estrellas, con búsqueda por cliente.
- **Responder** en público (máx. 500); se puede editar. No hay borrar.
- Preferencia nueva en Configuración → Notificaciones (clientes):
  «Encuesta después de la visita», plantilla E-1, encendida por defecto.

### Plataforma (soporte)

- Ocultar / volver a mostrar una reseña por abuso, con motivo. Oculta: no sale
  en la tienda ni cuenta en la media pública; el dueño la sigue viendo marcada.

## Datos (base del negocio, migración nueva)

`encuestas`: `id`, `cita_id` (único), `cliente_id`, `local_id`,
`profesional_id` null, `servicio` (texto, para la reseña), `enviada_el`,
`vence_el`, `respondida_el` null, `puntuacion` (1–5) null, `comentario` null,
`publicar` (bool, false), `respuesta` null, `respondida_por_negocio_el` null,
`oculta_el` null, `motivo_oculta` null, timestamps. Índices
`(local_id, respondida_el)` y `(cliente_id, enviada_el)`.

`accesos_encuesta`: `id`, `encuesta_id`, `token_hash` (único), timestamps.

## Textos aprobados (2026-11-26)

**WhatsApp E-1** (solo con consentimiento):

> ¡Hola, {cliente}! 😊 Gracias por venir hoy a *{negocio}*. ¿Cómo te fue con
> *{servicio}*? Cuéntanos en 10 segundos 👉 {enlace}

Si la encuesta sale al día siguiente (decisión 3), «Gracias por venir hoy»
pasa a «Gracias por tu visita».

**Correo** — Asunto: «¿Cómo te fue en {negocio}?»

> Hola, {cliente}:
> Gracias por venir hoy. ¿Cómo te fue con {servicio} con {profesional}?
> ★ ★ ★ ★ ★ (cada estrella abre la encuesta con esa nota marcada)
> Tu opinión nos ayuda a mejorar. Son 10 segundos.
> [Dar mi opinión]
> El enlace sirve una sola vez y vence en 14 días.

## Contrato

`docs/api-contract.md` § «Encuestas y reseñas — Story 12.1».

## Pruebas (backend)

- Completar programa la tarea a +2 h; de noche, a las 9:00; volver atrás la anula.
- Sin la función, con la preferencia apagada, sin cliente, cita de hace más de
  48 h o encuesta en los últimos 30 días: no se programa (o se descarta al ejecutar).
- Ejecutar crea la encuesta y el evento; E-1 sale por correo (y WhatsApp con consentimiento).
- Encuesta pública: ver no guarda; responder guarda y cierra el enlace (409 la
  segunda); vencida 410; desconocida 404; en la base solo la huella.
- Tienda: media con todas, lista solo publicadas y no ocultas; sin respuestas `null`.
- Panel: 403 sin la función; `solo_propios` ve las suyas; responder; no hay DELETE.
- Plataforma: ocultar la saca de la tienda y de la media.

## Fuera

- Preguntas configurables por el negocio, NPS o calificar por profesional.
- Pedir reseña en Google.
- Encuestas a citas del panel sin cliente.
