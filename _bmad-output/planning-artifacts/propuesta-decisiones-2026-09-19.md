---
title: Respuesta a las decisiones bloqueantes y revisiones de roles, planes y notificaciones
status: A-1 a A-7 aprobadas (2026-09-19); F y L pendientes
created: 2026-09-19
entrada: diagnostico-2026-09-19.md · prds/prd-ChiraFlow-2026-09-19/prd.md
---

# Propuesta: decisiones bloqueantes, roles, planes y notificaciones

**Convenciones.** **[PROPUESTA]** = recomendación mía que necesita tu visto
bueno. **[SUPUESTO]** = inferencia que no pude verificar. **[POR DEFINIR]** =
dato que falta. **Verificado** = lo comprobé en el código el 2026-09-19. Nada de
este documento está implementado: es diseño.

> ⚠️ **Tres propuestas cambian decisiones que hoy están cerradas.** Van
> marcadas con **⟲ REABRE** y no se aplican sin tu aprobación explícita:
> caducidad de reservas impagas (`discrepancias.md` §6.2.1), el uso de
> `citas.fuente` (§2.11) y el canal de gestión de la cita por el cliente
> (de «código por WhatsApp» a «enlace seguro por correo»; los clientes siguen
> sin cuenta).

---

## 1. Las ocho decisiones bloqueantes

### Q-01 · Permisos del formulario de citas

**Problema concreto (verificado).** El formulario «Nueva cita» carga seis
listas: profesionales, servicios, clientes, inventario, sedes y configuración.
Cada una sale del `index` de su módulo, y cada `index` exige el permiso de ese
módulo (`routes/api.php`: `puede:empleados`, `puede:inventario`,
`puede:locales`, `puede:configuracion`). El rol **Profesional** de fábrica
tiene `citas: gestionar`, pero no `empleados`, `inventario`, `locales` ni
`configuracion`. Resultado: cuatro 403 y un select de profesional vacío, así
que **no puede guardar ninguna cita**.

**Causa.** Se trata como un solo permiso algo que son dos cosas distintas:
*administrar* un módulo (ver la ficha completa de un profesional, su pago, su
horario editable) y *elegir* un valor de ese módulo al agendar (id, nombre y lo
justo para calcular huecos). El formulario pide lo segundo por la puerta de lo
primero.

**Al revisarlo aparecieron cuatro huecos de autorización más graves que el 403**
(verificado en `CitaService`, `CitaRequest` y `ProfesionalRequest`):

| ID | Hueco | Quién puede explotarlo | Efecto |
|---|---|---|---|
| **G-1** | `POST /citas` no comprueba que `empleado_id` sea la propia ficha cuando el rol tiene `solo_propios` | Un profesional | Agenda citas a nombre de un compañero. Con `PUT` puede además pasarle su cita a otro, y deja de verla |
| **G-2** | `POST`/`PUT /citas` no comprueban que `local_id` esté dentro del alcance por sedes; sin `local_id` se asigna la principal aunque esté fuera | Un administrador de la sede norte | Crea o mueve citas a la sede sur |
| **G-3** | No se valida que el profesional esté activo, habilitado en esa sede y que preste ese servicio | Cualquiera con `citas: gestionar` | Citas imposibles (un barbero haciendo un facial en una sede donde no trabaja) |
| **G-4** | `POST /profesionales` con `usuario.rol_id` acepta **cualquier rol salvo el administrador general**, y la cuenta nace con `todos_los_locales = true` | Un administrador local (tiene `empleados: gestionar`) | Crea cuentas con más permisos que los suyos (un rol personalizado con Configuración o Facturación) y con alcance a todas las sedes. **Escalada fuera de su autoridad** |

**Corrección propuesta [PROPUESTA]** — sin ampliar ningún permiso de módulo:

1. **Opciones para agendar derivadas del permiso de citas.** Un endpoint de
   solo lectura, `GET /citas/opciones`, detrás de `puede:citas,gestionar`, que
   devuelve **proyecciones mínimas ya recortadas** por el mismo `Capacidades`:
   - profesionales: `id`, `nombre`, `color`, el horario y las excepciones
     necesarios para calcular huecos y los servicios que presta. **Nunca**
     pago, comisión ni cuenta. Solo los activos, habilitados en las sedes de
     su alcance, y **solo su propia ficha** si tiene `solo_propios`.
   - servicios: `id`, `nombre`, `duracion_min`, `precio`, habilitados en la
     sede elegida (ver Q-06).
   - sedes: `id`, `nombre`, dentro de su alcance.
   - agenda del negocio: `modo_intervalo`, `intervalo_min`, horario de
     respaldo y `zona_horaria`. Nada más de la configuración.
   - productos: **solo si el rol además tiene `inventario: ver`**. Si no, el
     formulario oculta la fila de productos. Vender productos es de quien ve
     el inventario.
   - clientes: búsqueda por nombre o teléfono (`id`, `nombre`, `telefono`)
     **solo con `clientes: ver`**. Sin ese permiso se escribe el cliente a mano
     (el service ya lo reconoce por teléfono).
   Es la opción (b) del traspaso, pero no como «endpoint ligero sin permiso»:
   hereda el permiso de citas y los recortes de alcance. Quien no puede
   agendar no ve nada de esto.
2. **Invariantes en `CitaService`** (no en el controlador, por la regla del
   proyecto), para crear **y** para editar: profesional activo, habilitado en
   la sede y que presta el servicio (G-3); sede dentro del alcance (G-2); con
   `solo_propios`, el profesional tiene que ser su propia ficha y no se puede
   reasignar a otro (G-1). Rechazo con 422 en el campo correspondiente, o 404
   si el recurso está fuera de su alcance.
3. **«Nadie concede lo que no tiene»** en `UsuarioService::crear/actualizar`
   (G-4): solo se puede asignar un rol cuyos permisos sean un **subconjunto**
   de los propios, y un alcance de sedes **contenido** en el propio. El
   administrador general sigue pudiendo todo. Así lo cumplen los dos caminos,
   `/usuarios` y `/profesionales`.
4. Tests por cada hueco, incluido el recorrido completo con el rol Profesional
   de fábrica.

Encaja en la matriz de §2.

### Q-02 · Origen de una cita

**Estado real (verificado).**

| Dónde | Valores |
|---|---|
| Columna `citas.fuente` (tenant) | ENUM `publica \| admin \| whatsapp \| api`, **default `publica`** |
| Lo que escribe `CitaService` | siempre `admin` |
| `CitaResource` | **no emite `fuente`** (nadie la lee hoy por API) |
| Frontend `FUENTES_CITA` | `web`, `panel`, `publica` |
| Contrato | `fuente: "publica"` en la reserva pública; `Reporte.fuentes` con claves `web/panel/publica` |
| Quién la registró | **no se guarda** en ninguna columna. El id del usuario solo llega al service para el movimiento de stock |

`whatsapp` y `api` no tienen implementación ni plan. `web` no significa nada
distinto de `publica`.

**Propuesta [PROPUESTA] ⟲ REABRE §2.11**: separar las dos preguntas.

- **Canal** (`citas.canal`, por dónde entró), con un catálogo que solo incluye
  lo que existe:
  | Clave | Significado | Estado |
  |---|---|---|
  | `panel` | Creada por alguien del negocio en el panel | existe (hoy se guarda como `admin`) |
  | `tienda` | Reservada por el cliente en la tienda pública | llega con 5.A |
  Los canales futuros (WhatsApp, API, importación) **se añaden al ENUM cuando
  existan**, con su propia migración. Hoy no se anuncian.
- **Actor** (`citas.creada_por_usuario_id`, nullable → `usuarios.id` del
  tenant): quién la registró. `NULL` cuando la creó el cliente en la tienda.
  Para los cambios posteriores (quién reprogramó, quién canceló, cliente o
  personal) **[PROPUESTA]** una tabla `cita_eventos` (cita, tipo, actor tipo +
  id, antes/después, fecha), que además sirve de historial y de disparador de
  notificaciones (§4).

**Migración (tenant) y compatibilidad.** Una migración nueva (no editar la de
agosto, por la lección del 2026-09-04): añadir `canal`, copiar
`admin→panel` y `publica→tienda`, retirar `fuente`, y añadir
`creada_por_usuario_id`. Las citas existentes quedan con `creada_por` en
`NULL` (no hay dato del que recuperarlo). Se despliega con
`tenants:migrar-provisionados`. **Riesgo de compatibilidad: bajo**, porque
ningún consumidor lee hoy `fuente` por API. Cambios de contrato: la entidad
Cita gana `canal` y `creada_por` (`{id, nombre} | null`), y
`Reporte.fuentes` pasa a llamarse `canales` con las mismas claves.
`FUENTES_CITA` del frontend se sustituye.

