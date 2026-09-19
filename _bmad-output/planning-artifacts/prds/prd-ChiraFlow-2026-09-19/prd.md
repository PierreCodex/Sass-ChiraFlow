---
title: PRD — ChiraFlow
status: draft
created: 2026-09-19
updated: 2026-09-19
---

# PRD: ChiraFlow

*Nombre de trabajo, tomado del repositorio del frontend. El nombre comercial
está [POR DEFINIR] (el código usa «Mi SaaS»).*

**Convenciones de este documento.** **[POR DEFINIR]** marca información de
producto que falta confirmar, **[PROPUESTA]** una sugerencia mía y
**[SUPUESTO]** una inferencia. Cada funcionalidad lleva su **estado real**,
comprobado contra el código (ver `../../diagnostico-2026-09-19.md`):
✅ implementado y verificado · 🟡 parcial, con el fallo concreto · ⬜ pendiente.
Los IDs `Q-xx`, `D-xx` y `F-xx` remiten a ese diagnóstico; `A-x`, `F-x`,
`L-x` y `G-x` remiten a `../../propuesta-decisiones-2026-09-19.md`.

**Decisiones aprobadas el 2026-09-19: A-1 a A-7.** Tres de ellas **sustituyen
decisiones que estaban cerradas** en `Backend-Sass/CLAUDE.md` y en
`Backend-Sass/docs/discrepancias.md` (documento congelado). Mientras esos
archivos no se actualicen, **este PRD prevalece** en estos tres puntos:

| Decisión anterior | Sustituida por |
|---|---|
| Sin caducidad de la reserva impaga (discrepancias §6.2.1) | A-3: caduca si el pago es obligatorio y no llega la evidencia en plazo (FR-71) |
| `citas.fuente` con `publica \| admin \| whatsapp \| api` (§2.11) | A-2: `canal` (`panel \| tienda`) + quién la registró (FR-33) |
| El cliente gestiona su cita con el `codigo` por WhatsApp | A-4: enlace seguro por correo; el `codigo` queda como referencia y llave de la subida del comprobante (FR-69) |
| Verificar un pago genera un movimiento de caja al momento | Solo cuando Caja esté lanzada (FR-46) |

## 0. Propósito del documento

Este PRD recoge **qué es el producto y qué tiene que hacer**, para que la
arquitectura, las épicas y las historias de BMAD partan de una sola fuente. Es
**brownfield**: los Sprints 0–4 ya están construidos, y aquí se registran como
requisitos cumplidos para que no se vuelvan a planificar.

No sustituye a dos documentos que siguen vigentes y a los que este remite:

- **`Sass-ChiraFlow/docs/api-contract.md`**: la forma exacta de cada endpoint.
  Se conserva completo; este PRD no repite formas JSON.
- **`Backend-Sass/docs/discrepancias.md`**: decisiones de datos congeladas.
  Prevalece sobre el esquema SQL de referencia.

Las decisiones técnicas (tenancy, BFF, stack) viven en `addendum.md` y en la
arquitectura que viene después, no aquí.

## 1. Visión

Un SaaS de agenda y gestión para **negocios que venden el tiempo de personas**:
barberías, salones, spas, clínicas, estudios. Nace para el mercado peruano, con
precios en soles, WhatsApp como canal principal y Yape/Plin como medios de pago
naturales.

Cada negocio que se registra obtiene dos cosas a la vez: un **panel** para
gestionar su agenda, su equipo, su catálogo, su caja y su inventario, y una
**tienda pública** en su propio enlace, donde sus clientes reservan solos, sin
crear cuenta, a cualquier hora. La promesa es que la agenda deje de vivir en un
cuaderno y en el WhatsApp del dueño, sin que nadie tenga que aprender software
complicado.

El modelo es el de **AgendaPro** (autoservicio, prueba sin tarjeta, precio por
número de profesionales), con diferencias locales: Yape/Plin nativos, WhatsApp
como canal, soles y foco en el mercado del norte del Perú.

## 2. Usuarios

### 2.1 Trabajos por hacer

- **Dueño del negocio**: dejar de perder citas y dinero por agenda en papel o
  chats; saber cuánto factura y quién rinde; que los clientes reserven sin
  llamarle; controlar lo que hace su equipo sin darles acceso a todo.
- **Administrador local / recepcionista**: agendar, mover y cobrar citas
  rápido, con la agenda de todos a la vista, sin pisar horarios.
- **Profesional** (barbero, estilista, terapeuta): ver sus propias citas y su
  jornada; no ver lo que no le toca.
- **Cliente final**: reservar un servicio con un profesional en una hora libre
  desde el móvil, sin registrarse; recibir por correo el estado real de su
  cita, y poder reprogramarla o cancelarla sin llamar. (WhatsApp, más
  adelante.)
- **Equipo de la plataforma** (nosotros): cobrar las suscripciones, atender
  soporte y saber qué negocios están activos, sin entrar en sus datos.

### 2.2 Quién NO es usuario en v1

- El **cliente final no tiene cuenta** ni login: se le reconoce por su
  teléfono y gestiona **cada cita** con el enlace seguro que recibe por correo
  (A-4).
- Negocios que no venden tiempo de personas (tiendas de producto, restaurantes).
- Mercados fuera de Perú: una sola moneda (PEN) y un solo idioma (español).

### 2.3 Recorridos clave

- **UJ-1. Rosa abre su salón en el sistema en una tarde.**
  Rosa tiene un salón en Chiclayo con tres estilistas. Se registra con tipo de
  negocio y cuántos profesionales tiene, sin nombre del negocio. Confirma el
  correo, entra al panel y ve un checklist lateral: pone el nombre del salón
  (nace su enlace), su horario, da de alta a sus estilistas y sus servicios, y
  hace una reserva de prueba. **Clímax**: comparte por WhatsApp el enlace de su
  tienda y ve entrar la primera reserva real. **Borde**: si intenta un nombre
  cuyo enlace ya existe, el sistema propone uno libre.

- **UJ-2. Carla, recepcionista, agenda sin pisar a nadie.**
  Carla entra con su cuenta (invitada por Rosa, eligió su contraseña). Crea una
  cita para una clienta que llama: elige servicio, profesional y ve solo las
  horas realmente libres. **Clímax**: la cita queda guardada y aparece en el
  calendario. **Borde**: si otra persona tomó esa hora un segundo antes, recibe
  el aviso con las horas que siguen libres.

- **UJ-3. Luis, barbero, solo ve lo suyo.**
  Luis entra con el rol Profesional: ve sus citas, no las de sus compañeros ni
  la caja. Marca una cita como completada y el producto vendido sale del stock.

- **UJ-4. María reserva desde su celular un sábado por la noche.**
  Abre el enlace del salón, elige sede, añade dos servicios al carrito, decide
  si los hace en una sola cita o separadas, elige profesional, día y hora entre
  los huecos reales, deja nombre, teléfono y correo y confirma. El salón exige
  pago previo: ve el QR de Yape, el monto y un plazo de 60 minutos, paga desde
  su celular y sube la captura. **Clímax**: le llega un correo «comprobante
  recibido, en verificación» y, cuando el salón lo aprueba, otro «tu cita está
  confirmada». **Borde**: si alguien se llevó la hora mientras decidía, el
  sistema se lo dice y le deja elegir otra; si no sube la captura a tiempo, la
  reserva se cancela y el correo se lo explica.

- **UJ-8. María cambia su cita desde el correo.**
  Surge un imprevisto. María abre el correo de su cita y pulsa «Reprogramar».
  La página le muestra su cita actual y los huecos libres del mismo
  profesional; elige otro día y confirma. **Clímax**: recibe el correo con la
  nueva fecha, y el profesional también. **Borde**: si faltan menos horas de
  las que permite el salón, la página se lo explica y le ofrece el WhatsApp del
  negocio; si el enlace es de una cita que ya cambió, le muestra el estado
  actual.

- **UJ-5. Rosa cierra la caja y mira el mes.**
  Al final del día abre la caja con su monto inicial, registra ingresos y
  gastos, y al cerrar ve la diferencia de arqueo. A fin de mes consulta los
  reportes: ingresos, inasistencias, ocupación, lo que rinde cada profesional.

- **UJ-6. Rosa termina la prueba y elige plan.**
  Faltando pocos días, el panel le avisa. En Mi Plan ve los planes con el
  sugerido según su equipo real, añade extras y pulsa «Contratar»: se abre el
  WhatsApp de la plataforma con el plan elegido. La activación la hace la
  plataforma (UJ-7).
  **Borde**: si la prueba vence sin pagar, entra al panel pero solo puede ir a
  Mi Plan y Soporte.

- **UJ-7. La plataforma activa el plan de Rosa.**
  Rosa escribe por WhatsApp que quiere el plan Equipo y envía la captura de su
  pago. Un administrador de la plataforma entra al panel de plataforma con su usuario y su código 2FA,
  busca el salón, registra el pago con la referencia y activa el plan Equipo
  mensual con vigencia de un mes y motivo «pago por Yape». **Clímax**: al
  instante Rosa ve su plan activo en Mi Plan y le llega el correo de
  confirmación. **Borde**: si Rosa aún no pagó pero es negocio piloto, el administrador
  activa el plan sin registrar pago y el historial deja constancia de ello.

