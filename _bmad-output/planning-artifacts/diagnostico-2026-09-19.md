---
title: Diagnóstico brownfield — ChiraFlow
status: borrador para revisión
created: 2026-09-19
alcance: Backend-Sass (Laravel 12) + Sass-ChiraFlow (Next.js 16)
---

# Diagnóstico del estado real y de la arquitectura

Contrasta lo que dicen los documentos caseros con lo que hay en el código de
los dos repos a fecha **2026-09-19**. Sirve de entrada al PRD
(`prds/prd-ChiraFlow-2026-09-19/prd.md`) y a la arquitectura BMAD que viene
después.

**Qué se verificó y cómo**

| Evidencia | Resultado |
|---|---|
| Suite Pest del backend (Laragon PHP 8.3) | ✅ 312 tests, 1370 aserciones en verde |
| `tsc --noEmit` del frontend | ✅ sin errores |
| Rutas reales (`routes/api.php`), services, migraciones, seeders | leídos |
| Interruptores de mocks del frontend (`.env.local`, `usarMocksPara`) | leídos |
| Verificación en navegador | **no re-verificada**: se cita lo que dice `estado.md` |

Convención: **✅ verificado** = hay código + tests en verde (y, en el
frontend, el módulo está en `NEXT_PUBLIC_MODULOS_CONECTADOS`). **🟡 parcial** =
existe pero con un fallo comprobado o una pieza pendiente. **⬜ pendiente** =
no hay implementación. *(no verificable)* = solo lo afirma un documento.

---

## 1. Estado real por módulo

### 1.1 Tabla resumen

| Módulo | Backend | Frontend | Estado real | Motivo |
|---|---|---|---|---|
| 0.A Fundaciones (tenancy multi-BD, migraciones, seeders, provisioning) | ✅ | — | ✅ | Tests `ProvisioningTest`, `MigrarTenantsTest` |
| 0.B Registro · verificación · login · recuperación | ✅ | ✅ conectado | ✅ | Rutas + tests `Auth/*` |
| 0.B Onboarding (checklist + paso 1) | 🟡 | ✅ conectado | 🟡 | **Los pasos `primer_profesional` y `primer_servicio` nunca se marcan**: no hay llamada a `OnboardingService::marcar` en `ProfesionalService` ni `ServicioService` (solo en `CitaService` y `ConfiguracionService`). El checklist no se puede terminar. Enlace «Ver tutorial» apunta a `#` |
| Invitación de usuarios (`/invitacion/aceptar`) | ✅ | ✅ | ✅ | Ruta y pantalla `(auth)/invitacion` |
| Mi perfil (`PUT /user`, `/user/password`) | ✅ | 🟡 | 🟡 | `perfil` **no** está en `MODULOS_CONECTADOS`: la pantalla sigue guardando contra el mock |
| Puerta de cobro (`403 suscripcion_vencida`) | ✅ | 🟡 | 🟡 | Backend aplica; el aviso con botón de renovar depende de Mi Plan (⬜) |
| 1.A Categorías | ✅ | ✅ | ✅ | |
| 1.B Servicios | ✅ | ✅ | 🟡 | Solo por el hook de onboarding ausente |
| 1.C Clientes | ✅ | ✅ | ✅ | |
| 2.A Usuarios · Profesionales · Roles | ✅ | ✅ | 🟡 | Hook `primer_profesional` ausente. El alcance por sedes **filtra** pero **no hay endpoint que lo asigne** |
| 2.B Configuración | ✅ | ✅ | ✅ | |
| Capacidades (`puede:modulo,nivel`) | ✅ | ✅ | 🟡 | Ver D-01: quien tiene `citas: gestionar` recibe 403 en los selects del formulario de cita |
| 3.A Locales · pivote · grupos | ✅ | ✅ | 🟡 | `grupos` no lo consulta nadie (propósito sin decidir). No existe `local_servicio`: la pestaña Servicios de un local no filtra nada |
| 3.B Inventario | ✅ | ✅ | ✅ | Sin kardex de lectura (backlog declarado) |
| 4.A Disponibilidad | ✅ | — | ✅ | `DisponibilidadTest` con el caso dorado. Sin endpoint propio (por diseño) |
| 4.B Citas | ✅ | ✅ | 🟡 | D-01 (permisos), D-02 (`fuente`), `codigo` no se muestra en ninguna pantalla, anti-solape probado solo en secuencia |
| 4.C Calendario | — | ⬜ | ⬜ | Usa hooks ya conectados, pero nadie verificó paridad de franjas con el motor |
| 5.A Tienda pública | ⬜ | maquetada (mock) | ⬜ | No hay rutas `/publico/{slug}*` en `routes/api.php` |
| 5.B Plantillas WhatsApp | ⬜ (tabla sí) | maquetada (mock) | ⬜ | |
| 6.A Caja | ⬜ (tablas sí) | maquetada (mock) | ⬜ | El selector `metodo` (decidido en discrepancias §4) no está en la maqueta ni en el contrato |
| 6.B Dashboard | ⬜ | maquetada (mock) | ⬜ | Dos decisiones abiertas (Q-09) |
| 7.A Reportes | ⬜ | maquetada (mock) | ⬜ | |
| 7.B Soporte | ⬜ (tablas sí) | maquetada (mock) | ⬜ | |
| 7.C Mi Plan / Suscripción | ⬜ (planes sembrados) | maquetada (mock) | ⬜ | |
| 8 Lifecycle diario | ⬜ | — | ⬜ | `routes/console.php` no programa nada; no hay command |
| 8 Métricas nocturnas | ⬜ (tabla sí) | — | ⬜ | Sin job |
| 8 Landing del SaaS | — | ⬜ | ⬜ | No hay ruta de landing en `web/src/app` |
| 8 Apagar mocks globalmente | — | ⬜ | ⬜ | `NEXT_PUBLIC_USE_MOCKS=true` |
| Pagos QR (Yape/Plin) | ⬜ (esquema sí) | ⬜ sin maquetar | ⬜ | Ver D-10: el alcance está en conflicto entre documentos |
| Reseñas | ⬜ (sin tabla) | maquetadas (mock) | ⬜ | Backlog declarado |
| Importar clientela (Excel) | ⬜ | ⬜ | ⬜ | Diseño cerrado en `pendientes-contrato.md` § Backlog |