### Q-03 · Estimación de fecha

**Ritmo medido en git** (no supuesto):

| Repo | Días con commits | Periodo | Entregado |
|---|---|---|---|
| Backend | 9 | 15-ago → 06-sep | Sprints 0–4.B (≈14 módulos + 6 ramas de arreglos), 312 tests |
| Frontend | 10 | 10-ago → 06-sep | Maqueta completa previa + conexión 0–4.B |
| Ambos | sin actividad | 07-sep → 19-sep | — |

Del orden de **1,3 días activos por módulo y lado**, con una persona
alternando dos sesiones.

**Trabajo del lanzamiento recomendado** (§5), en días activos de desarrollo
[SUPUESTO: mismo ritmo, mismo tamaño de módulos]:

| Bloque | Días |
|---|---|
| Arreglos de seguridad y cierre de 4.B (Q-01, G-1…G-4, onboarding, canal, `lang/es`, Mi perfil) | 3–4 |
| Servicios por sede y validaciones de la agenda (Q-06) | 2–3 |
| Calendario conectado y reprogramar desde el panel | 2–3 |
| Tienda pública (backend + conexión) | 5–7 |
| Gestión de la cita por enlace (ver / reprogramar / cancelar) | 3–4 |
| Pagos por QR de Yape | 5–7 |
| Notificaciones por correo (salida, plantillas, recordatorios, preferencias mínimas) | 6–8 |
| Suscripción: estado, Mi Plan de solo lectura, ciclo de vida mínimo | 3–4 |
| Panel de plataforma mínimo (acceso, planes, auditoría) | 5–7 |
| Dashboard mínimo y retirar pantallas con datos ficticios | 2 |
| Landing, términos y privacidad | 3–4 |
| Despliegue de pruebas y producción, correo, copias | 3–4 |
| Pruebas de punta a punta y arreglos del piloto | 5 |
| **Total** | **≈ 47–62 días activos** |

**Conversión a calendario:** con 5 días activos por semana, **10–13 semanas**
→ lanzamiento entre **finales de noviembre y mediados de diciembre de 2026**.
Con 3 días por semana, febrero de 2027. **No es una fecha, es un rango
[SUPUESTO]**.

**Qué necesito saber para afinarla:**
1. Días y horas por semana que puedes dedicar, y si hay semanas bloqueadas.
2. Si alguien más va a probar (piloto) y desde cuándo.
3. Si aceptas lanzar con un **piloto cerrado** (2–3 negocios) antes de abrir
   el registro.
4. El tiempo de trámites que no son código: dominio, cuentas de Resend y de
   hosting, textos legales.

**La fecha no bloquea nada.** Los bloques 1–3 pueden empezar ya.

### Q-04 · Alcance mínimo del lanzamiento

**Tu propuesta contrastada con el estado real:**

| Pides | Estado real | Dependencias que faltan |
|---|---|---|
| Configuración, sedes, servicios, profesionales y horarios | ✅ hecho | Servicios por sede (Q-06) |
| Disponibilidad; crear, reprogramar y cancelar citas | ✅ en el panel (reprogramar = editar fecha y hora; cancelar = estado) | Arreglos de Q-01. **Para el cliente, nada**: necesita la **tienda pública** y la **gestión por enlace**, que no nombras pero son requisito del pago con QR y de los botones de los correos |
| Agenda y clientes | Clientes ✅ · Calendario ⬜ (sin conectar) | 4.C |
| Roles, permisos y aislamiento | ✅ con 4 huecos (G-1…G-4) | Corrección de Q-01 |
| Pago de citas con QR de Yape | ⬜ solo esquema | Tienda pública, gestión por enlace, notificaciones |
| Activación y cambio manual de planes | ⬜ | Panel de plataforma, estado de suscripción, **ciclo de vida mínimo** (sin él la puerta de cobro no se dispara nunca: nadie pasa un negocio a suspendido) |
| Correos a clientes y profesionales con enlaces | ⬜ (hay 3 correos de cuenta) | Salida de correo con registro, plantillas, tarea programada para recordatorios, dominio remitente verificado |

**Dependencias implícitas que no están en tu lista y hacen falta para lanzar:**
- **Tienda pública** (5.A): sin ella no hay reserva del cliente ni pago QR.
- **Pantallas con datos ficticios**: el panel abre en el **Dashboard**, que
  hoy es un mock. Al lanzar no puede quedar ninguna pantalla con datos
  inventados. [PROPUESTA] un Dashboard mínimo real (citas de hoy, pagos por
  verificar, próximas citas), y los módulos que queden fuera se **ocultan del
  menú** en vez de mostrarse con mocks.
- **Landing y registro** (el registro existe; la landing no).
- **Términos, privacidad y consentimiento** en la reserva: Ley N.° 29733
  [PROPUESTA].
- **Despliegue**, dominio y remitente de correo verificado.
- **Canal de contacto** para «contáctanos para activar tu plan»: basta un
  WhatsApp/correo de la plataforma. El módulo Soporte puede esperar.

**Recomendación [PROPUESTA]:**

| Entra al lanzamiento | Queda para después (sigue en el alcance general) |
|---|---|
| Todo lo ya hecho, con los arreglos | Caja (6.A) |
| Servicios por sede | Reportes (7.A) |
| Calendario | Plantillas y envío de WhatsApp (5.B) |
| Tienda pública + gestión por enlace | Soporte con tickets (7.B) |
| Pago QR Yape | Pasarela de suscripciones (Mercado Pago) |
| Notificaciones por correo esenciales + 1 recordatorio | Reseñas, importación de clientela, kardex, historial de cajas |
| Estado de suscripción, Mi Plan de solo lectura y ciclo de vida mínimo | Purga automática con copia y borrado (manual al principio) |
| Panel de plataforma mínimo | Métricas nocturnas de plataforma |
| Dashboard mínimo, sin mocks | SEO de la tienda (Q-07) salvo que el piloto lo pida |
| Landing, legales, despliegue | Grupos (Q-08: ocultar hasta decidir su uso) |

Inventario se queda (ya existe), pero sin descontar a caja.

### Q-05 · Pago de la cita con QR de Yape

**La contradicción, aclarada (verificado).** No es que un documento diga
«terminado» y otro «excluido» sobre lo mismo:
- `CLAUDE.md` y `discrepancias.md` §6 cerraron el **diseño y el esquema** el
  2026-08-14, y las migraciones los crearon: `tenants.pagos_qr_activo`,
  `qr_imagen` e `instrucciones_pago`; `citas.metodo_pago_eleccion` y
  `estado_pago`; tabla `cita_pagos`.
- `plan-sprints.md` excluyó la **funcionalidad** porque no estaba maquetada ni
  en el contrato.
- **Implementado de verdad: solo el esquema.** No hay modelo, ni endpoint, ni
  pantalla, ni test (el único código que lo menciona es `Tenant` y el test de
  provisioning).

**Principios.** El dinero va **directo del cliente al negocio**: la plataforma
no lo toca ni lo intermedia. **Mostrar un QR no confirma nada**: el pago solo
cuenta como recibido cuando una persona del negocio verifica la evidencia.

**Flujo propuesto [PROPUESTA]:**

```
Cliente reserva en la tienda
  └─ el negocio exige pago previo ─┬─ NO → cita «pendiente de tu confirmación» hasta que el cliente confirme por correo (FR-84, 2026-09-19), sin pago
                                   └─ SÍ → cita «pendiente» + pago «pendiente» + plazo para subir evidencia
        pantalla de confirmación: QR + instrucciones + monto + código + botón «Subir comprobante»
        correo: «Reserva recibida — pendiente de pago» con el mismo botón
Cliente sube evidencia (captura + nº de operación opcional)
  └─ pago «comprobante_subido» · se para el plazo · aviso al negocio
Negocio verifica en Citas (filtro «pagos por verificar»)
  ├─ Aprueba → pago «verificado» · cita pasa a «confirmada» · correo al cliente
  └─ Rechaza (motivo obligatorio) → pago «rechazado» · se reabre un plazo corto para re-subir · correo al cliente
Plazo vencido sin evidencia → cita «cancelada» (motivo: pago no recibido) · se libera el hueco · correo al cliente
```

