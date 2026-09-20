---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics (aprobado por el usuario 2026-09-19)', 'step-03-create-stories', 'step-04-final-validation']
inputDocuments:
  - '_bmad-output/planning-artifacts/prds/prd-ChiraFlow-2026-09-19/prd.md'
  - '_bmad-output/planning-artifacts/architecture/architecture-ChiraFlow-2026-09-19/ARCHITECTURE-SPINE.md'
  - '_bmad-output/planning-artifacts/propuesta-decisiones-2026-09-19.md'
  - '_bmad-output/planning-artifacts/diagnostico-2026-09-19.md'
  - 'docs/api-contract.md (referencia, no se copia)'
  - 'docs/vistas/*.md (referencia por pantalla, no se copia)'
  - '_bmad-output/planning-artifacts/ux-designs/ux-ChiraFlow-2026-09-19/DESIGN.md'
  - '_bmad-output/planning-artifacts/ux-designs/ux-ChiraFlow-2026-09-19/EXPERIENCE.md'
---

# ChiraFlow - Epic Breakdown

## Overview

Este documento descompone en épicas e historias los requisitos del PRD y de
la arquitectura de ChiraFlow. Es **brownfield**: lo marcado ✅ ya está
construido y verificado y **no se replanifica**; los 🟡 generan historias de
cierre; los ⬜ historias nuevas. El alcance del lanzamiento es el del PRD §8.

Cada historia cita, cuando existe, su ficha de `docs/vistas/` y su sección de
`docs/api-contract.md` como fuente de detalle. Las pantallas sin diseño
previo empiezan por una **historia de diseño** dentro de su épica.

## Requirements Inventory

### Functional Requirements

Estado real entre corchetes: [✅] hecho y verificado · [🟡] parcial · [⬜] pendiente · [post] fuera del lanzamiento.

FR1: [✅] Registro del dueño sin nombre de negocio, sin abrir sesión ni crear base; negocio y dueño atómicos; correo único global.
FR2: [✅] Verificación de correo que crea la base del negocio en segundo plano, idempotente; reenvío con límite por correo.
FR3: [✅] Inicio y cierre de sesión; cerrar invalida solo esa sesión; credenciales malas → 422 en email.
FR4: [✅] Recuperación de contraseña por correo.
FR5: [✅] Invitación de usuarios por correo; cada quien elige su contraseña; caduca a 7 días; fallo del envío deshace el alta.
FR6: [🟡] Mi perfil (datos y cambio de contraseña con la actual; cierra otras sesiones). Falta conectar la pantalla (hoy mock).
FR7: [✅] Nombre del negocio y slug: nace la primera vez que hay nombre, por cualquier camino; renombrar no lo cambia.
FR8: [🟡] Marcado automático de los 6 pasos del onboarding. F-01: primer_profesional y primer_servicio no se marcan.
FR9: [⬜] Tutorial enlazado desde el onboarding (contenido por definir).
FR10: [✅] Usuarios del panel gestionados solo por el administrador general; un único administrador general.
FR11: [✅] Profesionales con horario, descansos, excepciones y cuenta opcional.
FR12: [✅] Cupo de profesionales activos por plan + extras; bajar de plan no desactiva a nadie.
FR13: [✅] Roles del negocio con ver/gestionar por módulo y solo_propios; los de sistema no se borran.
FR14: [🟡] Aplicación de permisos en lecturas y escrituras. F-02/D-01 y huecos G-1..G-4 abiertos.
FR15: [✅] Categorías de servicio.
FR16: [✅] Servicios con tipo, galería, visibilidad y profesionales.
FR17: [✅] Clientes con teléfono normalizado único.
FR18: [post] Importar clientela desde Excel.
FR19: [✅] Sedes; la principal no se borra. Desde el lanzamiento sin identidad visual propia: heredan la del negocio (ver FR77, FR82).
FR20: [✅] Quién atiende en cada sede (habilitado, nombre público, perfil, horario informativo).
FR21: [⬜] Servicios habilitados por sede (A-7); migración con todo habilitado; servicio sin profesionales no reservable.
FR22: [🟡] Grupos existen pero nadie los usa; ocultar hasta decidir (F-8).
FR23: [✅] Configuración del negocio por secciones.
FR24: [✅] Productos; el stock no se edita directamente.
FR25: [✅] Movimientos de stock; salida manual no deja negativo.
FR26: [post] Kardex de inventario.
FR27: [✅] Cálculo único de huecos con precedencia de 5 niveles y caso dorado.
FR28: [🟡] Crear y editar citas sin solapes. Faltan reglas G-1..G-3 en escrituras; F-06 sin test de concurrencia.
FR29: [✅] Cliente al vuelo por teléfono; sin teléfono, ficha nueva.
FR30: [✅] Precio y duración congelados por línea; monto editable; monto_total con productos.
FR31: [✅] Seis estados; stock al completar y devolución al deshacer; cancelar ≠ borrar.
FR32: [✅] solo_propios en citas (404 a lo ajeno).
FR33: [🟡] Canal (panel|tienda) y autor de la cita (A-2). Hoy se guarda `admin` y no el autor.
FR34: [⬜] Código de la cita visible en el panel.
FR35: [⬜] Calendario del día por profesional, coherente con el motor del servidor (Q-19 por definir).
FR36: [⬜] Resolución de la tienda por slug; 404 en los casos definidos; sede preseleccionada desde su enlace y cambiable (aviso si reinicia la selección); sede antes del servicio.
FR37: [⬜] Catálogo público de una sede sin datos internos.
FR38: [⬜] Huecos públicos idénticos a los del panel.
FR39: [⬜] Reserva con carrito (única/separada), datos del cliente, consentimientos, comprobante y correo con enlace.
FR40: [⬜] Límite de peticiones propio en la superficie pública.
FR41: [post] SEO de la tienda (Q-07).
FR42: [post] Reseñas.
FR43: [⬜] Pantalla «tienda no disponible».
FR44: [⬜] Configurar cobro por QR (no pedido/opcional/obligatorio, plazo). Un único QR del negocio; QR por sede posterior.
FR45: [⬜] Subir evidencia de pago con todas las reglas de seguridad de la regla 7.
FR46: [⬜] Verificar pagos desde Citas: aprobar, pedir otra captura (corregible) o rechazar y cancelar (definitivo); solo pago total (adelantos posteriores); sin movimientos de caja hasta que Caja exista.
FR47: [post] Plantillas de WhatsApp por evento.
FR48: [post] Envío y consumo de WhatsApp.
FR49: [post] Sesión diaria de caja con método de pago.
FR50: [post] Historial de cajas.
FR51: [⬜] Dashboard mínimo real (citas de hoy, pagos por verificar, próximas citas); versión completa posterior.
FR52: [post] Informe de reportes por rango.
FR53: [post] Exportar reportes a CSV.
FR54: [post] Tickets de soporte del negocio.
FR55: [🟡] Estado de la suscripción y puerta de cobro; falta el aviso y Mi Plan.
FR56: [⬜] Elegir plan y extras con plan sugerido; nunca esconder planes.
FR57: [⬜] Contratar y activar: activación manual por la plataforma; un único punto de entrada; pasarela posterior.
FR58: [⬜] Ciclo de vida diario mínimo: vencer → avisar → suspender (purga automática posterior).
FR59: [post] Métricas nocturnas de plataforma.
FR60: [⬜] Panel de plataforma: acceso con 2FA, lista y ficha de negocios, activar/cambiar plan con historial, registrar pago aparte, suspender, auditoría.
FR61: [⬜] Landing del SaaS con planes y registro.
FR62: [⬜] Opciones para agendar derivadas del permiso de citas, recortadas por alcance.
FR63: [⬜] Nadie concede lo que no tiene (rol y alcance ⊆ los propios); el administrador de sede no invita.
FR64: [⬜] Cuatro roles de sistema: + Recepción; «administrador de sede» como nombre visible.
FR65: [⬜] Alcance por sedes en profesionales.
FR66: [⬜] Módulo de permiso `pagos`.
FR67: [⬜] Regla única de reservabilidad servicio + profesional + sede.
FR68: [⬜] Historial de la cita (eventos con actor).
FR69: [⬜] Gestión de la cita por enlace seguro: ver, reprogramar, cancelar.
FR70: [⬜] Política de cambios del negocio (horas mínimas para reprogramar o cancelar).
FR83: [⬜] Avisos por WhatsApp al personal desde el número de ChiraFlow (Evolution en Railway), canal secundario con consentimiento verificado.
FR84: [⬜] Confirmación por correo de toda reserva de la tienda sin pago en línea; si no confirma en el plazo, se libera el horario.
FR71: [⬜] Caducidad de la reserva impaga solo con pago obligatorio; plazos desde la creación o desde «pedir otra captura», nunca después de 15 min antes de la cita; sin horarios que no dejen tiempo de pagar.
FR72: [⬜] Cancelaciones, reprogramaciones y devoluciones con pago.
FR73: [⬜] Envío de correo fiable (tras commit, reintentos, sin duplicados, estados, webhook, aislamiento, dominio autenticado); arreglar correos actuales.
FR74: [⬜] Eventos y destinatarios según la matriz de la propuesta §4.3; botones de gestión en todos los planes.
FR75: [⬜] Configuración y preferencias de notificaciones (negocio, sede, usuario, cliente).
FR76: [⬜] Cuota de correos por plan sin cortar los esenciales.
FR77: [⬜] Identidad del negocio en la tienda (logo, color con contraste AA, 3 estilos de portada) en todos los planes; todas las sedes la heredan.
FR78: [⬜] Editor básico de apariencia: vista previa móvil/escritorio, publicar, descartar (vuelve a lo publicado).
FR79: [⬜] Imágenes de marca validadas y procesadas (logo 512 px; portada en 3 anchos; sin metadatos).
FR80: [post] Portada propia por sede (función de plan portada_por_sede).
FR81: [⬜] Slug de sede único dentro del negocio, con historial que redirige para siempre y redirección de las rutas con id.
FR82: [⬜] Traslado de la identidad de las sedes al negocio sin perder datos; color secundario retirado.

### NonFunctional Requirements

NFR1: Aislamiento entre negocios: 404 (no 403) a lo ajeno, en todos los endpoints, con test.
NFR2: Seguridad: token nunca en el navegador; reglas en un solo sitio; límite de peticiones en rutas sin sesión.
NFR3: Toda hora de negocio en la zona horaria del negocio.
NFR4: Todo texto y todo error en español. F-04: los 422 genéricos salen en inglés.
NFR5: Listados paginados con `search`; ningún selector pierde opciones en silencio (F-05).
NFR6: Formas de datos según `api-contract.md`; importes como número; el servidor manda claves.
NFR7: Panel y tienda usables en móvil.
NFR8: Correos en segundo plano.
NFR9: Operación: hosting, copias, disponibilidad y monitoreo (resuelto en AD-20).
NFR10: Protección de datos personales (Ley N.° 29733): privacidad, consentimiento, supresión.
NFR11: Orden de autorización: aislamiento → suscripción → plan → permiso → alcance; límites al crear.
NFR12: Cada regla de seguridad o de negocio en un solo service.

### Additional Requirements

De la arquitectura (AD-1..AD-21). No hay plantilla de inicio: el proyecto existe.

- Zonas separadas en Laravel (`routes/api.php`, `routes/publico.php`, `routes/plataforma.php`) con su middleware y credencial, y test que impida cruzarlas (AD-3).
- Comprobador único de funciones del plan: catálogo en código + `planes.features`; `GET /capacidades` devuelve plan, permisos y alcance (AD-5).
- Tabla `eventos_dominio` en cada base (negocio y central) y `Notificador` único con `notificacion_envios`, idempotencia y envío tras commit; webhook firmado de Resend con índice central de ids (AD-8).
- Agenda central `tareas_programadas` con comando por minuto y re-comprobación por versión; creada tras el commit (AD-9).
- `SuscripcionService::aplicar`, `suscripcion_cambios` solo de inserción, `pagos` con estado por defecto `pendiente`, `modo_cobro` (AD-10).
- Superficie pública: tenant por slug o token de cita, sin ids numéricos, límites con nombre y Cloudflare Turnstile en login, registro, recuperación, reserva y subida de comprobante (AD-11).
- Guard de `platform_admins` con 2FA; zona plataforma sin tenancy; auditoría en `soporte_acciones` (AD-12).
- Contrato primero en cada historia que cambie la API; `pendientes-contrato.md` cerrado (AD-13).
- Migraciones solo se añaden; de tenant con `tenants:migrar-provisionados` (AD-14).
- Dominios `app.`, `admin.`, `api.`, `{slug}.site.`; cookies `__Host-`; BFF enruta por host y valida `Origin` (AD-15).
- UTC para lo programado; hora local del negocio para citas (AD-16).
- Sin mocks en producción; menú solo desde `/capacidades` (AD-17).
- `sprint-status.yaml` único; git solo en el propio repo; worktree por agente (AD-18).
- Vitest en `web/`, caso dorado JSON compartido en `docs/fixtures/` leído por Vitest y Pest, Playwright con 4–5 recorridos (AD-19).
- Entornos local, pruebas y producción separados; worker y programador por minuto; copias diarias central + cada negocio a R2 con restauración mensual; MySQL 8.4 LTS; monitor de disponibilidad y alertas X-1/X-2; logs 14 días (AD-20).
- Despliegue: Contabo VPS 6 con Forge, Vercel Pro en `iad1`, Resend Pro, Cloudflare DNS/R2/Turnstile (memlog de arquitectura).
- Provisioning al verificar correo; ciclo de vida diario vía `SuscripcionService`; métricas nocturnas (posterior) (AD-21).
- Correo remitente con SPF, DKIM y DMARC en el dominio del producto (L-1 pendiente).
- Coordinación con Codex: `AGENTS.md` en cada repo y BMAD instalado para Codex antes de repartir historias.

