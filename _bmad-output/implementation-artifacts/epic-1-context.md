# Epic 1 Context: Cada persona ve y hace exactamente lo suyo

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Que el negocio pueda repartir el trabajo con confianza. Esta épica cierra los cuatro huecos de autorización verificados el 2026-09-19 (G-1 agendar a nombre de otro, G-2 escribir fuera del alcance de sedes, G-3 citas imposibles, G-4 escalada de privilegios al crear cuentas) y los fallos abiertos F-01 a F-06. Además deja el panel listo para las épicas públicas: el rol Profesional de fábrica agenda de principio a fin sin permisos extra, hay cuatro roles de sistema y un permiso `pagos`, el alcance por sedes se aplica en todas partes, cada cita guarda su canal, su autor y su historial, y todo error sale en español. Nada de lo público (tienda, pagos QR) empieza antes de que esto esté cerrado.

## Stories

- Story 1.1: Un profesional no agenda a nombre de otro (hecha)
- Story 1.2: Las citas no salen del alcance de sedes
- Story 1.3: No se pueden agendar citas imposibles
- Story 1.4: Nadie concede lo que no tiene
- Story 1.5: Un rol de Recepción listo para usar
- Story 1.6: Un permiso propio para los pagos
- Story 1.7: Quien puede agendar, puede abrir el formulario
- Story 1.8: El alcance por sedes también en los profesionales
- Story 1.9: Todos los errores en español
- Story 1.10: Ningún selector pierde opciones en silencio
- Story 1.11: Mi perfil deja de ser una maqueta
- Story 1.12: El onboarding se marca solo
- Story 1.13: Cada cita dice de dónde vino y quién la registró
- Story 1.14: Los grupos dejan de estorbar
- Story 1.15: El anti-solape aguanta dos reservas a la vez

## Requirements & Constraints

- **Autorización en lecturas y en escrituras.** Crear, editar y reasignar respetan el mismo alcance que el listado. Con `solo_propios`, lo ajeno responde 404 y el propio profesional no puede reasignar su cita a otro (422 en `empleado_id`). Fuera del alcance de sedes: 422 en `local_id` al escribir; sin `local_id`, la cita va a una sede del alcance (la principal solo si está dentro).
- **Citas imposibles (G-3):** profesional activo, habilitado en la sede y con el servicio asignado; si no, 422 en el campo que falla (en el servicio, indicando cuál).
- **Nadie concede lo que no tiene:** el rol asignado debe tener permisos ⊆ los del actor, y el alcance ⊆ el suyo, por `/usuarios` **y** por `/profesionales` con cuenta. El administrador de sede no invita. El general puede todo salvo crear un segundo general. Ojo: la historia pide 403 `sin_permiso` y el PRD habla de 422 en el campo; manda la historia, y conviene confirmarlo al especificar.
- **Roles de sistema:** administrador general (único, no editable), administrador de sede (texto visible de `admin_local`, la clave no cambia), **recepción** (nuevo) y profesional. Ninguno se borra; los negocios existentes reciben Recepción sin tocar sus roles personalizados.
- **Matriz de roles aprobada (A-1):** Recepción = citas G·sedes, clientes G·negocio, profesionales V·sedes (solo para agendar), inventario y servicios V; sin equipo, usuarios, roles, configuración, facturación ni reportes. Pagos: general, sede y recepción lo gestionan; profesional nada. Hay contradicción: la historia 1.5 dice `pagos: ver` para recepción y la matriz y el PRD dicen gestionar. Hay que resolverlo antes de implementar 1.5/1.6.
- **Módulo `pagos`** (ver/gestionar) se declara ya en el catálogo aunque sus endpoints lleguen en la Épica 7. Es distinto de `facturacion`, que sigue siendo solo del general.
- **Opciones para agendar:** `GET /citas/opciones` detrás de `citas: gestionar`, con proyecciones mínimas ya recortadas por alcance y `solo_propios`. Profesionales sin pago, comisión ni cuenta; servicios; sedes del alcance; solo los ajustes de agenda del negocio. Productos solo con `inventario: ver`; búsqueda de clientes solo con `clientes: ver`. Los index de gestión conservan su permiso.
- **Alcance en profesionales:** el listado y la ficha se filtran por sedes habilitadas; fuera del alcance, 404; al dar de alta solo se habilita en sedes propias. Clientes, catálogo y configuración siguen siendo de todo el negocio.
- **Español:** todo 422 y todo error de auth, autorización y rate limit en español, con `lang/es` y los `attributes` de los campos del negocio. Una prueba debe fallar si reaparece texto en inglés.
- **Selectores:** los index usados por selectores (clientes, servicios, profesionales, productos) aceptan `search` + paginación con `{data, meta}`; se acabó `per_page=200`.
- **Onboarding:** `primer_profesional` y `primer_servicio` se marcan en el service, por cualquier camino (incluida el alta con cuenta), de forma idempotente, con prueba de los seis pasos.
- **Anti-solape:** prueba de concurrencia real sobre MySQL 8.4: dos peticiones simultáneas → una cita y un 422, estable y documentada para que nadie la borre por lenta.
- Cada endpoint de recursos lleva test de aislamiento entre negocios (404, no 403) y test de autorización.