## 3. Glosario

- **Negocio (tenant)**: la cuenta de una empresa cliente. Tiene su propia base
  de datos. Se identifica por un `id` interno inmutable y, para el público, por
  su **slug**.
- **Slug**: la parte del enlace público del negocio. Nace la primera vez que el
  negocio tiene nombre y ya no cambia al renombrarlo.
- **Panel**: la aplicación autenticada donde trabaja el negocio.
- **Tienda pública**: las páginas sin sesión donde el cliente final reserva.
- **Usuario**: persona que **entra al panel**. Tiene un rol.
- **Profesional**: persona que **presta servicios** y tiene agenda. Puede tener
  o no un usuario asociado. Es lo que cuenta el cupo del plan.
- **Rol**: conjunto de permisos del negocio. Hay cuatro de sistema
  (**administrador general**, **administrador de sede** —clave interna
  `admin_local`—, **recepción** y **profesional**) y los que cree el negocio.
  Un rol nunca depende del plan.
- **Capacidad**: permiso resuelto de un usuario sobre un módulo, en dos niveles
  (`ver`, `gestionar`), más `solo_propios` y el **alcance por sedes**.
- **Sede (local)**: establecimiento físico del negocio. Una es la **principal**.
- **Grupo**: agrupación de sedes, profesionales y servicios. Propósito
  [POR DEFINIR] (Q-08).
- **Servicio**: lo que se reserva, con duración y precio. Pertenece
  opcionalmente a una **categoría**.
- **Cliente**: persona que recibe servicios. Sin cuenta. Su clave natural es el
  teléfono normalizado.
- **Cita**: reserva de uno o más servicios para un cliente con un profesional,
  en una fecha y hora. Tiene **código** y uno de seis **estados**: pendiente,
  confirmada, en curso, completada, cancelada, no asistió.
- **Línea de cita**: cada servicio o producto de una cita, con su precio y
  duración **congelados** el día de la reserva.
- **Hueco**: hora de inicio posible para una duración dada, según la
  **disponibilidad**.
- **Jornada**: horario de trabajo de un profesional en una fecha.
- **Caja**: sesión diaria de dinero con apertura, movimientos y cierre.
- **Plan**: nivel de suscripción con precio y cupos. **Prueba**: período
  gratuito inicial.
- **Puerta de cobro**: bloqueo del panel cuando la suscripción venció.
- **Onboarding**: checklist no bloqueante de primeros pasos.
- **Panel de plataforma**: aplicación interna del equipo de la plataforma, separada del panel. Ve todos los negocios, pero solo sus datos centrales.
- **Administrador de plataforma**: persona del equipo de la plataforma (`superadmin` o `soporte`). No es un usuario de ningún negocio.
- **Servicio habilitado en una sede**: servicio del catálogo que esa sede
  ofrece. Un servicio es **reservable** con un profesional en una sede solo si
  los tres encajan (FR-67).
- **Canal**: por dónde entró una cita (`panel` o `tienda`). Distinto de
  **quién la registró**.
- **Enlace de gestión**: enlace secreto, con caducidad, que da acceso a **una**
  cita a su cliente, sin cuenta.
- **Pago de cita**: pago del cliente al negocio por un servicio reservado.
  **No tiene nada que ver con la suscripción** del negocio a la plataforma.
  **Evidencia**: la captura del pago que sube el cliente.
- **Envío**: cada correo que el sistema manda, con su estado (pendiente,
  aceptado por el proveedor, entregado, rebotado…).

## 4. Funcionalidades

### 4.1 Alta del negocio y acceso — ✅ (con 🟡 en Mi perfil)

**Descripción**: el dueño se registra sin nombre de negocio, verifica su correo
y en ese momento se crea la base de su negocio; después entra al panel. Los
demás usuarios entran por invitación. Realiza UJ-1 y UJ-2.

#### FR-1: Registro del dueño — ✅
Un visitante puede registrar un negocio con tipo de negocio, rango de
profesionales, nombre, apellido, correo, teléfono y contraseña.
- El registro no abre sesión ni crea la base del negocio.
- Correo repetido (en cualquier negocio) → error en `email`.
- Negocio y dueño se crean juntos o no se crea ninguno.

#### FR-2: Verificación de correo y alta de la base del negocio — ✅
Al verificar el correo, el sistema crea y prepara la base del negocio en
segundo plano; repetir el proceso no duplica nada. Login sin verificar →
rechazado con opción de reenviar. El reenvío tiene límite por correo y no
revela si la cuenta existe.

#### FR-3: Inicio y cierre de sesión — ✅
Un usuario verificado inicia sesión con correo y contraseña. Cerrar sesión
invalida esa sesión y solo esa. Credenciales incorrectas → error en `email`.

#### FR-4: Recuperación de contraseña — ✅
Quien no puede entrar recupera su contraseña por correo.

#### FR-5: Invitación de usuarios — ✅
El administrador general invita a una persona por correo; ella elige su
contraseña. Nadie escribe la contraseña de otro. La invitación caduca a los 7
días y se puede reenviar. Si el envío falla, el alta se deshace entera.

#### FR-6: Mi perfil — 🟡
Un usuario edita su nombre, apellido, teléfono, documento y foto, y cambia su
contraseña indicando la actual. Cambiarla cierra sus demás sesiones. El correo
no se edita en v1. Los cambios se reflejan en su ficha de profesional.
- 🟡 El backend está hecho; la pantalla **todavía guarda contra datos
  ficticios** (falta conectarla).

### 4.2 Onboarding — 🟡

**Descripción**: checklist lateral, no bloqueante, de seis pasos: nombre del
negocio, horario, primer profesional, primer servicio, reserva de prueba y
activar la tienda. Los pasos se marcan solos cuando el negocio hace la acción
en su pantalla normal. Realiza UJ-1.

#### FR-7: Nombre del negocio y enlace — ✅
El negocio fija su nombre desde el onboarding o desde Configuración; la
primera vez que hay nombre nace el slug (único, sin subdominios reservados).
Renombrar después no cambia el slug.

#### FR-8: Marcado automático de pasos — 🟡
Cada paso se marca al hacer la acción correspondiente, desde cualquier
pantalla, una sola vez, y no se desmarca.
- 🟡 **F-01**: crear el primer profesional o el primer servicio **no marca**
  su paso. El checklist no se puede completar.

#### FR-9: Tutorial — ⬜
El enlace «Ver tutorial completo» lleva a un tutorial. [POR DEFINIR] qué
contenido y dónde vive.

### 4.3 Equipo y permisos — ✅ (con 🟡)

**Descripción**: el negocio separa quién **entra al panel** (usuarios) de quién
**presta servicios** (profesionales). Crea sus propios roles y los permisos se
aplican en el servidor. Realiza UJ-2 y UJ-3.

#### FR-10: Usuarios del panel — ✅
El administrador general gestiona las cuentas del panel y su rol. Solo puede
haber un administrador general; nadie puede darse ni quitarse ese rango por
ningún camino.

#### FR-11: Profesionales — ✅
Quien tiene permiso sobre el equipo gestiona profesionales: foto, cargo, forma
de pago (comisión, sueldo o ambos), horario semanal con descansos, y
excepciones por fecha. Opcionalmente se le crea una cuenta. Quitar la cuenta no
borra su ficha ni sus citas.

#### FR-12: Cupo del plan — ✅
El número de profesionales activos no puede superar el cupo del plan más los
extras contratados. Se comprueba al crear, reactivar y mostrar en la tienda.
Los usuarios del panel son ilimitados. Bajar de plan no desactiva a nadie:
solo impide añadir más.

#### FR-13: Roles del negocio — ✅
El administrador general crea, edita, duplica y borra roles, con permisos
`ver`/`gestionar` por módulo y la opción `solo_propios`. Los roles de sistema
no se borran; uno en uso tampoco. Facturación no se delega.

#### FR-14: Aplicación de permisos — 🟡
Toda acción se autoriza en el servidor según la capacidad del usuario, **en
las lecturas y en las escrituras**; esconder una opción en el menú no es
autorización. Sin permiso → 403 `sin_permiso`; con la suscripción vencida gana
`suscripcion_vencida`. Con `solo_propios`, lo ajeno responde 404. Fuera de su
alcance de sedes, una sede responde 404. Orden completo de comprobaciones en
NFR-11.
- 🟡 **F-02 / D-01**: con `citas: gestionar` no se puede crear una cita →
  se resuelve con FR-62, **sin ampliar permisos de ningún módulo**.
- 🟡 **G-1 a G-4** (huecos verificados en el código): se cierran con FR-28,
  FR-63 y FR-65.
- 🟡 El alcance por sedes se aplica, pero **no hay forma de asignarlo** desde
  el panel: se asigna al invitar o editar una cuenta, con la regla de FR-63.

La matriz de referencia por rol, módulo, acción y alcance está en
`../../propuesta-decisiones-2026-09-19.md` §2.3 (aprobada, A-1).