### UX Design Requirements

**Actualizado el 2026-09-19:** el contrato UX de BMAD existe ya en
`ux-designs/ux-ChiraFlow-2026-09-19/` (DESIGN.md + EXPERIENCE.md, borrador
revisado por el usuario). Cada UX-DR remite a su sección. Añadido UX-DR10:
editor de apariencia de la página de reservas (FR77 a FR79, FR82).

Texto original de la extracción: no había contrato UX de BMAD. Las pantallas existentes se rigen por sus fichas de
`docs/vistas/` y por la plantilla Modernize (tema `AQUA_THEME`, componentes
compartidos, `dialogoResponsive`). Las pantallas **nuevas** llevan una historia
de diseño al inicio de su épica:

UX-DR1: Opciones de pago QR en Configuración y pantalla de pago al reservar (QR, monto, plazo, subir evidencia). Diseño: EXPERIENCE.md (Paso de pago, State Patterns).
UX-DR2: Verificación de pagos en la tabla y ficha de Citas (filtro, visor de evidencia, aprobar/rechazar con motivo).
UX-DR3: Página de la cita del cliente (ver, reprogramar, cancelar, estados de enlace caducado o cita cambiada).
UX-DR4: Panel de plataforma (acceso con 2FA, lista y ficha de negocio, activar plan, registrar pago, suspender).
UX-DR5: Sección «Notificaciones» en Configuración y preferencias en Mi perfil.
UX-DR6: Plantillas de correo (layout común con marca del negocio, versión de texto, botones de gestión).
UX-DR7: Mi Plan de solo lectura con plan sugerido, avisos de exceso y «contáctanos».
UX-DR8: Dashboard mínimo (citas de hoy, pagos por verificar, próximas citas).
UX-DR9: Landing del SaaS, términos y privacidad.
UX-DR10: Editor de apariencia de la página de reservas (identidad, estilo de portada, degradados, foto con punto de enfoque, vista previa, publicar, descartar, aviso tras el traslado de la identidad de las sedes).

### FR Coverage Map

| FR | Épica | Qué aporta |
|---|---|---|
| FR1–FR5, FR7 | 0 | Registro, verificación, acceso, recuperación, invitaciones y slug del negocio (hecho) |
| FR6 | 1 | Mi perfil conectado de verdad |
| FR8 | 1 | El onboarding se marca solo desde cualquier pantalla |
| FR9 | 9 | Tutorial enlazado desde el onboarding |
| FR10–FR13 | 0 | Usuarios, profesionales, cupo del plan y roles (hecho) |
| FR14 | 1 | Permisos aplicados también en las escrituras |
| FR15–FR17 | 0 | Categorías, servicios y clientes (hecho) |
| FR18 | — | Importar clientela (posterior) |
| FR19, FR20 | 0 | Sedes y quién atiende en cada una (hecho) |
| FR21 | 2 | Servicios habilitados por sede |
| FR22 | 1 | Grupos ocultos hasta decidir su uso |
| FR23–FR25 | 0 | Configuración e inventario (hecho) |
| FR26 | — | Kardex (posterior) |
| FR27 | 0 | Motor de huecos (hecho) |
| FR28 | 1 | Reglas de alcance y reservabilidad al crear y editar citas |
| FR29–FR32 | 0 | Cliente al vuelo, precios congelados, estados y solo lo propio (hecho) |
| FR33, FR68 | 1 | Canal y autor de la cita, con su historial |
| FR34, FR35, FR51 | 3 | Código visible, calendario y dashboard mínimo |
| FR36–FR40, FR43 | 6 | Tienda pública completa |
| FR41, FR42 | — | SEO y reseñas (posteriores) |
| FR44–FR46 | 7 | Configurar, subir y verificar el pago con Yape |
| FR47–FR50 | — | WhatsApp a clientes y caja (posteriores) |
| FR52–FR54 | — | Reportes y soporte (posteriores) |
| FR55–FR58 | 8 | Estado de la suscripción, Mi Plan, activación y ciclo de vida |
| FR59 | — | Métricas de plataforma (posterior) |
| FR60 | 8 | Panel de plataforma |
| FR61 | 9 | Landing del SaaS |
| FR62–FR66 | 1 | Opciones para agendar, «nadie concede lo que no tiene», roles, alcance y permiso de pagos |
| FR67 | 2 | Regla única de reservabilidad |
| FR69, FR70 | 6 | Gestión de la cita por enlace y política de cambios |
| FR71, FR72 | 7 | Plazos, caducidad, rescate del pago tardío y devoluciones |
| FR73–FR76 | 4 | Envío fiable, eventos, preferencias y cuota de correos |
| FR77–FR79, FR82 | 5 | Identidad del negocio, editor y traslado desde las sedes |
| FR80 | — | Portada por sede (posterior) |
| FR81 | 6 | Slug de sede y redirecciones |
| FR83 | 4 | Avisos por WhatsApp al personal |
| FR84 | 6 | Confirmación por correo de las reservas sin pago en línea |


## Epic List

Nueve épicas para el lanzamiento, en orden de dependencia. Cada una deja algo
que el negocio o su cliente pueden usar, y ninguna necesita a las siguientes
para funcionar. **Épica 0** no es trabajo: registra lo que ya está construido
y verificado, para que nadie lo replanifique.

### Épica 0: Lo que ya funciona (registro, no trabajo)
Registro y acceso, equipo y roles, catálogo, clientes, sedes, configuración,
inventario, disponibilidad y citas del panel están construidos y verificados
(312 tests en verde). No se replanifican; si algo de aquí se rompe, entra como
arreglo dentro de la épica que lo toque.
**FRs cubiertos:** FR1–FR5, FR7, FR10–FR13, FR15–FR17, FR19, FR20, FR23–FR25, FR27, FR29–FR32.

### Épica 1: Cada persona ve y hace exactamente lo suyo
El negocio puede repartir el trabajo con confianza: el rol Profesional agenda
sin tropezar con permisos, nadie puede darse más poder del que tiene, y los
errores se leen en español. Cierra los huecos de seguridad encontrados el
2026-09-19 y deja el panel listo para todo lo demás.
**FRs cubiertos:** FR6, FR8, FR14, FR22, FR28 (reglas de escritura), FR33, FR62–FR66, FR68 · **NFR:** NFR4, NFR5, NFR11, NFR12.
**Notas:** empieza por G-1 a G-4 (seguridad); incluye `lang/es`, conectar Mi perfil, los avisos del onboarding, canal y autor de la cita con su historial, y el preset Recepción. Agente sugerido: **Claude** (seguridad y reglas en services).

### Épica 2: Cada sede ofrece lo que de verdad ofrece
El negocio decide qué servicios da cada sede y el sistema deja de ofrecer
combinaciones imposibles: solo se puede reservar un servicio con alguien que
lo presta, en una sede donde se ofrece.
**FRs cubiertos:** FR21, FR67.
**Notas:** una sola regla de reservabilidad que después usan la tienda, el panel y el enlace del cliente. Agente sugerido: **Claude**.

### Épica 3: El día de trabajo se ve de un vistazo
Recepción abre el panel y entiende su día: calendario por profesional
coherente con el motor real, el código de cada cita a mano y un tablero con lo
urgente.
**FRs cubiertos:** FR34, FR35, FR51.
**Notas:** 4.C ya tiene pantalla maquetada; falta conectarla y verificar la paridad de franjas. El dashboard mínimo sustituye al que hoy muestra datos ficticios. Agente sugerido: **Codex** (pantallas ya especificadas).

### Épica 4: Nadie se entera tarde de nada
Clientes y equipo reciben los avisos que importan: correo fiable con su
registro de entregas, recordatorios que se reprograman solos y WhatsApp al
encargado cuando algo necesita su atención.
**FRs cubiertos:** FR73–FR76, FR83.
**Notas:** incluye arreglar los correos actuales (recuperación de contraseña en inglés, plantilla común), la agenda central de tareas y el canal de WhatsApp con Evolution en Railway. Agente sugerido: **Claude** (notificador, tareas) + **Codex** (pantallas de preferencias).

### Épica 5: El negocio se ve como su negocio
El dueño viste su página de reservas con su logo, su color y su portada, la ve
en móvil y escritorio antes de publicar, y todas sus sedes quedan iguales.
**FRs cubiertos:** FR77–FR79, FR82.
**Notas:** el traslado de la identidad de las sedes va en la misma épica para que nadie quede con dos identidades. La portada por sede (FR80) es posterior. Agente sugerido: **Codex** (editor) + **Claude** (procesado de imágenes y migración).

### Épica 6: Los clientes reservan solos, de verdad
La tienda pública entra en servicio: el cliente elige sede, servicio,
profesional y hora, confirma su reserva desde su correo y luego la gestiona
sin crear cuenta. Las reservas de broma dejan de bloquear horarios.
**FRs cubiertos:** FR36–FR40, FR43, FR69, FR70, FR81, FR84.
**Notas:** incluye el slug de sede con sus redirecciones y la pantalla de tienda no disponible. Necesita las épicas 2, 4 y 5. Agente sugerido: **Claude** (zona pública y enlaces) + **Codex** (conectar la maqueta).

### Épica 7: Cobrar por adelantado con Yape
El negocio exige (o propone) el pago al reservar: el cliente paga, sube su
captura y el negocio la verifica en dos clics, con los plazos y el rescate del
pago tardío ya resueltos.
**FRs cubiertos:** FR44–FR46, FR71, FR72.
**Notas:** solo el total; sin movimientos de caja hasta que exista Caja. Agente sugerido: **Claude**.

### Épica 8: Cobrar la suscripción sin tocar la base de datos
La plataforma deja de depender de consultas manuales: hay un panel propio con
2FA para activar planes, registrar pagos y suspender, y el negocio ve su plan,
sus límites y su vencimiento.
**FRs cubiertos:** FR55–FR58, FR60.
**Notas:** un único camino aplica los cambios (AD-10), el historial no se edita y activar nunca equivale a cobrar. Agente sugerido: **Claude** (suscripción y auditoría) + **Codex** (pantallas).

### Épica 9: Abrir la puerta al público
El producto se puede enseñar y contratar: landing con los planes, textos
legales, ninguna pantalla con datos ficticios y el sistema corriendo en
producción con copias probadas.
**FRs cubiertos:** FR9, FR61 · **NFR:** NFR9, NFR10 · **AD:** AD-17, AD-20.
**Notas:** incluye apagar los mocks, ocultar del menú los módulos no lanzados, el despliegue en Contabo y Vercel con entorno de pruebas, y el piloto con 2–3 negocios. Agente sugerido: **Codex** (landing) + **Claude** (despliegue y cierre).

### Fuera del lanzamiento (siguen en el alcance general)
FR18, FR26, FR41, FR42, FR47–FR50, FR52–FR54, FR59, FR80: importación de
clientela, kardex, SEO, reseñas, WhatsApp a clientes, caja, reportes, soporte,
métricas de plataforma y portada por sede.


---

## Épica 0: Lo que ya funciona (registro, no trabajo)

**Meta:** dejar constancia de lo construido y verificado para que ninguna
sesión lo replanifique. **No genera historias.** Si algo de aquí se rompe,
el arreglo entra como historia de la épica que lo toque.

Cubre FR1–FR5, FR7, FR10–FR13, FR15–FR17, FR19, FR20, FR23–FR25, FR27,
FR29–FR32, con 312 pruebas en verde (Sprints 0 a 4.B).

---

## Épica 1: Cada persona ve y hace exactamente lo suyo

**Meta:** el negocio reparte el trabajo con confianza. Nadie agenda a nombre
de otro, nadie se concede más poder del que tiene, el rol Profesional agenda
sin tropezar con permisos y los errores se leen en español.

**Requisitos:** FR6, FR8, FR14, FR22, FR28, FR33, FR62–FR66, FR68 ·
NFR4, NFR5, NFR11, NFR12 · F-01 a F-06 · G-1 a G-4.
**Agente por defecto:** Claude (seguridad y reglas en services); las historias
de pantalla van marcadas para Codex.

### Story 1.1: Un profesional no agenda a nombre de otro

As a dueño de un negocio con varios barberos,
I want que quien solo ve sus propias citas tampoco pueda crear ni mover citas de un compañero,
So that la agenda de cada persona sea suya de verdad y no dependa de que la pantalla esconda un selector.

**Acceptance Criteria:**

**Given** un usuario con rol de permiso `citas: gestionar` y `solo_propios`, con ficha de profesional propia
**When** envía `POST /citas` con `empleado_id` de otro profesional
**Then** la respuesta es 422 sobre el campo `empleado_id` con mensaje en español
**And** no se crea ninguna cita.

**Given** ese mismo usuario y una cita suya
**When** envía `PUT /citas/{id}` cambiando `empleado_id` a otro profesional
**Then** la respuesta es 422 y la cita conserva su profesional.