**Lectura rápida**: los Sprints 0–3 y el 4.A están hechos de verdad. El 4.B
está hecho con fallos concretos y acotados. Del 4.C al 8, más Pagos QR, no hay
backend todavía; el frontend tiene las pantallas maquetadas con mocks, que
**no cuentan como implementación**.

### 1.2 Fallos comprobados en el código

| ID | Qué | Evidencia |
|---|---|---|
| F-01 | Onboarding: `primer_profesional` y `primer_servicio` no se marcan nunca | `grep` de `->marcar(` en `app/Services`: solo `CitaService:67` y `ConfiguracionService:97` |
| F-02 | Un rol con `citas: gestionar` no puede crear citas | `routes/api.php`: `GET /profesionales` exige `puede:empleados`, `/inventario` `puede:inventario`, `/locales` `puede:locales`, `/configuracion` `puede:configuracion`. Traspaso FE→BE del 2026-09-06 |
| F-03 | `citas.fuente` se guarda como `admin`; el contrato y el frontend esperan `web \| panel \| publica` | `CitaService:55` |
| F-04 | Los 422 sin mensaje propio salen en inglés | `APP_LOCALE=es` pero no existe `lang/es` (Laravel solo trae `en`) |
| F-05 | Los selects del panel truncan en silencio por encima de 200 opciones | `all()` → `per_page=200` (35 usos en `features/`). La solución elegida (autocompletado paginado) está decidida y sin implementar |
| F-06 | El anti-solape no tiene test de concurrencia real | Lo declara el propio traspaso BE→FE de 4.B |

### 1.3 Pruebas

- **Backend**: 25 archivos de test Pest. Última cifra documentada: 312 tests /
  1370 aserciones (2026-09-06). **Resultado de hoy (2026-09-19): 312 tests,
  1370 aserciones, todos en verde** (939 s). Coincide con la cifra
  documentada: no hubo regresiones desde el cierre de 4.B.
- **Frontend**: `tsc --noEmit` pasa. **No hay tests** ni `lint` configurado
  (`next lint` sin `eslint.config`). La paridad del motor de huecos entre
  `disponibilidad.ts` y `Disponibilidad.php` solo está probada del lado
  backend.

---

## 2. Arquitectura: documentada frente a implementada

### 2.1 Lo que coincide (y conviene conservar tal cual)

- **Multi-tenancy multi-BD** con stancl/tenancy v3: BD central + una BD por
  negocio, nombrada por el `id` inmutable (`tenant_{id}`); el `slug` es una
  columna aparte. Implementado y probado.
- **BFF** en Next: el navegador nunca ve el token Sanctum (cookie httpOnly);
  el proxy añade `Authorization` y `X-Tenant`. Implementado.