#### FR-62: Opciones para agendar — ⬜ (A-1)
Quien tiene `citas: gestionar` obtiene, en una sola consulta, **solo lo que
necesita para agendar**, ya recortado por su alcance: profesionales
reservables (sin datos de pago ni de cuenta; solo el propio si tiene
`solo_propios`), servicios habilitados en la sede, sedes de su alcance y los
ajustes de agenda del negocio. Productos, solo si además tiene
`inventario: ver`; búsqueda de clientes, solo si además tiene `clientes: ver`
(si no, el cliente se escribe a mano).
- El rol Profesional de fábrica puede crear una cita de principio a fin.
- Nadie obtiene por esta vía un dato que su rol no podría ver.

#### FR-63: Nadie concede lo que no tiene — ⬜ (A-1, G-4)
Al crear o editar una cuenta, por cualquier camino (`/usuarios` o el alta de
un profesional con cuenta), solo se puede asignar un rol cuyos permisos sean
un **subconjunto** de los de quien lo asigna, y un alcance de sedes
**contenido** en el suyo. El administrador general no tiene límite, salvo que
sigue habiendo uno solo.
- El administrador de sede **no invita cuentas** en v1 [PROPUESTA aprobada con
  A-1].
- Intentarlo por la API directamente → 422 en el campo del rol o del alcance,
  sin crear nada.

#### FR-64: Roles de sistema — ⬜ (A-1)
Cada negocio recibe **cuatro** roles de sistema: administrador general (único,
no editable), **administrador de sede** (nombre visible del actual
«administrador local»), **recepción** (nuevo: agenda y clientes de sus sedes y
verificación de pagos; sin equipo, catálogo ni reportes) y profesional.
Editables salvo el general, no borrables, duplicables salvo el general. Los
negocios existentes reciben el nuevo preset sin tocar sus roles
personalizados.

#### FR-65: Alcance por sedes en el equipo — ⬜ (A-1)
El alcance por sedes se aplica también a **profesionales**: quien está
limitado a unas sedes solo ve y gestiona a los profesionales habilitados en
ellas. Se aplicará igual a caja, reportes y dashboard cuando existan.
Clientes, catálogo y configuración siguen siendo de todo el negocio.

#### FR-66: Permiso de pagos de citas — ⬜ (A-1)
Módulo nuevo **`pagos`** para verificar o rechazar evidencias de pago, dentro
del alcance por sedes. Presets: administrador general, de sede y recepción lo
gestionan; profesional no. Es distinto de **facturación**, que es la
suscripción del negocio y sigue siendo solo del administrador general.

### 4.4 Catálogo — ✅

#### FR-15: Categorías de servicio — ✅
Crear, editar y borrar categorías con descripción, color e imagen. Nombre
único por negocio. Borrar deja sus servicios sin categoría.

#### FR-16: Servicios — ✅
Crear, editar y borrar servicios con categoría, duración, precio, color, tipo
(normal, sesiones, clases, paquete; sesiones y paquete exigen máximo de
sesiones), imagen principal más hasta 4 de galería, visibilidad en la tienda y
los profesionales que lo prestan. Borrado recuperable.

### 4.5 Clientes — ✅ (importación ⬜)

#### FR-17: Fichas de cliente — ✅
Crear, editar, buscar y borrar clientes. El teléfono normalizado es único y es
lo que reconoce a un cliente en todas partes. Cada ficha muestra cuántas citas
tiene y la última.

#### FR-18: Importar clientela desde Excel — ⬜ (backlog)
Subir un `.xlsx` o `.csv`, previsualizar el resumen y confirmar. Los
repetidos solo rellenan campos vacíos. Diseño cerrado en
`pendientes-contrato.md` § Backlog. Entrada en el lanzamiento [POR DEFINIR]
(Q-20).

### 4.6 Sedes y grupos — ✅ (con 🟡)

#### FR-19: Sedes — ✅ (su identidad visual cambia con FR-77 y FR-82)
Crear, editar y borrar sedes con dirección, contacto, coordenadas y horario.
La primera es la principal y no se borra. **Desde el lanzamiento, la sede no
tiene identidad visual propia**: hereda logo, color y portada del negocio
(FR-77) y conserva sus datos operativos (dirección, horarios, servicios,
profesionales, WhatsApp propio si lo tiene). Los campos actuales de color,
banner y logo por sede se trasladan según FR-82.

#### FR-20: Quién atiende en cada sede — ✅
Por sede, cada profesional puede estar habilitado o no, con nombre público,
perfil y horario informativo. El horario de la sede **no** limita la
disponibilidad: manda el del profesional.

#### FR-21: Qué servicios ofrece cada sede — ⬜ (A-7)
El catálogo es **del negocio**, y cada sede habilita los servicios que ofrece
(la pestaña «Servicios» de la sede, que hoy no tiene efecto). Al introducirlo,
todos los servicios quedan habilitados en todas las sedes existentes, para que
nadie pierda su catálogo.
- **Precio y duración son los del catálogo en v1.** Las diferencias por sede
  no son un requisito confirmado; el modelo reserva el espacio para ellas sin
  exponerlo.
- Un servicio **sin profesionales asignados no se puede reservar**: no aparece
  en la tienda y el panel avisa «Asigna al menos un profesional».

#### FR-67: Regla única de reservabilidad — ⬜ (A-7)
Un servicio se puede reservar con un profesional en una sede solo si el
servicio está activo y habilitado en esa sede, el profesional está activo y
habilitado en esa sede, y el profesional presta ese servicio. **La misma
regla**, en un solo sitio del servidor, decide la tienda, las opciones para
agendar (FR-62), la creación y edición de citas (FR-28) y la reprogramación
por enlace (FR-69).

#### FR-22: Grupos — 🟡
Se pueden crear grupos de sedes, profesionales y servicios. 🟡 Ninguna otra
parte del sistema los usa: propósito [POR DEFINIR] (Q-08).

### 4.7 Configuración del negocio — ✅

#### FR-23: Datos, marca y agenda del negocio — ✅
El negocio edita por secciones: datos y contacto, zona horaria, horario de
respaldo, marca (colores, logo, portada), tienda pública (activa, términos) y
el paso de la agenda (duración del servicio o intervalo fijo). Guardar una
sección no toca las demás. Solo el administrador general la gestiona.

### 4.8 Inventario — ✅

#### FR-24: Productos — ✅
Crear, editar y borrar productos con precio de venta, de compra y stock
mínimo. El stock no se edita directamente.

#### FR-25: Movimientos de stock — ✅
Registrar entradas y salidas con motivo. Una salida manual no puede dejar el
stock en negativo. Todo cambio de stock queda anotado, incluido el inicial.

#### FR-26: Historial de movimientos (kardex) — ⬜ (backlog)
Consultar los movimientos de un producto. Entrada en el lanzamiento
[POR DEFINIR].

### 4.9 Disponibilidad — ✅

#### FR-27: Cálculo único de huecos — ✅
El sistema calcula los huecos de un profesional para una fecha y una duración
con esta precedencia: excepción no disponible → excepción disponible
(reemplaza el día entero, sin sus descansos) → horario propio → día sin
trabajo → horario del negocio como respaldo. Descuenta descansos y citas no
canceladas (una inasistencia **sí** ocupa su hueco). La rejilla sigue el modo
de agenda del negocio y añade los bordes de citas y descansos.
- El panel y la tienda obtienen **exactamente** los mismos huecos.
- El caso dorado de la ficha de citas (27 huecos de 15 min, 9 de 45) se
  cumple.

### 4.10 Citas — 🟡

**Descripción**: el negocio crea y gestiona citas desde el panel. Realiza UJ-2
y UJ-3.

#### FR-28: Crear y editar citas sin solapes — ✅
Crear una cita con cliente (existente o nuevo), servicio, profesional, sede,
fecha, hora y productos. La hora tiene que ser un hueco disponible; si no,
error en `hora_inicio` que distingue «esa hora ya no está» de «no hay horas
ese día». Dos reservas a la misma hora no pueden quedar guardadas a la vez.
Al crear **y al editar**, el servidor exige además:
- la combinación servicio + profesional + sede cumple FR-67 (G-3);
- la sede está dentro del alcance de quien agenda; sin sede indicada, se usa
  una de su alcance, nunca una ajena (G-2);
- con `solo_propios`, el profesional es su propia ficha, y no puede pasar la
  cita a otro (G-1).
- 🟡 **F-06**: la carrera entre dos peticiones simultáneas no tiene test.
- 🟡 Las tres reglas de arriba **no se comprueban hoy** (verificado).

#### FR-29: Cliente al vuelo — ✅
Sin cliente elegido, con teléfono se reutiliza (o restaura) la ficha; sin
teléfono se crea una ficha nueva aunque el nombre se repita.

#### FR-30: Precio y duración congelados — ✅
Cada línea guarda el precio y la duración del día de la reserva. El monto del
servicio es editable y reescribe el precio de su línea; el total incluye los
productos.

#### FR-31: Estados y stock — ✅
Una cita recorre seis estados. Al completarla, sus productos salen del stock
(aunque lo dejen en negativo); al deshacer el completado, vuelven. Cancelar
conserva el historial; borrar elimina de verdad.

#### FR-32: Ver solo lo propio — ✅
Con `solo_propios`, el listado muestra solo las citas del profesional del
usuario, y la de otro responde 404.