**Given** ese mismo usuario
**When** pide `PUT`/`DELETE` sobre una cita de otro profesional
**Then** la respuesta es 404 (FR32: para esa persona no existe).

**Given** un usuario con `citas: gestionar` sin `solo_propios`
**When** crea una cita para cualquier profesional de su alcance
**Then** la cita se crea con normalidad.

**And** la regla vive en `CitaService` (NFR12), no en el controlador, y hay
prueba Pest para cada uno de los cuatro casos.

> **Agente:** claude · **Referencias:** propuesta §Q-01 (G-1), PRD FR-28/FR-32,
> `app/Services/CitaService.php`.

### Story 1.2: Las citas no salen del alcance de sedes

As a administrador de la sede norte,
I want no poder crear ni mover citas en sedes que no administro,
So that el alcance por sedes signifique algo también al escribir, y no solo al listar.

**Acceptance Criteria:**

**Given** un usuario con alcance limitado a la sede norte
**When** envía `POST /citas` con `local_id` de la sede sur
**Then** la respuesta es 422 en `local_id` con mensaje en español y no se crea la cita.

**Given** ese usuario
**When** envía `POST /citas` **sin** `local_id`
**Then** la cita se asigna a una sede de su alcance (la principal solo si está dentro), nunca a una ajena.

**Given** una cita de la sede norte
**When** ese usuario intenta moverla a la sede sur con `PUT /citas/{id}`
**Then** la respuesta es 422 y la cita no cambia de sede.

**Given** un usuario con `todos_los_locales`
**When** crea o mueve citas entre sedes
**Then** se permite.

**And** la comprobación se hace en el service y se cubre con pruebas Pest.

> **Agente:** claude · **Referencias:** propuesta §Q-01 (G-2), NFR11 (orden de
> autorización: aislamiento → suscripción → plan → permiso → alcance).

### Story 1.3: No se pueden agendar citas imposibles

As a recepcionista,
I want que el sistema rechace una cita cuyo profesional no trabaja en esa sede o no presta ese servicio,
So that no se prometa al cliente algo que nadie va a poder atender.

**Acceptance Criteria:**

**Given** un profesional dado de baja (inactivo)
**When** se crea o edita una cita con él
**Then** 422 en `empleado_id` con mensaje en español.

**Given** un profesional activo que no está habilitado en la sede de la cita
**When** se crea o edita la cita
**Then** 422 en `empleado_id`.

**Given** un profesional que no tiene asignado el servicio pedido
**When** se crea o edita la cita con ese servicio
**Then** 422 en el campo del servicio, indicando cuál de los servicios falla.

**Given** un profesional activo, habilitado en la sede y con ese servicio asignado
**When** se crea la cita
**Then** se crea con normalidad.

**And** la comprobación se implementa como **un único método reutilizable**
(`CitaService` la llama al crear y al editar), preparado para recibir en la
Épica 2 la dimensión «servicio habilitado en esa sede» sin duplicar la regla.

> **Agente:** claude · **Referencias:** propuesta §Q-01 (G-3), FR-67. Usa
> `profesional_local` y `servicio_profesional`, que ya existen; **no** depende
> de `local_servicio` (Épica 2).

### Story 1.4: Nadie concede lo que no tiene

As a dueño del negocio,
I want que nadie pueda crear una cuenta con más permisos o más alcance de los que él mismo tiene,
So that dar acceso a un encargado no sea darle las llaves de la empresa.

**Acceptance Criteria:**

**Given** un usuario que crea o edita una cuenta (por `POST /usuarios`, por `PUT /usuarios/{id}` o por `POST /profesionales` con datos de cuenta)
**When** el rol elegido tiene algún permiso que el actor no posee
**Then** la respuesta es 403 con `codigo: sin_permiso` y mensaje en español, venga por el camino que venga.

**Given** un administrador de sede (alcance limitado)
**When** intenta crear una cuenta con `todos_los_locales` o con sedes fuera de su alcance
**Then** la respuesta es 403 y la cuenta no se crea.

**Given** un administrador de sede
**When** intenta invitar a un usuario nuevo
**Then** la respuesta es 403: invitar es del administrador general (A-1).

**Given** un administrador general
**When** asigna cualquier rol y cualquier alcance
**Then** se permite, salvo crear un segundo administrador general (FR10).

**And** la regla vive en `App\Support\Rango` (un solo sitio, dos puntos de
llamada permitidos: Form Request y service) y hay prueba de que
`POST /profesionales` **no** puede saltársela.

> **Agente:** claude · **Referencias:** propuesta §Q-01 (G-4) y §A-1, PRD FR-63,
> CLAUDE.md «las reglas de seguridad viven en el SERVICE».

### Story 1.5: Un rol de Recepción listo para usar

As a dueño que contrata a una recepcionista,
I want un rol de sistema que ya venga con lo que ella necesita,
So that no tener que inventar permisos el primer día ni darle de más por comodidad.

**Acceptance Criteria:**

**Given** un negocio recién provisionado
**When** se listan los roles
**Then** existen cuatro roles de sistema: administrador general, administrador de sede, profesional y **recepción**, ninguno borrable.

**Given** el rol recepción
**When** se consultan sus permisos
**Then** trae citas: gestionar, clientes: gestionar, pagos: ver (según la matriz de la propuesta §3) y ninguno de configuración ni facturación.

**Given** un negocio ya existente
**When** corre la migración
**Then** el rol recepción aparece sin tocar los roles personalizados que el negocio ya tenía.

**Given** cualquier pantalla o correo
**When** se nombra al rol `admin_local`
**Then** el texto visible dice «administrador de sede» (el identificador interno no cambia).

> **Agente:** claude · **Referencias:** PRD FR-64, propuesta §3 (matriz de roles).

### Story 1.6: Un permiso propio para los pagos

As a dueño,
I want poder decidir quién verifica pagos sin darle todo el módulo de citas,
So that el dinero no lo toque cualquiera que agende.

**Acceptance Criteria:**

**Given** el catálogo de módulos de permiso
**When** se consulta `GET /capacidades`
**Then** incluye el módulo `pagos` con niveles ver y gestionar.

**Given** un usuario con `pagos: ver`
**When** consulta la evidencia de un pago
**Then** la ve, pero al aprobar o rechazar recibe 403 con `codigo: sin_permiso`.

**Given** los roles de sistema
**When** se crean
**Then** administrador general y administrador de sede traen `pagos: gestionar`; profesional, ninguno.

**And** el módulo queda declarado aunque los endpoints de pago lleguen en la
Épica 7: el catálogo y el rol no dependen de ellos.

> **Agente:** claude · **Referencias:** PRD FR-66, AD-5.

### Story 1.7: Quien puede agendar, puede abrir el formulario

As a recepcionista con permiso de citas,
I want que el formulario de cita cargue sus listas sin pedirme permisos de otros módulos,
So that poder hacer mi trabajo sin que el dueño me dé acceso a inventario o a configuración.

**Acceptance Criteria:**

**Given** un usuario con `citas: gestionar` y sin permisos de empleados, locales ni servicios
**When** pide `GET /citas/opciones`
**Then** recibe 200 con los profesionales, servicios, sedes y productos que necesita el formulario, recortados por su alcance y por `solo_propios`.

**Given** ese mismo usuario
**When** pide `GET /profesionales` directamente
**Then** sigue recibiendo 403 (el endpoint de gestión no cambia de permiso).

**Given** un usuario sin permiso de citas
**When** pide `GET /citas/opciones`
**Then** recibe 403 con `codigo: sin_permiso`.

**And** el endpoint queda documentado en `api-contract.md` **antes** de
implementarse (AD-13).

> **Agente:** claude · **Referencias:** F-02, traspaso FE→BE del 2026-09-06,
> PRD FR-62.

### Story 1.8: El alcance por sedes también en los profesionales

As a administrador de sede,
I want ver y gestionar solo a los profesionales de mi sede,
So that el alcance signifique lo mismo en toda la aplicación.

**Acceptance Criteria:**

**Given** un usuario con alcance a la sede norte
**When** lista `GET /profesionales`
**Then** solo aparecen los habilitados en la sede norte.

**Given** ese usuario
**When** pide un profesional que solo trabaja en la sede sur
**Then** recibe 404 (no 403).

**Given** ese usuario
**When** crea un profesional
**Then** solo puede habilitarlo en sedes de su alcance.

**And** hay prueba de aislamiento entre negocios (NFR1) para el listado y la ficha.

> **Agente:** claude · **Referencias:** PRD FR-65, NFR11.

### Story 1.9: Todos los errores en español

As a usuario del panel,
I want que los mensajes de error estén en español,
So that entender qué he hecho mal sin traducir «The given data was invalid».

**Acceptance Criteria:**

**Given** la aplicación con `APP_LOCALE=es`
**When** una validación falla sin mensaje propio
**Then** el 422 devuelve el texto en español para cada campo.

**Given** los nombres de campo del negocio (`empleado_id`, `local_id`, `starts_at`…)
**When** aparecen en un mensaje
**Then** se muestran con su nombre en español según `lang/es/validation.php` (`attributes`).

**Given** los errores de autenticación, autorización y límite de peticiones
**When** se devuelven
**Then** también salen en español.

**And** hay una prueba que recorre los mensajes base y falla si vuelve a
aparecer texto en inglés.

> **Agente:** claude · **Referencias:** NFR4, F-04.

### Story 1.10: Ningún selector pierde opciones en silencio

As a negocio con más de 200 clientes,
I want que los selectores busquen en el servidor en vez de traer las primeras 200 filas,
So that no desaparezcan clientes ni servicios sin que nadie lo note.

**Acceptance Criteria:**

**Given** un listado usado por un selector (clientes, servicios, profesionales, productos)
**When** se pide con `search` y paginación
**Then** el servidor devuelve `{ data, meta }` filtrado, con la misma forma que el resto de índices (NFR5, NFR6).

**Given** un selector del panel
**When** el usuario escribe
**Then** consulta al servidor con `search` (con retardo), no `per_page=200`.

**Given** un valor ya elegido que no está en la primera página
**When** se abre el formulario de edición
**Then** la opción elegida se muestra igual, cargada por id.

**And** no queda ningún `per_page=200` en `features/` para esos recursos.

> **Agente:** codex (pantallas) con apoyo de claude (endpoints) ·
> **Referencias:** F-05, NFR5, traspaso FE→BE del 2026-09-01.

### Story 1.11: Mi perfil deja de ser una maqueta

As a cualquier usuario del panel,
I want cambiar mis datos y mi contraseña de verdad,
So that no depender del dueño para algo que es mío.

**Acceptance Criteria:**

**Given** un usuario con sesión
**When** abre Mi perfil
**Then** ve sus datos reales del servidor, no datos de ejemplo.

**Given** un usuario que cambia su contraseña
**When** introduce mal la contraseña actual
**Then** recibe 422 en español sobre ese campo.

**Given** un cambio de contraseña correcto
**When** se guarda
**Then** las demás sesiones se cierran y la actual sigue abierta.

**Given** un cambio de nombre o teléfono
**When** se guarda
**Then** se refleja en el panel sin recargar.

> **Agente:** codex · **Referencias:** PRD FR-6, `docs/vistas/perfil.md`,
> `api-contract.md` §Mi perfil.

### Story 1.12: El onboarding se marca solo

As a dueño recién registrado,
I want que la lista de primeros pasos se marque cuando de verdad hago cada cosa,
So that la checklist me diga en qué voy y no se quede clavada.

**Acceptance Criteria:**

**Given** un negocio sin profesionales
**When** se crea el primer profesional desde cualquier camino (incluido el alta con cuenta)
**Then** el paso `primer_profesional` queda marcado.

**Given** un negocio sin servicios
**When** se crea el primer servicio
**Then** el paso `primer_servicio` queda marcado.

**Given** un paso ya marcado
**When** se repite la acción
**Then** no cambia nada (idempotente).

**And** el marcado ocurre en el service correspondiente (NFR12) y hay prueba
Pest para los seis pasos.

> **Agente:** claude · **Referencias:** PRD FR-8, F-01, traspaso FE→BE del 2026-09-06.

### Story 1.13: Cada cita dice de dónde vino y quién la registró

As a dueño,
I want saber si una cita la puso alguien del panel o el propio cliente, y quién fue,
So that poder resolver un malentendido sin adivinar.

**Acceptance Criteria:**

**Given** una cita creada desde el panel
**When** se guarda
**Then** `canal = panel` y `creada_por_usuario_id` = el usuario con sesión.

**Given** una cita creada por un cliente en la tienda
**When** se guarda
**Then** `canal = tienda` y `creada_por_usuario_id` es nulo.

**Given** las citas existentes con `fuente = admin`
**When** corre la migración (archivo nuevo, nunca editando la de agosto)
**Then** quedan como `canal = panel` sin autor, y la columna antigua deja de usarse.

**Given** cualquier cambio de estado, de hora, de profesional o de pago
**When** ocurre
**Then** se anota un evento en el historial de la cita con actor, momento y qué cambió, y el historial se puede leer desde la ficha.

> **Agente:** claude · **Referencias:** PRD FR-33 y FR-68, decisión A-2, F-03,
> AD-14 (migraciones solo se añaden).

### Story 1.14: Los grupos dejan de estorbar

