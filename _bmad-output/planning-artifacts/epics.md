---
stepsCompleted: ['step-01-validate-prerequisites']
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

{{requirements_coverage_map}}

## Epic List

{{epics_list}}
