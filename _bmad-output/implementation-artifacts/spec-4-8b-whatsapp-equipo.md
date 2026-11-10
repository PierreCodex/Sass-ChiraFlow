---
title: 'Story 4.8b — El WhatsApp de cada persona del equipo y lo que entra'
type: 'feature'
created: '2026-11-10'
status: 'review'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

# Story 4.8b — El WhatsApp de cada persona del equipo y lo que entra

Segunda de las tres partes de la Story 4.8 (AD-22, FR-83, FR-85). La 4.8a dejó
el canal de salida; esta deja **el número verificado de cada persona** y **la
puerta de entrada** (webhook) con sus primeros comandos. La 4.8c suma a los
clientes (consentimiento, C-3…C-6 y recordatorios) y la alerta X-2.

## Intent

Que cada persona del equipo active su WhatsApp desde Mi perfil probando que el
número es suyo, y que lo que la gente responde al número de la plataforma se
entienda, se registre y se conteste, sin tocar código para sumar palabras.

## Decisiones

- **En la central** (`whatsapp_equipo`), no en la base del negocio: al llegar
  «ACTIVAR 482913» solo sabemos el teléfono que escribe, y de ahí hay que sacar
  persona y negocio sin recorrer todas las bases.
- **Activar = escribir el código DESDE ese número** al número del equipo. El
  código (6 dígitos, 24 h) solo vale si el remitente es el teléfono dado de
  alta: así nadie activa un número ajeno. Hasta entonces, nada sale.
- **El teléfono no es único en la tabla**: dos personas pueden dejarlo
  `pendiente` (escribir un número ajeno no bloquea a su dueño). Lo que la
  aplicación impide es que **dos lo tengan activo**: 422 «Ese número ya lo
  activó otra persona».
- **Tope del plan** `max_numeros_equipo` (Básico 1, Premium 3, prueba 3,
  Pro 10). Cuentan `pendiente` y `activo`; cambiar el propio número no gasta
  otro hueco.
- **Rutas**: `GET` y `PUT /user/whatsapp` tras `suscripcion.activa`; `DELETE`
  **fuera**: nadie debería tener que pagar para que le dejen de escribir.
- **Webhook** `POST /api/webhooks/whatsapp/{proveedor}`, con el secreto en
  `X-Tivu-Webhook` (`WHATSAPP_WEBHOOK_SECRETO`); sin secreto configurado no
  acepta nada. Responde 200 aunque ignore, para que el proveedor no reintente.
  Sin limitador: todo llega desde la misma IP interna.
- **Lector de Evolution**: `messages.upsert`; descarta lo nuestro (`fromMe`),
  grupos y estados; con los identificadores `@lid` el teléfono sale de
  `senderPn`/`remoteJidAlt`.
- **Buzón con comandos por palabra** (`config('whatsapp.comandos')`): ACTIVAR,
  AYUDA, BAJA/STOP. Una palabra admite varios atendedores en orden (con su
  historia, «ACTIVAR» a secas será reactivar la suscripción; APROBAR y CAMBIAR
  se suman igual). **Lo desconocido se registra y no se contesta**: contestar a
  todo es como dos bots acaban hablándose sin fin.
- **Todo lo que entra queda en `whatsapp_entrantes`** con su resultado y a
  nombre de quién (registro de bajas y de acciones). Idempotente por id de
  mensaje: el reintento del proveedor no se atiende dos veces.
- **Respuestas** por la cola (`ResponderWhatsapp`), desde el **mismo número** al
  que escribieron, con su ritmo y tope; como mucho 5 por teléfono y hora. Un
  fallo se registra y no se reintenta en bucle.
- **BAJA solo de lo que sale por ese número**: quien responde BAJA al de
  clientes no pierde los avisos de su trabajo. La baja de clientes, en la 4.8c.
- `Destinatario::delEquipo($user)` da el teléfono y el consentimiento a los
  avisos del equipo (C-2, P-3) cuando lleguen.

## Contrato

`docs/api-contract.md` → `GET/PUT/DELETE /user/whatsapp`, la forma
`WhatsappEquipo` y `max_numeros_equipo` en el plan.

## Pruebas (`tests/Feature/Avisos/WhatsappEquipoTest.php`, backend)

- Alta pendiente con código, vencimiento y enlace wa.me; sin número del equipo
  activo, enlace null. Formato +51 y 9 dígitos.
- Tope del plan (y la baja no ocupa hueco); cambiar el propio número; número
  activo de otra persona → 422; DELETE 204.
- Webhook sin secreto o con otro → 401; proveedor desconocido → 404.
- ACTIVAR desde ese número activa y contesta desde el del equipo; desde otro
  número, vencido o al número de clientes, no activa. `@lid` por `senderPn`.
- BAJA da de baja, registra, confirma y saca al destinatario; BAJA al de
  clientes no toca el del equipo. AYUDA con el soporte. Lo desconocido, sin
  respuesta. Lo nuestro, grupos y otros eventos, ni se registran. Reintento
  del proveedor una sola vez. Instancia ajena. Tope de respuestas. Fallo del
  proveedor sin romper el webhook.

Verificado en el navegador (local, con la cuenta de prueba): alta con el
teléfono de la ficha propuesto, pendiente con código y «Abrir WhatsApp»,
**paso solo a «Activo»** al llegar el ACTIVAR por el webhook, cambiar número
y quitar con confirmación; a 390 px el botón ocupa todo el ancho.

## Para producción

`docs/despliegue-coolify.md` (backend), paso 5 de WhatsApp: el secreto y el
webhook de cada instancia de Evolution.

## Pendiente

- La cabecera del panel desborda a 390 px («Configura tu negocio» + avatar):
  no es de esta historia; va con los arreglos de diseño.

## Depende de

- 4.8a (canales, `pedirTurno`, adaptadores, plantillas).
