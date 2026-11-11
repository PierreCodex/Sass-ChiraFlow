---
title: 'Story 4.8c — El WhatsApp de los clientes y la alerta de un número caído'
type: 'feature'
created: '2026-11-11'
status: 'review'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

# Story 4.8c — El WhatsApp de los clientes y la alerta de un número caído

Tercera parte de la Story 4.8 (AD-22, FR-83, FR-85). La 4.8a dejó el canal de
salida, la 4.8b el WhatsApp del equipo y la puerta de entrada, y el arreglo
`spec-whatsapp-waha.md` cambió Evolution por WAHA. Esta suma **a los clientes**:

- su consentimiento;
- sus avisos;
- lo que responden;
- la alerta **X-2** de un número caído.

## Alcance

| Qué | Dónde |
|---|---|
| Casilla «Recibir avisos de sus citas por WhatsApp» | Nueva cita y Nuevo cliente en el panel. La de la tienda queda en el contrato y la conecta la **6.7**, porque la reserva pública aún no existe |
| **C-4** por WhatsApp (te agendaron una cita) | Sale desde ya |
| Textos de **C-3, C-5, C-6, C-8, C-9** | Escritos y probados; sus disparadores llegan con la **4.5** (confirmar, reprogramar, cancelar) y la **4.4** (recordatorios), que solo implementan `ConWhatsapp` con `DatosCita` |
| CAMBIAR, BAJA y AYUDA en el número de clientes | Sí |
| 👍 a lo que no se entiende | Sí |
| X-2 por `session.status` de WAHA | Sí |

## Decisiones

- **El consentimiento es del cliente, no de la cita.** Se guarda en `clientes`:
  - `whatsapp_consentimiento_at`;
  - `whatsapp_consentimiento_origen` (`panel` o `tienda`).

  Sin la clave en el payload no se toca; `true` la marca y `false` la retira.
- **Solo con la cita confirmada** (AD-22). Una cita pendiente no llega a
  WhatsApp: el envío queda `omitido` con `cita_sin_confirmar` y su aviso será la
  C-3. El aviso lo indica lanzando `WhatsappNoAplica` desde `mensajeWhatsapp()`,
  al momento de enviar.
- **Teléfono internacional o nada.** Un móvil peruano de 9 dígitos que empieza
  por 9 recibe el +51, y un número escrito con `+` se deja tal cual. Lo demás
  («999», un fijo) no recibe WhatsApp: escribir a un número adivinado es
  escribirle a otra persona.
- **La consulta del consentimiento se repite al enviar.** Entre el aviso y el
  envío, que puede esperar a la apertura, el cliente pudo responder BAJA.
- **`whatsapp_clientes`** (central) guarda el último aviso de cada negocio a
  cada teléfono, con su cita. Es lo que dice de qué cita habla un CAMBIAR o una
  BAJA, porque el número de clientes es uno para todos los negocios.
- **BAJA en el número de clientes vale para todos los negocios** (decidido por
  el equipo el 2026-11-11). El chat es uno solo y la persona pidió que se
  callara.
  - Se registra en `whatsapp_bajas` (central).
  - Se retira la casilla en cada negocio que le escribió.
  - **Volver a marcar la casilla después es un consentimiento nuevo:** la fecha
    del consentimiento tiene que ser posterior a la de la baja.
  - BAJA al número del equipo sigue tocando solo lo del equipo, y al revés.
- **CAMBIAR.** Hasta la 6.8 («Gestionar mi cita») no hay enlace, así que se
  responde con el teléfono del negocio, en texto y como **tarjeta de contacto**.
  El teléfono se toma de la sede; si no tiene, el WhatsApp del negocio y luego
  su teléfono. Sin aviso previo, la respuesta dice que no encontró la cita. En
  el número del equipo CAMBIAR no es un comando.
- **AYUDA en el número de clientes** habla de CAMBIAR y BAJA.
- **Lo que no se entiende recibe un 👍**, como mucho una vez al día por chat
  (`whatsapp.reaccion_desconocido`). No se contesta con texto, para que dos
  bots no acaben hablándose.
- **Extras de WAHA:**
  - «Escribiendo…» de 2 a 4 s antes de cada mensaje
    (`whatsapp.escribiendo_segundos`);
  - **ubicación** de la sede después de C-4 (y de C-3/C-8 cuando lleguen), si
    la sede tiene coordenadas;
  - **tarjeta de contacto** en CAMBIAR.

  Si un extra falla, el texto ya salió y no se reintenta: se registra y ya.
- **Una línea con un dato que falta no sale.** «📍 dirección», «💵 Pagas en el
  local» o «Motivo» desaparecen si no hay dato.
- **X-2.** Con `session.status` de WAHA:
  - FAILED o SCAN_QR_CODE en un número `activo` lo pasan a `caido`, con correo
    a `whatsapp.alertas` (`TIVU_ALERTAS`);
  - WORKING en uno `caido` lo devuelve a `activo`;
  - STOPPED y STARTING no cuentan, porque pasan en cada reinicio de WAHA;
  - `calentando` y `retirado` no se tocan.

  Mientras está caído, los avisos de ese uso quedan `omitido`
  (`sin_numero_activo`) y siguen por correo. Pasar el uso a otro número es
  `whatsapp:numero cambiar`; la pantalla llega con la épica 8.

## Mensajes (aprobados el 2026-11-11)