As a dueño,
I want no ver un módulo que no uso,
So that el panel no me haga preguntas sobre algo que nadie ha decidido.

**Acceptance Criteria:**

**Given** el menú del panel
**When** se arma desde `GET /capacidades`
**Then** Grupos no aparece.

**Given** los endpoints de grupos
**When** se llaman
**Then** siguen respondiendo (no se borra nada ni se pierde dato), pero ninguna pantalla los enlaza.

**And** queda anotado en el PRD que F-8 sigue abierto: decidir su uso o retirarlos.

> **Agente:** codex · **Referencias:** PRD FR-22, F-8, AD-17.

### Story 1.15: El anti-solape aguanta dos reservas a la vez

As a dueño,
I want estar seguro de que dos personas no pueden coger el mismo hueco en el mismo instante,
So that no tener que pedir perdón a un cliente por un solape que el sistema debía impedir.

**Acceptance Criteria:**

**Given** dos peticiones simultáneas para el mismo profesional y la misma franja
**When** se ejecutan en paralelo contra la base real
**Then** una crea la cita y la otra recibe 422 de conflicto, nunca dos citas.

**Given** la misma prueba
**When** se ejecuta con el motor de base de datos de producción (MySQL 8.4)
**Then** pasa de forma estable (sin depender del orden de llegada).

**And** la prueba queda en la suite como prueba de concurrencia, documentada
para que no se borre por «lenta».

> **Agente:** claude · **Referencias:** F-06, regla no negociable 1 de CLAUDE.md.

**Resumen de la Épica 1:** 15 historias. Cierra G-1 a G-4, F-01 a F-06 y deja
listos los cuatro roles, el permiso de pagos, el alcance y el historial de la
cita antes de tocar nada público.

---

## Épica 2: Cada sede ofrece lo que de verdad ofrece

**Meta:** el negocio decide qué servicios da cada sede, y el sistema deja de
ofrecer combinaciones imposibles.

**Requisitos:** FR21, FR67 · decisión A-7.
**Agente por defecto:** Claude.

### Story 2.1: Elegir qué servicios se ofrecen en cada sede

As a dueño con dos sedes,
I want marcar qué servicios se ofrecen en cada una,
So that la sede del centro no ofrezca el tratamiento que solo hay en la principal.

**Acceptance Criteria:**

**Given** un negocio ya existente con servicios y sedes
**When** corre la migración que crea `local_servicio`
**Then** todos los servicios quedan habilitados en todas las sedes (nadie pierde nada el día del despliegue).

**Given** la ficha de una sede
**When** el usuario con permiso de locales abre «Servicios»
**Then** puede habilitar y deshabilitar servicios y guardar.

**Given** un servicio deshabilitado en una sede
**When** se consulta el catálogo de esa sede
**Then** no aparece.

**Given** un usuario sin permiso de locales
**When** intenta cambiar esa lista
**Then** 403 con `codigo: sin_permiso`.

**And** el cambio de contrato se documenta en `api-contract.md` antes de
implementarse (AD-13), y la migración es un archivo nuevo desplegado con
`tenants:migrar-provisionados` (AD-14).

> **Agente:** claude · **Referencias:** PRD FR-21, decisión A-7.

### Story 2.2: Una sola regla decide si algo es reservable

As a cliente o recepcionista,
I want que el sistema use el mismo criterio en el panel, en la tienda y en el enlace de mi cita,
So that lo que se puede reservar sea siempre lo mismo, sin sorpresas según por dónde entres.

**Acceptance Criteria:**

**Given** la combinación servicio + profesional + sede
**When** se evalúa
**Then** una única clase responde si es reservable: servicio activo y habilitado en la sede, profesional activo, habilitado en la sede y con ese servicio asignado.

**Given** el motor de disponibilidad
**When** calcula huecos
**Then** consulta esa misma regla (no la reimplementa).

**Given** `POST`/`PUT /citas`
**When** valida
**Then** llama a esa misma regla, ampliando lo hecho en la Story 1.3 sin duplicarla.

**Given** una combinación no reservable
**When** llega desde la tienda pública
**Then** responde 404 (no revela qué falla a un desconocido); desde el panel, 422 diciendo exactamente qué falla.

> **Agente:** claude · **Referencias:** PRD FR-67, NFR12, `App\Services\Disponibilidad`.

### Story 2.3: Un servicio sin quién lo preste se ve venir

As a dueño,
I want que el panel me avise cuando un servicio no lo puede prestar nadie en una sede,
So that no descubrirlo porque un cliente no encuentra hueco.

**Acceptance Criteria:**

**Given** un servicio habilitado en una sede sin ningún profesional que lo preste allí
**When** el dueño abre el servicio o la sede
**Then** ve un aviso claro de que no es reservable y por qué.

**Given** ese servicio
**When** un cliente lo busca en la tienda
**Then** no aparece en el catálogo de esa sede.

**Given** que se asigna un profesional que lo preste
**When** se guarda
**Then** el aviso desaparece y el servicio pasa a ser reservable sin ningún paso extra.

> **Agente:** codex (aviso en pantalla) con apoyo de claude (dato en la API) ·
> **Referencias:** PRD FR-21 («servicio sin profesionales no reservable»).

**Resumen de la Épica 2:** 3 historias. Deja una sola definición de
«reservable» que usan el panel, la tienda y el enlace del cliente.

---

## Épica 3: El día de trabajo se ve de un vistazo

**Meta:** recepción abre el panel y entiende su día sin abrir cinco pantallas.

**Requisitos:** FR34, FR35, FR51 · UX-DR8.
**Agente por defecto:** Codex (pantallas ya especificadas).

### Story 3.1: El código de la cita, a mano

As a recepcionista,
I want ver y copiar el código de una cita,
So that poder decírselo al cliente por teléfono y encontrar la cita cuando me lo dicta.

**Acceptance Criteria:**

**Given** la ficha de una cita
**When** se abre
**Then** muestra el código de 8 caracteres con un botón de copiar.

**Given** el listado de citas
**When** se busca por ese código en `search`
**Then** aparece la cita correspondiente.

**Given** un usuario con `solo_propios`
**When** busca el código de una cita ajena
**Then** el listado sale vacío (404 a lo ajeno, FR32).

> **Agente:** codex · **Referencias:** PRD FR-34, `docs/vistas/citas.md`.

### Story 3.2: El calendario del día por profesional

As a recepcionista,
I want ver el día en columnas por profesional con los huecos reales,
So that colocar una cita sin comparar horarios a mano.

**Acceptance Criteria:**

**Given** una fecha y una sede
**When** se abre el calendario
**Then** muestra una columna por profesional que atiende ese día, con sus citas y sus descansos.

**Given** un hueco que el motor del servidor considera libre
**When** se compara con lo que pinta el calendario
**Then** coinciden exactamente (misma precedencia de 5 niveles, mismo caso dorado).

**Given** un clic sobre un hueco libre
**When** se pulsa
**Then** se abre el formulario de cita con profesional, sede y hora ya puestos.

**Given** un profesional sin jornada ese día
**When** se dibuja el calendario
**Then** su columna aparece marcada como cerrada, no vacía sin explicación.

**And** el caso dorado compartido (`docs/fixtures/`) se verifica desde Vitest
y desde Pest (AD-19).

> **Agente:** codex · **Referencias:** PRD FR-35, `docs/vistas/citas.md` (caso
> dorado), AD-19. Q-19 (comportamientos de arrastrar y del rango visible)
> queda **[POR DEFINIR]**: si no se confirma, se implementa sin arrastrar.

### Story 3.3: Un tablero que dice la verdad

As a dueño que entra por la mañana,
I want ver las citas de hoy, los pagos por verificar y las próximas citas,
So that saber qué me toca sin recorrer el panel.

**Acceptance Criteria:**

**Given** el panel de inicio
**When** se abre
**Then** muestra tres bloques con datos reales del negocio: citas de hoy, pagos pendientes de verificar y próximas citas.

**Given** un usuario con `solo_propios` o alcance limitado
**When** ve el tablero
**Then** los números respetan su alcance (no ve el total del negocio).

**Given** que aún no existe el módulo de pagos (Épica 7)
**When** se pinta el bloque de pagos
**Then** aparece en cero sin romper, y se rellena solo cuando la Épica 7 exista.

**Given** el tablero anterior con datos de ejemplo
**When** se despliega esta historia
**Then** ya no queda ninguna cifra inventada en pantalla (AD-17).

> **Agente:** codex con apoyo de claude (endpoint de resumen) ·
> **Referencias:** PRD FR-51, UX-DR8, AD-17.

**Resumen de la Épica 3:** 3 historias. Sustituye el tablero de mentira y deja
el calendario clavado al motor real.

---

## Épica 4: Nadie se entera tarde de nada

**Meta:** clientes y equipo reciben los avisos que importan, con registro de
lo enviado y sin duplicados. El correo es el canal garantizado; WhatsApp al
personal es el canal secundario.

**Requisitos:** FR73–FR76, FR83 · NFR8 · AD-8, AD-9, AD-22 · UX-DR5, UX-DR6.
**Agente por defecto:** Claude (notificador y tareas); Codex en las pantallas.

### Story 4.1: Un solo camino para avisar, con registro de lo enviado

As a dueño,
I want que cada aviso quede registrado y no se envíe dos veces,
So that poder comprobar si un cliente recibió su confirmación en vez de suponerlo.

**Acceptance Criteria:**

**Given** una acción que debe avisar (crear cita, verificar pago, cambiar plan…)
**When** la transacción se confirma
**Then** se anota un evento en `eventos_dominio` y el `Notificador` encola el envío **después** del commit (nunca dentro).

**Given** el mismo evento procesado dos veces
**When** se intenta enviar
**Then** la clave de idempotencia impide el segundo envío y se registra como duplicado descartado.

**Given** un envío
**When** ocurre
**Then** queda una fila en `notificacion_envios` con destinatario, plantilla, estado y momento, consultable desde el panel de plataforma.

**Given** un fallo temporal del proveedor
**When** el trabajo se reintenta
**Then** reintenta con espera creciente y, agotados los intentos, queda en estado fallido sin romper la acción de negocio.

**Given** dos negocios distintos
**When** se consultan los envíos
**Then** ninguno ve los del otro (NFR1).

> **Agente:** claude · **Referencias:** AD-8, PRD FR-73, NFR8. Migraciones
> nuevas en negocio y central (AD-14).

### Story 4.2: Correos que parecen del negocio y están en español

As a cliente de una barbería,
I want recibir correos con el nombre y el logo del negocio, en español y legibles en el móvil,
So that reconocer que son suyos y no borrarlos por sospechosos.

**Acceptance Criteria:**

**Given** cualquier correo del sistema
**When** se envía
**Then** usa una plantilla común con la identidad del negocio (nombre, logo y color si existen), versión de texto plano y pie con el contacto del negocio.

**Given** el correo de recuperación de contraseña
**When** se envía
**Then** está en español (hoy sale en inglés) y usa esa misma plantilla.

**Given** los correos ya existentes (verificación, invitación)
**When** se despliega esta historia
**Then** pasan a la plantilla común sin perder sus enlaces ni sus caducidades.

**Given** un correo con acciones (ver, reprogramar, cancelar, confirmar, subir comprobante)
**When** se pinta
**Then** los botones aparecen en todos los planes y funcionan sin sesión.

**And** el remitente usa el dominio del producto con SPF, DKIM y DMARC
configurados (L-1).

> **Agente:** claude · **Referencias:** PRD FR-73 y FR-74, UX-DR6,
> propuesta §4.3 (K-2 en inglés), EXPERIENCE.md.

### Story 4.3: Saber si el correo llegó

As a dueño,
I want ver si un aviso se entregó, rebotó o fue marcado como spam,
So that poder llamar por teléfono al cliente cuyo correo no llegó.

**Acceptance Criteria:**

**Given** el webhook de Resend
**When** llega un evento
**Then** se verifica su firma y se descarta si no es válida.

**Given** un evento válido
**When** se procesa
**Then** actualiza el estado del envío (entregado, rebotado, spam) usando el índice central de identificadores.

**Given** un evento repetido
**When** llega
**Then** no cambia nada (idempotente).

**Given** un rebote duro en el correo de un cliente
**When** se registra
**Then** la ficha del cliente lo muestra y el panel avisa de que ese correo no recibe nada.

> **Agente:** claude · **Referencias:** AD-8, PRD FR-73, X-1 de la matriz.

### Story 4.4: Los recordatorios salen a su hora y se reprograman solos

As a cliente,
I want recibir el recordatorio antes de mi cita, y que si cambio la hora el recordatorio cambie conmigo,
So that no recibir un aviso de una cita que ya no existe.

**Acceptance Criteria:**

**Given** una cita confirmada
**When** se crea
**Then** se programan sus recordatorios en `tareas_programadas` (en UTC) tras el commit, según la configuración del negocio.

**Given** una cita reprogramada o cancelada
**When** se guarda el cambio
**Then** las tareas pendientes de esa cita se reprograman o se anulan por versión, sin dejar avisos huérfanos.

**Given** el comando programado por minuto
**When** corre
**Then** ejecuta solo las tareas vencidas, re-comprobando la versión antes de enviar.

**Given** una cita cuya hora de recordatorio ya pasó
**When** se confirma
**Then** ese recordatorio no se envía tarde: se descarta.

