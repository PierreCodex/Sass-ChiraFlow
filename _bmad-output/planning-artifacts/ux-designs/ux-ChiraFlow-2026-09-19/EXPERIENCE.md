---
title: EXPERIENCE — ChiraFlow
status: draft
created: 2026-09-19
updated: 2026-09-19
scope: 'Las 9 pantallas nuevas (UX-DR1..UX-DR9) + el recorrido de reserva de la tienda. Las pantallas existentes siguen sus fichas de docs/vistas/.'
sources:
  - ../../prds/prd-ChiraFlow-2026-09-19/prd.md
  - ../../architecture/architecture-ChiraFlow-2026-09-19/ARCHITECTURE-SPINE.md
  - ../../propuesta-decisiones-2026-09-19.md
  - ../../epics.md
  - DESIGN.md
  - .working/revision-visual-temprana.html
---

# EXPERIENCE — ChiraFlow

## Foundation

- **Formatos.** Web adaptable. La **tienda y la página de la cita se piensan primero para el móvil** (el cliente reserva desde el celular). El **panel del negocio** se usa en escritorio y móvil. El **panel de plataforma** se usa en escritorio; en móvil, solo debe poder leerse. Los **correos** se leen sobre todo en el móvil.
- **Sistema de UI.** **MUI 7 + plantilla Modernize** (tema `AQUA_THEME`). Se reutilizan sus componentes y los compartidos del proyecto: `DataTable`, `ConfirmDialog`, `BuscadorTabla`, `CampoImagenes`, `StatCard`, `DashboardCard`, `BlankCard`, `EncabezadoPagina`, `dialogoResponsive`, `formularioCompacto`, `MarcoSeccion` y los avisos de `useAvisos()`. Este documento solo especifica el comportamiento **añadido**. Referencias de la plantilla: `landingpage`, `frontend-pages/pricing`, `theme-pages/account-settings`, `auth` (incluido *two-steps*), `apps/invoice`, `dashboards`, `widgets`.
- **Identidad visual:** `DESIGN.md`. Si una maqueta contradice a los documentos, mandan los documentos.

## Information Architecture

| Superficie | Dirección | Pantallas nuevas | Quién |
|---|---|---|---|
| Tienda pública | `{negocio}.site.<marca>` y `{negocio}.site.<marca>/{sede}` (sin subdominio: `/reservar/{negocio}/{sede}`) | Selección de sede (si hay varias) · Portada + servicios · Profesional, día y hora · Tus datos · Pago · Confirmación | Cliente final, sin cuenta |
| Página de la cita | `{negocio}.site.<marca>/cita/{token}` | Ver cita · Subir comprobante · Reprogramar · Cancelar · Enlace no válido | Cliente final, con su enlace |
| Panel del negocio | `app.<marca>` | **Configuración → Apariencia de la página de reservas** (UX-DR1 parte visual) · **Configuración → Pagos por QR** (UX-DR1) · **Configuración → Notificaciones** (UX-DR5) · **Citas: pagos por verificar** (UX-DR2) · **Mi Plan de solo lectura** (UX-DR7) · **Dashboard mínimo** (UX-DR8) · **Mi perfil → Avisos** (UX-DR5). *Posterior:* Locales → sede → Portada (FR-80) | Usuarios del negocio, según permisos |
| Panel de plataforma | `admin.<marca>` | Acceso con 2FA · Negocios (lista) · Ficha del negocio · Activar o cambiar plan · Registrar pago · Suspender / reactivar · Auditoría · Envíos de correo · Equipo de plataforma | Administradores de plataforma |
| Landing | dominio raíz de la marca | Portada con titular que se escribe · Cinta de rubros · Producto por pestañas · Cómo funciona · Pagos con Yape y avisos · Planes · Preguntas frecuentes · Llamada a registrarse · Términos · Privacidad | Dueños de negocio que aún no son clientes |
| Correos | — | Plantillas de cita y pago (en nombre del negocio) y de suscripción y seguridad (ChiraFlow) (UX-DR6) | Clientes, personal, titulares |

**Cierre del mapa.** Cada necesidad aprobada tiene su superficie, y cada superficie tiene un recorrido que llega a ella (ver Key Flows). Queda fuera la gestión de reseñas y de WhatsApp, que son posteriores al lanzamiento.

## Voice and Tone