#### FR-33: Canal y autor de la cita — 🟡 (A-2)
Cada cita registra **dos datos distintos**:
- **canal**, por dónde entró: `panel` o `tienda`. Solo existen los canales
  implementados; WhatsApp, API o importación se añadirán cuando existan, no
  antes.
- **quién la registró**: la cuenta del negocio que la creó, o nadie si la
  reservó el cliente en la tienda.
- Las citas existentes pasan de `admin` a `panel` sin perder datos; su autor
  queda vacío porque nunca se guardó.
- La entidad Cita de la API emite `canal` y `creada_por` (`{id, nombre}` o
  vacío), y los reportes agrupan por los mismos canales.
- 🟡 **F-03**: hoy se guarda `admin` y no se guarda el autor.

#### FR-68: Historial de la cita — ⬜ (A-2)
Cada cambio relevante de una cita (creación, cambio de estado, de fecha, de
profesional, de pago) queda en un historial con **quién** lo hizo (cuenta del
negocio, cliente por su enlace, o el sistema), cuándo, y el antes y el
después. Es la base de las notificaciones (FR-74) y de la auditoría. No se
edita ni se borra salvo con la cita.

#### FR-34: Código de la cita visible — ⬜
El código aparece en la ficha de la cita del panel, para que el negocio pueda
citarlo al cliente.

### 4.11 Calendario — ⬜

#### FR-35: Agenda del día por profesional — ⬜
Vista del día con una columna por profesional, las citas reales y las franjas
fuera de jornada o en descanso atenuadas, **coincidiendo con el cálculo del
servidor**. Clic en una cita abre su ficha; clic en un hueco abre el
formulario precargado.
- [POR DEFINIR] (Q-19): impedir o solo avisar fuera de franja; vistas de
  semana o mes; arrastrar para reprogramar.

### 4.12 Tienda pública y reserva online — ⬜

**Descripción**: cada negocio con nombre fijado tiene una tienda en su enlace.
Sin sesión. Realiza UJ-4.

#### FR-36: Resolución de la tienda — ⬜
Visitar el enlace de un negocio muestra sus sedes, o salta directo a la única.
Responde 404 si el negocio no existe, no fijó su nombre o desactivó la tienda;
si está suspendido, muestra la pantalla de FR-43.
- Direcciones: `{negocio}.site.<marca>` (tienda) y
  `{negocio}.site.<marca>/{sede}` (una sede, FR-81). Equivalente sin
  subdominio: `/reservar/{negocio}/{sede}`, p. ej.
  `/reservar/rosa-estilistas/balta`.
- **Desde el enlace de una sede**, esa sede llega **preseleccionada y
  visible**, y el cliente puede cambiarla. Si ya eligió servicios, se le avisa
  antes de reiniciar la selección.
- Con varias sedes reservables, la sede se elige **antes** que el servicio.

#### FR-37: Catálogo público de una sede — ⬜
Muestra la identidad del negocio (FR-77) con los datos de la sede, el catálogo agrupado por categoría (solo
servicios activos y visibles) y los profesionales activos y habilitados en esa
sede con su nombre público. Nunca expone costes, comisiones, correos del
equipo ni estados internos.

#### FR-38: Huecos públicos — ⬜
Para un profesional, una fecha y una duración, devuelve los mismos huecos que
el panel.

#### FR-39: Reserva con carrito — ⬜
El cliente reserva uno o varios servicios, en una sola cita encadenada (mismo
profesional, duración sumada) o en citas separadas. Deja nombre, teléfono y
correo obligatorios, y apellido y documento opcionales. La cita entra
**pendiente** con canal `tienda`, en esa sede: pendiente de pago si paga con
Yape, o **pendiente de su confirmación por correo** si no paga en línea
(FR-84). El cliente se reconoce por teléfono
**normalizado igual que en el panel** (D-13). Recibe un comprobante con código
y total, y el correo C-1 con su enlace de gestión.
- Solo se ofrecen combinaciones reservables (FR-67).
- Una hora ocupada entre la consulta y la confirmación → error y nueva
  elección.
- Las citas aparecen en el panel del negocio.
- Antes de confirmar, el cliente acepta los términos y la política de
  privacidad, y **opcionalmente** (desmarcado por defecto) recibir novedades
  de ese negocio. Se guardan con fecha.

#### FR-69: Gestión de la cita por enlace — ⬜ (A-4)
El cliente, **sin cuenta**, abre desde sus correos una página de **esa cita**
con tres acciones: **ver**, **reprogramar** y **cancelar**. Realiza UJ-8.
- El enlace es secreto (solo se guarda su huella), caduca 7 días después de la
  cita y se puede revocar. No lleva ids en la URL y nunca da acceso a otras
  citas ni a otros negocios.
- **Abrir el enlace no cambia nada**: toda acción se confirma en la página.
- Cada acción comprueba el estado actual de la cita, la política del negocio
  (FR-70) y, al reprogramar, la disponibilidad real con el mismo motor y el
  mismo anti-solape que una reserva nueva, y la regla FR-67.
- Reprogramar mantiene servicio, profesional y precio; solo cambia fecha y
  hora. Cambiar de servicio o profesional se hace con el negocio.
- Enlace caducado, cita ya cambiada o fuera de plazo → explicación clara del
  estado actual y alternativa: WhatsApp o teléfono del negocio, y enlace a la
  tienda para reservar de nuevo.
- El `codigo` de 8 caracteres sigue siendo la referencia legible y la llave
  para subir la evidencia de pago (FR-45).

#### FR-70: Política de cambios del negocio — ⬜ (A-4)
El negocio define cuántas horas antes de la cita el cliente puede reprogramar
o cancelar por su cuenta (por defecto 24 h, [POR DEFINIR] F-2). Fuera de
plazo, el enlace solo permite ver la cita y contactar al negocio. (La opción
«confirmar automáticamente las reservas sin pago» se retiró el 2026-09-19:
ver FR-84.)

#### FR-84: Confirmación por correo de las reservas sin pago en línea — ⬜ (decisión 2026-09-19)
Toda reserva de la tienda que **no se paga con Yape** («pagar en el local», o
negocio que no pide pago) debe **confirmarla el cliente desde su correo**. Es
el único modo: frena reservas falsas sin trabajo para el negocio. Realiza
UJ-4.
- Al terminar, la tienda muestra: «Revisa tu correo para confirmar tu
  reserva», el correo enmascarado, el plazo con hora exacta y que el horario
  está reservado; botones **Reenviar correo** (con espera entre envíos) y
  **Corregir correo** (una vez) [PROPUESTA].
- El correo lleva **«Confirmar mi reserva»**, que abre la página de la cita;
  la confirmación exige pulsar el botón en la página (abrir el enlace no
  cambia nada, FR-69).
- **Plazo configurable por el negocio** (Configuración → Reservas): por
  defecto 30 minutos, **nunca menos de 15** (15 a 120). Cuenta desde la reserva y
  nunca termina después de 15 minutos antes de la cita. La tienda no ofrece horarios que
  empiecen antes de que termine el plazo más ese margen (con 30 minutos:
  nada antes de 45 minutos desde ahora) [PROPUESTA].
- **Confirma a tiempo:** la cita pasa a **confirmada** («pagas en el local» si
  corresponde). **No confirma:** pasa a **cancelada** («reserva no
  confirmada»), el horario se libera y se le avisa. Mismo mecanismo que la
  caducidad del pago (agenda de tareas y mismo bloqueo; AD-7, AD-9).
- Las citas creadas desde el panel no necesitan esta confirmación.

#### FR-40: Protección de la superficie pública — ⬜
Todas las rutas públicas tienen límite de peticiones propio.

#### FR-41: Visibilidad en buscadores — ⬜
[POR DEFINIR] (Q-07) si entra en el lanzamiento.

#### FR-42: Reseñas — ⬜ (backlog)
El cliente valora su cita y el negocio responde. Hoy la tienda las pinta con
datos ficticios y la sección se oculta sin reseñas. Entrada [POR DEFINIR]
(Q-20).

#### FR-43: Pantalla «tienda no disponible» — ⬜
Un negocio suspendido muestra una página propia, no un error genérico.

### 4.13 Pago de la cita con QR de Yape — ⬜ · **entra al lanzamiento** (Q-05)

**Descripción**: sin pasarela y **sin que la plataforma toque el dinero**: el
cliente paga directamente al Yape del negocio. **Mostrar el QR no confirma
nada**: el pago solo cuenta como recibido cuando alguien del negocio con el
permiso `pagos` verifica la evidencia. Es independiente de la suscripción del
negocio. Realiza UJ-4. Hoy **solo existe el esquema** (verificado); el diseño
original está en `discrepancias.md` §6, con los cambios de A-3.

Estados: la cita sigue **pendiente** mientras el pago esté pendiente o en
verificación; solo pasa a **confirmada** al verificar. Pago: `pendiente →
comprobante_subido → verificado | rechazado`, más `devolucion_pendiente →
devuelto` tras una cancelación de una cita pagada.