- **El tenant se deriva del token** (middleware `tenant.token`); `X-Tenant` es
  solo una pista que se valida. Implementado.
- **Provisioning perezoso** al verificar el correo (job en cola). Implementado.
- **Permisos por capacidad** (`puede:modulo,nivel`), `GET /capacidades`, reglas
  de rango en un solo sitio (`App\Support\Rango`). Implementado.
- **Disponibilidad en un solo service** (`App\Services\Disponibilidad`) con
  copia deliberada en el cliente. Implementado.
- **Invariantes en services, no en controladores** (lección aprendida tres
  veces). Se cumple en los módulos revisados.
- **Contrato de API único** en `Sass-ChiraFlow/docs/api-contract.md`,
  **al día hasta el 4.B** (servicios[], seis estados, `monto_total`,
  capacidades, `profesionales/resumen`).

### 2.2 Inconsistencias y problemas de integración

| ID | Tipo | Qué | Impacto | Propuesta |
|---|---|---|---|---|
| D-01 | Autorización | El formulario de cita necesita leer profesionales, servicios, clientes, inventario, locales y configuración, pero la matriz exige el permiso de cada módulo. El rol Profesional de fábrica tiene una pantalla que no funciona | Bloquea a todo un rol | Decisión Q-01 |
| D-02 | Contrato | `citas.fuente`: BD `publica\|admin\|whatsapp\|api`, contrato `web\|panel\|publica`; `Reporte.fuentes` hereda el choque (discrepancias §2.11) | Se agrava en 5.A (entra `publica`) y en 7.A | Decisión Q-02 |
| D-03 | Documentación | `CLAUDE.md` del frontend dice «backend aún no empezado», «no hay tests», «16 vistas con mocks»; `api-contract.md` §6 lista como «no cableado» login, onboarding y `GET /user`, que ya funcionan; `plan-sprints.md` sigue hablando de `/empleados` y de roles `dueno`/`admin` | Cualquier agente que lea esos archivos planifica sobre un estado falso | La migración a BMAD los sustituye. **[PROPUESTA]**: no corregirlos a mano; se retiran en la fase de borrado |
| D-04 | Documentación | Las secciones «Pendiente» de las fichas de `vistas/` mezclan cosas resueltas (Caja: «partir `saldo`», ya hecho en migración; Onboarding: `negocio.slug`, ya emitido) con decisiones abiertas de verdad | No se distingue lo abierto de lo cerrado | Las abiertas de verdad se recogen en Q-xx; el resto se descarta |
| D-05 | Modelo de datos | `plan-backend.md` §6 propone `local_servicio`, `resenas`, `whatsapp_envios`, `suscripciones`; ninguna existe. La regla «las migraciones de tenant se escriben completas en el Sprint 0» ya no se cumple de hecho | Añadir tablas de tenant exige `tenants:migrar-provisionados` en cada despliegue (el comando existe y está probado) | **[PROPUESTA]**: sustituir la regla por «toda migración de tenant nueva se despliega con `tenants:migrar-provisionados`»; decidir `local_servicio` en Q-06 |
| D-06 | Lógica duplicada | Motor de huecos en dos copias (TS y PHP), sin test en el frontend | Divergencia silenciosa → 422 en el selector | **[PROPUESTA]**: fixture JSON del caso dorado compartido, leído por un test Pest y por un test del frontend (hace falta un runner de tests en `web/`) |
| D-07 | Operación | No hay scheduler, ni lifecycle, ni job de métricas; correo y provisioning dependen de un worker de cola; no hay nada documentado sobre despliegue (hosting, DNS comodín, dominios separados, backups) | Sin esto no se puede operar en producción | Q-13 (despliegue) + Sprint 8 |
| D-08 | Cobro | «Solicitar plan» abre un ticket de soporte; **responder tickets y activar planes lo hace «el panel de soporte (otra app)», que no existe** en ninguno de los dos repos | Nadie puede activar un plan de pago sin tocar la BD a mano | Q-11 |
| D-09 | Datos fiscales | `tenants` no tiene RUC ni razón social (traspaso FE→BE 2026-08-23, «bloquea el Sprint 7») | Facturar al negocio | Q-12 |
| D-10 | Alcance | **Pagos QR**: `CLAUDE.md` del backend lo lista como «decisión de producto cerrada» y las migraciones lo implementan; `plan-sprints.md` lo pone en «backlog fuera de estos sprints»; no está en el contrato ni maquetado | No se sabe si entra en el lanzamiento | Q-05 |
| D-11 | Suscripción | `Suscripcion.estado = cancelada` no tiene origen (no hay baja voluntaria) | Estado muerto en el contrato | Q-10 |
| D-12 | Tienda pública | SEO: páginas de cliente; pasar a Server Components con `generateMetadata` es un cambio de fondo «a decidir antes de lanzar» | Visibilidad en buscadores | Q-07 |
| D-13 | Tienda pública | Ejemplo de payload de reserva con `cliente_telefono: "999888777"`; el resto del sistema normaliza a `+51…` | Clientes duplicados si no se normaliza | Regla en la historia 5.A (normalizar igual que `telefono_normalizado`) |
| D-14 | Registro | La categoría «Otro» debería pedir detalle (`tenants.categoria_otro_detalle`), pero `/register` no acepta el campo | Dato perdido | Q-14 |
| D-15 | Proceso | `estado.md` + Traspasos era el canal entre sesiones; con BMAD el seguimiento pasa a `sprint-status.yaml` | Dos tableros divergiendo | **[PROPUESTA]**: `sprint-status.yaml` sustituye la tabla de estado; los traspasos pendientes se convierten en historias (ver §4) |