- **De tú**, breve, cálido y concreto. Frases que dicen **qué pasó** y **qué hacer ahora**.
- En la tienda y en los correos habla **el negocio** («Te esperamos, María»). En el panel y en la plataforma habla **ChiraFlow**.
- **Nunca prometer lo que no pasó:** no decir «pagada» si se paga en el local, ni «confirmada» si falta verificar.
- **Los errores explican cómo arreglarse:** «Esa hora acaba de ocuparse. Elige otra de la lista.» y no «Error 422».
- **Plazos con hora concreta y en hora de Lima:** «hasta hoy a las 20:52 (tienes 60 minutos)».
- **Botones con verbo:** «Reservar cita», «Subir comprobante», «Aprobar pago», «Publicar cambios».

## Component Patterns

| Patrón | Comportamiento |
|---|---|
| **Portada de la tienda** | Muestra el estilo **publicado** (sólido, degradado o foto) del **negocio**. En el lanzamiento, **todas las sedes heredan** logo, color y portada; cada una muestra solo sus datos (nombre, dirección, horario de hoy). «Reservar cita» baja hasta los servicios; WhatsApp abre el chat del negocio (o de la sede, si tiene número propio) |
| **Selector de sede** | Solo aparece si hay **más de una sede con servicios reservables**. Va antes del servicio, porque servicios, profesionales y horarios dependen de ella. Al llegar por el enlace de una sede (`/balta`), viene **preseleccionada** y se muestra fija («Sede Balta · Cambiar sede»), **y se puede cambiar**. Si ya hay servicios elegidos, se avisa antes: «Cambiar de sede reinicia tu selección (2 servicios). ¿Continuar?», con «Cambiar sede» y «Quedarme en Balta» |
| **Carrito** | Pertenece a **una sede**. Barra inferior fija en móvil con número de servicios, total y «Continuar» |
| **Paso de profesional, día y hora** | Profesionales que prestan el servicio en esa sede, más «Cualquiera disponible». Días de los próximos 14 [SUPUESTO] con los días sin huecos apagados. Huecos reales del servidor (AD-6). Si se ocupa en el último momento: mensaje, lista actualizada y la selección se conserva para elegir otra hora |
| **Paso de pago** | Según la configuración del negocio: **no pedido** → no aparece; **opcional** → «Pagar ahora con Yape» o «Pagar en el local»; **obligatorio** → solo Yape, con el monto y el plazo visibles **antes** de confirmar. «Pagar en el local» **nunca** aparece si el pago es obligatorio |
| **Pantalla de confirmación** | Etiqueta de estado real (ver State Patterns), código de reserva y qué hacer ahora. La cuenta atrás **avisa a los 5 minutos restantes** y, al llegar a cero, la pantalla cambia sola a «Tu reserva expiró» con «Subir captura» (rescate) y los horarios cercanos; nunca dice «sesión expirada». Si hay que pagar: QR grande, instrucciones del negocio, monto, «Subir comprobante» y plazo. **Si no paga en línea** (FR-84): «Revisa tu correo para confirmar tu reserva», correo enmascarado (ma•••@gmail.com), plazo con hora exacta, «tu horario está reservado», **Reenviar correo** (con espera), **Corregir correo** (una vez) y el consejo de mirar en spam o promociones |
| **Subir comprobante** | Un solo campo de imagen (cámara o galería) + número de operación opcional. Vista previa antes de enviar. Formatos y tamaño explicados junto al campo. Tras enviar: estado «Comprobante en revisión» |
| **Página de la cita** | Estado arriba, datos de la cita y acciones según el estado y la política. **Abrir no cambia nada**: reprogramar y cancelar piden confirmación en la página. Cancelar pide un motivo opcional |
| **Pagos por verificar (Citas)** | Chip de filtro «Pagos por verificar (n)» y columna de estado de pago. La fila abre un **cajón lateral** con la captura (ampliable), monto esperado, número de operación y hora de subida. Tres acciones: **«Aprobar pago»**, **«Pedir otra captura»** (corregible) y **«Rechazar y cancelar la cita»** (definitivo, con confirmación). Las dos últimas exigen un motivo, que se envía al cliente |
| **Editor de apariencia** | Ver sección propia más abajo |
| **Configuración → Pagos y reservas** | Activar el cobro por QR, subir la imagen, instrucciones, modalidad (no pedido, opcional, obligatorio) y **tres plazos que fija el negocio, nunca por debajo de 15 minutos**: pagar y subir la captura (15 min por defecto, 15–60), corregir un comprobante rechazado (30 min, 15–120) y confirmar por correo las reservas sin Yape (30 min, 15–120). Cada uno avisa de su efecto: «con 60 min, tu tienda no ofrecerá horarios a menos de 75 minutos vista». Una vista previa muestra al cliente el paso de pago |
| **Configuración → Notificaciones** | Interruptores por aviso opcional (los esenciales se ven fijos con un candado y su motivo), número y hora de los recordatorios según el plan, correo de respuesta y la política de cambios (horas mínimas para reprogramar o cancelar) |
| **Configuración → Notificaciones → WhatsApp del equipo** | Lista de números internos con nombre («Recepción Balta»), qué avisos recibe cada uno (comprobantes por verificar, reservas nuevas) y su estado: **Pendiente de activar** (muestra el código y un botón «Abrir WhatsApp» con el mensaje «ACTIVAR 482913» ya escrito hacia el número de ChiraFlow) o **Activo**. Aviso fijo: «Los avisos también llegan por correo y al panel» |
| **Mi perfil → Avisos** | Reservas nuevas: al instante, resumen diario o nunca. Agenda del día. Cambios de horario |
| **Mi Plan (solo lectura)** | Plan actual, vigencia, uso frente a límites («3 de 5 profesionales»), plan sugerido y avisos de exceso. «Quiero este plan» abre WhatsApp o un correo a ChiraFlow con el plan elegido. No cobra nada |
| **Dashboard mínimo** | Citas de hoy, **pagos por verificar** (enlaza al filtro de Citas) y próximas citas. Sin gráficas en el lanzamiento |
| **Panel de plataforma** | Barra y etiqueta permanentes (DESIGN). En la ficha del negocio, la **cabecera de contexto** no desaparece al hacer scroll. «Activar o cambiar plan» abre un diálogo con plan, periodicidad, vigencia, complementos, **motivo obligatorio** y pago asociado opcional. El historial muestra, por separado, **cambios de plan** (quién, cuándo, de qué a qué, motivo) y **pagos** (con su propio estado) |
| **Correo** | Estado arriba, título que dice qué pasó, datos, qué hacer ahora y botones que llevan a la página de la cita. Versión de texto siempre |
| **Landing** | Titular que se escribe (3 frases), cinta de rubros, pestañas Agenda · Tienda · Pagos con Yape · Avisos con capturas reales, confeti al completar la reserva de demostración y garabatos en uno o dos sitios como máximo. **Sin testimonios inventados**: la sección de testimonios aparece cuando haya clientes reales |

