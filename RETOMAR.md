# RETOMAR — por dónde iba y a quién le toca

Esto es para volver después de unos días y saber en un minuto qué hacer.
Lo generado sale de `_bmad-output/planning-artifacts/epics.md` y
`_bmad-output/implementation-artifacts/sprint-status.yaml`; **si algo aquí
contradice a esos dos, mandan ellos** y hay que corregir este archivo.

Última revisión: **2026-09-27**.

---

## 1. Dónde me quedé

**Sprint 1 aprobado el 2026-09-20**: «Cerrar los agujeros y dejar el panel
honesto». Son los cuatro huecos de seguridad G-1 a G-4 más lo que hace que el
panel no mienta. Estimado en 3–4 días de trabajo efectivo.

| | |
|---|---|
| **En curso** | **Story 1.1** — Un profesional no agenda a nombre de otro |
| Quién | Claude, en `Backend-Sass` |
| Estado real | sus 4 tareas están **marcadas hechas** y su spec está en `in-review` |
| Sin empezar | todo lo demás: 61 historias en `backlog` |

> ⚠️ **Incoherencia a resolver primero**: `sprint-status.yaml` tiene 1.1 en
> `in-progress` y su spec dice `in-review`. Una de las dos está desactualizada.
> Mirar `spec-1-1-agendar-solo-lo-propio.md` § Review Triage Log y mover el
> estado que toque.

También hay **cuatro archivos sin commitear** en este repo: el spec de 1.1,
`epic-1-context.md`, `deferred-work.md` y el propio `sprint-status.yaml`.

---

## 2. Qué hacer ahora mismo

**Dos terminales, dos repos, en paralelo.** No se pisan: 1.1 es backend y 1.11
es frontend.

```bash
# Terminal A — Claude, en el backend
cd D:/PERSONAL_JEAN/Backend-Sass
# cerrar 1.1 (está en revisión) y seguir con 1.2 → 1.3
```

```bash
# Terminal B — Codex, en el frontend
cd D:/PERSONAL_JEAN/Sass-ChiraFlow
# arrancar 1.11 «Mi perfil deja de ser una maqueta»
```

Las dos historias de Codex que pueden empezar **hoy** están verificadas como
independientes (`sprint-status.yaml` → `dependencias_verificadas_2026_09_20`):

| Historia | Por qué no espera a nadie |
|---|---|
| **1.11** Mi perfil | `GET /user`, `PUT /user` y `PUT /user/password` ya existen (`routes/api.php:83, 94, 87`) |
| **1.14** Los grupos dejan de estorbar | «grupos» no está en `RolesSistema::MODULOS`, cuelga de «locales»: es solo menú y rutas del panel |

Y una que **no** puede empezar todavía:

| Historia | Qué falta |
|---|---|
| **3.1** El código de la cita, a mano | `CitaResource` ya emite `codigo`, pero `GET /citas` solo busca por cliente. **Claude añade `codigo` a la búsqueda primero** (contrato antes que pantalla, AD-13); Codex conecta después |

---

## 3. La regla: cuándo Claude y cuándo Codex

No es preferencia, es el reparto que ya está escrito historia por historia en
`epics.md` (línea `**Agente:**`).

| | **Claude** | **Codex** |
|---|---|---|
| **Se lleva** | Backend, contrato de la API, seguridad, permisos, migraciones, correos y tareas programadas | Pantallas **ya especificadas**: hay ficha en `docs/vistas/` o maqueta que solo hay que conectar |
| **Por qué** | Son las reglas que, mal puestas, abren un agujero o rompen los tipos que usan nueve módulos | Son trabajo acotado con el diseño ya decidido, que se puede hacer en paralelo sin bloquear a nadie |
| **Repo habitual** | `Backend-Sass` | `Sass-ChiraFlow` |

**Cuando una historia dice «con apoyo de»**, toca los dos repos y se hace en
**dos pasos, no en paralelo**: primero quien pone los datos, después quien pinta
la pantalla. `epics.md` lo dice al final:

> las historias que tocan las dos capas no se reparten en paralelo entre Claude
> y Codex; se ordenan.

**Si dudas**: mira `sprint-status.yaml` →
`preparacion.listo_para_desarrollar` → el campo `agente:` de esa historia. Ese
es el responsable, y **hay uno solo por historia**.

