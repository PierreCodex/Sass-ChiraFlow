# Propuesta de cambio — Avisos por dos canales, cobro por WhatsApp, planes y promociones

Fecha: 2026-11-09 · Flujo: corrección de rumbo (BMAD) · Estado: **aprobada por el
equipo y aplicada el 2026-11-09** (PRD, arquitectura, épicas, estado del sprint,
memlogs y `docs/infra/evolution/`).

Material de apoyo, revisado y aprobado por el equipo (no forma parte del repo):

- `tivu-flujos-de-avisos.pdf` — 9 hojas: el flujo de la reserva (dos formas de
  cobrar), equipo, suscripción, cuenta y qué se puede activar.
- `tivu-planes-lanzamiento.pdf` — 4 hojas: estrategia de lanzamiento en Piura,
  los dos planes, los avisos en cada plan y qué se configura desde el panel.
- `tivu-catalogo-avisos.pdf` — los 30 avisos con su simulación en correo y
  WhatsApp.

---

## 1. Qué pasó

Entre el 2026-11-07 y el 2026-11-09, al revisar la épica 4 con Jean y el equipo:

1. **WhatsApp a clientes.** Se pidió que el lanzamiento envíe también avisos de
   cita a los clientes por WhatsApp. La verificación de Meta está pedida, pero
   sin fecha.
2. **Evolution ya no va en Railway.** Está desplegado en el VPS con Coolify
   (proyecto `tivu`, recurso `evolution`, v2.3.7, Postgres y Redis propios, red
   interna, `evo.tivuapp.com` tras Cloudflare Access). Railway se eligió el
   2026-09-19, antes de tener servidor propio.
3. **Los dueños casi no leen el correo.** Lo importante para ellos tiene que
   llegar por WhatsApp, y poder resolverse desde el celular.
4. **Pagos.** Se valoró conectar una pasarela por negocio (Mercado Pago,
   Izipay, Culqi).
5. **Planes.** El equipo es de estudiantes que buscan presencia en Piura: hace
   falta una forma de enganchar a los primeros negocios y de convertir los
   avisos en ventajas de plan, sin tocar código para cada ajuste.
6. **Promociones de los negocios.** Barberías y salones dan promociones
   («5 cortes en el mes, el 6.º gratis»); cada rubro necesita las suyas.

## 2. Decisiones aprobadas

### 2.1 Dos canales de aviso

- **El correo sale siempre**; WhatsApp es apoyo, nunca la única vía.
- **Dos números de WhatsApp de la plataforma**, nunca el del negocio:
  - **número del equipo**: dueño, encargados y profesionales;
  - **número de clientes**: los clientes de los negocios.
  Si bloquean el de clientes, el equipo sigue recibiendo sus avisos.
- **Clientes, solo con consentimiento** (Ley 29733): casilla desmarcada
  «Recibir avisos por WhatsApp» al reservar en la tienda y en el alta de cita
  del panel. Sin casilla → envío `omitido` (`sin_consentimiento_whatsapp`).
- **Clientes, solo cuando la cita ya está confirmada.** En la tienda, después
  de confirmar por correo o de que se apruebe el pago. Las reservas de broma no
  llegan nunca a WhatsApp.
- **Avisos a clientes por WhatsApp:** C-3 confirmada, C-4 te agendaron (desde
  el panel), C-5 cambió de hora, C-6 cancelada, C-8/C-9 recordatorios. El resto,
  solo correo (llevan QR, enlaces o botones).
- **Primer mensaje sin enlace**, con una pregunta abierta («¿Necesitas cambiar
  algo? Responde CAMBIAR»). Si responde, recibe el enlace a «gestionar mi cita»
  (Story 6.8). Los enlaces van en los mensajes siguientes y en los
  recordatorios.
- **Equipo:** cada persona activa su WhatsApp escribiendo un código al número
  del equipo (consentimiento verificado, conversación de ida y vuelta).