## Apariencia de la página de reservas (editor básico del lanzamiento)

**Dónde:** Panel → Configuración → **Apariencia**. Solo el administrador general (la capacidad `configuracion: gestionar`, igual que hoy).

**Qué se configura (todos los planes):**
1. **Logo**: PNG, JPG o WebP (sin SVG), hasta 1 MB, mínimo 256 × 256 px. Se muestra recortado en cuadrado redondeado.
2. **Color principal**: selector de color + **8 colores sugeridos** [SUPUESTO: la paleta exacta]. Debajo, la muestra de un botón con el texto calculado y el aviso si el color no permite botones legibles.
3. **Estilo de portada**: sólido / degradado / fotografía.
4. **Degradado**: galería de 8 prediseñados + «a partir de tu color».
5. **Fotografía**: JPG, PNG o WebP, hasta 5 MB, mínimo 1600 × 600 px. Después de subirla, **se toca el punto importante** y la vista previa muestra el encuadre en móvil y en escritorio a la vez.
6. **Vista previa** en vivo con conmutador **Móvil / Escritorio**, usando los componentes reales de la tienda.
7. **Publicar cambios**: los clientes ven lo nuevo al instante. Mientras no se publica, los cambios viven solo en la pantalla, y **«Descartar cambios»** vuelve a lo publicado.

**Portada por sede: posterior al lanzamiento (FR-80).** En el lanzamiento todas las sedes heredan la portada del negocio. Cuando llegue, será la función de plan `portada_por_sede`: en Locales → sede → Portada, subir una foto propia o «usar la del negocio».

**«Descartar cambios»** devuelve la pantalla a la **última apariencia publicada**, que es la que ven los clientes; no hay borrador guardado en el servidor en esta versión.