**Las decisiones que pides, con recomendación:**

| Decisión | Recomendación [PROPUESTA] | Motivo |
|---|---|---|
| ¿Total o adelanto? | **v1: total.** El esquema admite el adelanto sin migrar (`cita_pagos.monto`); pasa a v1.1 con un porcentaje configurable | El adelanto trae reglas de saldo y de devolución parcial; es mejor lanzar con una sola |
| ¿Obligatorio u opcional? | Configurable por negocio: **no pedir / opcional / obligatorio** | Un salón conocido no quiere espantar clientes; uno con muchas inasistencias sí |
| ¿Quién recibe el pago? | **El negocio**, en su propio Yape | Sin intermediación: no hay comisión ni responsabilidad de custodia de fondos |
| ¿Por negocio o por sede? | QR del negocio y **reemplazo opcional por sede** (migración: `locales.qr_imagen`, `locales.instrucciones_pago`) | Cada sede puede cobrar en otro Yape. El esquema actual solo tiene el del negocio |
| ¿Evidencia? | Imagen (JPG/PNG/WebP, 5 MB máx.) + nº de operación opcional + fecha declarada. Con todas las reglas de §6.3 (autorización por código, tipo real, re-codificado, nombre UUID, disco privado, enlace firmado, límite por IP y por código) | El PDF no aporta nada que no aporte una captura y amplía la superficie de ataque |
| ¿Quién aprueba o rechaza? | Capacidad nueva **`pagos: gestionar`**, dentro del alcance por sedes. Presets: administrador general y de sede sí; recepción sí; profesional no | Verificar dinero no es lo mismo que agendar |
| ¿Estado de la cita mientras se verifica? | **`pendiente`** con `estado_pago = comprobante_subido`. Nunca «confirmada» antes de verificar | El correo al cliente tiene que decir el estado real |
| ¿Hueco reservado? ¿Cuánto? | **⟲ REABRE §6.2.1.** Solo si el pago es **obligatorio**: el hueco queda bloqueado por un **plazo configurable (por defecto 60 min, entre 15 y 240)** para subir la evidencia. Con evidencia subida, **no caduca** (la espera es del negocio, no del cliente). Pago opcional: no caduca nunca, como hoy | La decisión cerrada temía carreras con el anti-solape. La caducidad es un **cambio de estado a `cancelada` hecho con el mismo bloqueo** (`FOR UPDATE`) que una reserva, así que la carrera se resuelve igual que dos reservas simultáneas. Sin caducidad, el pago «obligatorio» permite bloquear agendas gratis |
| ¿Vencimiento? | Tarea programada cada minuto que cancela las vencidas y avisa | — |
| ¿Cancelación por el cliente? | Permitida hasta X horas antes (**política del negocio**, por defecto 24 h). Si ya pagó: la cita pasa a cancelada y el pago a **«devolución pendiente»**; el negocio devuelve **fuera del sistema** y marca «devuelto» (migración: añadir `devolucion_pendiente` y `devuelto` al estado de `cita_pagos`) | La plataforma no puede devolver dinero que no tocó; solo puede registrar que se hizo |
| ¿Reprogramación? | El pago **se queda con la cita** (misma fila). Si el nuevo horario cambia el precio: v1 no lo permite desde el enlace del cliente (se reprograma al mismo servicio) | Evita saldos a favor o en contra en v1 |
| ¿Cancelación por el negocio? | Siempre posible; si había pago verificado → «devolución pendiente» y correo al cliente | — |
| ¿Caja? | Al verificar **no** se crean movimientos de caja mientras Caja no esté lanzada. Si se crearan huérfanos, la regla de adopción de §6.2.3 los metería todos de golpe en la primera caja que se abra | Evita un arqueo con meses de historia |

**Notificaciones por estado:** ver la matriz de §4.3 (eventos P-1…P-6).

### Q-06 · Servicios por sede

**Modelo actual (verificado):** catálogo por negocio (`servicios`);
`servicio_profesional` (quién presta qué, con un `precio_override` sin usar);
`local_profesional` (quién trabaja en qué sede). **No existe
`local_servicio`**: cada sede ofrecería todo el catálogo. El motor de huecos
recibe profesional, fecha y duración, sin mirar ni sede ni servicio.

**Propuesta [PROPUESTA]:**
- Tabla nueva `local_servicio` (`local_id`, `servicio_id`, `activo`) con
  columnas **nullables reservadas** `precio` y `duracion_min` que **no se
  exponen en v1**. Así las diferencias por sede, si se confirman, no exigen
  otra migración. Diferente precio o duración por sede **no es requisito**
  hasta que lo confirmes.
- **Migración de datos**: todas las combinaciones servicio × sede existentes
  nacen habilitadas, para que ningún negocio de desarrollo pierda su catálogo.
- **Regla de reservabilidad única** (en un service, usada por el panel, la
  tienda y `/citas/opciones`): un servicio se puede reservar con el
  profesional P en la sede S si el servicio está activo y habilitado en S, P
  está activo y habilitado en S, y P presta ese servicio.
- **Servicio sin profesionales asignados**: hoy la asignación es opcional.
  [PROPUESTA] no se puede reservar (en la tienda no aparece) y el panel avisa:
  «Asigna al menos un profesional».
- La pestaña «Servicios» de cada sede (hoy sin efecto) pasa a ser el
  interruptor de `local_servicio`.

### Q-11 · Activación manual de planes

**Lo que existe y se puede aprovechar (verificado):**

| Pieza | Estado |
|---|---|
| `platform_admins` (rol `superadmin \| soporte`, `two_factor_secret`, baja lógica) | tabla ✅, sin guard, sin rutas, sin pantallas |
| `soporte_acciones` (admin, tenant, acción, detalle) | tabla ✅ — sirve de **bitácora de auditoría** |
| `pagos` (tenant, plan, monto, periodo, fecha, método, estado, referencia externa) | tabla ✅ — ⚠️ `estado` tiene **default `pagado`** |
| `tenants.plan_id`, `suscripcion_vence_el`, `extra_profesionales`, `extra_whatsapp` | columnas ✅ |
| Historial de cambios de plan | ❌ no existe |
| Panel | ❌ no existe en ninguno de los dos repos |

**Diseño [PROPUESTA]:**

1. **Tabla `suscripcion_cambios`** (central, solo inserción, nunca se edita):
   negocio, **plan anterior y nuevo**, **periodicidad** (mensual/anual),
   **vigencia** (desde/hasta), **complementos** (profesionales, sedes y
   correos extra), **origen** (`manual \| pasarela \| sistema`), **actor**
   (`platform_admin_id` o id de evento externo), **motivo** (obligatorio si es
   manual), `pago_id` nullable, `referencia_evidencia` nullable y fecha.
2. **La activación no es el pago.** Activar crea un `suscripcion_cambio`;
   registrar un pago crea una fila en `pagos` con su propio estado. Se
   enlazan si hay pago, pero activar **nunca** marca nada como pagado.
   Migración: el default de `pagos.estado` pasa a `pendiente` y se añade
   `registrado_por_admin_id`. Así se puede activar a crédito (piloto,
   cortesía, promesa de pago) dejando constancia.
3. **Un solo punto de entrada**: `SuscripcionService::aplicar(Cambio)`. Lo
   llaman el panel manual, el ciclo de vida diario y, en el futuro, el
   webhook de la pasarela. Aplica **las mismas reglas** de beneficios,
   vigencia y límites venga de donde venga, y escribe `tenants` + el cambio en
   la misma transacción.
4. **Convivencia con la futura pasarela (Mercado Pago, suscripciones
   `preapproval`, disponibles en Perú según su documentación):**
   - cada negocio tiene un **`modo_cobro`**: `manual` o `pasarela`;
   - los eventos de la pasarela son **idempotentes** (clave única por id de
     evento) y llevan la **versión** de la suscripción que conocían: un evento
     con una versión vieja no pisa un cambio manual posterior (bloqueo
     optimista);
   - un cambio manual sobre un negocio en `modo_cobro = pasarela` obliga a
     elegir: **pasar a manual** (y cancelar la suscripción en MP, que queda
     como acción pendiente registrada) o **cortesía temporal** con fecha de
     fin, tras la cual vuelve a mandar la pasarela;
   - nunca hay dos fuentes vivas a la vez para el mismo negocio.