---

## 4. En qué repo, y cómo no pisarse

Cada agente trabaja en **su propio worktree**, con su `.env.local` y su
`node_modules`. Nunca dos `npm run dev` en el mismo puerto ni dos suites sobre
la misma base de pruebas.

### Frontend — `D:/PERSONAL_JEAN/Sass-ChiraFlow`

| Agente | Dev server | Apunta a |
|---|---|---|
| Claude | `npm run dev` (3000) | `127.0.0.1:8000` |
| Codex | `PORT=3001 npm run dev` | `127.0.0.1:8001` si levanta el suyo |

### Backend — `D:/PERSONAL_JEAN/Backend-Sass`

| Agente | `DB_DATABASE` | `TENANCY_DB_PREFIX` | `artisan serve` |
|---|---|---|---|
| Claude | `saas_central_testing` | `tenant_` (por defecto) | 8000 |
| Codex | `saas_central_testing_codex` | `tcodex_` | 8001 |

```bash
# PHP: el de Laragon por ruta absoluta; `php` a secas es otro
PHP="C:/laragon/bin/php/php-8.3.33-nts-Win32-vs16-x64/php.exe"

# Codex, dentro de su worktree:
DB_DATABASE=saas_central_testing_codex TENANCY_DB_PREFIX=tcodex_ $PHP artisan test
```

Un solo `queue:work` y un solo `schedule:work` en la máquina: si los dos los
necesitan, se turnan.

### La regla que ya casi costó trabajo

**`git` solo en el repo en el que estás.** El 2026-08-22 las dos sesiones
escribieron sobre el mismo repositorio y no se perdió trabajo de milagro. Está
en las dos `AGENTS.md` como regla 1.

---

## 5. Cómo se trabaja una historia

Igual en los dos repos:

```
bmad-build «Story 1.11»      → la implementa en su rama
bmad-code-review             → antes de mergear
bmad-retrospective           → al cerrar una épica
```

- **Una rama por historia**, salida de `main`: `sprint-1/1-11-mi-perfil`.
  Merge con `--no-ff`, para que cada historia sea revertible de un tirón.
- **Al terminar**, actualizar el estado de **esa** historia en
  `sprint-status.yaml` y nada más. No se toca el estado de historias ajenas.
- `npm run typecheck` (frontend) o la suite Pest (backend) en verde **antes**
  de cerrar.
- Un módulo entra en `NEXT_PUBLIC_MODULOS_CONECTADOS` **cuando su historia se
  cierra**, no antes.

### Para ver el estado sin abrir el YAML a mano

```
bmad                     → qué hacer ahora / qué sigue
bmad-sprint-planning     → «show sprint status» o validar el archivo de estado
```

El vocabulario de estado de BMAD es: `backlog` → `ready-for-dev` →
`in-progress` → `review` → `done`.

---

## 6. Sprint 1 al detalle

Son **10 de las 15 historias de la Épica 1**. Las otras cinco (1.8, 1.10, 1.12,
1.13 y 1.15) están en la épica pero **fuera de este sprint**.

| Historia | Agente | Repo | Orden |
|---|---|---|---|
| **1.1** Un profesional no agenda a nombre de otro | claude | Backend | primera — `CitaService` |
| **1.2** Las citas no salen del alcance de sedes | claude | Backend | después de 1.1 (mismo archivo) |
| **1.3** No se pueden agendar citas imposibles | claude | Backend | después de 1.2 (mismo archivo) |
| **1.4** Nadie concede lo que no tiene | claude | Backend | libre |
| **1.5** Un rol de Recepción listo para usar | claude | Backend | libre |
| **1.6** Un permiso propio para los pagos | claude | Backend | libre |
| **1.7** Quien puede agendar, puede abrir el formulario | claude | Backend + contrato | libre |
| **1.9** Todos los errores en español | claude | Backend | libre |
| **1.11** Mi perfil deja de ser una maqueta | **codex** | Frontend | **desde el día 1** |
| **1.14** Los grupos dejan de estorbar | **codex** | Frontend | **desde el día 1** |
| *(3.1)* El código de la cita, a mano | codex | Frontend | **en espera**: necesita backend |

### Los cuatro huecos que cierra