**Negocios que ya tenían color o logo por sede (FR-82).** Tras el traslado, la primera vez que se abre el editor aparece un aviso: «Tus sedes tenían colores o logos distintos; ahora todas usan los del negocio», con la lista y la opción «Usar el de esta sede» en cada una. Un color trasladado sin contraste suficiente aparece marcado para corregirlo.

**Procesado de imágenes (servidor):** se valida el tipo real y las dimensiones, se re-codifica a WebP (quitando los metadatos, como ya hace `ImagenService`) y se generan **tres anchos para la portada** (2400, 1600 y 800 px) y **512 px para el logo**. La tienda sirve el tamaño adecuado a cada pantalla.

**Posterior al lanzamiento:** borrador guardado en el servidor, «Restaurar diseño inicial», historial de versiones, programar una publicación, más estilos (patrones o vídeo), elegir tipografía, fondos propios adicionales, ocultar la marca del pie y dominio propio.

## State Patterns

**La cita y su pago, tal como los ven el cliente y el negocio.** El horario queda **retenido** mientras la cita no esté cancelada; lo que cambia es **hasta cuándo**.

| Situación | Etiqueta (icono + texto) | ¿Horario retenido? | ¿Hasta cuándo? | Qué se le dice al cliente |
|---|---|---|---|---|
| Sin pago o «pagar en el local», **aún sin confirmar por correo** (FR-84) | ● **Pendiente de tu confirmación** | Sí | **30 min desde la reserva** [SUPUESTO], nunca después de 15 min antes de la cita | «Revisa tu correo y confirma tu reserva hasta las 20:52. Tu horario está reservado.» |
| Sin pago o «pagar en el local», **confirmada por el cliente** | ✓ **Confirmada** · «Pagas en el local» | Sí | Hasta la cita | «Te esperamos. Pagarás S/ 35 en el local.» |
| No confirmó a tiempo | ✕ **Cancelada** · «reserva no confirmada» | No | — | «No recibimos tu confirmación y el horario se liberó. Puedes reservar de nuevo.» |
| Pago **obligatorio**, sin comprobante | ● **Pendiente de pago** | Sí | **Hasta el plazo** (por defecto 60 min, con la hora exacta) | «Paga S/ 35 por Yape y sube la captura hasta las 20:52. Si no llega, el horario se libera.» |
| Pago **opcional**, eligió «pagar ahora» y aún no subió nada | ● **Pendiente de pago** · «también puedes pagar en el local» | Sí | Sin caducidad (el pago opcional no libera el horario) | «Sube tu comprobante cuando pagues, o paga en el local.» |
| Comprobante subido | ◐ **Comprobante en revisión** | Sí | Sin caducidad: la espera es del negocio | «Recibimos tu comprobante. El salón lo revisará y te avisaremos.» |
| Pago aprobado | ✓ **Confirmada** · «Pago verificado» | Sí | Hasta la cita | «Tu pago fue verificado. Te esperamos.» |
| El negocio **pide otra captura** (corregible) | ● **Pendiente de pago** · «se necesita otra captura» + motivo | Sí | **30 min desde que el negocio lo pide** [SUPUESTO], y nunca después de **15 min antes de la cita** | «El salón necesita otra captura: *la imagen no se lee*. Súbela hasta las 21:30. Tu horario sigue reservado.» |
| Plazo vencido y **la captura llega después**, con el horario aún libre | ◐ **Comprobante en revisión** (reserva reactivada) | Sí | Sin caducidad | «Recuperamos tu reserva: el horario seguía libre y el salón revisará tu pago.» |
| Plazo vencido, la captura llega después y **el horario ya se tomó** | ✕ **Cancelada** · «horario ocupado» | No | — | «Ese horario ya se tomó. Elige otro y el salón traslada tu pago, o pídele la devolución.» |
| Plazo que acabaría a menos de 15 min de la cita | ● **Pendiente de pago** · «resuélvelo en el local» | Sí | Hasta la cita: **no se cancela sola** | «Tu cita empieza pronto. Lleva tu comprobante al local.» El negocio recibe un aviso para decidir en el mostrador |
| El negocio **rechaza y cancela** (definitivo) | ✕ **Cancelada** · «pago rechazado» + motivo | No | — | «El salón no pudo confirmar tu pago: *no figura en su Yape*. Tu reserva se canceló. Puedes reservar de nuevo o escribir al salón.» |
| Plazo vencido sin comprobante | ✕ **Cancelada** · «pago no recibido» | No | — | «**Tu reserva expiró.** No recibimos tu pago a tiempo y el horario quedó libre. ¿Ya pagaste? Sube tu captura y lo recuperamos si sigue libre.» (nunca «sesión expirada»: el cliente no tiene sesión) |
| Cancelada por el cliente o el negocio con pago verificado | ✕ **Cancelada** · «devolución pendiente» | No | — | «Tu cita se canceló. El salón te devolverá el pago y te lo confirmará.» |