## Technical Decisions

- **Orden único de autorización en el panel:** aislamiento (404) → suscripción (403 `suscripcion_vencida`) → plan (403 `plan_no_incluye`) → permiso `puede:modulo,nivel` (403 `sin_permiso`) → alcance y `solo_propios` (404). Los límites de cupo solo al crear o activar (422). Se pregunta por capacidades, nunca por la clave del rol, salvo el rango del general en `App\Support\Rango`.
- **Una regla, un sitio:** las invariantes de citas (G-1..G-3) viven en `CitaService` y se aplican al crear y al editar. La comprobación de G-3 es **un único método reutilizable** que la Épica 2 ampliará con «servicio habilitado en la sede» (`local_servicio`) sin duplicarla. Hoy usa `profesional_local` y `servicio_profesional`. La regla de rango y subconjunto vive en `App\Support\Rango` (y en `UsuarioService`): se permiten dos puntos de llamada (Form Request y service), pero nunca dos copias.
- **Toda escritura que ocupa o libera tiempo** pasa por el service de citas en una transacción con `SELECT … FOR UPDATE`, revalidando dentro del bloqueo. Nadie más escribe `starts_at`, `ends_at`, `estado` ni el profesional.
- **Canal y autor (A-2):** `citas.canal` ENUM `panel | tienda` (solo lo que existe) y `citas.creada_por_usuario_id` nullable → `usuarios.id`. Se hace con una migración nueva que copia `admin→panel` y `publica→tienda` y retira `fuente`; las citas antiguas quedan sin autor. El Resource emite `canal` y `creada_por` (`{id, nombre} | null`); en los reportes, `fuentes` pasa a llamarse `canales`.
- **Historial de la cita:** los services registran eventos tipados **dentro de su transacción** en la tabla `eventos_dominio` de la base del negocio (tipo, entidad, id, actor `usuario|cliente|plataforma|sistema` + id, datos antes/después, versión). El historial de la cita es la consulta de sus eventos, y más adelante alimentará al Notificador (Épica 4). No se edita ni se borra salvo con la cita.
- **Migraciones solo se añaden:** nunca se edita una que ya corrió. Las migraciones de datos (preset Recepción, `fuente→canal`) van en la misma migración que el cambio de esquema, y se despliegan con `tenants:migrar-provisionados`.
- **Contrato primero:** toda historia que cambie la API (p. ej. `/citas/opciones`, `canal`/`creada_por`, historial) empieza editando `Sass-ChiraFlow/docs/api-contract.md` desde el repo del frontend. Desde aquí no se edita: se pide por traspaso.
- `GET /capacidades` devuelve permisos, alcance y funciones del plan. El menú del frontend sale solo de ahí, y esconder algo no sustituye al 403.
- Convenciones: 403 `{message, codigo}`, 422 `{message, errors}`, `per_page` con tope 200, códigos de error en `snake_case`.

## UX & Interaction Patterns

- Los selectores del panel buscan en el servidor con `search` y retardo; un valor ya elegido que no está en la primera página se carga por id al editar.
- El formulario de cita oculta la fila de productos sin `inventario: ver` y deja escribir el cliente a mano sin `clientes: ver`.
- Mi perfil muestra datos reales. Cambiar la contraseña exige la actual (422 en español si falla) y cierra las demás sesiones pero no la actual.
- Grupos desaparece del menú (vía `/capacidades`) pero sus endpoints siguen respondiendo; la decisión F-8 sigue abierta.
- Las historias de pantalla (1.10 selectores, 1.11 perfil, 1.14 grupos) son del frontend (Codex); el backend aporta los endpoints.

## Cross-Story Dependencies

- 1.1 (hecha) → 1.2 → 1.3: las tres endurecen las mismas escrituras de `CitaService`. Conviene mantener un solo punto de validación de profesional, sede y servicio.
- 1.3 deja el método de reservabilidad que la Épica 2 (FR-67, `local_servicio`) extenderá.
- 1.5 y 1.6 comparten la siembra de roles de sistema y la migración de presets para negocios existentes. 1.6 alimenta los endpoints de pagos de la Épica 7.
- 1.7 depende de los recortes de alcance de 1.2 y 1.8 y del permiso de inventario y clientes. La Épica 2 añadirá el filtro de servicios por sede.
- 1.4 depende de que el alcance sea asignable al crear o editar cuentas, y 1.8 aplica ese mismo alcance a profesionales.
- 1.13 crea `eventos_dominio`, de la que dependen el Notificador (Épica 4), la tienda (`canal = tienda`, Épica 6) y los pagos (Épica 7).
- 1.15 protege la regla anti-solape que reutilizarán la reserva pública, la reprogramación y la caducidad de pagos.