### 2.3 Mejoras necesarias para los módulos pendientes (incrementales)

Ninguna exige reestructurar lo que funciona. Por orden de dependencia:

1. **Pipeline público sin sesión** (5.A): grupo de rutas `/publico/{slug}/*`
   con resolución por slug → inicialización de tenancy sin auth, `throttle`
   con nombre (como `archivos`), Resources recortados. Reutiliza
   `Disponibilidad` y el service de citas (anti-solape) — **no** duplicar la
   lógica de reserva.
2. **Servicio de cuotas único** (propuesto en `plan-backend.md` Fase 5 y hoy
   repartido): `profesionales/resumen`, Mi Plan y el futuro contador de
   WhatsApp deben responder desde el mismo sitio.
3. **Scheduler + worker** documentados como requisito de despliegue (correo,
   provisioning, lifecycle, métricas).
4. **Mensajes de validación en español** (`lang/es`) antes de conectar más
   formularios.
5. **Autocompletado paginado** en selects (decisión ya tomada, pendiente de
   hacer) antes de que un negocio real supere 200 clientes.

**Reestructuraciones que NO se proponen**: ni cambiar el modelo multi-BD, ni
mover el BFF, ni unificar repos. Funcionan y están probados.

### 2.4 `api-contract.md`

Se **conserva completo y en su sitio** (`Sass-ChiraFlow/docs/api-contract.md`).
La arquitectura BMAD lo referenciará por ruta; no se resume ni se reparte.

**[PROPUESTA]**: no moverlo. Si más adelante se quisiera mover (p. ej. junto a
`_bmad-output/planning-artifacts/`), estas son las referencias que habría que
actualizar: `Backend-Sass/CLAUDE.md`, `Backend-Sass/README.md`,
`Backend-Sass/docs/discrepancias.md`, `Backend-Sass/docs/pendientes-contrato.md`,
los cuatro `Backend-Sass/_bmad/custom/*.toml`, `Sass-ChiraFlow/CLAUDE.md`,
`Sass-ChiraFlow/README.md`, `Sass-ChiraFlow/docs/{README,estado,plan-backend,plan-sprints}.md`
y `Sass-ChiraFlow/docs/vistas/registro.md`. Ningún archivo de código lo
referencia.

Queda **desalineado en tres puntos** que la historia correspondiente debe
corregir: §6 («lo que no está cableado») está obsoleto, `POST /caja/movimientos`
no lleva `metodo`, y `Reporte.fuentes` depende de Q-02.

---

## 3. Decisiones que necesito de ti

Las **bloqueantes** impiden escribir los criterios de aceptación de un módulo
pendiente; las demás pueden esperar a su sprint.