**Cómo corren los plazos (pago obligatorio y confirmación por correo)**
- El **plazo inicial** (por defecto 60 min) cuenta **desde que se crea la reserva**; el de **corrección** (30 min [SUPUESTO]), **desde que el negocio pide otra captura**.
- Ningún plazo termina después de **15 minutos antes de la cita** [SUPUESTO]. Si al abrirse quedarían menos de 15 minutos, no hay caducidad automática: la cita queda pendiente de pago y el negocio decide.
- Con pago obligatorio, la tienda **no ofrece horarios** que empiecen antes de que termine el plazo inicial más esos 15 minutos. Lo mismo con la confirmación por correo: con 30 minutos de plazo, nada antes de **45 minutos** desde ahora [PROPUESTA].
- **Corregible** («Pedir otra captura»): captura ilegible, monto incompleto o imagen equivocada; hasta 3 capturas por cita [SUPUESTO]. **Definitivo** («Rechazar y cancelar la cita»): el pago no aparece en el Yape del negocio, o el comprobante es falso o está duplicado.

**Direcciones públicas y enlaces**
- La sede se identifica por un **slug único dentro de su negocio** (`rosa-estilistas.site.<marca>/balta`), derivado de su nombre, con sufijo si se repite y sin palabras reservadas (`cita`, `reservar`, `publico`).
- Si el slug de una sede cambia, **el anterior redirige para siempre** al nuevo y no se reutiliza en ese negocio.
- Los enlaces antiguos con id numérico (`/reservar/{negocio}/sucursal/{id}`) redirigen a la dirección con slug durante la transición.
- Una sede desactivada o borrada: su dirección lleva a la tienda del negocio con el aviso «Esta sede ya no recibe reservas en línea».

**Otros estados de pantalla**
- **Tienda sin servicios reservables:** «Este negocio aún no tiene horarios en línea» + WhatsApp.
- **Tienda de un negocio suspendido:** página «La tienda no está disponible», con los datos de contacto.
- **Sin huecos ese día:** «No hay horarios libres el sábado 26. Prueba otro día» y se resalta el siguiente día con huecos.
- **Enlace caducado o cita ya cambiada:** se muestra el estado actual («Tu cita fue reprogramada al jueves 12 a las 10:00») o «Este enlace ya no permite cambios», con WhatsApp y enlace a la tienda.
- **Fuera de la política de cambios:** los botones Reprogramar y Cancelar se ven desactivados, con el motivo («Solo hasta 24 h antes»).
- **Panel sin permisos:** la opción no aparece en el menú y, si se llega por URL, un aviso claro (403 `sin_permiso`).
- **Plan que no incluye la función:** aviso con «Ver planes» (403 `plan_no_incluye`).
- **Suscripción vencida:** banner fijo con «Regularizar mi plan».

## Interaction Primitives

- Tocar para seleccionar; el seleccionado cambia de fondo o de borde y además muestra un ✓.
- La barra inferior fija en móvil lleva la acción principal de cada paso.
- Los cajones laterales (escritorio) se convierten en hojas inferiores en móvil (`dialogoResponsive`).
- Las confirmaciones destructivas usan `ConfirmDialog` con la consecuencia escrita.
- El éxito se avisa con `useAvisos()`; los errores se muestran donde el usuario está mirando (bajo el campo o dentro del diálogo).
- Punto de enfoque: un toque sobre la foto coloca el marcador; se puede arrastrar.
- La landing respeta «reducir movimiento»: sin escritura animada ni apariciones, todo visible desde el inicio.

## Accessibility Floor

- Contraste AA en texto (4.5:1) y en los botones sobre el color del negocio (calculado).
- **Ningún estado se comunica solo con color** (icono + texto).
- Zonas táctiles de al menos 44 × 44 px en la tienda y en la página de la cita.
- Foco visible en todo control; orden de tabulación natural; `Esc` cierra diálogos.
- Cada campo con etiqueta asociada (sin repetir la trampa del `Autocomplete` sin `id`).
- Idioma `es-PE` y horas en 24 h con la zona indicada.
- Las imágenes de portada son decorativas (texto alternativo vacío); el logo lleva el nombre del negocio como texto alternativo.
- Correos: versión de texto, botones como enlaces con texto completo y nada importante solo en imágenes.