5. **Panel de plataforma mínimo [PROPUESTA]**, separado del panel de negocios:
   - Backend: guard propio para `PlatformAdmin` (tokens Sanctum con
     `abilities`), rutas en `routes/plataforma.php`, **2FA TOTP obligatorio**
     (la columna ya existe) y límite de peticiones estricto.
   - Frontend: grupo de rutas `(plataforma)` en el mismo repo de Next, servido
     en **otro subdominio** y con su propia cookie. Alternativa descartada:
     Filament, porque rompe la regla «API pura, sin Blade».
   - Pantallas v1: lista de negocios (estado, plan, vence el, profesionales,
     sedes), ficha con historial de cambios y pagos, **activar/cambiar plan**
     (formulario con todos los campos del punto 1), **registrar pago**,
     suspender o reactivar.
   - **Sin acceso a los datos del negocio** (su base de datos). Solo datos
     centrales.
6. **Acceso de soporte a un negocio** (fuera del lanzamiento): solo con un
   permiso **temporal** (p. ej. 2 h), ligado a un motivo o ticket, **visible
   para el negocio** y registrado en `soporte_acciones`.

### Q-13 · Despliegue

**Restricciones del stack:** Laravel necesita **worker de cola** (correo,
provisioning, recordatorios) y **cron** (ciclo de vida, caducidades); MySQL
con permiso de **crear bases** (una por negocio); archivos por negocio en
disco; Next con BFF; **subdominio comodín** para las tiendas y dominio de panel
separado.

**Opciones** (precios en USD consultados el 2026-09-19, sin impuestos; S/ ≈ 3,7
por USD [SUPUESTO]):

| | **A. Recomendada** | B. Gestionada | C. Mínima |
|---|---|---|---|
| Frontend | Vercel Pro, 20 $/mes | Vercel Pro, 20 $/mes | Next en el mismo VPS |
| Backend + worker + cron | VPS Hetzner (CPX22 ≈ 8 €/mes) administrado con Laravel Forge (12–19 $/mes) | Droplet DigitalOcean (12–24 $/mes) + Forge | 1 VPS Hetzner + Forge |
| Base de datos | MySQL en el mismo VPS | MySQL gestionado de DigitalOcean (≈ 30 $/mes el primer plan apto para producción) | En el mismo VPS |
| Archivos | Disco del VPS (como hoy) + copia a Cloudflare R2 | Disco + Spaces (≈ 5 $/mes) | Disco del VPS |
| Copias | Volcado diario de la central **y de cada tenant** a R2 (cifrado, 30 días) + instantáneas del VPS (+20 % del precio del servidor) | Copias diarias y recuperación a un punto en el tiempo incluidas en el MySQL gestionado + volcado propio | Volcado diario a R2 |
| Correo | Resend Pro, 20 $/mes (50 000 correos) | igual | igual |
| **Total aprox.** | **≈ 60–75 $/mes** (≈ S/ 220–280) | **≈ 95–120 $/mes** | ≈ 35–45 $/mes |
| A favor | Barato y suficiente para decenas de negocios; Forge resuelve worker, cron y HTTPS | Menos mantenimiento de la base; restauración más fácil | Lo más barato |
| En contra | La base de datos la mantienes tú (actualizaciones, espacio) | Más caro; hay que verificar que el usuario de la app puede crear bases [SUPUESTO] | Un solo punto de fallo; certificados comodín y despliegue de Next a mano |

Resend gratis **no sirve para producción**: limita a 100 correos al día.

**Pruebas frente a producción:** un segundo sitio en Forge con su propia base
y usuario MySQL, **su propio subdominio y su propio remitente de correo**
(`pruebas.…`), las *previews* de Vercel para el frontend y **nunca** datos
reales en pruebas.

**Dominios, HTTPS y DNS** [POR DEFINIR]:
- Un dominio de producto (p. ej. `marca.pe` o `.com`): `app.` (panel),
  `api.` (Laravel), `admin.` (plataforma), `mail.` o `notificaciones.`
  (remitente).
- Otro dominio, o subdominio comodín, para las tiendas (`*.reservas-marca.pe`).
  La decisión de separar dominios está tomada (`plan-backend.md` §1).
- Comodín en Vercel: requiere que Vercel gestione los DNS de ese dominio, o
  usar Cloudflare con certificado comodín.
- Correo: **SPF, DKIM (los registros que da Resend) y DMARC** en el
  subdominio remitente. Hoy el remitente es `no-reply@flexishopp.site`: hay
  que cambiarlo al dominio del producto.

**Mantenimiento:** actualizaciones de seguridad del VPS (Forge las facilita),
revisar trabajos fallidos, espacio en disco (una base por negocio), rotar
claves y **probar una restauración cada mes**.

**Crecimiento:** separar MySQL a su propio servidor o a uno gestionado; mover
archivos a R2/S3 (el código ya usa el disco `public` por negocio, así que el
cambio es de configuración); más workers.

**Qué decidir ahora y qué puede esperar:**

| Ahora (antes de construir notificaciones y tienda) | Puede esperar |
|---|---|
| **Nombre y dominio del producto**: aparece en correos, enlaces, remitente y subdominios | Proveedor concreto (A o B) — hasta el bloque de despliegue |
| Dominio de las tiendas (comodín) | Dominios personalizados por negocio |
| Cuenta de Resend con el dominio verificado (tarda por la propagación DNS) | CDN para imágenes, réplicas |

No contrato ni despliego nada.

---

## 2. Roles y permisos por negocio

### 2.1 Diagnóstico (verificado)

| Pregunta | Respuesta real |
|---|---|
| ¿Qué roles existen? | Tres de sistema: **administrador general**, **administrador local** y **profesional**, más los que cree el negocio. Permisos `ver`/`gestionar` en 14 módulos, `solo_propios` por rol y alcance por sedes por cuenta |
| ¿Cómo se relaciona un usuario con un negocio? | `users.tenant_id NOT NULL` y **email único global**: **una persona pertenece a un solo negocio**. Su cuenta en el negocio es una fila en `usuarios` (base del tenant) con su rol |
| ¿Puede pertenecer a varios negocios? | **No.** Un barbero que trabaja en dos salones necesita dos correos. No hay selector de contexto: el negocio sale del token |
| ¿Cómo se impide ver otro negocio? | Base de datos separada por negocio; tenancy inicializada **desde el token**, no desde la cabecera (`X-Tenant` distinta → 404); tests de aislamiento en cada módulo |
| ¿El backend protege aunque llamen a la API directamente? | Sí en las lecturas y en los módulos; **no del todo en las escrituras de citas y en la asignación de roles**: huecos **G-1…G-4** (§Q-01) |
| ¿Dónde se aplica el alcance por sedes? | Solo en `locales` y `citas` (y el pivote de sede). **No** en profesionales, inventario ni clientes. Tampoco se aplicará en caja, reportes y dashboard si no se diseña ahora |
| ¿Quién invita y asigna roles? | `/usuarios` y `/roles`: solo el administrador general (regla en `App\Support\Rango`). **Pero** `/profesionales` crea cuentas con quien tenga `empleados: gestionar` → G-4 |
| ¿Plataforma frente a negocio? | Tablas separadas (`platform_admins` frente a `users`). Sin guard ni rutas todavía |
| Rol central duplicado | `users.rol` (central) se **deriva** del rol del negocio y solo lo usa `Rango` para saber quién es el administrador general. Es correcto mientras se derive en un solo sitio (`UsuarioService::rolCentral`) |
| El administrador local | Sin Configuración ni Facturación; con `empleados: gestionar`. Como el alcance no filtra profesionales, **gestiona el equipo de todas las sedes** |

### 2.2 Modelo recomendado

**Combinación, como hoy: roles predefinidos + roles personalizables.** Los
presets cubren al 90 % de los negocios desde el primer día, y los
personalizados evitan tener que pedirnos un rol nuevo. Es lo que ya hay y
funciona. Lo que falta es **cerrar los huecos**, **ampliar el alcance** y
**añadir un preset**.

**Para el lanzamiento [PROPUESTA]:**
1. Corregir G-1…G-4.
2. **Añadir el preset «Recepción»** (sistema, editable, no borrable): agenda
   de todos en su sede, clientes y verificación de pagos; sin equipo, catálogo
   ni reportes. Es la persona que más usa el panel en un salón, y hoy tendría
   que inventarla cada negocio.
3. Renombrar en pantalla (la clave interna no cambia) **Administrador local →
   «Administrador de sede»**, que es lo que es.