| ID | Pregunta | Bloquea | Opciones / lo que dicen las fuentes |
|---|---|---|---|
| **Q-01** | ¿Cómo se arregla D-01? | 4.B (arreglo) | (a) `citas: gestionar` concede lectura de los módulos que pide el formulario — lo que prefiere el frontend; (b) endpoints ligeros de selects sin el permiso del módulo |
| **Q-02** | ¿Qué claves de `fuente` valen? | 5.A, 7.A | (a) las de la BD (`publica\|admin\|whatsapp\|api`) — lo que recomienda discrepancias §2.11; (b) las del contrato (`web\|panel\|publica`) |
| **Q-03** | **Fecha de lanzamiento** | orden del plan | [POR DEFINIR] — ninguna fuente la menciona |
| **Q-04** | **Alcance mínimo del lanzamiento** | orden del plan | [POR DEFINIR]. El plan actual llega hasta el Sprint 8 sin cortes; no reduzco nada por mi cuenta |
| **Q-05** | ¿Pagos QR entra en el lanzamiento? | 5.A, 6.A | CLAUDE.md lo da por cerrado; plan-sprints lo deja fuera (D-10) |
| **Q-06** | ¿Un local ofrece todos los servicios o solo algunos (`local_servicio`)? | 5.A | Hoy la tienda de cada sede mostraría todo el catálogo |
| **Q-07** | ¿SEO de la tienda antes del lanzamiento? | 5.A | Server Components + `generateMetadata` (cambio de fondo) o dejarlo para después |
| **Q-08** | ¿Para qué sirven los **grupos**? | 3.A (cierre), 5.A | Hoy no los consulta nadie. ¿Filtran algo en la tienda, en los reportes, o se retiran? |
| **Q-09** | Dashboard: ¿`ingresos_hoy` sale de citas completadas o de la caja? ¿`citas_pendientes` son las de hoy o todas las futuras? | 6.B | El plan recomienda: citas completadas hoy; pendientes de hoy en adelante |
| **Q-10** | ¿Existe la baja voluntaria (`cancelada`)? | 7.C | El plan recomienda quitarla del contrato |
| **Q-11** | ¿Quién y con qué herramienta activa un plan pagado y responde tickets? | 7.B, 7.C | No existe panel de plataforma (D-08) |
| **Q-12** | ¿RUC/razón social del negocio? ¿Se emite comprobante electrónico (SUNAT) por la suscripción? | 7.C | [POR DEFINIR] |
| **Q-13** | Despliegue: hosting, dominio del panel y dominio de tiendas, DNS comodín | 8 | Decisión tomada: dominios separados. Proveedor y dominios [POR DEFINIR] |
| Q-14 | Categoría «Otro»: ¿se pide el detalle o se quita la columna? | — | |
| Q-15 | **Precios**: ¿confirmas los del seeder (Básico S/99, Premium S/149, Pro S/449, promo S/9 por 3 meses, extras S/11 y S/17)? ¿Añades el plan **Individual** (propuesta S/49, 1 profesional, sin extras)? ¿Texto comercial del plan Pro? | 7.C | Los precios vienen de la app anterior; no hay confirmación tuya escrita |
| Q-16 | ¿Duración de la prueba = 7 días? | 8 | Está en el código (`ProvisionTenantDatabase`) y en `CLAUDE.md` como modelo de AgendaPro |
| Q-17 | **Cliente piloto** | — | [POR DEFINIR] |
| Q-18 | WhatsApp: ¿solo `wa.me` a mano o API de WhatsApp Business? ¿Hay contador de consumo en el lanzamiento? | 5.B | Hoy el plan vende un cupo que nada cuenta |
| Q-19 | Calendario: ¿impedir agendar fuera de franja o solo avisar? ¿Vistas semana/mes? ¿Arrastrar para reprogramar? | 4.C | Preguntas abiertas de la ficha |
| Q-20 | Reseñas e importación de clientela: ¿entran antes o después del lanzamiento? | — | Hoy en backlog |

---

## 4. Traspasos abiertos que pasan a ser historias

No se pierden: cada uno queda como historia en la épica de su módulo.

| Origen | Qué | Épica destino |
|---|---|---|
| FE→BE 2026-09-06 | Permisos del formulario de cita (F-02) | Cierre de Citas |
| FE→BE 2026-09-06 | `fuente` (F-03) | Cierre de Citas |
| FE→BE 2026-09-06 | Hooks de onboarding (F-01) | Cierre de onboarding |
| FE→BE 2026-09-06 | 422 en inglés (F-04) | Transversal |
| FE→BE 2026-09-01 | Autocompletado paginado (F-05) | Transversal |
| FE→BE 2026-08-23 | RUC / razón social (D-09) | Mi Plan (según Q-12) |
| FE→BE 2026-08-23 | `dias_totales` en Suscripción | Mi Plan |
| FE→BE 2026-08-22 | Categoría «Otro» (D-14) | Según Q-14 |
| Sesión FE | Apagar mock de `perfil`, paginar `LocalesGrid`, `CampoImagenes` que descarta en silencio, mostrar `codigo`, `GET /citas` sin filtro de fecha en el selector | Cierre de módulos conectados |
| pendientes-contrato | Ítems en estado «pendiente» de absorber en el contrato (X-Tenant, suscripción vencida, Mi perfil, revisión Sprint 1, banderas de archivos, Configuración) | Sincronización del contrato |