**And** los horarios se interpretan en la zona horaria del negocio y se
guardan en UTC (AD-16, NFR3).

> **Agente:** claude · **Referencias:** AD-9, AD-16, PRD FR-74, matriz C-8/C-9.

### Story 4.5: Cada aviso llega a quien le toca

As a dueño,
I want que el cliente, el profesional y quien lleva la recepción reciban lo que les corresponde,
So that nadie se entere tarde y nadie reciba ruido.

**Acceptance Criteria:**

**Given** la matriz de eventos de la propuesta §4.3
**When** se implementa
**Then** cada evento del lanzamiento (C-1 a C-12, P-1 a P-8, E-1 a E-3, S-1 a S-4, K-1 a K-4) tiene destinatarios y plantilla, y los marcados esenciales no se pueden desactivar.

**Given** un aviso de reserva pendiente (C-1, C-11, P-2, P-5)
**When** se redacta
**Then** dice qué pasó, si el horario sigue reservado y hasta cuándo, y qué debe hacer el cliente ahora; **nunca** dice «confirmada».

**Given** una cita que se paga en el local (C-3)
**When** se confirma
**Then** el correo indica el monto a pagar allí y **no** afirma que está pagada.

**Given** un evento cuyo disparador todavía no existe (P-1 a P-8 necesitan la Épica 7; S-1 a S-4, la Épica 8)
**When** se implementa esta historia
**Then** su plantilla y sus destinatarios quedan escritos y probados con un evento simulado, y **la épica dueña del disparador lo conecta**: esta historia no espera a ninguna posterior.

**Given** los eventos fuera del lanzamiento (X-1 a X-3 y los de planes superiores)
**When** se revisa el alcance
**Then** quedan declarados pero no implementados, y así consta.

> **Agente:** claude · **Referencias:** PRD FR-74, propuesta §4.3,
> EXPERIENCE.md (State Patterns).

### Story 4.6: El negocio decide qué avisa y cada quien qué recibe

As a dueño,
I want activar o desactivar los avisos no esenciales, y que cada persona ajuste los suyos,
So that el equipo no se ahogue en correos y el cliente reciba lo justo.

**Acceptance Criteria:**

**Given** Configuración → Notificaciones
**When** se abre
**Then** muestra los eventos configurables del negocio con su estado y el texto de qué implica apagarlos.

**Given** Mi perfil
**When** un profesional o recepcionista abre sus preferencias
**Then** puede elegir qué avisos recibe (al instante o en resumen diario) sin tocar los del negocio.

**Given** un evento esencial
**When** se intenta desactivar
**Then** aparece explicado como no desactivable y el servidor lo rechaza igualmente (403/422).

**Given** un cliente que se da de baja de los recordatorios desde el correo
**When** pulsa el enlace
**Then** deja de recibirlos sin perder los esenciales de sus citas.

> **Agente:** codex (pantallas) con apoyo de claude (endpoints) ·
> **Referencias:** PRD FR-75, UX-DR5, propuesta §4.4.

### Story 4.7: La cuota de correos no corta lo importante

As a plataforma,
I want limitar el volumen de correo por plan sin dejar a un cliente sin su confirmación,
So that un negocio no dispare el coste ni la reputación del dominio.

**Acceptance Criteria:**

**Given** un negocio que alcanza su cuota mensual
**When** se intenta enviar un aviso **no** esencial
**Then** no se envía y queda registrado el motivo.

**Given** ese mismo negocio
**When** el aviso es esencial (confirmación, pago, cancelación, cuenta)
**Then** se envía igualmente.

**Given** que se alcanza la cuota
**When** ocurre
**Then** se avisa al titular y a la plataforma (X-3) una sola vez por periodo.

**Given** el cambio de mes
**When** ocurre
**Then** el contador se reinicia.

> **Agente:** claude · **Referencias:** PRD FR-76, AD-5 (funciones del plan).

### Story 4.8: Un aviso por WhatsApp cuando algo necesita atención

As a encargada de una barbería,
I want que me llegue un WhatsApp cuando entra una reserva o hay un comprobante por verificar,
So that no tener el correo abierto todo el día.

**Acceptance Criteria:**

**Given** un número interno del negocio
**When** se da de alta
**Then** queda inactivo hasta que esa persona escriba el código de confirmación al número de ChiraFlow (consentimiento verificado).

**Given** un número confirmado con el aviso activado
**When** entra una reserva de la tienda (C-2) o un comprobante por verificar (P-3)
**Then** recibe un mensaje corto con enlace al panel, agrupando los que lleguen seguidos.

**Given** que el canal de WhatsApp falla o está caído
**When** se intenta enviar
**Then** el correo y el panel siguen avisando igual, y el fallo se registra sin reintentar en bucle.

**Given** los clientes finales
**When** se evalúa el alcance
**Then** **no** reciben WhatsApp en el lanzamiento (solo personal del negocio).

**And** el canal corre sobre Evolution API en Railway con el número de la
plataforma, con límite de ritmo de envío y registro de bajas.

> **Agente:** claude · **Referencias:** PRD FR-83, AD-22, decisión del
> 2026-09-19 (número propio de la plataforma; API oficial aplazada).

**Resumen de la Épica 4:** 8 historias. Deja el correo fiable y medido, la
agenda de tareas funcionando y WhatsApp como apoyo, nunca como única vía.

---

## Épica 5: El negocio se ve como su negocio

**Meta:** el dueño viste su página de reservas con su marca, la revisa antes
de publicar, y todas sus sedes quedan iguales.

**Requisitos:** FR77–FR79, FR82 · UX-DR10 · NFR7.
**Agente por defecto:** Codex (editor) y Claude (imágenes y migración).

### Story 5.1: La marca del negocio, en todos los planes

As a dueño,
I want poner mi logo, mi color y un estilo de portada,
So that mi página de reservas se parezca a mi negocio y no a una plantilla.

**Acceptance Criteria:**

**Given** Configuración → Apariencia
**When** el dueño guarda logo, color principal y estilo de portada (uno de los tres)
**Then** se guarda en el negocio y lo heredan todas sus sedes.

**Given** un color con poco contraste sobre el texto
**When** se intenta guardar
**Then** se avisa y se ajusta automáticamente al tono más cercano que cumpla AA, explicándolo.

**Given** cualquier plan contratado
**When** se abre Apariencia
**Then** las tres opciones de portada están disponibles (no es función de pago).

**Given** un negocio sin identidad configurada
**When** se ve su página pública
**Then** usa la apariencia por defecto, legible y sin huecos rotos.

> **Agente:** codex con apoyo de claude · **Referencias:** PRD FR-77,
> DESIGN.md, UX-DR10.

### Story 5.2: Las imágenes se guardan bien o no se guardan

As a plataforma,
I want validar y procesar cada imagen de marca,
So that ni una foto de 8 MB ni un archivo disfrazado lleguen a la página pública.

**Acceptance Criteria:**

**Given** una subida de logo o portada
**When** llega
**Then** se comprueba el tipo real por firma (no por extensión), se limita el tamaño y se rechaza lo demás con mensaje en español.

**Given** una imagen válida
**When** se procesa
**Then** se re-codifica sin metadatos, el logo a 512 px y la portada en tres anchos, con nombre aleatorio.

**Given** una portada con punto de enfoque elegido
**When** se recorta para cada ancho
**Then** el punto elegido se mantiene visible.

**Given** una imagen sustituida
**When** se publica la nueva
**Then** la anterior deja de servirse y se limpia.

> **Agente:** claude · **Referencias:** PRD FR-79, regla 7 de CLAUDE.md
> (mismas defensas de subida), AD-20 (almacenamiento en R2).

### Story 5.3: Ver cómo queda antes de que lo vea nadie

As a dueño,
I want ver mi página en móvil y en escritorio antes de publicarla, y poder descartar,
So that no experimentar en vivo delante de mis clientes.

**Acceptance Criteria:**

**Given** el editor de apariencia
**When** se cambia algo
**Then** la vista previa se actualiza y se puede alternar entre móvil y escritorio.

**Given** cambios sin publicar
**When** el dueño pulsa «Publicar»
**Then** pasan a la página pública y se registra quién y cuándo.

**Given** cambios sin publicar
**When** el dueño pulsa «Descartar»
**Then** el editor vuelve exactamente a **la última apariencia publicada**, sin tocar la página pública en ningún momento.

**Given** que se abandona el editor con cambios sin publicar
**When** se vuelve a entrar
**Then** se avisa de que hay cambios sin publicar y se puede seguir o descartar.

> **Agente:** codex · **Referencias:** PRD FR-78, UX-DR10, EXPERIENCE.md.

### Story 5.4: Las sedes dejan de tener identidad propia

As a dueño con dos sedes que configuró por separado,
I want que mi marca sea una sola,
So that mis clientes vean lo mismo entren por donde entren, sin que yo pierda lo que ya subí.

**Acceptance Criteria:**

**Given** sedes con logo o color propios
**When** corre la migración
**Then** la identidad de la sede principal pasa al negocio si el negocio no tenía ninguna, y ninguna imagen se borra.

**Given** que la migración cambió algo visible
**When** el dueño entra al panel
**Then** ve un aviso que explica el cambio y le lleva al editor para revisarlo.

**Given** el campo de color secundario
**When** se retira
**Then** deja de pedirse en las pantallas y su valor queda archivado, no borrado.

**Given** la ficha de una sede
**When** se abre tras la migración
**Then** ya no ofrece identidad propia y dice de dónde hereda la suya.

> **Agente:** claude (migración) con apoyo de codex (aviso y ficha) ·
> **Referencias:** PRD FR-82, FR-19, AD-14. La portada por sede (FR-80) queda
> fuera del lanzamiento.

**Resumen de la Épica 5:** 4 historias. La marca es del negocio, se revisa
antes de publicar y la migración no pierde nada.

---

## Épica 6: Los clientes reservan solos, de verdad

**Meta:** la tienda pública entra en servicio. El cliente reserva sin cuenta,
confirma desde su correo y luego gestiona su cita por un enlace seguro.

**Requisitos:** FR36–FR40, FR43, FR69, FR70, FR81, FR84 · NFR1, NFR7 ·
AD-3, AD-11, AD-15 · UX-DR3.
**Depende de:** Épicas 2 (reservabilidad), 4 (correo) y 5 (identidad).
**Agente por defecto:** Claude en la zona pública; Codex en las pantallas.

### Story 6.1: Cada negocio tiene su dirección pública

As a dueño,
I want un enlace propio que pueda repartir,
So that mis clientes lleguen a mi página de reservas y no a una genérica.

**Acceptance Criteria:**

**Given** una petición a `{slug}.site.{dominio}` o `/{slug}`
**When** el slug existe y el negocio está activo
**Then** se resuelve su tienda sin necesidad de sesión.

**Given** un slug inexistente, un negocio sin nombre fijado, suspendido o eliminado
**When** se pide
**Then** responde 404 (o la pantalla de tienda no disponible según el caso), sin revelar si el negocio existe.

**Given** la zona pública
**When** se revisa su configuración
**Then** vive en `routes/publico.php` con su propio middleware, sin `auth:sanctum`, y hay prueba de que no puede alcanzar endpoints del panel (AD-3).

**Given** cualquier respuesta pública
**When** se inspecciona
**Then** no contiene ids internos ni datos del panel (precios de coste, notas, teléfonos del equipo).

> **Agente:** claude · **Referencias:** PRD FR-36, AD-3, AD-11, AD-15,
> `api-contract.md` §Tienda pública (cambio aprobado el 2026-09-19).

### Story 6.2: Cada sede tiene su propio enlace

As a dueño con dos sedes,
I want repartir el enlace de cada sede,
So that quien viene del cartel de la sede del centro no tenga que elegirla a mano.

**Acceptance Criteria:**

**Given** una sede
**When** se le pone o cambia el nombre
**Then** tiene un slug único **dentro del negocio**, y la ruta es `/{negocio}/{sede}`.

**Given** un slug de sede que cambió
**When** alguien entra por el antiguo
**Then** se le redirige al actual (el historial redirige para siempre).

**Given** las rutas antiguas con id de sede
**When** se piden
**Then** redirigen a la ruta con slug.

**Given** un enlace de sede
**When** el cliente abre la tienda
**Then** esa sede llega preseleccionada y puede cambiarla, con aviso de que cambiar de sede reinicia su selección.

> **Agente:** claude con apoyo de codex · **Referencias:** PRD FR-81 y FR-36,
> `api-contract.md` (rutas de sede, cambio aprobado el 2026-09-19).

### Story 6.3: El catálogo que ve el cliente

As a cliente,
I want ver qué servicios ofrece esa sede, con su precio y su duración,
So that elegir sin llamar por teléfono.

**Acceptance Criteria:**

**Given** una sede de un negocio activo
**When** se abre su tienda
**Then** muestra los servicios visibles y reservables de esa sede, agrupados por categoría, con precio, duración y foto si la hay.

**Given** un servicio oculto, inactivo, no habilitado en esa sede o sin nadie que lo preste
**When** se lista el catálogo
**Then** no aparece (misma regla única de la Épica 2).

**Given** la página en un móvil
**When** se navega
**Then** es usable con una mano y sin desplazamiento horizontal (NFR7).

**Given** dos negocios distintos
**When** se consultan sus catálogos
**Then** ninguno filtra datos del otro (NFR1).