4. Aplicar el alcance por sedes también a **profesionales** (solo los
   habilitados en sus sedes) y, cuando existan, a caja, reportes y dashboard.
5. Módulo nuevo **`pagos`** (verificar comprobantes). El módulo `facturacion`
   (nuestra suscripción) sigue siendo solo del administrador general.
6. «Nadie concede lo que no tiene»: rol ⊆ permisos propios y alcance ⊆
   alcance propio.

**Después del lanzamiento:** pertenencia a varios negocios (tabla central de
membresías + selector de negocio al entrar, que emite un token por negocio);
permisos más finos donde el negocio lo pida (p. ej. «ver montos», «cancelar
citas ajenas»); ocultar datos de contacto del cliente al profesional;
excepciones por persona.

### 2.3 Matriz recomendada (rol × módulo × acción × alcance)

Leyenda: **G** gestionar · **V** ver · **—** sin acceso. Alcance: **N**
negocio entero · **S** sus sedes · **P** solo lo propio.

| Módulo | Administrador general | Administrador de sede | Recepción (nuevo) | Profesional |
|---|---|---|---|---|
| Dashboard | V · N | V · S | V · S | V · P |
| Citas y calendario | G · N | G · S | G · S | G · P (solo su agenda; no reasigna) |
| Pagos de citas (verificar) | G · N | G · S | G · S | — |
| Clientes | G · N | G · N ¹ | G · N ¹ | V · N ¹ ² |
| Servicios y categorías | G · N | G · N (catálogo) + activar en S | V | V |
| Servicios por sede | G · N | G · S | — | — |
| Profesionales | G · N | G · S | V · S (solo para agendar) | — |
| Usuarios del panel (invitar, rol) | G · N | — ³ | — | — |
| Roles y permisos | G · N | — | — | — |
| Sedes | G · N | V · S + editar las suyas | — | — |
| Inventario | G · N | G · S ⁴ | V | — |
| Caja *(posterior)* | G · N | G · S | G · S | — |
| Reportes *(posterior)* | V · N | V · S | — | V · P |
| Configuración del negocio | G · N | — | — | — |
| Notificaciones del negocio | G · N | ajustes de su sede | — | preferencias propias |
| Facturación (suscripción) | G · N | — | — | — |
| Mi perfil | propio | propio | propio | propio |

¹ Los clientes son del negocio, no de una sede: los comparte todo el negocio.
² [POR DEFINIR] si el profesional ve el teléfono del cliente o solo el nombre.
³ [PROPUESTA] el administrador de sede **no** invita en v1; hoy lo hace por
`/profesionales` (G-4). Alternativa si lo necesitas: que invite solo con el
preset Profesional o Recepción y alcance dentro del suyo.
⁴ Hoy el inventario no tiene sede: es del negocio. Alcance por sede solo si
se modela stock por sede (posterior).

**Reglas que atraviesan la matriz:** el administrador general es único, no se
borra ni se degrada; ninguna acción del panel cruza negocios (404); los 403
llevan `codigo`; ocultar en el menú no es autorización.

---

## 3. Planes, variantes y complementos

### 3.1 Referencias de mercado (consultadas el 2026-09-19)

| Producto | País / moneda | Precio | Condiciones |
|---|---|---|---|
| AgendaPro — Individual | Perú, PEN | S/ 59/mes | 1 profesional; recordatorios automáticos; 500 correos de marketing/mes; 20 % de descuento anual |
| AgendaPro — Básico | Perú, PEN | S/ 99/mes | 2 a 20+ profesionales; + inventario y comisiones |
| AgendaPro — Premium | Perú, PEN | S/ 149/mes | + encuestas, fichas, gift cards |
| AgendaPro — Pro | Perú, PEN | S/ 449/mes | + API, soporte personalizado |
| AgendaPro — WhatsApp | Perú, PEN | desde S/ 17/mes | paquete de 50 mensajes |
| AgenditApp | LatAm, USD | 0 / 10 / 30 $/mes | gratis para 1 profesional; marca propia a 30 $ |

**Hallazgo:** los precios del seeder (99 / 149 / 449 y WhatsApp a 17) son
**exactamente los de AgendaPro Perú**. Copiarlos no posiciona el producto:
compite en igualdad de precio con un producto más completo y conocido.

**Costos propios [SUPUESTO, validar]:**
- Infraestructura fija: ≈ 60–75 $/mes (opción A).
- Correo: ≈ 0,90 $ por cada 1 000 envíos por encima de lo incluido en Resend
  Pro.
- **Consumo por cita:** confirmación + aviso al profesional + 1 recordatorio
  ≈ 3 correos; con pago QR y algún cambio, ≈ 5.
- Negocio tipo con 5 profesionales × 8 citas/día × 26 días ≈ 1 040 citas/mes
  ≈ **3 000–5 200 correos/mes**. El correo cuesta poco (≈ 3–5 $/mes en ese
  caso), pero no es cero en los negocios grandes.

### 3.2 Tres planes [PROPUESTA — nombres y precios para validar]

| | **Independiente** | **Equipo** | **Negocio** |
|---|---|---|---|
| Cliente objetivo | Barbero, manicurista o terapeuta que trabaja solo | Salón o consultorio con una sede | Cadena o negocio con varias sedes |
| Precio mensual | **S/ 39** | **S/ 89** | **S/ 189** |
| Precio anual (2 meses gratis) | S/ 390 | S/ 890 | S/ 1 890 |
| Profesionales incluidos | 1 | hasta 5 | hasta 15 |
| Sedes | 1 | 1 | hasta 3 |
| Usuarios del panel | ilimitados (decisión vigente) | ilimitados | ilimitados |
| Agenda, calendario, tienda pública, clientes, servicios | ✅ | ✅ | ✅ |
| **Pago QR Yape** | ✅ | ✅ | ✅ (QR por sede: posterior, 2026-09-19) |
| Roles | presets | presets + personalizados | presets + personalizados + alcance por sedes |
| Inventario | — | ✅ | ✅ |
| Caja y reportes *(cuando salgan)* | reportes básicos | ✅ | ✅ por sede |
| Correos esenciales + botones de gestión | ✅ | ✅ | ✅ |
| Recordatorios | 1 (24 h antes, fijo) | hasta 2, horario configurable | hasta 3, reglas por sede |
| Correos con logo y color del negocio | ✅ | ✅ | ✅ (identidad básica en todos los planes, decisión 2026-09-19) |
| Registro de entregas y rebotes | — | — | ✅ |
| Correos incluidos/mes (esenciales + recordatorios) | 1 000 | 5 000 | 15 000 |

**Fundamento:**
- **Por debajo de AgendaPro en cada escalón** (59 → 39, 99 → 89, 449 → 189),
  con el pago QR de Yape como diferencia local incluida en todos.
- El precio por profesional baja al crecer (39 → ≈ 18 → ≈ 13 soles), como es
  habitual.
- Solo tres escalones, y lo que los separa es fácil de explicar: **trabajo
  solo / tengo equipo / tengo varias sedes**.
- El escalón de entrada **no admite profesionales extra** (la lección del
  plan Individual en `pendientes-contrato.md`: si no, nadie compra el
  siguiente).

### 3.3 Complementos y periodicidad

| Complemento | Precio [PROPUESTA] | Disponible en |
|---|---|---|
| Profesional extra | S/ 12/mes | Equipo, Negocio |
| Sede extra | S/ 39/mes | Negocio |
| Paquete de 5 000 correos | S/ 15/mes | todos |

- **Periodicidad:** mensual y anual (dos meses gratis) desde el primer día. En
  activación manual es solo una fecha de vigencia distinta: no añade
  complejidad.
- **Prueba:** hoy son 7 días en el código. [PROPUESTA] 14 días con funciones
  del plan Equipo: 7 días apenas dan para configurar y recibir las primeras
  reservas públicas. [POR DEFINIR]
- **Promo S/ 9 × 3 meses** (seeder): [PROPUESTA] no lanzarla en público;
  usarla como precio de piloto.
- **Disponibles en la activación manual inicial:** los 3 planes × mensual y
  anual + profesional extra. **Después:** sede extra, paquete de correos (se
  pueden vender en cuanto exista el contador), cupones.
- **Separación de conceptos** (así se modelará):
  - **Plan**: funciones y límites.
  - **Periodicidad**: mensual o anual.
  - **Complemento**: capacidad adicional.
  - **Rol**: lo que una persona puede hacer dentro del negocio.
  Cambiar uno nunca cambia los otros.