## Key Flows

**KF-1 · María reserva y paga con Yape (tienda, pago obligatorio).** Cierra UJ-4.
1. Abre `rosaestilistas.site.<marca>/balta` desde Instagram: la **Sede Balta** aparece preseleccionada.
2. Portada con foto del salón; toca «Reservar cita» y elige «Corte de cabello mujer».
3. Elige a Rosa Paredes, el sábado 26 y las 10:30.
4. Deja nombre, celular y correo; acepta términos y privacidad.
5. Paso de pago: solo Yape, S/ 35 y el plazo «tienes 60 minutos».
6. **Clímax:** paga desde su celular, vuelve, sube la captura y ve **«Comprobante en revisión»**. Le llega el correo con ese mismo estado.
7. Carla, recepción, aprueba el pago. María recibe **«Confirmada · Pago verificado»**.
- **Borde:** si otra persona tomó las 10:30 antes de confirmar, el paso 3 le avisa y le ofrece las 11:15.

**KF-2 · María reprograma desde su correo.** Cierra UJ-8.
1. Abre «Reprogramar» del correo y ve su cita y su estado.
2. Elige el domingo a las 11:00 entre los huecos reales de Rosa.
3. **Clímax:** confirma y ve la cita actualizada; les llega un correo a ella y a Rosa.
- **Borde:** si faltan menos de 24 h, la página se lo explica y le ofrece el WhatsApp del salón.

**KF-3 · Carla verifica pagos.**
1. En el Dashboard ve «2 pagos por verificar» y entra.
2. En Citas, con el filtro ya activo, abre la primera.
3. **Clímax:** compara la captura con el monto y el número de operación, y pulsa «Aprobar pago». La fila pasa a «Confirmada».
- **Borde:** si la captura no se lee, pulsa «Pedir otra captura» y el cliente recibe un nuevo plazo; si el pago no aparece en el Yape del salón, pulsa «Rechazar y cancelar la cita» y el horario se libera.

**KF-4 · Rosa viste su página de reservas.** (Vale para todas sus sedes.)
1. Entra en Configuración → Apariencia, sube su logo y elige su color: el aviso de contraste dice «Los botones usarán texto blanco».
2. Elige «Fotografía», sube la foto del local y toca la silla principal como punto de enfoque.
3. **Clímax:** cambia la vista previa a Móvil, comprueba que el texto se lee y pulsa «Publicar cambios». Abre su enlace y ve su salón.
- **Borde:** si la foto mide menos de 1600 px de ancho, la subida se rechaza con el tamaño mínimo y un consejo para hacer la foto en horizontal.

**KF-5 · La plataforma activa un plan.** Cierra UJ-7.
1. El administrador entra en `admin.<marca>` con su código 2FA y ve la etiqueta «Administración de plataforma».
2. Busca «Rosa Estilistas» y abre su ficha: la cabecera muestra logo, estado «Prueba · vence el 22 sep» y la sede principal.
3. Registra el pago (Yape, S/ 89, número de operación) y abre «Activar o cambiar plan»: Equipo, mensual, vigencia, motivo.
4. **Clímax:** aplica el cambio. El historial muestra el cambio de plan y, aparte, el pago con su estado. Rosa recibe el correo de ChiraFlow «Tu plan Equipo está activo».
- **Borde:** sin pago (negocio piloto), activa igual y el historial registra «sin cobro».

**KF-6 · Luis, profesional, recibe su aviso.** Tiene «Reservas nuevas: resumen diario». A las 7:00 recibe «Tu agenda de hoy · 6 citas», con enlace al panel (pide sesión).

## Responsive & Platform

- **Tienda:** una columna por debajo de 600 px, barra de acción fija abajo, portada de 280 px como mínimo con el texto abajo; en escritorio, portada de 320 px con el texto a la izquierda y los servicios en dos columnas.
- **Panel:** los breakpoints de Modernize; tablas con desplazamiento horizontal en su propio contenedor.
- **Plataforma:** pensada para 1280 px o más; en móvil, lectura en una columna.
- **Correos:** 600 px como máximo, una columna, botones al 100 % en móvil.

## Contradicciones y decisiones que afectan al alcance