> **Agente:** codex con apoyo de claude · **Referencias:** PRD FR-37,
> DESIGN.md, `docs/vistas/tienda.md` si existe.

### Story 6.4: Los huecos que ve el cliente son los de verdad

As a cliente,
I want ver solo horas en las que de verdad me pueden atender,
So that no llevarme un «lo siento, ya no está libre» después de reservar.

**Acceptance Criteria:**

**Given** una sede, un servicio y (opcionalmente) un profesional
**When** se piden los huecos públicos de una fecha
**Then** salen del mismo motor que usa el panel, con la misma precedencia de cinco niveles.

**Given** la misma consulta hecha desde el panel y desde la tienda
**When** se comparan
**Then** devuelven exactamente los mismos huecos (prueba automática con el caso dorado compartido).

**Given** «cualquier profesional»
**When** el cliente no elige uno
**Then** se ofrecen los huecos de todos los que prestan ese servicio en esa sede, y al reservar se asigna uno concreto.

**Given** un hueco que se ocupa mientras el cliente elige
**When** intenta reservarlo
**Then** recibe un mensaje claro de que esa hora ya no está libre y se le refrescan los huecos.

> **Agente:** claude · **Referencias:** PRD FR-38, FR-27, AD-19.

### Story 6.5: Elegir y revisar antes de dar mis datos

As a cliente,
I want elegir uno o varios servicios y ver cuánto dura y cuánto cuesta en total,
So that saber a qué me comprometo antes de escribir mi nombre.

**Acceptance Criteria:**

**Given** el catálogo de una sede
**When** el cliente añade o quita servicios
**Then** ve en todo momento la duración total y el importe total, y puede vaciar la selección.

**Given** varios servicios elegidos
**When** el cliente elige atención única (seguida) o separada
**Then** los huecos que se le ofrecen corresponden a esa elección: un bloque continuo, o un hueco por servicio.

**Given** un servicio que deja de ser reservable mientras el cliente elige (se oculta, se queda sin profesional)
**When** se refresca la selección
**Then** se le avisa, se retira ese servicio y se le explica por qué.

**Given** una selección vacía
**When** se intenta continuar
**Then** no se puede avanzar.

**And** esta historia **no escribe nada** en la base: es selección y cálculo,
y por eso puede entregarse y verificarse sola.

> **Agente:** codex con apoyo de claude · **Referencias:** PRD FR-39 (carrito),
> FR-30 (precio y duración), DESIGN.md.

### Story 6.6: Reservar dejando mis datos

As a cliente,
I want terminar la reserva con mi nombre, mi teléfono y mi correo,
So that no tener que registrarme para cortarme el pelo.

**Acceptance Criteria:**

**Given** los datos del cliente
**When** se envían
**Then** el teléfono se normaliza a `+51…`, la ficha se busca o se crea por teléfono, y los consentimientos (aviso de privacidad y avisos) quedan registrados con fecha.

**Given** la reserva
**When** se crea
**Then** pasa por el mismo anti-solape del panel (transacción + bloqueo) y por la regla única de reservabilidad de la Story 2.2.

**Given** una reserva creada
**When** se guarda
**Then** queda con `canal = tienda`, sin autor, con su código de 8 caracteres, y dispara el correo que corresponda a su camino.

**Given** una reserva rechazada por solape
**When** ocurre
**Then** no se crea ninguna ficha de cliente huérfana ni se envía correo.

**Given** un negocio con **pago obligatorio** configurado y la Épica 7 sin desplegar
**When** un cliente intenta reservar en su tienda
**Then** la tienda **no acepta** reservas públicas de ese negocio: muestra la pantalla de tienda no disponible con el contacto del negocio. **No** se convierte el pago obligatorio en pago en el local, **ni** se omite el requisito de pago. El panel sigue pudiendo agendar con normalidad.

**Given** un negocio que permite reservar sin pago previo
**When** un cliente reserva
**Then** sigue el camino de confirmación por correo (Story 6.7).

> **Agente:** claude con apoyo de codex · **Referencias:** PRD FR-39, FR-29,
> regla no negociable 1, NFR10. El cierre en falso está prohibido por decisión
> del usuario (2026-09-20): sin Épica 7, el pago obligatorio deshabilita la
> tienda de ese negocio, no se degrada.

### Story 6.7: Confirmar la reserva desde el correo

As a negocio,
I want que las reservas sin pago en línea se confirmen desde el correo del cliente,
So that las reservas de broma no me bloqueen la agenda.

**Acceptance Criteria:**

**Given** una reserva de la tienda sin pago en línea
**When** se crea
**Then** queda pendiente, se envía el correo «Confirma tu reserva» (C-11) con la hora exacta del plazo y la pantalla dice al cliente que revise su correo.

**Given** el plazo configurado por el negocio
**When** se guarda
**Then** admite valores desde 15 minutos, con el valor por defecto acordado, y nunca se extiende más allá de 15 minutos antes de la cita.

**Given** un horario tan próximo que no daría tiempo a confirmar
**When** se calculan los huecos públicos
**Then** ese horario no se ofrece.

**Given** que el cliente pulsa «Confirmar mi reserva» dentro del plazo
**When** se abre el enlace
**Then** la cita pasa a confirmada, se avisa al negocio y al cliente, y volver a pulsar no cambia nada.

**Given** que vence el plazo sin confirmar
**When** corre la tarea
**Then** la cita se cancela liberando el hueco con el mismo bloqueo que una reserva, y el cliente recibe C-12 «no recibimos tu confirmación» con enlace para reservar de nuevo.

**Given** un cliente que abre el enlace después de vencido
**When** lo hace
**Then** ve «Tu reserva expiró» con el enlace para reservar de nuevo, no un error.

> **Agente:** claude · **Referencias:** PRD FR-84, propuesta §4.3 (C-11, C-12),
> EXPERIENCE.md. El plazo por defecto y el reenvío a petición siguen
> **[POR CONFIRMAR]** en el PRD.

### Story 6.8: Gestionar mi cita desde un enlace seguro

As a cliente,
I want ver, reprogramar o cancelar mi cita desde el enlace que me llegó,
So that no tener que llamar ni crear una cuenta.

**Acceptance Criteria:**

**Given** el correo de la cita
**When** el cliente abre el enlace
**Then** ve **solo esa** cita (fecha, sede, servicio, profesional, importe y estado); abrirla no cambia nada.

**Given** el enlace
**When** se guarda en la base
**Then** esta historia añade la migración de accesos por enlace (archivo nuevo, AD-14) y guarda **solo su hash**; caduca 7 días después de la cita, es revocable y no contiene ids enumerables.

**Given** una reprogramación permitida
**When** el cliente elige otra hora
**Then** pasa por el mismo motor y el mismo anti-solape, y se confirma en la página (nunca por el simple hecho de abrir el enlace).

**Given** una cancelación
**When** el cliente la confirma
**Then** la cita queda cancelada, se avisa al negocio y al profesional, y si había pago se marca «devolución pendiente».

**Given** un enlace caducado, revocado o de una cita que cambió
**When** se abre
**Then** se muestra el estado correspondiente en español, con qué hacer a continuación.

> **Agente:** claude con apoyo de codex · **Referencias:** PRD FR-69,
> decisión A-4, UX-DR3, CLAUDE.md («enlace seguro enviado por correo»).

### Story 6.9: El negocio pone sus reglas de cambio

As a dueño,
I want decidir con cuánta antelación se puede cambiar o cancelar una cita,
So that no encontrarme una cancelación diez minutos antes.

**Acceptance Criteria:**

**Given** Configuración
**When** el dueño fija las horas mínimas para reprogramar y para cancelar
**Then** se guardan y se muestran al cliente en su página y en el correo.

**Given** una cita dentro del plazo prohibido
**When** el cliente intenta reprogramar o cancelar
**Then** se le explica la política y se le ofrece el contacto del negocio, sin cambiar la cita.

**Given** el panel
**When** el negocio reprograma o cancela
**Then** la política no le limita (es para el cliente).

> **Agente:** claude con apoyo de codex · **Referencias:** PRD FR-70.

### Story 6.10: La puerta pública aguanta el ruido

As a plataforma,
I want limitar las peticiones sin sesión y frenar a los robots,
So that nadie tumbe la tienda ni llene la agenda de basura.

**Acceptance Criteria:**

**Given** las rutas públicas (tienda, huecos, reserva, enlace de la cita, subida de comprobante)
**When** se llaman
**Then** cada una tiene su límite con nombre, por IP y por recurso, y responde 429 en español al superarlo.

**Given** el registro, el inicio de sesión, la recuperación, la reserva y la subida de comprobante
**When** se envían
**Then** validan Cloudflare Turnstile en el servidor.

**Given** una reserva legítima desde un móvil con datos compartidos
**When** se hace
**Then** los límites no la bloquean (se ajustan y se documentan los valores).

> **Agente:** claude · **Referencias:** PRD FR-40, AD-11, NFR2.

### Story 6.11: Cuando la tienda no está disponible, se dice

As a cliente que entra por un enlace antiguo,
I want entender qué pasa,
So that no quedarme mirando un error.

**Acceptance Criteria:**

**Given** un negocio suspendido por falta de pago
**When** un cliente abre su tienda
**Then** ve una página que dice que no admite reservas ahora mismo, sin exponer el motivo comercial.

**Given** un negocio que aún no fijó su nombre
**When** se abre su tienda
**Then** responde 404 (el slug temporal nunca circula).

**Given** cualquiera de estos casos
**When** se muestra la pantalla
**Then** ofrece el contacto del negocio si existe y funciona en móvil.

> **Agente:** codex · **Referencias:** PRD FR-43, CLAUDE.md («la tienda pública
> responde 404 mientras el paso 1 del onboarding no haya fijado nombre/slug»).

**Resumen de la Épica 6:** 11 historias. La tienda abre con reserva,
confirmación por correo y gestión por enlace, sin cuentas de cliente.

---

## Épica 7: Cobrar por adelantado con Yape

**Meta:** el negocio propone o exige el pago al reservar; el cliente paga y
sube su captura; el negocio la verifica en dos clics. Con plazos claros y sin
perder al que paga tarde.

**Requisitos:** FR44–FR46, FR71, FR72 · regla no negociable 7 · UX-DR1, UX-DR2.
**Depende de:** Épicas 4 (correo) y 6 (tienda).
**Agente por defecto:** Claude.

### Story 7.1: Configurar el cobro por QR

As a dueño,
I want subir mi QR de Yape y decidir si el pago es obligatorio,
So that cobrar por adelantado cuando me interesa y no cuando no.

**Acceptance Criteria:**

**Given** Configuración → Pagos
**When** el dueño elige el modo (no pedido / opcional / obligatorio)
**Then** se guarda para todo el negocio y se aplica en la tienda de inmediato.

**Given** el modo opcional u obligatorio
**When** se guarda
**Then** exige un QR subido y unas instrucciones; sin ellos no deja activar el modo y lo explica.

**Given** el QR
**When** se sube
**Then** pasa las mismas defensas que cualquier imagen (tipo real, tamaño, re-codificado, nombre aleatorio) y se guarda en la base central, porque la tienda pública lo necesita.

**Given** el plazo de pago
**When** se configura
**Then** admite de 15 a 240 minutos (por defecto 60) y se muestra al cliente como hora exacta, no como cuenta de minutos sueltos.

**Given** un plan sin QR por sede
**When** se configura
**Then** el QR es uno solo para el negocio (el QR por sede queda fuera del lanzamiento).

> **Agente:** claude con apoyo de codex · **Referencias:** PRD FR-44,
> decisión A-3, UX-DR1, discrepancias §6.

### Story 7.2: Pagar al reservar

As a cliente,
I want ver el QR, el monto y hasta cuándo tengo para pagar,
So that saber exactamente qué hacer y cuánto tiempo tengo.

**Acceptance Criteria:**

**Given** una reserva con pago obligatorio u opcional
**When** se crea
**Then** la pantalla muestra el QR, el monto total, la hora exacta del plazo y el botón para subir la captura.

**Given** el modo opcional
**When** el cliente elige pagar en el local
**Then** su reserva sigue el camino de confirmación por correo (Story 6.7) y no se le pide captura.

**Given** un horario que no dejaría tiempo real para pagar
**When** se calculan los huecos con pago obligatorio
**Then** ese horario no se ofrece.

**Given** la pantalla de pago
**When** se ve en un móvil
**Then** el QR se puede guardar o abrir en la app, y la cuenta atrás es legible.

> **Agente:** codex con apoyo de claude · **Referencias:** PRD FR-44 y FR-71,
> UX-DR1, EXPERIENCE.md (Paso de pago).

### Story 7.3: Subir el comprobante sin tener cuenta

As a cliente,
I want subir la captura de mi Yape desde el enlace de mi reserva,
So that el negocio pueda verificar que pagué.

**Acceptance Criteria:**

**Given** la posesión del código de la cita (nunca un id numérico)
**When** se sube el archivo
**Then** se acepta sin sesión, comprobando el tipo real por firma, re-codificando la imagen, limitando el tamaño, renombrando a UUID y guardando en disco privado.

**Given** un archivo que no es imagen o excede el límite
**When** se sube
**Then** se rechaza con mensaje en español y no se guarda nada.