#### FR-44: Configurar cobro por QR — ⬜
El administrador general activa el cobro por QR con imagen e instrucciones y
elige si el pago es **no pedido, opcional u obligatorio**, el plazo para
subir la evidencia (**por defecto 15 min, entre 15 y 60**) y el plazo para
corregir un comprobante rechazado (por defecto 30 min, entre 15 y 120).
Los plazos los fija el negocio, **pero nunca por debajo de 15 minutos**: con
menos, alguien podría pagar y perder su cita, y eso se le achaca al producto.
- **Lanzamiento: un único QR del negocio** para todas las sedes. El QR por
  sede y los adelantos son **posteriores**.

#### FR-45: Subir la evidencia — ⬜
Con el `codigo` de su cita (desde la confirmación de la reserva o su enlace de
gestión), el cliente sube una captura (JPG, PNG o WebP, máx. 5 MB) y
opcionalmente el número de operación. Reglas no negociables (regla 7 del
backend): autorización por código y nunca por id numérico, tipo de archivo por
contenido real, re-codificado de la imagen, nombre aleatorio, almacenamiento
privado, servido solo por enlace temporal al panel, límite por IP y por
código. Solo un intento en verificación a la vez; tras un rechazo se puede
volver a subir.

#### FR-46: Verificar o rechazar — ⬜
Desde la tabla y la ficha de citas (sin pantalla nueva), quien tiene `pagos:
gestionar` en esa sede filtra «pagos por verificar», ve la evidencia y
**aprueba** (la cita pasa a confirmada) o, con motivo obligatorio, elige
entre dos salidas:
- **«Pedir otra captura»** (corregible: captura ilegible, monto incompleto,
  imagen equivocada). La cita sigue **pendiente de pago**, con el horario
  **retenido**, y se abre un plazo de corrección (FR-71). Máximo 3 capturas
  por cita [SUPUESTO].
- **«Rechazar y cancelar la cita»** (definitivo: el pago no aparece en su
  Yape, o el comprobante es falso o está duplicado). La cita pasa a
  **cancelada**, el horario se libera y el cliente recibe el motivo.
- **Lanzamiento: se cobra solo el total** del monto de la cita cuando el
  negocio exige pago. Los **adelantos son posteriores** (el modelo de datos ya
  los admite).
- **Caja**: mientras Caja no esté lanzada, verificar **no** crea movimientos
  de caja (si no, la primera caja que se abriera adoptaría meses de pagos de
  golpe). Cuando Caja exista, el pago verificado genera su ingreso con método
  Yape.

#### FR-71: Caducidad de la reserva impaga — ⬜ (A-3)
Solo cuando el pago es **obligatorio**: si el cliente no sube la evidencia
dentro del plazo, la cita pasa a **cancelada** (motivo «pago no recibido»), el
hueco se libera y se avisa al cliente y al negocio. Con la evidencia subida,
la cita **ya no caduca**: la espera es del negocio. Con pago opcional, nunca
caduca.
- **Desde cuándo:** el plazo inicial cuenta desde que se crea la reserva; el
  de corrección, desde que el negocio pulsa «Pedir otra captura». El horario
  queda **retenido** durante los dos.
- **Plazo de corrección:** el configurado por el negocio (por defecto 30
  minutos, mínimo 15), sin pasar del límite siguiente.
- **Nunca más allá del inicio de la cita:** todo plazo termina, como tarde,
  **15 minutos antes de la hora de la cita** [SUPUESTO]. Si al abrirse quedan
  menos de 15 minutos, **no se cancela sola**: la cita queda pendiente de pago,
  se avisa al negocio y este decide en el mostrador, para no cancelar a
  alguien que ya está llegando.
- Con pago obligatorio, la tienda **no ofrece horarios que empiecen antes de
  que termine el plazo inicial más esos 15 minutos**, para que siempre haya
  tiempo real de pagar [PROPUESTA].
- La caducidad se ejecuta con el mismo bloqueo que una reserva nueva, así que
  no puede chocar con alguien que reserve ese hueco en el mismo instante.
- Si pasan 2 h con una evidencia sin revisar, se avisa al negocio (P-3).
- **Rescate de un pago tardío:** si la evidencia llega **después** de vencido
  el plazo y el horario **sigue libre**, la reserva se **reactiva** y queda en
  revisión. Si otra persona ya lo tomó, la página lo dice y ofrece horarios
  cercanos o que el negocio devuelva el dinero; el pago queda registrado como
  devolución pendiente. Se resuelve con el mismo bloqueo que una reserva
  nueva (AD-7).

#### FR-72: Cancelaciones, reprogramaciones y devoluciones — ⬜ (A-3)
- **Reprogramar** conserva el pago: es la misma cita.
- **Cancelar una cita con pago verificado** (la cancele el cliente dentro de
  plazo o el negocio) deja el pago en **devolución pendiente** y avisa al
  negocio. El negocio devuelve el dinero **fuera del sistema** y lo marca como
  devuelto. La plataforma no devuelve dinero que no tocó; solo lo registra.
- **El rechazo definitivo** (FR-46) cancela la cita y libera el horario; si
  el negocio sí había recibido parte del dinero, lo registra como devolución
  pendiente.
- Cada estado del pago avisa al cliente por correo (P-1 a P-8).

### 4.14 Plantillas de WhatsApp — ⬜ · después del lanzamiento

#### FR-47: Plantillas por evento — ⬜
El negocio mantiene una plantilla por evento (confirmación, recordatorio,
cancelación, finalizado, bienvenida, pago en línea, redes sociales, cumpleaños,
personalizado). Guardar sobre un evento ocupado lo reemplaza. Prueba de envío
abriendo WhatsApp.

#### FR-48: Envío y consumo — ⬜ [POR DEFINIR] (Q-18)
Qué dispara cada evento, si el envío es manual (`wa.me`) o automático, y si
se cuenta el consumo contra el cupo del plan. Hoy el plan vende un cupo que
nada cuenta.

### 4.15 Caja — ⬜ · después del lanzamiento

#### FR-49: Sesión diaria de caja — ⬜
Una sesión por día: abrir con monto inicial (dos veces el mismo día →
rechazado), registrar ingresos y egresos con **método de pago** (efectivo,
tarjeta, Yape, Plin) mientras esté abierta, y cerrar con el monto contado. La
diferencia de arqueo se calcula en pantalla. Tras cerrar no se admiten
movimientos. Los movimientos sin sesión (p. ej. de pagos QR) se adoptan al
abrir.

#### FR-50: Historial de cajas — ⬜ (backlog)
Consultar sesiones de días anteriores. Entrada [POR DEFINIR].

### 4.16 Dashboard — ⬜

#### FR-51: Resumen del día — ⬜
En una sola carga: citas de hoy, pendientes, total de clientes, ingresos de
hoy, ventas de los últimos 7 días (con ceros) y citas del día ordenadas por
hora. Criterios de «ingresos» y «pendientes» [POR DEFINIR] (Q-09) — deben ser
los mismos que en Reportes.

### 4.17 Reportes — ⬜ · después del lanzamiento

#### FR-52: Informe por rango de fechas — ⬜
Para un rango: citas, completadas, canceladas, ingresos, ocupación e
inasistencias, comparados con el período anterior; desglose por servicio y por
profesional (incluidos los de cero); mapa de calor por día y hora; origen de
las citas; serie diaria.

#### FR-53: Exportar — ⬜
Descargar el informe en CSV que Excel abra con acentos.

### 4.18 Soporte — ⬜ · después del lanzamiento (el contacto del lanzamiento es WhatsApp o correo)

#### FR-54: Tickets del negocio — ⬜
El negocio crea tickets (asunto, mensaje, prioridad) y ve los suyos con su
estado y la respuesta. Nunca ve los de otro negocio. No edita ni borra.
- [POR DEFINIR]: aviso cuando responden, conversación de varios turnos,
  adjuntos.

### 4.19 Suscripción y planes — ⬜

#### FR-55: Estado de la suscripción — 🟡
El panel muestra el estado (prueba, activa, vencida), los días restantes y un
aviso durante la prueba. Con la suscripción vencida, el negocio entra pero
solo a Mi Plan, Soporte, su perfil y cerrar sesión. 🟡 La puerta de cobro
funciona; el aviso y Mi Plan no.

#### FR-56: Elegir plan y extras — ⬜
El negocio ve los planes ordenados por precio, con el **sugerido** según sus
profesionales reales (o, si no dio de alta a nadie, según lo que declaró al
registrarse). Nunca se esconden planes. Puede añadir profesionales y paquetes
de WhatsApp extra (0–100). Si su equipo actual no cabe en un plan, se le avisa
antes de elegirlo.

#### FR-57: Contratar y activar — ⬜ (A-6)
**Lanzamiento: activación manual.** El negocio pide el plan desde Mi Plan
(«contáctanos», por WhatsApp o correo de la plataforma) y un administrador de
la plataforma lo activa desde el panel de plataforma (FR-60, UJ-7).
- Todo cambio de plan registra administrador, fecha, motivo, plan anterior y
  nuevo, periodicidad, vigencia y complementos. **Activar no es cobrar**: el
  pago se registra aparte, con su referencia y evidencia.
- **Un único punto de entrada** aplica los cambios, con las mismas reglas de
  beneficios, vigencia y límites, venga del panel manual, del ciclo de vida
  diario o, en el futuro, de la pasarela.