| | Historia | Qué cierra |
|---|---|---|
| **G-1** | 1.1 | un profesional agenda o reasigna citas de un compañero |
| **G-2** | 1.2 | crear o mover citas a una sede fuera de su alcance |
| **G-3** | 1.3 | citas imposibles: profesional inactivo, no habilitado en la sede, o que no presta el servicio |
| **G-4** | 1.4 | `POST /profesionales` crea cuentas con más permisos y alcance que el actor |

Tres de estas historias salieron de traspasos que yo reporté el 2026-09-06:
**1.7** (un rol con `citas: gestionar` no podía abrir el formulario), **1.9**
(los 422 en inglés) y **1.12** (el onboarding que no se marcaba solo).

---

## 7. Las 62 historias, con su estado y su responsable

`claude` y `codex` a secas son de un solo repo. **`claude + codex` y
`codex + claude` tocan los dos**, y el orden de la etiqueta es el orden del
trabajo: primero el que aparece primero, nunca los dos a la vez.

### Épica 1 — Cada persona ve y hace exactamente lo suyo

| Historia | Estado | Responsable | |
|---|---|---|---|
| **1.1** Un profesional no agenda a nombre de otro | `in-progress` | claude | **Sprint 1** |
| **1.2** Las citas no salen del alcance de sedes | `backlog` | claude | **Sprint 1** |
| **1.3** No se pueden agendar citas imposibles | `backlog` | claude | **Sprint 1** |
| **1.4** Nadie concede lo que no tiene | `backlog` | claude | **Sprint 1** |
| **1.5** Un rol de Recepción listo para usar | `backlog` | claude | **Sprint 1** |
| **1.6** Un permiso propio para los pagos | `backlog` | claude | **Sprint 1** |
| **1.7** Quien puede agendar, puede abrir el formulario | `backlog` | claude | **Sprint 1** |
| **1.8** El alcance por sedes también en los profesionales | `backlog` | claude |  |
| **1.9** Todos los errores en español | `backlog` | claude | **Sprint 1** |
| **1.10** Ningún selector pierde opciones en silencio | `backlog` | codex + claude |  |
| **1.11** Mi perfil deja de ser una maqueta | `backlog` | codex | **Sprint 1** |
| **1.12** El onboarding se marca solo | `backlog` | claude |  |
| **1.13** Cada cita dice de dónde vino y quién la registró | `backlog` | claude |  |
| **1.14** Los grupos dejan de estorbar | `backlog` | codex | **Sprint 1** |
| **1.15** El anti-solape aguanta dos reservas a la vez | `backlog` | claude |  |

### Épica 2 — Cada sede ofrece lo que de verdad ofrece

| Historia | Estado | Responsable | |
|---|---|---|---|
| **2.1** Elegir qué servicios se ofrecen en cada sede | `backlog` | claude |  |
| **2.2** Una sola regla decide si algo es reservable | `backlog` | claude |  |
| **2.3** Un servicio sin quién lo preste se ve venir | `backlog` | codex + claude |  |

### Épica 3 — El día de trabajo se ve de un vistazo

| Historia | Estado | Responsable | |
|---|---|---|---|
| **3.1** El código de la cita, a mano | `backlog` | codex |  |
| **3.2** El calendario del día por profesional | `backlog` | codex |  |
| **3.3** Un tablero que dice la verdad | `backlog` | codex + claude |  |

### Épica 4 — Nadie se entera tarde de nada

| Historia | Estado | Responsable | |
|---|---|---|---|
| **4.1** Un solo camino para avisar, con registro de lo enviado | `backlog` | claude |  |
| **4.2** Correos que parecen del negocio y están en español | `backlog` | claude |  |
| **4.3** Saber si el correo llegó | `backlog` | claude |  |
| **4.4** Los recordatorios salen a su hora y se reprograman solos | `backlog` | claude |  |
| **4.5** Cada aviso llega a quien le toca | `backlog` | claude |  |
| **4.6** El negocio decide qué avisa y cada quien qué recibe | `backlog` | codex + claude |  |
| **4.7** La cuota de correos no corta lo importante | `backlog` | claude |  |
| **4.8** Un aviso por WhatsApp cuando algo necesita atención | `backlog` | claude |  |

### Épica 5 — El negocio se ve como su negocio