### 3.4 Cómo se cuentan los límites

| Límite | Cuenta | No cuenta |
|---|---|---|
| Profesionales | Filas **activas** de `profesionales` (regla vigente) | Desactivados y borrados |
| Sedes | Sedes **activas** | Desactivadas |
| Usuarios | Ilimitados | — |
| Correos | Envíos **aceptados por el proveedor** en el mes calendario del negocio | Esenciales de seguridad y de suscripción (no se descuentan nunca) |

### 3.5 Plan, permisos, alcance y suscripción: cómo se combinan

Una acción se permite si se cumplen **las cinco**, evaluadas en este orden:

```
1. Aislamiento        el recurso es del negocio del token            → si no: 404
2. Suscripción        el negocio no está suspendido                  → si no: 403 suscripcion_vencida (salvo Mi Plan, perfil, salir)
3. Plan               el plan incluye el módulo o la función         → si no: 403 plan_no_incluye
4. Permiso            el rol tiene la capacidad (ver/gestionar)      → si no: 403 sin_permiso
5. Alcance            sede y «solo lo propio»                        → si no: 404
   + Límite           solo al CREAR o ACTIVAR algo que cuenta         → si no: 422 con el límite
```

- El plan **habilita funciones del negocio**; **nunca** concede permisos a
  una persona. Subir de plan no convierte a nadie en administrador.
- `GET /capacidades` devolverá también lo que incluye el plan, para que el
  menú no enseñe lo que no está contratado.
- El aislamiento y la seguridad no dependen del plan.

**Cambios de plan, vencimiento y exceso:**
- **Subir de plan:** efecto inmediato; se registra el cambio (§Q-11).
- **Bajar de plan / exceso de capacidad:** **no se borra ni se desactiva
  nada** (decisión vigente). Se bloquea crear o activar más, y el panel
  muestra «5 de 2 — estás por encima de tu plan». Las funciones que el plan
  nuevo no incluye pasan a **solo lectura**. Las sedes por encima del límite
  siguen viéndose y sus citas siguen vivas, pero tras **14 días de gracia**
  dejan de aceptar reservas nuevas en la tienda [PROPUESTA].
- **Vencimiento:** aviso previo → suspensión (puerta de cobro: entra solo a
  Mi Plan, perfil, soporte y salir). **Las citas ya reservadas se mantienen y
  sus correos esenciales al cliente siguen saliendo** durante la gracia: el
  cliente final no tiene culpa. La tienda deja de aceptar reservas nuevas. La
  purga llega mucho después, con aviso y copia (ciclo de vida).

---

## 4. Notificaciones por correo

### 4.1 Diagnóstico (verificado)

| Qué hay | Estado |
|---|---|
| Proveedor | **Resend** (`resend/resend-laravel`), `MAIL_MAILER=resend` ✅ |
| Cola | `QUEUE_CONNECTION=database`, tablas `jobs` y `failed_jobs` ✅; los tres correos implementan `ShouldQueue` ✅ |
| Correo de **verificación** | HTML en línea, **sin plantilla común ni versión de texto** 🟡 |
| Correo de **invitación** | Con la plantilla común `components/correo/layout.blade.php` (tablas, estilos en línea, preheader, sin imágenes externas) ✅ — **reutilizable** |
| Correo de **recuperación** | `ResetPassword` de Laravel sin personalizar: **sale en inglés** (no hay `lang/es`) 🟡 |
| Remitente | `no-reply@flexishopp.site` — dominio ajeno al producto 🟡 |
| Envío tras confirmar la transacción | `after_commit = false` en todas las colas: un correo puede salir de una operación que después se deshace 🟡 |
| Registro de envíos, estados, rebotes, webhooks | ❌ no existen |
| Notificaciones de citas, pagos, equipo o suscripción | ❌ no existen |
| Recordatorios y tarea programada | ❌ no hay nada en el programador de tareas |
| Preferencias | ❌ |
| Tabla `notificaciones` (central) | ✅ existe, pensada para avisos **dentro del panel**; sin uso |

**Reutilizable:** Resend, la cola, la plantilla común y el patrón de
notificaciones encoladas. **Falta:** todo lo de citas, el registro de envíos,
las preferencias y la fiabilidad.

### 4.2 Diseño [PROPUESTA]

**Un solo camino para todo correo de negocio:**

```
Operación (reservar, cancelar, verificar pago…)
   └─ dentro de la transacción: se escribe un «evento de cita» (cita_eventos)
      y las filas de envío necesarias (notificacion_envios, estado «pendiente»)
   └─ tras el COMMIT: se encola el envío (afterCommit)
Worker
   └─ relee la cita: si cambió de versión o de estado y el aviso ya no aplica → «omitido»
   └─ arma el correo en la zona horaria del negocio → Resend → guarda el id del proveedor → «aceptado»
Webhook de Resend (firmado)
   └─ delivered → «entregado» · bounced → «rebotado» · complained → «queja» (y se suprime ese correo)
```

- **Tabla `notificacion_envios`** en la base del negocio: evento, cita,
  destinatario (tipo + id + correo), plantilla, **clave de idempotencia**
  (evento + cita + destinatario + versión de la cita, única), estado
  (`pendiente | encolado | aceptado | entregado | rebotado | queja | fallido |
  omitido | cancelado`), `programado_para` (UTC), intentos, id del proveedor y
  último error.
- **Índice central mínimo** `envios_programados` (negocio, id del envío,
  `programado_para`), **sin datos personales**. Sirve para que una tarea cada
  minuto encuentre los recordatorios que tocan sin recorrer la base de cada
  negocio. Otro índice central (id del proveedor → negocio) sirve para el
  webhook.
- **Reintentos:** 3 con espera creciente; los errores 4xx del proveedor no se
  reintentan. La clave de idempotencia impide duplicados.
- **Recordatorios:** se programan al crear la cita; al reprogramar se
  **cancelan y se reprograman**; al cancelar se cancelan. Además el worker
  relee el estado justo antes de enviar.
- **Zona horaria:** se programa en UTC y se escribe en la hora del negocio,
  con la zona indicada en el correo.
- **Un fallo de correo nunca deshace una reserva:** el envío va después del
  commit y su error queda en su fila, no en la cita.
- **Aislamiento:** los envíos viven en la base de cada negocio; el remitente
  muestra el nombre del negocio (`"Salón Rosa" <reservas@notificaciones.marca.pe>`),
  con respuesta al correo del negocio o de la sede.
- **«Aceptado» no es «entregado».** El panel muestra «enviado» solo cuando hay
  confirmación de entrega; si no, «enviado al proveedor».
- **Plantillas:** la plantilla común (ampliada con logo y color del negocio
  en todos los planes, decisión 2026-09-19) + **versión de texto** en todos los correos + contenido
  mínimo por destinatario (el profesional no recibe el teléfono del cliente si
  su rol no lo ve).

### 4.3 Matriz de eventos

Destinatarios: **C** cliente · **Pr** profesional asignado · **A** usuarios
con el aviso activado (administración o recepción de esa sede) · **T**
titular (administrador general) · **Pl** plataforma. Esencial = no se puede
desactivar (aunque sigue haciendo falta un correo válido).