En negrita lo clave: negocio, servicio, fecha, hora, monto y la palabra a
responder. El nombre del cliente va sin negrita. El primer mensaje no lleva
enlace y termina con una pregunta.

**El emoji del servicio sale del rubro del negocio** (su categoría): 💈
barbería, 🦷 clínica dental, 🏋️ gimnasio… No sabemos qué tipo de negocio se
une, y «✂️ Limpieza dental» quedaría raro. «Otro», sin categoría o una
categoría nueva sin emoji usan ✨. La tabla está en `config/whatsapp.php`
(`emojis_por_categoria`). En los ejemplos de abajo, ✂️ es ese emoji.

**Los negocios no reescriben estos textos:** los personalizan con la 4.6 (nota
del negocio y emoji, según el plan). Ver el cambio del 2026-11-11 en la 4.6
(`epics.md`).

| Plantilla | Texto (ejemplo) |
|---|---|
| C-3 | ✅ ¡Listo, Lucía! Tu cita en **Barbería Pepito** está **confirmada**: ✂️ **Corte clásico** con Carlos · 📅 **Lunes 9 de noviembre** · **10:00** · 📍 Av. Larco 745 · 💵 Pagas en el local: **S/ 25.00** · ¿Necesitas cambiar algo? Responde **CAMBIAR**. |
| C-4 | 📅 Hola Lucía, **Barbería Pepito** te agendó una cita: ✂️ **Corte clásico** con Carlos · 🗓️ **Lunes 9 de noviembre** · **10:00** · 📍 … · ¿Necesitas cambiar algo? Responde **CAMBIAR**. |
| C-5 | 🔄 Lucía, tu cita en **Barbería Pepito** cambió de hora: ~~Lunes 9 · 10:00~~ ➡️ **Martes 10 de noviembre · 16:30** · ¿Esta hora no te sirve? Responde **CAMBIAR**. |
| C-6 | ❌ Lucía, tu cita en **Barbería Pepito** del **lunes 9** a las **10:00** se canceló. Motivo: … · Cuando quieras, reserva otra hora. ¡Te esperamos! |
| C-8 | ⏰ Lucía, **mañana** tienes tu cita en **Barbería Pepito**: ✂️ **Corte clásico** con Carlos · **10:00** · 📍 … · ¿Necesitas cambiar algo? Responde **CAMBIAR**. |
| C-9 | ⏰ Lucía, en **2 horas** es tu cita en **Barbería Pepito** (**10:00** con Carlos). 📍 … ¡Te esperamos! |
| W-CAMBIAR | Para cambiar o cancelar tu cita en **Barbería Pepito**, escríbeles o llámalos: 📞 **+51 955 555 555** (+ tarjeta) |
| W-BAJA-CLIENTE | Listo, Lucía. Ya no te enviaremos avisos de tus citas por WhatsApp desde este número. Te seguirán llegando por **correo**. 📩 _Si algún día quieres volver a recibirlos, marca la casilla al reservar._ |
| W-AYUDA-CLIENTES | 👋 Hola, este es el número de avisos de citas de **tivu**. Puedes responder: • **CAMBIAR** … • **BAJA** … |

El texto exacto vive en `config/whatsapp.php` (backend).

## Contrato

`docs/api-contract.md`:

- `Cliente.acepta_whatsapp`;
- `Cita.cliente_acepta_whatsapp`;
- `acepta_whatsapp?` en los payloads de cliente y de cita;
- `acepta_whatsapp` en la reserva pública (para la 6.7).

## Pruebas (backend)

`tests/Feature/Avisos/WhatsappClientesTest.php`:

- C-4 con casilla y cita confirmada: correo, WhatsApp desde el número de
  clientes con su texto, y anotación en `whatsapp_clientes`;
- dirección y ubicación de la sede;
- cita pendiente → `cita_sin_confirmar`;
- sin casilla → `sin_consentimiento_whatsapp`;
- teléfono no internacional → sin WhatsApp; formato del teléfono;
- la casilla en la API: guardar, retirar, sin clave no se toca;
- CAMBIAR con contacto; sin cita previa; en el número del equipo → 👍;
- BAJA: calla el chat, retira la casilla y confirma con el nombre; el
  consentimiento posterior vale; una baja anterior al consentimiento se respeta;
- AYUDA del número de clientes;
- 👍 una vez al día;
- X-2: FAILED → `caido` y los avisos siguen por correo; WORKING → `activo`;
  STOPPED y `calentando` no cambian;
- líneas que faltan y el tachado de C-5;
- el adaptador: «escribiendo…», texto, ubicación, contacto y reacción; si la
  ubicación falla, el texto ya salió.

## Frontend

- `CasillaWhatsapp` (features/clientes), en `ClienteFormDialog` y
  `CitaFormDialog`.
- Al elegir un cliente registrado en la cita, la casilla toma la suya; al
  escribir un nombre a mano, se desmarca.
- Mocks con `acepta_whatsapp` y `cliente_acepta_whatsapp`.

## Para producción

- Opcional: `TIVU_ALERTAS` en el backend. Si no está, las alertas van a
  `TIVU_SOPORTE`.
- Los webhooks de las sesiones ya piden `session.status`.
- Nada más que configurar: las migraciones corren en el despliegue.

## Depende de

- 4.8a, 4.8b, el arreglo WAHA.
- **Siguen:** 4.5 (C-3, C-5, C-6), 4.4 (C-8, C-9), 6.7 (casilla en la tienda) y
  6.8 (enlace en CAMBIAR).