| Historia | Estado | Responsable | |
|---|---|---|---|
| **5.1** La marca del negocio, en todos los planes | `backlog` | codex + claude |  |
| **5.2** Las imágenes se guardan bien o no se guardan | `backlog` | claude |  |
| **5.3** Ver cómo queda antes de que lo vea nadie | `backlog` | codex |  |
| **5.4** Las sedes dejan de tener identidad propia | `backlog` | claude + codex |  |

### Épica 6 — Los clientes reservan solos, de verdad

| Historia | Estado | Responsable | |
|---|---|---|---|
| **6.1** Cada negocio tiene su dirección pública | `backlog` | claude |  |
| **6.2** Cada sede tiene su propio enlace | `backlog` | claude + codex |  |
| **6.3** El catálogo que ve el cliente | `backlog` | codex + claude |  |
| **6.4** Los huecos que ve el cliente son los de verdad | `backlog` | claude |  |
| **6.5** Elegir y revisar antes de dar mis datos | `backlog` | codex + claude |  |
| **6.6** Reservar dejando mis datos | `backlog` | claude + codex |  |
| **6.7** Confirmar la reserva desde el correo | `backlog` | claude |  |
| **6.8** Gestionar mi cita desde un enlace seguro | `backlog` | claude + codex |  |
| **6.9** El negocio pone sus reglas de cambio | `backlog` | claude + codex |  |
| **6.10** La puerta pública aguanta el ruido | `backlog` | claude |  |
| **6.11** Cuando la tienda no está disponible, se dice | `backlog` | codex + claude |  |

### Épica 7 — Cobrar por adelantado con Yape

| Historia | Estado | Responsable | |
|---|---|---|---|
| **7.1** Configurar el cobro por QR | `backlog` | claude + codex |  |
| **7.2** Pagar al reservar | `backlog` | codex + claude |  |
| **7.3** Subir el comprobante sin tener cuenta | `backlog` | claude |  |
| **7.4** Verificar un pago en dos clics | `backlog` | claude + codex |  |
| **7.5** La reserva impaga no bloquea el hueco para siempre | `backlog` | claude |  |
| **7.6** Cambios y devoluciones cuando ya hay dinero de por medio | `backlog` | claude |  |

### Épica 8 — Cobrar la suscripción sin tocar la base de datos

| Historia | Estado | Responsable | |
|---|---|---|---|
| **8.1** Un único camino aplica los cambios de plan | `backlog` | claude |  |
| **8.2** Avisar antes de cortar | `backlog` | claude |  |
| **8.3** Mi Plan, en el panel del negocio | `backlog` | codex + claude |  |
| **8.4** Entrar al panel de plataforma | `backlog` | claude |  |
| **8.5** La ficha de un negocio, con todo lo que hace falta | `backlog` | codex + claude |  |
| **8.6** El ciclo de vida corre solo cada día | `backlog` | claude |  |

### Épica 9 — Abrir la puerta al público

| Historia | Estado | Responsable | |
|---|---|---|---|
| **9.1** Una landing que explica y convierte | `backlog` | codex |  |
| **9.2** Términos, privacidad y los derechos del cliente | `backlog` | claude + codex |  |
| **9.3** Ninguna pantalla miente | `backlog` | codex + claude |  |
| **9.4** Los primeros pasos, explicados | `backlog` | codex |  |
| **9.5** Producción de verdad, con copias que se restauran | `backlog` | claude |  |
| **9.6** Un piloto antes de abrir del todo | `backlog` | claude |  |

---

## 8. Lo que no se hace

1. **`git` en el otro repo.** Nunca.
2. **`Backend-Sass/docs/discrepancias.md` está congelado.**
3. **Contrato primero**: si una historia cambia la forma de los datos, se
   acuerda en `docs/api-contract.md` **antes** de tocar un componente.
4. **Si la API no encaja con lo que la pantalla espera, no se tapa con un
   adaptador en el cliente**: se anota como traspaso FE → BE en
   `docs/estado.md` con fecha.
5. **Esconder una opción del menú no es autorización**: el backend responde 403
   igual.
6. **Nada de datos ficticios en producción**: un módulo conectado no deja rama
   mock viva.
7. **Todo el texto en español**, incluidos los errores.

**Jerarquía ante conflicto:** PRD de BMAD → `discrepancias.md` (congelado) →
`api-contract.md` → las fichas de `docs/vistas/`.