- **Después del lanzamiento: pasarela** (Mercado Pago propuesto, pendiente de
  validar; ofrece suscripciones recurrentes en Perú). **Ambas vías conviven**:
  cada negocio está en modo de cobro manual o por pasarela, nunca los dos a la
  vez; los eventos de la pasarela son idempotentes y no pisan un cambio manual
  posterior; un cambio manual sobre un negocio con pasarela obliga a pasarlo a
  manual o a registrarlo como cortesía temporal.
- [POR DEFINIR] (L-6): RUC y comprobante por la suscripción.

### 4.20 Ciclo de vida y operación de la plataforma — ⬜

#### FR-58: Ciclo de vida automático — ⬜
Cada día: la prueba vence → aviso → suspensión → aviso de purga → copia de
seguridad, borrado de la base y baja lógica. Un negocio suspendido tiene la
tienda en 404.

#### FR-59: Métricas de la plataforma — ⬜
Cada noche se agregan las cifras de cada negocio activo a una tabla central,
sin cruzar bases.

#### FR-60: Panel de plataforma — ⬜ · **entra al lanzamiento** (A-6 aprobada 2026-09-19)
Aplicación interna, **separada del panel del negocio**, para el equipo de la
plataforma. Hoy solo existen las tablas `platform_admins`, `soporte_acciones`
y `pagos`; no hay acceso, rutas ni pantallas. Realiza UJ-7.

- **Acceso propio**: usuarios de `platform_admins` (roles `superadmin` y
  `soporte`), su propio inicio de sesión, **2FA obligatorio**, su propio
  subdominio y su propia cookie. Una cuenta de negocio nunca entra aquí, ni
  al revés.
- **Lista de negocios**: estado, plan, periodicidad, fecha de vencimiento,
  profesionales y sedes activos, con búsqueda y filtro por estado.
- **Ficha del negocio**: datos centrales, historial de cambios de plan y de
  pagos. **Sin acceso a su base de datos** (citas, clientes, caja).
- **Activar o cambiar plan**: plan nuevo, periodicidad, vigencia (desde/hasta),
  complementos y **motivo obligatorio**. Cada cambio queda registrado con el
  administrador, la fecha, el plan anterior y el nuevo, y no se puede editar
  después. Aplica las mismas reglas de beneficios, vigencia y límites que
  aplicará la futura pasarela (un único punto de entrada).
- **Registrar pago**: monto, fecha, método, referencia y evidencia. Es una
  acción **distinta** de activar: activar nunca marca un pago como recibido.
  Se puede activar sin pago (piloto, cortesía) dejando constancia.
- **Suspender y reactivar** un negocio, con motivo.
- Toda acción queda en la bitácora de auditoría (`soporte_acciones`).
- Solo `superadmin` cambia planes y registra pagos; `soporte` consulta
  [PROPUESTA].
- Fuera del lanzamiento: responder tickets (llega con Soporte), acceso
  temporal y auditado a los datos de un negocio, y conciliación con la
  pasarela.

### 4.21b Identidad del negocio en su página de reservas — ⬜ (UX 2026-09-19)

**Descripción**: el cliente debe sentir que está en la página del negocio.
Nombre, logo e identidad visual del negocio mandan; ChiraFlow aparece solo en
el pie. Diseño y comportamiento en
`../../ux-designs/ux-ChiraFlow-2026-09-19/` (DESIGN.md y EXPERIENCE.md).

#### FR-77: Identidad del negocio en la tienda — ⬜
Logo, color principal y portada del negocio en la tienda, la página de la cita
y los correos de cita, **en todos los planes**. Tres estilos de portada:
**color sólido**, **degradado prediseñado** y **fotografía con capa de
color**. Sin foto subida, la portada es sólida (o el degradado elegido).
Todas las sedes heredan la identidad del negocio.
- El texto sobre el color del negocio se calcula para cumplir contraste AA
  (blanco o azul marino); un color sin contraste posible se rechaza.
- Los fondos decorativos solo van en la portada: servicios, calendario y
  formularios usan superficies limpias.
- **El negocio no tiene color secundario** (ver FR-82).

#### FR-78: Editor básico de apariencia — ⬜
El administrador general, en Configuración → Apariencia, cambia logo, color,
estilo de portada, degradado y fotografía con **punto de enfoque**, con
**vista previa en vivo en móvil y escritorio**.
- **«Publicar cambios»** los aplica al instante para los clientes.
- **«Descartar cambios»** vuelve a la **última apariencia publicada**; hasta
  publicar, los cambios solo existen en esa pantalla.
- Posteriores: borrador guardado, restaurar el diseño inicial, historial,
  programar la publicación, más estilos y fuentes, ocultar la marca del pie y
  dominio propio.

#### FR-79: Imágenes de marca procesadas y limitadas — ⬜
- Logo: PNG, JPG o WebP (**sin SVG ni GIF**), hasta 1 MB, mínimo 256 × 256 px;
  se guarda en WebP de 512 px.
- Portada: JPG, PNG o WebP, hasta 5 MB, mínimo 1600 × 600 px; se guarda en
  WebP en 2400, 1600 y 800 px de ancho, sin metadatos.
- Se validan el tipo real y las dimensiones; al reemplazar se borran las
  versiones anteriores. La tienda sirve el tamaño adecuado a cada pantalla.

#### FR-80: Portada propia por sede — ⬜ · **posterior al lanzamiento**
Función de plan `portada_por_sede` (AD-5), para los planes con varias sedes:
la sede puede tener su foto de portada y, sin ella, hereda la del negocio.
Logo y color siguen siendo del negocio.

#### FR-81: Dirección pública de cada sede — ⬜
Cada sede tiene un **slug único dentro de su negocio** (`balta`), derivado de
su nombre al crearla (con sufijo si se repite) y sin palabras reservadas
(`cita`, `reservar`, `publico`…). Dos negocios pueden tener cada uno su sede
«centro» sin conflicto, porque el slug vive dentro del negocio.
- **Si el slug de la sede cambia**, el anterior queda guardado y **redirige
  para siempre** al nuevo; ninguna otra sede del negocio puede reutilizarlo.
- **Los enlaces existentes** con el id numérico
  (`/reservar/{negocio}/sucursal/{id}`) **redirigen** a la dirección con slug
  durante la transición, y después se retiran.
- El slug del negocio sigue siendo inmutable (decisión vigente).

#### FR-82: Traslado de la identidad de las sedes al negocio — ⬜
Una migración de datos, sin perder nada:
- **Logo:** si el negocio no tiene logo y su sede principal sí, pasa al
  negocio.
- **Color:** si el color del negocio sigue siendo el predeterminado y la sede
  principal tiene uno, se adopta el de la sede principal; si no, se mantiene
  el del negocio.
- **Portada:** si el negocio no tiene portada y la sede principal tiene
  banner, este pasa a ser la foto del negocio.
- **Sedes con logo o color distintos:** los valores **no se borran** (quedan
  guardados para cuando llegue FR-80) y el editor muestra una vez el aviso
  «Tus sedes tenían colores o logos distintos; ahora todas usan los del
  negocio», con la opción de adoptar los de otra sede.
- **Color secundario:** se retira de la pantalla y de la API; la columna queda
  sin uso hasta eliminarla en una limpieza posterior.
- Un color trasladado que no cumple el contraste no se rechaza: se marca en el
  editor para que el negocio lo corrija.

### 4.21 Adquisición — ⬜

#### FR-61: Landing del SaaS — ⬜
Página pública del producto con la propuesta de valor, los planes y el acceso
al registro de prueba. Contenido y dominio [POR DEFINIR].

### 4.22 Notificaciones por correo — ⬜ (A-5)

**Descripción**: los eventos relevantes avisan **a quien le importan**, no a
todos. Reutiliza lo que ya existe (verificado): Resend, la cola, los tres
correos de cuenta y la plantilla común. Falta todo lo de citas, pagos, equipo
y suscripción, además del registro de envíos, las preferencias y la
fiabilidad. WhatsApp, SMS y campañas promocionales **no** son parte del
lanzamiento.

#### FR-73: Envío fiable — ⬜
- Un correo solo se envía **después de guardar** la operación que lo provoca.
  **Si falla el correo, la operación no se deshace**: el fallo queda en el
  registro del envío, no en la cita.
- Se procesa en segundo plano, con **reintentos limitados** (3) y **sin
  duplicados** (clave única por evento, cita, destinatario y versión de la
  cita).
- Antes de enviar se relee la cita: si cambió y el aviso ya no aplica, el
  envío se marca como omitido.
- Los recordatorios se programan al crear la cita, y se **cancelan y
  reprograman** al reprogramarla o cancelarla.
- Las horas se programan en UTC y se escriben en la zona horaria del negocio,
  indicándola.
- Cada envío tiene estado: pendiente, aceptado por el proveedor, **entregado**
  (solo con confirmación del proveedor), rebotado, queja, fallido, omitido o
  cancelado. Un rebote o una queja suprimen ese correo en ese negocio y lo
  marcan en la ficha.
- Los envíos, sus datos y su configuración son **de cada negocio**; nada se
  mezcla entre negocios.