| # | Evento | Para | Cuándo | Se configura en | ¿Desactivable? | Plan |
|---|---|---|---|---|---|---|
| **Citas y agenda** | | | | | | |
| C-1 | Reserva recibida — **pendiente de pago** (con QR, monto y plazo con hora exacta) | C | al instante | Notificaciones del negocio | No (esencial) | todos |
| C-11 | **Confirma tu reserva** (reservas de la tienda sin pago en línea, FR-84): botón «Confirmar mi reserva», plazo con hora exacta, «tu horario está reservado hasta entonces» | C | al instante; reenviable a pedido del cliente | — | No (esencial) | todos |
| C-12 | **Reserva no confirmada y cancelada**: «no recibimos tu confirmación; el horario se liberó», enlace para reservar de nuevo | C | al vencer el plazo | — | No | todos |
| C-2 | Nueva reserva de la tienda | Pr, A (+ WhatsApp a los números internos que lo elijan, FR-83) | al instante o en resumen diario | preferencias de cada uno | Sí | todos |
| C-3 | Cita confirmada, con **tres textos según el pago**: «Pago verificado» (tras P-4) · **«Pagas en el local»** (con el monto a pagar; nunca dice «pagada») · sin mención de pago si el servicio no lo requiere | C | al confirmar (automática o manual) | Notificaciones del negocio | No | todos |
| C-4 | Cita creada desde el panel | C | al instante | Notificaciones del negocio | Sí (el negocio puede no avisar de lo que agenda por teléfono) | todos |
| C-5 | Reprogramada (por el negocio o por el cliente) | C, Pr (+ A si la hizo el cliente) | al instante | — | No para C | todos |
| C-6 | Cancelada (con motivo; si hay pago, «devolución pendiente») | C, Pr (+ A si la hizo el cliente) | al instante | — | No para C | todos |
| C-7 | Cambio de profesional | C, Pr anterior, Pr nuevo | al instante | — | No | todos |
| C-8 | Recordatorio 1 | C | 24 h antes (fijo en Independiente) | Notificaciones del negocio | Sí; el cliente puede darse de baja | todos |
| C-9 | Recordatorios 2 y 3 | C | configurables (p. ej. 2 h antes) | Notificaciones del negocio / sede | Sí | Equipo (2), Negocio (3) |
| C-10 | Agenda del día | Pr | a las 7:00 del negocio | preferencias del profesional | Sí | Equipo, Negocio |
| **Pagos de citas** | | | | | | |
| P-1 | Pendiente de pago (QR, monto, plazo, botón «Subir comprobante») | C | al reservar | — | No | todos |
| P-2 | **Comprobante recibido, en revisión**: «el salón lo revisará; tu horario sigue reservado; te avisaremos» | C | al subir | — | No | todos |
| P-3 | Hay un comprobante por verificar | A (con `pagos`) por correo + **WhatsApp a los números internos del negocio** (FR-83), agrupado | al subir; recordatorio si pasan 2 h | preferencias y Configuración → Notificaciones | Sí (el aviso; el filtro en Citas sigue) | todos |
| P-4 | Pago aprobado → cita confirmada | C | al verificar | — | No | todos |
| P-5 | **Se pide otra captura** (corregible): motivo + plazo de corrección con hora exacta; horario retenido | C | al pulsar «Pedir otra captura» | — | No | todos |
| P-6 | Plazo vencido → cita cancelada | C, A | al vencer | — | No | todos |
| P-7 | Devolución pendiente | T, A | al cancelar una cita pagada | — | No | todos |
| P-8 | **Pago rechazado y cita cancelada** (definitivo): motivo, horario liberado, enlace para reservar de nuevo y contacto del negocio | C (+ A) | al pulsar «Rechazar y cancelar la cita» | — | No | todos |
| **Equipo** | | | | | | |
| E-1 | Invitación al panel | invitado | al invitar | — | No | todos (existe ✅) |
| E-2 | Te asignaron a una sede o un servicio | Pr | al cambiar | preferencias | Sí | todos |
| E-3 | Cambió tu horario o tienes una excepción | Pr | al cambiar | preferencias | Sí | todos |
| **Suscripción** | | | | | | |
| S-1 | Plan activado o cambiado | T | al aplicar | — | No | todos |
| S-2 | Tu prueba o plan vence en 3 días / mañana | T | programado | — | No | todos |
| S-3 | Suscripción vencida (qué sigue funcionando y cómo regularizar) | T | al suspender | — | No | todos |
| S-4 | Exceso de capacidad tras bajar de plan | T | al aplicar | — | No | todos |
| **Cuenta y seguridad** | | | | | | |
| K-1 | Verificar correo | usuario | al registrarse | — | No | todos (existe ✅) |
| K-2 | Recuperar contraseña | usuario | a pedido | — | No | todos (existe, en inglés 🟡) |
| K-3 | Tu contraseña cambió | usuario | al cambiar | — | No | todos |
| K-4 | Tu rol o tus permisos cambiaron | usuario | al cambiar | — | No | todos |
| **Plataforma** | | | | | | |
| X-1 | Tasa de rebotes o fallos por encima del umbral (por negocio o global) | Pl | cada hora | panel de plataforma | No | — |
| X-2 | Trabajos fallidos o cola atascada | Pl | cada 15 min | — | No | — |
| X-3 | Negocio que alcanzó su cuota de correos | T, Pl | al alcanzarla | — | No | — |

**Pendiente ≠ confirmada.** C-1, C-11, P-2 y P-5 dicen qué pasó, **si el
horario sigue reservado y hasta cuándo**, y qué debe hacer ahora el cliente.
Solo C-3 y P-4 dicen «confirmada», y C-3 **nunca afirma que la cita está
pagada** cuando se paga en el local. Actualizada el 2026-09-19 con las
decisiones de UX; los textos modelo están en
`ux-designs/ux-ChiraFlow-2026-09-19/EXPERIENCE.md` (State Patterns).

### 4.4 Configuración y preferencias

**Sección central «Notificaciones»** en la configuración del negocio (solo el
administrador general):
- activar o desactivar los avisos opcionales;
- recordatorios: cuántos y cuándo (dentro de lo que da el plan);
- nombre del remitente, correo de respuesta y contacto que aparece en los
  correos;
- logo y color en los correos (todos los planes: salen de la apariencia del negocio);
- **política de la cita**: horas mínimas para que el cliente reprograme o
  cancele por su cuenta (las reservas sin pago en línea las confirma siempre el cliente por correo, FR-84);
- pago QR: no pedir / opcional / obligatorio, y el plazo (Q-05).

**Por sede** (plan Negocio; el administrador de sede, para la suya): correo
de respuesta, teléfono de contacto, QR propio y horario de recordatorios.

**Cada usuario, en Mi perfil:** avisos de reservas nuevas (al instante,
resumen diario o ninguno), agenda del día y cambios de horario. Los de
seguridad no se pueden quitar.

**El cliente:** enlace «dejar de recibir recordatorios de este negocio» en el
pie de los recordatorios; se guarda en su ficha de cliente de ese negocio.
Los avisos de estado de su cita (C-1, C-3, C-5, C-6, P-x) no se pueden
quitar: son la cita misma.

**Sin correo válido:**
- **Cliente sin correo** (citas creadas por teléfono en el panel): no se le
  envía nada, y el formulario lo advierte («no recibirá avisos»). En la
  tienda pública el correo es obligatorio (así está en el contrato).
- **Profesional sin cuenta:** [PROPUESTA] campo opcional «correo para avisos»
  en su ficha. Recibe los datos de la cita **sin botones al panel** (no tiene
  acceso). Sin ese correo, no recibe nada.
- **Rebote o queja:** se suprime ese correo en ese negocio y se marca en la
  ficha para que lo corrijan.

**Qué regla prevalece:**
```
el plan permite la función → el negocio la activa → el destinatario no se dio de baja → hay correo válido
(los esenciales se saltan el tercer paso, nunca el cuarto)
```

**Operativo frente a promocional:** en el lanzamiento solo hay correos
operativos. [PROPUESTA] la tienda pregunta desde ya, **desmarcado por
defecto**, «acepto recibir novedades de este negocio», y se guarda con fecha
para el día que existan campañas (con su propia baja y separado por negocio).

### 4.5 Botones y gestión de la cita por el cliente

**Sin cuenta, con enlace seguro [PROPUESTA ⟲ REABRE el canal]:** los clientes
no tienen cuenta (decisión vigente), y pedir registro para cancelar una cita
es fricción pura. Hoy la gestión estaba prevista por el `codigo` de 8
caracteres vía WhatsApp; ese código **no basta como secreto** para modificar
una cita desde un enlace (es corto, lo ve el personal y sirve de referencia
en conversaciones).

- **Token de acceso por cita**: aleatorio de 32 bytes, se guarda **solo su
  hash** (tabla `cita_accesos`: cita, hash, caduca el, revocado),
  **válido hasta 7 días después de la cita**, revocable. El `codigo` sigue
  siendo la referencia legible y la llave para subir el comprobante (con su
  límite de peticiones, §6.3).
- **Botones del correo:** «Ver reserva», «Reprogramar» y «Cancelar». Abren
  `{tienda}/cita/{token}`. **Abrir un enlace no cambia nada**: la vista enseña
  el estado actual y la acción exige confirmar en la página (los antivirus de
  correo abren los enlaces para inspeccionarlos, así que un GET que cancelara
  cancelaría solo).
- **Cada vista comprueba** que el token es válido y no ha caducado, el estado
  actual de la cita (no se reprograma una cancelada ni una ya atendida), la
  política del negocio (horas mínimas) y la disponibilidad real (el mismo
  motor y el mismo anti-solape).