Revisadas con el usuario el 2026-09-19. Estado al cierre de este borrador:

| # | Qué choca | Con qué | Propuesta |
|---|---|---|---|
| X-1 | Adelanto obligatorio | PRD FR-46 | ✅ **Resuelta:** en el lanzamiento, solo el total; adelantos posteriores. PRD sincronizado |
| X-2 | Dirección de la sede | Contrato con `localId` numérico frente a AD-11 | ✅ **Resuelta:** slug de sede dentro del negocio (FR-81), con redirecciones. Contrato y arquitectura sincronizados |
| X-3 | Identidad por sede y color secundario | Contrato (`LocalPublico`, `Configuracion`) | ✅ **Resuelta:** traslado sin pérdida de datos (FR-82); el color secundario se retira de la pantalla y de la API. Contrato sincronizado |
| X-4 | Estilos de portada por plan | PRD §6 | ✅ **Resuelta:** los tres estilos en todos los planes; portada por sede posterior, como función de plan. PRD sincronizado |
| X-5 | Editor de apariencia | PRD | ✅ **Resuelta:** FR-77 a FR-82 añadidos (FR-80 posterior) |
| X-6 | «Pendiente de confirmación» | Matriz de correos | ✅ **Resuelta y revisada el 2026-09-19:** ahora confirma el cliente por correo (FR-84): C-11 «Confirma tu reserva» y C-12 «no confirmada»; C-3 con tres textos según el pago; P-5 corregible y P-8 definitivo |
| X-7 | Plazo tras un rechazo | PRD FR-71 | 🟡 **Definido, pendiente de aprobar (F-9):** 30 min desde que el negocio pide otra captura, horario retenido, nunca después de 15 min antes de la cita; corregible frente a definitivo |

**Estimación del editor básico de apariencia (X-5)**

| Parte | Qué existe hoy | Qué falta | Días |
|---|---|---|---|
| Backend | Columnas `logo`, `cover` y `color_primario` en `tenants`. `ConfiguracionRequest` acepta logo (2 MB) y portada (4 MB), incluido GIF. `ImagenService` convierte a WebP y quita los metadatos, **pero no redimensiona** | Cinco piezas: **(1)** guardar estilo, degradado y punto de enfoque en el JSON de configuración; **(2)** validar tipo real (sin GIF ni SVG), peso y dimensiones mínimas; **(3)** ampliar `ImagenService` para generar 3 anchos de portada y el logo de 512 px; **(4)** comprobar el contraste del color en un único sitio (`app/Support`); **(5)** que la respuesta pública lleve la apariencia del negocio en vez del color, el banner y el logo de cada sede. El contrato se edita primero (AD-13) | 1,5–2 |
| Almacenamiento | Disco público por negocio y ruta `/archivos/{tenant}/…` | Guardar las variantes y borrar las anteriores al reemplazar (sin huérfanos) | incluido |
| Editor (frontend) | `SeccionMarca` con logo, portada y color | Selector de color con sugeridos y aviso de contraste, estilo de portada, galería de degradados, subida con punto de enfoque y vista previa en vivo Móvil/Escritorio con los componentes reales de la tienda; publicar y descartar | 1,5–2 |
| Tienda (frontend) | `PortadaLocal` pinta el color, el banner y el logo **de la sede** | Leer la apariencia del negocio con la herencia de la sede, `srcset` con las 3 variantes, encuadre por punto de enfoque y capa legible | 0,5–1 |
| Permisos | `configuracion: gestionar` (solo el administrador general) | Portada por sede: `locales: gestionar` dentro de su alcance **y** la función del plan | incluido |
| Pruebas | — | Pest: validaciones, variantes generadas, aislamiento, función de plan y contraste. Vitest: el cálculo de contraste (copia del frontend, verificada con un caso compartido como el motor de huecos). Verificación en navegador, en móvil y escritorio | 0,5 |
| **Total** | | | **4–5,5** |

**Fuera de esta estimación, y también en el lanzamiento:**
- **Slug de sede y redirecciones (FR-81):** ≈ 1 día. Migración `locales.slug` más el historial de slugs, rutas públicas nuevas y redirección de las antiguas, contrato y tests.
- **Traslado de la identidad (FR-82):** ≈ 0,5 días. Migración de datos, aviso en el editor y tests.

**Posterior:** portada por sede (FR-80), unas 0,5 jornadas cuando llegue.