- El dominio remitente está autenticado (SPF, DKIM y DMARC) y el remitente
  muestra el nombre del negocio, con respuesta a su correo o al de la sede.
- 🟡 Hoy: la recuperación de contraseña sale **en inglés**, el correo de
  verificación no usa la plantilla común ni tiene versión de texto, y el
  remitente es un dominio ajeno al producto.

#### FR-74: Eventos y destinatarios — ⬜ (matriz actualizada el 2026-09-19)
Los eventos, sus destinatarios, el momento, dónde se configuran, si se pueden
desactivar y en qué plan están en la matriz aprobada de
`../../propuesta-decisiones-2026-09-19.md` §4.3. Grupos:
- **Citas** (C-1 a C-12): reserva recibida pendiente de pago,
  **«Confirma tu reserva»** (C-11, con el botón y el plazo), **reserva no
  confirmada y cancelada** (C-12), confirmada (con tres textos según el pago:
  verificado, **«pagas en el local»** o sin pago), creada desde el panel, reprogramada,
  cancelada, cambio de profesional, recordatorios y agenda del día.
- **Pagos de cita** (P-1 a P-8): pendiente de pago, **comprobante recibido, en
  revisión**, por verificar (al negocio), aprobado, **se pide otra captura**
  (corregible), plazo vencido, devolución pendiente y **pago rechazado con
  cita cancelada** (definitivo, P-8).
- **Equipo** (E-1 a E-3), **suscripción** (S-1 a S-4), **cuenta y
  seguridad** (K-1 a K-4) y **plataforma** (X-1 a X-3).

Reglas:
- **Pendiente no es confirmada.** Mientras haya un pago por verificar, el
  correo dice que la cita **no está confirmada**. Solo C-3 y P-4 dicen
  «confirmada».
- Los correos del cliente llevan **Ver reserva, Reprogramar y Cancelar**
  (FR-69) en **todos los planes**. Los del personal enlazan al panel, con
  sesión y permisos, y nunca llevan enlaces de cliente.
- Cada destinatario recibe solo los datos que necesita: un profesional no ve
  el teléfono del cliente si su rol no lo permite (F-3).
- Plantillas con negocio, cliente, servicio, sede, profesional, fecha, hora,
  zona horaria y estado; en una columna, legibles en móvil, con versión de
  texto; logo, nombre y un uso moderado del color del negocio **en todos los
  planes** (sin fondos fotográficos de la portada).

#### FR-75: Configuración y preferencias — ⬜
- **Negocio** (sección «Notificaciones» de Configuración, administrador
  general): avisos opcionales, número y hora de los recordatorios (dentro del
  plan), remitente y correo de respuesta, logo y color, política de cambios
  (FR-70) y cobro por QR (FR-44).
- **Sede** (plan Negocio, administrador de sede): correo de respuesta,
  teléfono de contacto y horario de recordatorios.
- **Cada usuario** (Mi perfil): reservas nuevas al instante, en resumen diario
  o nunca; agenda del día; cambios de horario. Los de seguridad no se quitan.
- **Cliente**: puede dejar de recibir **recordatorios** de ese negocio desde
  el pie del correo. Los avisos del estado de su cita no se quitan.
- **Sin correo válido**: el cliente creado por teléfono no recibe nada y el
  formulario lo advierte. El profesional sin cuenta recibe avisos solo si su
  ficha tiene un correo para avisos [POR DEFINIR] (F-4), y sin enlaces al
  panel.
- **Precedencia**: el plan permite → el negocio activa → el destinatario no se
  dio de baja → hay correo válido. Los esenciales se saltan el tercer paso,
  nunca el cuarto.
- **Operativo frente a promocional**: en el lanzamiento solo hay correos
  operativos; el consentimiento promocional se recoge (FR-39) y se guarda para
  el futuro.

#### FR-83: Avisos por WhatsApp al personal del negocio — ⬜ (decisión 2026-09-19)
El sistema avisa por WhatsApp, desde **un único número emisor de ChiraFlow**,
a los **números internos** que cada negocio configura (recepción,
verificación de pagos). **Nunca** escribe a clientes finales ni usa el número
del negocio.
- Avisos: **comprobante por verificar** (P-3) y **reserva nueva** (C-2), según
  lo que elija cada número.
- **Consentimiento verificado:** al añadir un número, la persona envía desde
  él un mensaje con un código («ACTIVAR 482913») al número de ChiraFlow; hasta
  entonces no recibe nada.
- **Uso responsable:** límite por minuto y por destinatario, avisos
  agrupados («3 comprobantes por verificar»), textos cortos sin enlaces
  acortados, horario del negocio y calentamiento del número nuevo.
- **Canal secundario:** el correo y el contador del panel se envían siempre;
  si WhatsApp falla o el número cae, no se pierde ningún aviso, solo llega
  más lento. La plataforma recibe una alerta si la sesión se desconecta (X-2).
- **Proveedor del lanzamiento:** Evolution API (conexión no oficial) alojado en
  Railway. El riesgo de bloqueo lo asume la plataforma. Cuando Meta verifique
  la empresa, se cambia a la API oficial (Kapso) sin tocar la lógica.

#### FR-76: Cuota de correos — ⬜
Cada plan incluye una cuota mensual de correos (propuesta en §6). Al
alcanzarla, los **esenciales siguen saliendo siempre**; se **pausan los
opcionales** (recordatorios adicionales, agenda del día) con aviso al titular
y aviso visible en el panel, **nunca en silencio**. Al bajar de plan, los
recordatorios ya programados de citas existentes se envían igual; los nuevos
siguen las reglas del plan nuevo. Los avisos de seguridad y de suscripción no
cuentan para la cuota.

## 5. Requisitos no funcionales transversales

- **NFR-1 Aislamiento entre negocios**: un usuario del negocio A recibe **404**
  (no 403) al pedir cualquier recurso del negocio B. Obligatorio en cada
  endpoint, incluidas las tablas centrales con referencia al negocio.
- **NFR-2 Seguridad**: el navegador nunca ve el token; las reglas de seguridad
  viven en un solo sitio del servidor; toda ruta sin sesión tiene límite de
  peticiones.
- **NFR-3 Hora local**: toda fecha y hora de negocio se interpreta en la zona
  horaria del negocio.
- **NFR-4 Idioma**: toda la interfaz y **todos los mensajes de error** en
  español. 🟡 **F-04**: los mensajes de validación sin texto propio salen en
  inglés.
- **NFR-5 Listas**: todo listado va paginado, busca con `search` y filtra por
  parámetros. Ningún selector puede perder opciones en silencio (🟡 **F-05**).
- **NFR-6 Formas de datos**: las que fija `api-contract.md`; importes en soles
  como número; el servidor envía claves, el cliente pone colores y etiquetas.
- **NFR-7 Móvil**: el panel y la tienda se usan desde el celular; los diálogos
  se adaptan como hoja inferior.
- **NFR-8 Correo**: los correos de verificación, recuperación e invitación se
  envían en segundo plano.
- **NFR-9 Operación**: [POR DEFINIR] (Q-13) hosting, copias de seguridad,
  disponibilidad objetivo y monitoreo.
- **NFR-10 Protección de datos personales**: [PROPUESTA] cumplir la Ley
  N.° 29733 de Protección de Datos Personales del Perú (política de
  privacidad, consentimiento en la reserva pública, derecho de supresión).
  Ninguna fuente lo menciona hoy.
- **NFR-11 Orden de autorización** (A-1): toda acción pasa, en este orden,
  (1) **aislamiento**: el recurso es del negocio del token, si no 404;
  (2) **suscripción** no vencida, si no 403 `suscripcion_vencida` (salvo Mi
  Plan, perfil y salir); (3) **plan**: incluye la función, si no 403
  `plan_no_incluye`; (4) **permiso** del rol, si no 403 `sin_permiso`;
  (5) **alcance**: sede y solo lo propio, si no 404. Los **límites** de
  capacidad se comprueban solo al crear o activar (422). El plan habilita
  funciones del negocio y **nunca** concede permisos a una persona: subir de
  plan no convierte a nadie en administrador. La seguridad y el aislamiento
  son iguales en todos los planes.
- **NFR-12 Reglas en un solo sitio**: cada regla de seguridad o de negocio
  (reservabilidad, disponibilidad, «nadie concede lo que no tiene», aplicación
  de un cambio de plan) vive en un solo service del servidor y la llaman todos
  los caminos. Nunca dos copias.

## 6. Monetización

Suscripción por negocio con **tres conceptos que no se mezclan**: **plan**
(funciones y límites), **periodicidad** (mensual o anual) y **complementos**
(capacidad extra). El **rol** de cada persona no depende de nada de esto.

- Los precios del seeder (Básico S/99, Premium S/149, Pro S/449) **no están
  aprobados**, y son idénticos a los de AgendaPro Perú.
- **Propuesta en revisión** (F-5, `../../propuesta-decisiones-2026-09-19.md`
  §3): **Independiente** S/39 (1 profesional, 1 sede), **Equipo** S/89 (hasta
  5, 1 sede), **Negocio** S/189 (hasta 15, hasta 3 sedes); anual con 2 meses
  gratis; complementos de profesional (S/12), sede (S/39, solo Negocio) y 5 000
  correos (S/15). Usuarios del panel ilimitados en todos. **Pago QR, botones
  de gestión de la cita, e identidad del negocio (logo, color y los tres
  estilos de portada) incluidos en todos los planes.** La portada propia por
  sede (FR-80, posterior) será la función de plan `portada_por_sede`, activada
  en los planes con varias sedes, nunca por el nombre del plan.