- **Imagen** (logo del negocio, o foto del servicio cuando exista la 5.2) en
  los WhatsApp que la admitan.
- **Reglas contra el bloqueo:** ritmo lento con pausas, tope diario por número,
  calentar números nuevos semanas antes, horario del negocio, baja inmediata si
  el cliente lo pide.
- **Pensado para la API oficial:** el `Notificador` pasa datos con nombre, no
  texto armado; cada plantilla tendrá un campo opcional «plantilla en Meta» con
  el orden de sus variables. Las plantillas se envían a aprobación **antes**
  del cambio, mientras Evolution sigue funcionando.
- **Los números son configuración, no código.** Cada número es un registro del
  panel de plataforma: proveedor (Evolution, Meta/Kapso), número, **uso**
  (equipo, clientes o ambos) y estado (calentando, activo, caído, retirado). El
  `Notificador` pide «el canal para este destinatario» y la configuración
  responde. Cambiar de número, pasar a uno solo con Meta o usar uno de reserva
  es reasignar el uso, en minutos.
- **Los consentimientos son de la persona, no del número**: el del cliente
  sigue valiendo con un número nuevo (el primer mensaje se presenta: «Somos
  tivu, el nuevo número de avisos de [negocio]»). El equipo vuelve a escribir
  su código al número nuevo, para mantener la conversación de ida y vuelta.
- **Un tercer número de reserva**, calentándose desde el principio, para
  reemplazar al instante uno bloqueado.

### 2.2 Nada de mensajes basura al equipo

- **Hasta que la cita se confirma, el equipo no recibe avisos.** La ve como
  «pendiente» en el panel y el hueco queda reservado.
- En el cobro por adelantado, el primer aviso al dueño es el **comprobante con
  la captura**; al profesional, cuando se aprueba el pago.
- Al dueño no le llega lo que hizo él mismo, ni un cambio de horario normal
  (solo si deja citas fuera de horario).

### 2.3 Todo lo no esencial se activa o desactiva

- **Esencial (siempre):** seguridad de la cuenta; lo que el cliente necesita
  de su propia cita y de su dinero; la suscripción del dueño.
- **Cada persona del equipo**, en *Mi perfil → Mis avisos*: al instante,
  resumen diario o apagado; correo, WhatsApp o ambos.
- **El dueño, para sus clientes**, en *Configuración → Notificaciones*.
- «Comprobante por verificar» se puede apagar por persona, pero **al menos una**
  con permiso de pagos debe tenerlo.
- Valores por defecto: hoja 9 de `tivu-flujos-de-avisos.pdf`.

### 2.4 Cobrar por WhatsApp

- **Negocio cobra por adelantado (QR manual, lanzamiento):** la captura se sube
  **en la misma web** al reservar (el correo es respaldo). El dueño y quien
  tenga permiso de pagos la reciben **por WhatsApp con la imagen** y aprueban
  respondiendo **APROBAR + código**. Pedir otra captura o rechazar, en el panel
  (llevan motivo).
- **Suscripción de tivu (lanzamiento manual):** el dueño paga por Yape a tivu
  y sube la captura en *Mi Plan*; el equipo de tivu la recibe por WhatsApp y
  activa respondiendo **ACTIVAR + código**.
- Las respuestas solo valen desde un número verificado con el permiso
  correspondiente, y quedan registradas a su nombre.

### 2.5 Pagos: por fases

1. **Lanzamiento:** QR manual (épica 7), con lo de 2.4.
2. **Fase siguiente:** **pago en línea con Mercado Pago**, conectado por cada
   negocio con un botón (OAuth); la cita se confirma sola; devoluciones desde
   tivu. Cada negocio elige QR manual o pago en línea.
3. **Izipay o Culqi:** solo si un negocio grande lo pide (afiliación propia).

### 2.6 Suscripción

- Prueba de **7 días** con todo Premium, **ampliable a 14** desde el panel de
  plataforma (resuelve **F-6**).