**Given** varias subidas seguidas desde la misma IP o para el mismo código
**When** superan el límite
**Then** responde 429 (límite por IP y por código).

**Given** una subida correcta
**When** termina
**Then** el pago queda «en revisión», el cliente recibe P-2 («tu horario sigue reservado») y los avisos internos salen (P-3, correo y WhatsApp).

**Given** el panel
**When** alguien con permiso abre la evidencia
**Then** se sirve por URL firmada y caducable, nunca por ruta pública.

**Given** las plantillas P-2 y P-3, escritas y probadas con evento simulado en la Story 4.5
**When** se implementa esta historia
**Then** se conectan a su disparador real y una prueba de extremo a extremo comprueba que el correo sale y que el aviso interno llega. **Hasta que esa prueba pase, esas plantillas no cuentan como terminadas**: la prueba simulada de 4.5 no cierra la integración.

> **Agente:** claude · **Referencias:** regla no negociable 7 de CLAUDE.md,
> PRD FR-45, AD-11.

### Story 7.4: Verificar un pago en dos clics

As a encargada,
I want aprobar o rechazar la captura desde la propia cita,
So that no cambiar de pantalla ni apuntar nada aparte.

**Acceptance Criteria:**

**Given** el listado de citas
**When** se filtra por «pagos por verificar»
**Then** salen las citas con evidencia pendiente, dentro del alcance de quien mira.

**Given** una evidencia abierta
**When** quien tiene `pagos: gestionar` pulsa «Aprobar»
**Then** el pago queda verificado, la cita pasa a confirmada y el cliente recibe P-4.

**Given** una captura ilegible o incompleta
**When** se pulsa «Pedir otra captura» (corregible) con un motivo
**Then** la cita **sigue reservada**, el cliente recibe P-5 con el motivo y un nuevo plazo con hora exacta, y puede subir otra.

**Given** un pago que no existe
**When** se pulsa «Rechazar y cancelar la cita» (definitivo) con un motivo
**Then** la cita se cancela, se libera el hueco y el cliente recibe P-8 con el motivo, el contacto del negocio y el enlace para reservar de nuevo.

**Given** un usuario con `pagos: ver`
**When** intenta cualquiera de las tres acciones
**Then** 403 con `codigo: sin_permiso`.

**Given** que Caja aún no existe
**When** se verifica un pago
**Then** **no** se crea ningún movimiento de caja (A-3), y así queda anotado para cuando exista.

**Given** las plantillas P-4, P-5 y P-8, probadas con evento simulado en la Story 4.5
**When** se implementa esta historia
**Then** se conectan a sus tres acciones reales (aprobar, pedir otra captura, rechazar y cancelar) y una prueba de extremo a extremo recorre cada camino comprobando el correo que recibe el cliente. **Sin esa prueba, la integración no está terminada.**

**And** solo se admite el pago **total**; los adelantos quedan fuera del
lanzamiento.

> **Agente:** claude con apoyo de codex · **Referencias:** PRD FR-46,
> decisión A-3, UX-DR2, propuesta §4.3 (P-4, P-5, P-8).

### Story 7.5: La reserva impaga no bloquea el hueco para siempre

As a dueño con pago obligatorio,
I want que la reserva sin pagar caduque y libere la hora,
So that no perder clientes por horas apartadas que nadie va a usar.

**Acceptance Criteria:**

**Given** una cita con pago obligatorio y sin evidencia
**When** vence el plazo (contado desde la creación, o desde «pedir otra captura»)
**Then** la cita pasa a cancelada y libera el hueco, usando el **mismo bloqueo** que una reserva (sin carrera con el anti-solape).

**Given** una cita con evidencia subida en revisión
**When** vence el plazo original
**Then** **no** caduca: espera la verificación.

**Given** un plazo que caería a menos de 15 minutos del inicio de la cita
**When** se calcula
**Then** se recorta a ese límite (nunca se apura más).

**Given** el modo no obligatorio
**When** pasa el tiempo
**Then** no hay caducidad por pago (solo la confirmación por correo de la Story 6.7).

**Given** una caducidad
**When** ocurre
**Then** el cliente y el negocio reciben P-6 —conectado aquí a su disparador real, con prueba de extremo a extremo— y queda anotada en el historial de la cita.

> **Agente:** claude · **Referencias:** PRD FR-71, decisión A-3
> (sustituye discrepancias §6.2.1), regla no negociable 1.

### Story 7.6: Cambios y devoluciones cuando ya hay dinero de por medio

As a cliente que pagó por adelantado,
I want que al cancelar o cambiar mi cita quede claro qué pasa con mi dinero,
So that saber a qué atenerme sin discutir.

**Acceptance Criteria:**

**Given** una cita pagada
**When** se reprograma
**Then** el pago viaja con la cita: sigue verificado y no se pide otra vez.

**Given** una cita pagada
**When** se cancela (por el cliente o por el negocio)
**Then** queda marcada como «devolución pendiente», el titular y la administración reciben P-7, y el cliente ve ese estado en su página.

**Given** una devolución
**When** el negocio la marca como hecha, con nota
**Then** el estado cambia, queda quién y cuándo, y no se puede editar el historial.

**Given** la plantilla P-7, probada con evento simulado en la Story 4.5
**When** se implementa esta historia
**Then** se conecta a la cancelación real de una cita pagada y se verifica de extremo a extremo.

**Given** un pago tardío que llega después de caducar
**When** el negocio lo ve
**Then** puede rescatar la cita si la hora sigue libre, o gestionar la devolución si no (queda registrado el camino elegido).

> **Agente:** claude · **Referencias:** PRD FR-72, propuesta §4.3 (P-7),
> decisión de «rescate del pago tardío» del 2026-09-19.

**Resumen de la Épica 7:** 6 historias. Cobro por QR con plazos configurables,
subida segura sin sesión, verificación en dos clics y ninguna hora bloqueada
sin motivo.

---

## Épica 8: Cobrar la suscripción sin tocar la base de datos

**Meta:** la plataforma deja de depender de consultas manuales: hay un panel
propio con 2FA para activar planes, registrar pagos y suspender, y el negocio
ve su plan, sus límites y su vencimiento.

**Requisitos:** FR55–FR58, FR60 · AD-10, AD-12 · UX-DR4, UX-DR7.
**Agente por defecto:** Claude (suscripción y auditoría); Codex en pantallas.

### Story 8.1: Un único camino aplica los cambios de plan

As a plataforma,
I want que activar, cambiar o suspender un plan pase siempre por el mismo sitio,
So that el estado de un negocio nunca dependa de quién lo tocó ni por dónde.

**Acceptance Criteria:**

**Given** cualquier cambio de suscripción (activar, cambiar de plan, añadir extras, suspender, reactivar)
**When** ocurre
**Then** pasa por `SuscripcionService::aplicar`, que es el único que escribe el estado.

**Given** un cambio aplicado
**When** termina
**Then** se anota una fila en `suscripcion_cambios` (solo inserción: nunca se edita ni se borra) con qué cambió, quién y cuándo.

**Given** un cambio a un plan con menos cupo del que el negocio usa
**When** se aplica
**Then** se aplica igualmente sin desactivar a nadie, y se avisa del exceso (S-4).

**Given** que se registra un pago
**When** se guarda
**Then** nace con estado `pendiente` y **activar un plan nunca equivale a cobrar**: son dos acciones distintas.

**Given** las plantillas S-1 y S-4, probadas con evento simulado en la Story 4.5
**When** se implementa esta historia
**Then** se conectan a la activación real y al exceso de capacidad real, con prueba de extremo a extremo. Lo simulado no cierra la integración.

> **Agente:** claude · **Referencias:** AD-10, PRD FR-57, FR-12.

### Story 8.2: Avisar antes de cortar

As a dueño,
I want que me avisen antes de que se me venza el plan,
So that no descubrirlo cuando ya no puedo trabajar.

**Acceptance Criteria:**

**Given** una prueba o un plan que vence en 3 días y al día siguiente
**When** corre la tarea diaria
**Then** el titular recibe S-2, una sola vez por hito.

**Given** un plan vencido
**When** se supera el periodo de gracia
**Then** el negocio queda suspendido, el titular recibe S-3 y el panel muestra la pared de cobro con `codigo: suscripcion_vencida`.

**Given** un negocio suspendido
**When** alguien usa la API
**Then** la pared de cobro gana sobre el permiso cuando concurren, y siguen permitidas las lecturas y los caminos de regularización definidos.

**Given** un pago registrado por la plataforma
**When** se aplica
**Then** el negocio vuelve a activo sin intervención manual en la base.

**Given** las plantillas S-2 y S-3, probadas con evento simulado en la Story 4.5
**When** se implementa esta historia
**Then** se conectan al aviso de vencimiento y a la suspensión reales, con prueba que adelanta el reloj y comprueba que cada correo sale una sola vez.

> **Agente:** claude · **Referencias:** PRD FR-55 y FR-58, propuesta §4.3
> (S-2, S-3), CLAUDE.md (pared de cobro).

### Story 8.3: Mi Plan, en el panel del negocio

As a dueño,
I want ver mi plan, mis límites y mi vencimiento,
So that saber qué tengo contratado sin preguntar.

**Acceptance Criteria:**

**Given** el panel
**When** el titular abre Mi Plan
**Then** ve su plan actual, los profesionales usados frente a su cupo, la fecha de vencimiento y el estado.

**Given** que el negocio supera el cupo o se acerca
**When** se muestra
**Then** aparece el aviso correspondiente y el plan sugerido, sin esconder ningún plan.

**Given** que el cobro aún es manual
**When** el dueño quiere cambiar de plan
**Then** se le ofrece «contáctanos» con el camino real, no un botón que no hace nada.

**Given** un usuario que no es el titular
**When** abre Mi Plan
**Then** no la ve (o la ve sin datos de facturación), según el permiso.

> **Agente:** codex con apoyo de claude · **Referencias:** PRD FR-56, UX-DR7.

### Story 8.4: Entrar al panel de plataforma

As a responsable de ChiraFlow,
I want un acceso propio y con doble factor,
So that administrar los negocios sin usar la cuenta de ninguno de ellos.

**Acceptance Criteria:**

**Given** la zona de plataforma
**When** se configura
**Then** vive en su propia ruta y su propio guard (`platform_admins`), sin tenancy, y no comparte sesión con el panel de negocio (AD-3, AD-12).

**Given** un administrador de plataforma
**When** inicia sesión
**Then** se le exige segundo factor; sin él no entra.

**Given** un usuario de negocio
**When** intenta cualquier ruta de plataforma
**Then** recibe 404 y queda registrado el intento.

**Given** cualquier acción de plataforma
**When** se ejecuta
**Then** queda en `soporte_acciones` con quién, qué, sobre qué negocio y cuándo.

> **Agente:** claude · **Referencias:** AD-12, PRD FR-60, UX-DR4.

### Story 8.5: La ficha de un negocio, con todo lo que hace falta

As a responsable de ChiraFlow,
I want ver un negocio y actuar sobre él desde una sola pantalla,
So that atender una petición sin abrir la base de datos.

**Acceptance Criteria:**

**Given** la lista de negocios
**When** se abre
**Then** muestra nombre, plan, estado, vencimiento, profesionales usados y fecha de alta, con búsqueda y paginación.

**Given** la ficha de un negocio
**When** se activa o cambia su plan
**Then** el cambio pasa por `SuscripcionService::aplicar` y aparece en el historial de la propia ficha.

**Given** la ficha
**When** se registra un pago
**Then** se anota aparte del cambio de plan, con importe, método y fecha, y puede confirmarse después.

**Given** la ficha
**When** se suspende o se reactiva
**Then** el negocio cambia de estado y el titular recibe el aviso correspondiente.

**Given** el historial
**When** se intenta editar o borrar
**Then** no se puede: es solo de lectura.

> **Agente:** codex (pantallas) con apoyo de claude (endpoints) ·
> **Referencias:** PRD FR-60, AD-10, AD-12, UX-DR4.

### Story 8.6: El ciclo de vida corre solo cada día

As a plataforma,
I want que vencer, avisar y suspender ocurra sin que nadie lo recuerde,
So that el cobro no dependa de la memoria de una persona.

**Acceptance Criteria:**

**Given** el comando diario
**When** corre
**Then** recorre los negocios activos y aplica: prueba vencida → aviso → suspensión, usando `SuscripcionService`.

**Given** un negocio ya avisado
**When** el comando vuelve a correr
**Then** no repite el aviso (idempotente por hito).

**Given** un fallo en un negocio
**When** ocurre
**Then** se registra y el comando sigue con los demás.

**Given** la purga (copia + borrado) de los negocios eliminados
**When** se evalúa el alcance
**Then** queda **fuera del lanzamiento**, declarada y sin implementar.

> **Agente:** claude · **Referencias:** PRD FR-58, regla no negociable 3 de
> CLAUDE.md, AD-21.

**Resumen de la Épica 8:** 6 historias. El plan se activa, se cobra y se
suspende desde una pantalla con huella, no desde una consulta SQL.

---

## Épica 9: Abrir la puerta al público

**Meta:** el producto se puede enseñar, contratar y sostener: landing con los
planes, textos legales, ninguna pantalla con datos ficticios y el sistema
corriendo en producción con copias probadas.

**Requisitos:** FR9, FR61 · NFR9, NFR10 · AD-17, AD-20 · UX-DR9.
**Agente por defecto:** Codex (landing); Claude (despliegue y cierre).