- **Cómo se cuentan los límites**: profesionales y sedes **activos**; los
  desactivados no cuentan. Correos: los aceptados por el proveedor en el mes,
  sin contar los de seguridad y suscripción.
- **Bajar de plan o exceder la capacidad** no borra ni desactiva nada: bloquea
  crear o activar más, deja en solo lectura lo que el plan ya no incluye y lo
  avisa en pantalla. Tras [POR DEFINIR] (F-7) días de gracia, las sedes por
  encima del límite dejan de aceptar reservas nuevas; sus citas siguen vivas.
- **Vencimiento**: puerta de cobro para el negocio; las citas ya reservadas se
  mantienen y sus correos esenciales al cliente siguen saliendo; la tienda deja
  de aceptar reservas nuevas.
- Prueba: 7 días en el código; propuesta de 14 (F-6). Cobro del lanzamiento:
  manual (FR-57).

## 7. Lo que no es este producto (v1)

- No tiene cuentas de cliente final ni login social.
- No es un marketplace de negocios (el flag `mostrar_en_marketplace` existe,
  sin pantalla que lo use) [SUPUESTO].
- **No toca el dinero de las citas**: el cliente paga al Yape del negocio y la
  plataforma solo registra la evidencia y su verificación.
- No cobra la suscripción con pasarela en el lanzamiento (activación manual;
  Mercado Pago después).
- No envía WhatsApp a clientes, SMS ni campañas promocionales en el
  lanzamiento. El único WhatsApp es el aviso al personal de cada negocio
  (FR-83).
- No es multi-idioma ni multi-moneda.
- No tiene tiempo real (websockets).
- Una persona pertenece a **un solo negocio**; varios negocios por persona es
  posterior.
- No emite comprobantes electrónicos del negocio a sus clientes
  [SUPUESTO — confirmar en L-6].

## 8. Alcance del lanzamiento

**Recomendado** a partir de tu propuesta y de sus dependencias reales
(`../../propuesta-decisiones-2026-09-19.md` §5). **[POR DEFINIR]: confírmalo**
(Q-04); la fecha depende de tu disponibilidad (Q-03, L-4).

**Entra al lanzamiento**
1. Lo ya construido (§4.1–4.10), con los fallos 🟡 corregidos, incluidos
   G-1 a G-4, onboarding, canal y autor de la cita, mensajes en español y Mi
   perfil conectado.
2. Permisos de A-1: opciones para agendar, «nadie concede lo que no tiene»,
   preset Recepción, alcance en profesionales y permiso de pagos (FR-62 a
   FR-66).
3. Servicios por sede y reservabilidad única (FR-21, FR-67).
4. Calendario conectado (FR-35); reprogramar y cancelar desde el panel.
5. Tienda pública completa (FR-36 a FR-40, FR-43) con dirección de sede por
   slug (FR-81), identidad del negocio y editor básico de apariencia (FR-77 a
   FR-79), traslado de la identidad de las sedes (FR-82) y gestión de la cita
   por enlace (FR-69, FR-70).
6. Pago de la cita con QR de Yape (FR-44 a FR-46, FR-71, FR-72).
7. Notificaciones por correo (FR-73 a FR-76) con los eventos esenciales y un
   recordatorio, y avisos por WhatsApp al personal (FR-83).
8. Suscripción: estado, Mi Plan con «contáctanos», ciclo de vida mínimo
   (vencer → avisar → suspender) y planes nuevos (FR-55 a FR-58).
9. Panel de plataforma (FR-60).
10. Dashboard mínimo real (FR-51 reducido: citas de hoy, pagos por verificar,
    próximas citas). **Ninguna pantalla con datos ficticios**: los módulos que
    no se lanzan se ocultan del menú.
11. Landing, términos y privacidad (FR-61, NFR-10), despliegue con entorno de
    pruebas, dominio y remitente verificados, copias de seguridad probadas.
12. [PROPUESTA] Piloto cerrado con 2–3 negocios antes de abrir el registro.

**Después del lanzamiento** (siguen en el alcance general): portada propia por
sede (FR-80), QR por sede, funciones avanzadas del editor, Caja, Reportes,
Soporte con tickets, plantillas y envío de WhatsApp, recordatorios 2 y 3,
reglas por sede, registro de entregas visible al negocio, pasarela de
suscripciones, adelantos, precio y duración por sede, varios negocios por
persona, acceso de soporte temporal, purga automática, métricas de plataforma,
reseñas, importación de clientela, kardex, historial de cajas, SEO de la
tienda, dominios personalizados y campañas promocionales.

## 9. Métricas de éxito — [PROPUESTA]

Ninguna fuente define metas. Propongo medir, con metas [POR DEFINIR]:

- **SM-1 Activación**: % de negocios registrados que completan los 6 pasos
  del onboarding en su prueba. Valida FR-7, FR-8.
- **SM-2 Primera reserva pública**: % de negocios con al menos una reserva
  por la tienda en su prueba. Valida FR-36–FR-39.
- **SM-3 Conversión de prueba a pago**. Valida FR-56, FR-57.
- **SM-4 Retención**: negocios que pagan el segundo mes.
- **SM-5 Pago QR**: % de reservas con pago obligatorio que caducan sin
  evidencia, tiempo medio de verificación del negocio, y tasa de inasistencia
  con pago frente a sin pago. Valida FR-44–FR-46 y FR-71.
- **SM-8 Reservas confirmadas por correo**: % de reservas sin pago en línea
  que el cliente confirma a tiempo, y cuántas caducan. Valida FR-84.
- **SM-6 Autogestión**: % de reprogramaciones y cancelaciones hechas por el
  cliente desde su enlace. Valida FR-69.
- **SM-7 Entrega de correos**: % entregados y % rebotados por negocio. Valida
  FR-73.
- **SM-C1 Contramétrica**: citas solapadas o rechazadas por el servidor tras
  ofrecer el hueco (debe ser 0). No se optimiza la cantidad de huecos
  ofrecidos a costa de esto.
- **SM-C2 Contramétrica**: correos por cita. No se sube la tasa de apertura
  enviando más avisos.

## 10. Preguntas abiertas

Aprobadas y ya incorporadas: **A-1 a A-7** (2026-09-19). Quedan
(detalle en `../../propuesta-decisiones-2026-09-19.md` §6):

| # | Pregunta | Bloquea |
|---|---|---|
| Q-04 | Confirmar el alcance del lanzamiento de §8 | Plan de épicas |
| ~~F-1~~ | **Resuelta 2026-09-19:** solo el total en el lanzamiento; adelantos y QR por sede, posteriores | — |
| F-9 | Plazo de corrección tras «pedir otra captura» (propuesta 30 min), margen antes de la cita (15 min) y máximo de capturas (3) | FR-46, FR-71 |
| F-2 | Horas mínimas para que el cliente cambie su cita (propuesta 24 h) | FR-70 |
| F-3 | ¿El profesional ve el teléfono del cliente? | FR-62, FR-74 |
| F-4 | Correo para avisos en la ficha del profesional sin cuenta | FR-75 |
| F-5 | Nombres, precios, cuotas y complementos de los planes | §6, FR-56 |
| F-6 | Días de prueba (7 o 14) y uso de la promo S/9 | FR-58 |
| F-7 | Días de gracia por vencimiento o exceso | §6, FR-58 |
| F-8 | Grupos: ocultar hasta decidir su uso | FR-22 |
| Q-03 / L-4 | Tu disponibilidad semanal y el piloto → fecha | Lanzamiento |
| L-1 | **Nombre comercial y dominio** (remitente, enlaces, subdominios) | FR-73, lanzamiento |
| L-2 | Dominio de las tiendas (comodín) | Lanzamiento |
| ~~L-3~~ | **Resuelta 2026-09-19:** Contabo + Forge, Vercel Pro, Cloudflare (arquitectura AD-20) | — |
| L-5 | Textos legales | Lanzamiento |
| L-6 | RUC y comprobantes por la suscripción | FR-57 |
| Q-07 | SEO de la tienda | Posterior |
| Q-19 | Calendario: ¿bloquear fuera de franja? ¿semana/mes? ¿arrastrar? | FR-35 |

## 11. Índice de supuestos

- §7 — El marketplace no es parte de v1 (existe el flag, sin pantalla).
- §7 — No se emiten comprobantes electrónicos del negocio a sus clientes.
- §6 — Tipo de cambio ≈ S/3,7 por USD para estimar costos.
- FR-46, FR-71 — 30 min para corregir, 15 min de margen antes de la cita y
  3 capturas como máximo (F-9).
- FR-77 — 8 colores sugeridos y 8 degradados prediseñados; valores por fijar
  en la historia de diseño.
- §8 — Ritmo de desarrollo igual al medido en git (≈ 1,3 días activos por
  módulo y lado).
- Nombre comercial «ChiraFlow» tomado del nombre del repositorio.