- **3 días de gracia** tras vencer sin pagar, luego suspensión (resuelve
  **F-7**, solo para vencimiento).
- **No se puede bajar de plan sin caber** en él: el plan aparece bloqueado con
  el motivo y un botón para elegir qué desactivar. Igual desde el panel de
  plataforma. Desaparece el aviso S-4 y el estado «pasado del límite».
- **Avisos al equipo de tivu por WhatsApp:** negocio nuevo, prueba por vencer,
  pago por activar, vencido, suspendido, cupo agotado, fin del precio de
  fundador.

### 2.7 Planes y lanzamiento

- **Dos planes al lanzar** (Básico y Premium); Pro, a pedido.
- **Plan Fundador** para los primeros 20–30 negocios: Premium completo a
  **S/ 9 al mes** los 3 primeros meses, luego **−50 % congelado 12 meses**.
- **Avisos como ventaja de plan** (no se cobra lo esencial; se cobra canal,
  cantidad, automatización y personalización):

  | | Básico | Premium | Pro (después) |
  |---|---|---|---|
  | Números del equipo con WhatsApp | 1 | 3 | 10 |
  | WhatsApp a clientes / mes | — | 100 | 500 |
  | Captura del Yape y APROBAR por WhatsApp | — | ✓ | ✓ |
  | Recordatorios | 1 · correo | 2 · correo y WhatsApp | 3 · hora a elegir |
  | Resumen diario y agenda del día | — | ✓ | ✓ |
  | Imagen en el WhatsApp | — | ✓ | ✓ |
  | Editar los textos · informe de avisos | — | — | ✓ |

- **Precios por validar** (F-5 sigue abierta): S/ 99 y S/ 149 son los del
  sistema; se fijan tras hablar con 10 dueños de Piura.
- **Todo editable desde el panel de plataforma**: precios, funciones por plan,
  límites, promociones con fecha, paquetes extra y condiciones por negocio
  (Plan Fundador, prueba extendida, mes de regalo). Las funciones se programan
  una vez; activarlas por plan es un dato.

### 2.8 Promociones y fidelidad (épica nueva)

Tipos configurables por cada negocio, sin código por rubro:

1. **Tarjeta de sellos:** cada N servicios de [estos] en [periodo] → recompensa.
2. **Combo:** [A] + [B] juntos → S/ X.
3. **Día u horario:** [días/horas] → −X % en [servicios].
4. **Paquete de sesiones:** N sesiones de [servicio] por S/ X, por adelantado.
5. **Ocasiones:** primera visita, cumpleaños, referido.

Recompensa: gratis, % o S/. Con vigencia, sedes, límite por cliente y si se ve
en la tienda. El cliente se reconoce por su teléfono (6.6); **solo cuentan las
citas atendidas**. Se aplica sola, se ve en la tienda y en la ficha, y suma un
aviso activable («Te falta 1 corte para tu corte gratis»). Función de Premium.
Primero los tipos 1 y 2.

## 3. Impacto en los documentos

### 3.1 Arquitectura (`ARCHITECTURE-SPINE.md`)

| Dónde | Cambio |
|---|---|
| **AD-22** | Canal WhatsApp para equipo **y clientes**, dos números (más uno de reserva) como **registros configurables** con proveedor, uso y estado; consentimiento de la persona, no del número; solo tras confirmar; datos y no texto; respuestas APROBAR/ACTIVAR/CAMBIAR/AYUDA por un único webhook con un adaptador por proveedor; Evolution en Coolify |
| **AD-8** | El `Notificador` resuelve también canal y preferencias (por persona y por negocio) antes de crear el envío |
| Tabla de tecnología | «Evolution API v2 en Railway…» → «Evolution API v2.3.7 en el VPS con Coolify (Postgres y Redis propios, red interna, `evo.tivuapp.com` tras Cloudflare Access)» |
| Deferred | Sale «WhatsApp a clientes»; entran «Izipay/Culqi» y «aviso de dispositivo nuevo» |
| AD-15 | `evo` como subdominio reservado (coherencia con `api`, `app`, `coolify`) |