### Story 9.1: Una landing que explica y convierte

As a dueño de una barbería que oyó hablar de ChiraFlow,
I want entender qué hace, cuánto cuesta y poder probarlo,
So that decidir sin tener que preguntar por WhatsApp.

**Acceptance Criteria:**

**Given** la página de inicio
**When** se abre
**Then** explica el producto, muestra los tres planes con su precio en soles y lleva al registro.

**Given** un visitante en móvil
**When** navega
**Then** la página carga rápido y se lee bien, sin desplazamiento horizontal.

**Given** el diseño acordado (base Calendly + movimiento de Tracky + fotos reales)
**When** se implementa
**Then** respeta los tokens del tema y no introduce una tercera identidad visual.

**Given** los precios y nombres de plan
**When** aún no están confirmados (F-5)
**Then** se leen de un único sitio para poder cambiarlos sin tocar la maqueta.

> **Agente:** codex · **Referencias:** PRD FR-61, UX-DR9, DESIGN.md.
> Nombres y precios de los planes siguen **[POR CONFIRMAR]** (F-5, F-6, F-7).

### Story 9.2: Términos, privacidad y los derechos del cliente

As a negocio peruano que trata datos de sus clientes,
I want que la plataforma cumpla la ley de protección de datos,
So that no exponerme por usar una herramienta que no lo hace.

**Acceptance Criteria:**

**Given** la landing y la tienda pública
**When** se abren
**Then** enlazan los términos y el aviso de privacidad, accesibles sin sesión.

**Given** la reserva pública
**When** el cliente envía sus datos
**Then** consiente de forma explícita y queda registrado qué aceptó y cuándo.

**Given** una petición de supresión de datos de un cliente final
**When** el negocio la atiende desde el panel
**Then** se borran o anonimizan sus datos personales conservando lo que la contabilidad exige.

**Given** los textos legales
**When** se publican
**Then** salen de una fuente única revisable (L-5 sigue pendiente de confirmación).

> **Agente:** claude con apoyo de codex · **Referencias:** NFR10 (Ley N.° 29733),
> PRD §legal, L-5 y L-6 **[POR CONFIRMAR]**.

### Story 9.3: Ninguna pantalla miente

As a usuario,
I want que todo lo que veo sean datos míos,
So that no tomar una decisión mirando cifras inventadas.

**Acceptance Criteria:**

**Given** la aplicación desplegada
**When** se recorre el panel entero
**Then** no queda ninguna pantalla con datos de ejemplo (caja, reportes, soporte y cualquier resto de maqueta).

**Given** un módulo aún no lanzado
**When** se arma el menú desde `GET /capacidades`
**Then** no aparece, y su ruta directa responde 404.

**Given** un despliegue de producción
**When** se comprueba
**Then** no se sirve ningún mock ni dato semilla de demostración.

**And** hay una comprobación automática que falla si vuelve a colarse un mock
en la construcción de producción.

> **Agente:** codex con apoyo de claude · **Referencias:** AD-17, PRD FR-51,
> diagnóstico 2026-09-19 (pantallas con datos ficticios).

### Story 9.4: Los primeros pasos, explicados

As a dueño que acaba de registrarse,
I want una guía corta de qué hacer primero,
So that llegar a mi primera cita sin llamar a nadie.

**Acceptance Criteria:**

**Given** la checklist de onboarding
**When** se abre un paso
**Then** enlaza a una explicación breve de cómo hacerlo.

**Given** el tutorial
**When** se publica
**Then** cubre los seis pasos y no bloquea el uso del panel en ningún momento.

**Given** un paso ya completado
**When** se muestra
**Then** se ve marcado y el tutorial no vuelve a insistir.

> **Agente:** codex · **Referencias:** PRD FR-9. El contenido del tutorial
> sigue **[POR DEFINIR]**.

### Story 9.5: Producción de verdad, con copias que se restauran

As a responsable de ChiraFlow,
I want tres entornos, copias diarias y una restauración probada,
So that poder dormir tranquilo el día que algo se rompa.

**Acceptance Criteria:**

**Given** los entornos local, pruebas y producción
**When** se configuran
**Then** están separados (datos, claves y dominios propios) y el de pruebas se puede reconstruir sin tocar producción.

**Given** producción
**When** se despliega
**Then** corre en Contabo con Forge (API, worker y programador por minuto), la web en Vercel, y los dominios `app.`, `admin.`, `api.` y `{slug}.site.` resuelven con sus cookies `__Host-`.

**Given** las copias
**When** corren a diario
**Then** guardan la base central y la de cada negocio en R2, y **una restauración mensual se prueba de verdad** y queda anotada.

**Given** la disponibilidad
**When** algo falla (cola atascada, tasa de rebotes alta)
**Then** llegan las alertas X-1 y X-2 y los registros se conservan 14 días.

> **Agente:** claude · **Referencias:** NFR9, AD-20, AD-15, AD-21.

### Story 9.6: Un piloto antes de abrir del todo

As a responsable de ChiraFlow,
I want probar con dos o tres negocios reales antes de anunciar,
So that descubrir los fallos con quien me perdona y no con quien me paga.

**Acceptance Criteria:**

**Given** dos o tres negocios piloto
**When** se les da de alta
**Then** recorren el flujo completo: registro, onboarding, equipo, catálogo, tienda pública, reserva de un cliente real y cobro.

**Given** el piloto
**When** termina
**Then** hay una lista de fallos y fricciones con su gravedad, y los bloqueantes se arreglan antes de abrir.

**Given** los negocios piloto
**When** se abre al público
**Then** siguen funcionando sin migraciones manuales ni arreglos a mano.

> **Agente:** claude · **Referencias:** PRD §8 (alcance del lanzamiento),
> Q-03 y Q-04 **[POR CONFIRMAR]** (fecha objetivo y alcance definitivo).

**Resumen de la Épica 9:** 6 historias. El producto se puede enseñar,
contratar y sostener.

---

## Cobertura y cabos sueltos

**Historias por épica:** 0 (registro, sin historias) · 1: 15 · 2: 3 · 3: 3 ·
4: 8 · 5: 4 · 6: 11 · 7: 6 · 8: 6 · 9: 6. **Total: 62 historias.**

**Cobertura de los requisitos UX (UX-DR):**

| UX-DR | Historia que lo cubre |
|---|---|
| UX-DR1 Pago QR y pantalla de pago | 7.1, 7.2 |
| UX-DR2 Verificación de pagos en Citas | 7.4 |
| UX-DR3 Página de la cita del cliente | 6.8 (+6.7 para el estado «expiró») |
| UX-DR4 Panel de plataforma | 8.4, 8.5 |
| UX-DR5 Notificaciones y preferencias | 4.6 |
| UX-DR6 Plantillas de correo | 4.2 |
| UX-DR7 Mi Plan | 8.3 |
| UX-DR8 Dashboard mínimo | 3.3 |
| UX-DR9 Landing, términos y privacidad | 9.1, 9.2 |
| UX-DR10 Editor de apariencia | 5.1, 5.3 (+5.2 imágenes, 5.4 aviso del traslado) |

**Dependencias entre épicas:** 2 → 6 (reservabilidad), 4 → 6 y 7 (correo),
5 → 6 (identidad), 6 → 7 (la tienda existe antes de cobrar en ella).
Dentro de cada épica, ninguna historia depende de una posterior.

**Coordinación de los archivos compartidos** (acordado el 2026-09-20). Cuatro
épicas escriben en `App\Services\CitaService` y `App\Services\Disponibilidad`.
Reglas de convivencia, obligatorias para cualquier agente:

| Archivo | Historias que lo tocan | Dueño de la regla |
|---|---|---|
| Reglas de reservabilidad | 1.3 → **2.2** → 6.4, 6.6, 7.5 | **2.2** es la única implementación; las demás la llaman |
| `CitaService` (escrituras) | 1.1, 1.2, 1.3, 1.13, 2.2, 6.6, 6.8, 7.5, 7.6 | 1.3 deja el método único; nadie lo duplica |
| `Disponibilidad` | 2.2, 3.2, 6.4, 6.7, 7.2 | 2.2 le pasa la reservabilidad; el motor no la reimplementa |
| `disponibilidad.ts` (frontend) | 3.2, 6.4 | copia deliberada: si cambia una, cambia la otra en la misma historia |

1. **Una sola implementación de cada regla compartida.** Si una historia
   necesita ampliar la regla, amplía el método existente; no escribe el suyo.
   Es la lección de las tres escaladas de septiembre (CLAUDE.md).
2. **Un agente por archivo a la vez.** Dos historias que tocan `CitaService`
   no se reparten en paralelo entre Claude y Codex; se ordenan.
3. **La historia dueña se mergea primero.** 1.3 antes que 2.2, y 2.2 antes que
   cualquiera de la 6 o la 7.
4. **Revisión obligatoria antes de mergear** (`bmad-code-review`) en toda
   historia que toque estos archivos, con la prueba de aislación en verde.

**Decisiones que siguen abiertas** y que hay que cerrar antes de tocar su
historia (no bloquean las demás):

- F-5, F-6, F-7: nombres, precios, días de prueba y de gracia de los planes → Story 9.1, 8.2.
- F-8: qué se hace con Grupos → Story 1.14 los oculta; la decisión sigue pendiente.
- F-9: ventana de corrección (30 min), margen de 15 min y máximo de capturas → Story 7.4, 7.5.
- Q-19: arrastrar y rango visible del calendario → Story 3.2 (sin arrastrar si no se confirma).
- L-1, L-2: dominio de la marca y de la tienda → Story 9.5.
- L-5, L-6: textos legales y facturación con RUC → Story 9.2.
- Q-03, Q-04: fecha objetivo y alcance definitivo del lanzamiento → Story 9.6.
- Plazo por defecto de la confirmación por correo y reenvío a petición → Story 6.7.

**Fuera del lanzamiento** (siguen en el alcance general del producto, sin
historia todavía): FR18, FR26, FR41, FR42, FR47–FR50, FR52–FR54, FR59, FR80.

---

## Validación final (paso 4, 2026-09-20)

**1. Cobertura de requisitos.** Los 38 FR pendientes o parciales del
lanzamiento aparecen en al menos una historia, comprobado con script sobre el
propio documento. Los 19 FR ya construidos se citan como contexto, no como
trabajo. Los 12 FR fuera del lanzamiento están listados aparte. Los 10 UX-DR
tienen historia asignada.

**2. Plantilla de inicio.** No aplica: el proyecto existe (brownfield). Por eso
la Épica 1 no empieza con un montaje, sino cerrando agujeros de seguridad
sobre código que ya corre.

**3. Tablas y entidades.** Ninguna historia crea el esquema por adelantado.
Cada migración nace en la historia que la necesita: `local_servicio` en 2.1,
canal y autor en 1.13, `eventos_dominio` y `notificacion_envios` en 4.1,
`tareas_programadas` en 4.4, accesos por enlace en 6.8, pagos de cita en 7.1
y 7.3, `suscripcion_cambios` en 8.1, `soporte_acciones` en 8.4. Todas son
archivos nuevos desplegados con `tenants:migrar-provisionados` (AD-14).

**4. Dependencias dentro de cada épica.** Revisadas una por una: ninguna
historia necesita una posterior de su misma épica. Los tres casos que apuntaban
hacia adelante se corrigieron en esta validación: 4.5 (las plantillas de pago y
suscripción se escriben y se prueban con evento simulado; las conecta su épica
dueña), 6.6 (mientras no exista la Épica 7, la tienda **no acepta** reservas
de un negocio con pago obligatorio: no se degrada a pago en el local) y 3.3
(el bloque de pagos del tablero sale en cero y se rellena solo cuando llega la
Épica 7).

**5. Dependencias entre épicas.** 2 → 6, 4 → 6 y 7, 5 → 6, 6 → 7. Cada épica
entrega valor completo en su dominio con lo anterior: la 6 abre la tienda
aunque la 7 no exista (se reserva sin pago en línea), y la 7 añade el cobro sin
rehacer la 6.

**6. Rozamiento de archivos (file churn).** Cuatro épicas tocan
`CitaService` y `Disponibilidad` (1, 2, 6 y 7). Se consideró juntarlas y **se
descartó**: la 1 arregla seguridad sobre código en producción y debe poder
desplegarse sola; la 2 cambia el modelo de datos; la 6 abre una superficie
pública nueva; la 7 añade dinero. Juntarlas daría una épica imposible de
revertir de un tirón y retrasaría los arreglos de seguridad hasta tener tienda.
El riesgo real —dos versiones de la misma regla— se ataja con la regla única de
reservabilidad (2.2), que las tres siguientes llaman en vez de reescribir.

**7. Tamaño de las historias.** El criterio no es cuánto dura una sesión, sino
si la historia entrega algo verificable por sí sola. Con ese criterio se
**partió 6.5** (2026-09-20) en dos: **6.5** elige y calcula sin escribir nada en
la base (se verifica con el carrito y los huecos), y **6.6** escribe la reserva
con sus consentimientos y su anti-solape (se verifica con una reserva real y
con el intento de solape). Las demás se revisaron con el mismo criterio y no
tienen partes independientes que justifiquen partirlas.

**Resultado: validación superada.** El documento queda listo para
`bmad-sprint-planning`.