- **Si el enlace no sirve** (caducó, la cita cambió o ya pasó): mensaje claro
  («esta cita ya fue reprogramada al jueves 12 a las 10:00» o «ya no puedes
  cambiarla en línea») y alternativa: botón de WhatsApp o teléfono del
  negocio, y enlace a la tienda para reservar de nuevo.
- **El enlace solo abre esa cita**: nunca lista otras del mismo cliente ni de
  otro negocio. El token identifica cita y negocio; no se acepta ningún id en
  la URL.
- **Profesionales y personal:** sus correos enlazan al **panel** con sesión y
  permisos normales. Nunca llevan tokens de cliente.
- **Diseño:** una columna, botones grandes, legible en móvil; color y logo del
  negocio en todos los planes; versión de texto con las URLs completas; sin datos
  que el destinatario no necesite.

### 4.6 Consumo, límites y bajada de plan

- Estimación: ≈ 3–5 correos por cita (ver §3.1). Cuotas propuestas en §3.2,
  con paquete de 5 000 por S/ 15.
- **Al llegar a la cuota:** los **esenciales siguen saliendo siempre** (se
  cuentan y, si el exceso se repite, se ofrece el paquete); se **pausan** los
  opcionales (recordatorios 2–3, agenda del día, resúmenes) con aviso al
  titular (X-3) y un banner en el panel. **Nunca en silencio.**
- **Al bajar de plan:** los recordatorios ya programados de citas existentes
  **se envían** (el cliente ya los esperaba); los nuevos se programan con las
  reglas del plan nuevo. Las automatizaciones que el plan ya no incluye dejan
  de crear envíos nuevos desde la fecha del cambio.
- **Fuera del lanzamiento:** campañas promocionales, WhatsApp y SMS. Si se
  añaden, con costo aparte (WhatsApp Business cobra por conversación y exige
  plantillas aprobadas por Meta; los SMS en Perú tienen costo por mensaje) y
  con consentimiento propio.

---

## 5. Alcance recomendado

**Lanzamiento** (≈ 47–62 días activos, §Q-03):
1. Arreglos de seguridad y cierres: G-1…G-4, `/citas/opciones`, onboarding,
   canal y actor de la cita, `lang/es` (incluida la recuperación de
   contraseña), Mi perfil conectado, `afterCommit` en colas.
2. Preset Recepción, alcance por sedes en profesionales, módulo `pagos`, regla
   «nadie concede lo que no tiene».
3. Servicios por sede y regla de reservabilidad única.
4. Calendario conectado; reprogramar y cancelar desde el panel.
5. Tienda pública completa (con consentimiento y términos).
6. Gestión de la cita por enlace seguro.
7. Pago QR Yape (total, por negocio y sede, verificación, plazo configurable,
   devoluciones registradas).
8. Notificaciones: salida con registro, plantillas, eventos C-1…C-8, P-1…P-7,
   E-1, S-1…S-4, K-1…K-4, X-1…X-2; preferencias básicas; webhook de Resend.
9. Suscripción: estado, Mi Plan de solo lectura con «contáctanos», ciclo de
   vida mínimo (vencer → avisar → suspender), planes y cuotas nuevos en el
   seeder.
10. Panel de plataforma mínimo con auditoría y registro de pagos.
11. Dashboard mínimo real; los módulos no lanzados se ocultan del menú.
12. Landing, términos, privacidad, despliegue (pruebas + producción), dominio
    y remitente verificados, copias de seguridad probadas.
13. Piloto cerrado con 2–3 negocios [PROPUESTA].

**Después (se conservan en el alcance general):** Caja; Reportes; Soporte con
tickets; plantillas y envío de WhatsApp; recordatorios 2–3 y reglas por sede
(si no entran en el lanzamiento); registro de entregas visible al negocio;
pasarela Mercado Pago; adelantos; precios y duraciones por sede; varios
negocios por persona; acceso de soporte temporal; purga automática; métricas
de plataforma; reseñas; importación de clientela; kardex; historial de cajas;
SEO de la tienda; dominios personalizados; campañas promocionales.

---

## 6. Decisiones pendientes

| # | Decisión | Bloquea |
|---|---|---|
| **A-1** | ✅ **APROBADA 2026-09-19** — Aprobar el modelo de permisos (§2.2–2.3): preset Recepción, alcance en profesionales, módulo `pagos`, «nadie concede lo que no tiene», administrador de sede sin invitar | **Arquitectura** |
| **A-2** | ✅ **APROBADA 2026-09-19** — ⟲ Aprobar canal + actor para el origen de la cita, con su migración (Q-02) | **Arquitectura** |
| **A-3** | ✅ **APROBADA 2026-09-19** — ⟲ Aprobar la caducidad del hueco con pago obligatorio y su plazo por defecto (Q-05) | **Arquitectura** (motor de reservas y programador) |
| **A-4** | ✅ **APROBADA 2026-09-19** — ⟲ Aprobar la gestión por enlace seguro (§4.5) | **Arquitectura** |
| **A-5** | ✅ **APROBADA 2026-09-19** — Aprobar la salida de correo con registro, webhook e índices centrales (§4.2) | **Arquitectura** |
| **A-6** | ✅ **APROBADA 2026-09-19** — `suscripcion_cambios`, `modo_cobro` y el panel de plataforma en el repo de Next (Q-11). Incorporada al PRD como FR-60 y UJ-7 | Arquitectura |
| **A-7** | ✅ **APROBADA 2026-09-19** — Aprobar `local_servicio` (sin precio ni duración por sede en v1) y que un servicio sin profesionales no se pueda reservar (Q-06) | **Arquitectura** |
| ~~F-1~~ | **Resuelta 2026-09-19:** solo el total en el lanzamiento; adelantos y QR por sede, posteriores | — |
| F-2 | Política por defecto: horas mínimas para que el cliente cancele o reprograme (propuesta: 24 h) | Funcionalidad (gestión por enlace) |
| F-3 | ¿El profesional ve el teléfono del cliente? | Funcionalidad (permisos) |
| F-4 | Correo opcional de avisos en la ficha del profesional sin cuenta | Funcionalidad (notificaciones) |
| F-5 | Nombres y precios de los planes, cuotas de correo y complementos (§3.2–3.3) | Funcionalidad (seeder, Mi Plan) |
| F-6 | Días de prueba (7 o 14) y uso de la promo S/ 9 | Funcionalidad (ciclo de vida) |
| F-7 | Días de gracia antes de dejar de aceptar reservas por vencimiento o exceso | Funcionalidad (ciclo de vida) |
| F-8 | Grupos: ocultar hasta decidir su uso (Q-08) | Funcionalidad |
| L-1 | **Nombre comercial y dominio del producto** (remitente, enlaces, subdominios) | Lanzamiento (y el diseño de los correos) |
| L-2 | Dominio de las tiendas (comodín) | Lanzamiento |
| L-3 | Opción de despliegue A o B | Lanzamiento |
| L-4 | Tu disponibilidad semanal y el piloto (para fijar la fecha) | Lanzamiento |
| L-5 | Textos legales (términos, privacidad, consentimiento) | Lanzamiento |
| L-6 | RUC y comprobantes por la suscripción (Q-12) | Lanzamiento (cobro manual) |

**Para empezar ya sin esperar nada:** los arreglos G-1…G-4, los hooks de
onboarding, `lang/es` y conectar Mi perfil no dependen de ninguna decisión
(salvo que la corrección de G-4 depende de A-1 solo en el detalle del
administrador de sede).

---

**Fuentes externas** (consultadas el 2026-09-19):
- AgendaPro Perú, planes: https://agendapro.com/pe/planes
- AgenditApp frente a AgendaPro: https://agenditapp.com/vs/agendapro
- Precios de Resend: https://resend.com/docs/knowledge-base/what-is-resend-pricing · https://flexprice.io/blog/detailed-resend-pricing-guide
- Suscripciones de Mercado Pago Perú: https://www.mercadopago.com.pe/developers/es/docs/subscriptions/integration-configuration/subscription-associated-plan
- Hetzner 2026: https://northflank.com/blog/hetzner-cloud-server-price-increases
- MySQL gestionado de DigitalOcean: https://docs.digitalocean.com/products/databases/mysql/details/pricing/
- Laravel Forge 2026: https://laracopilot.com/blog/laravel-forge-pricing-2026/
- Vercel Pro: https://vercel.com/docs/plans/pro-plan