### 3.2 PRD

| Dónde | Cambio |
|---|---|
| FR-83 | Proveedor en Coolify; dos números; activación por código |
| **FR nuevo** | WhatsApp a clientes con consentimiento (2.1) |
| FR-75 | Preferencias por persona y por negocio (2.3) |
| FR-84 | El equipo no recibe nada hasta confirmar (2.2) |
| FR-56 / FR-57 | No bajar de plan sin caber; cobro de suscripción con ACTIVAR |
| §6 límites | Se quita «bajar de plan no desactiva nada…»; gracia solo por vencimiento |
| F-6, F-7 | Resueltas (7 días ampliable a 14; 3 días de gracia) |
| Alcance (§7) | Se quita «no envía WhatsApp a clientes» |
| **FR nuevos** | Pago en línea por negocio; promociones y fidelidad; editor de planes |

### 3.3 Épicas e historias (`epics.md`)

| Historia | Cambio |
|---|---|
| **4.4** Recordatorios | Se amplía: también por WhatsApp al cliente con consentimiento; cantidad según plan |
| **4.5** A quién le llega | El equipo solo tras confirmar; al dueño no lo que hizo él |
| **4.6** Preferencias | Mi perfil (al instante / resumen / apagado; canal) y Configuración para clientes; al menos uno con «comprobante por verificar» |
| **4.8** WhatsApp | Coolify; números como registros (proveedor, uso, estado) editables desde el panel de plataforma; activación por código; clientes; respuestas por webhook; quitar «clientes no reciben WhatsApp» |
| **6.6** Reservar | Casilla de WhatsApp; el equipo no se entera hasta confirmar |
| **6.7** Confirmar | Al confirmar: primer aviso al equipo y primer WhatsApp al cliente |
| **7.2 / 7.3** Pagar y subir | La captura se sube en la misma web; el correo es respaldo |
| **7.4** Verificar | Captura por WhatsApp y APROBAR + código |
| **8.1** Cambios de plan | No bajar sin caber (también desde plataforma) |
| **8.3** Mi Plan | Plan bloqueado con motivo y «elegir cuáles desactivar»; subir la captura del pago |
| **8.6** Ciclo de vida | 3 días de gracia; avisos al equipo de tivu; ACTIVAR |
| **8.7 (nueva)** | Planes y promociones editables desde el panel de plataforma |
| **9.1** Landing | Dos planes y Plan Fundador |
| **9.6** Piloto | Plan Fundador para los primeros 20–30 negocios |
| **Épica 10 (nueva)** | Pago en línea con Mercado Pago (después del lanzamiento) |
| **Épica 11 (nueva)** | Promociones y fidelidad (detrás de la reserva pública) |

### 3.4 Estado del sprint (`sprint-status.yaml`)

- 4.8: `bloqueado_por` → «números dedicados (equipo y clientes) dados de alta
  y calentados».
- Épicas 10 y 11 en `backlog`; 8.7 en `backlog`.

### 3.5 Otros

- `.memlog` de arquitectura y PRD: se **añade** la decisión; el historial no se
  reescribe.
- Backend: `SlugsReservados` con `evo` (PR aparte).
- `docs/infra/evolution/docker-compose.yml` con el compose desplegado.

## 4. Orden de trabajo

1. Aplicar este cambio a los documentos (una PR).
2. **4.2** (plantillas con marca) → **4.8** (canal WhatsApp) → **4.4** (con
   WhatsApp) → 4.5, 4.6 → **6.6 / 6.7** (reservar y confirmar).
3. Calentar los **tres números** (equipo, clientes y reserva) **desde ya**, en
   paralelo (son semanas).
4. Épicas 7 y 8 según el plan; 8.7 antes de abrir el piloto (9.6).
5. Después del lanzamiento: épica 10 (Mercado Pago) y épica 11 (promociones).
