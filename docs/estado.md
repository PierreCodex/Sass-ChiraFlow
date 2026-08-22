# Estado — quién va por dónde

**Tablero único de las dos sesiones.** Vive aquí, en el repo del frontend,
junto al resto de la documentación; `backend-sass` lo lee por ruta absoluta
(`F:\PERSONAL_JEAN\mi-saas\docs\estado.md`).

El qué construir está en [`plan-sprints.md`](plan-sprints.md) y el cómo hablan
las dos partes en [`api-contract.md`](api-contract.md). Este archivo responde
solo a **qué está hecho y quién lo tiene en la mano ahora mismo**.

## Reglas

1. **Cada sesión edita solo su columna.** La sesión de backend toca la columna
   BACKEND y la sección "Sesión BACKEND"; la de frontend, las suyas. Así dos
   agentes escribiendo a la vez no se pisan.
2. **Se actualiza al cerrar un módulo, no al empezarlo.** Un módulo pasa a ✅
   cuando cumple la definición de terminado de `plan-sprints.md` §2.
3. **Lo que una sesión necesita de la otra va en Traspasos**, con fecha. Es el
   único sitio donde se piden cosas al otro lado.
4. `api-contract.md` sigue con su regla de siempre: **se edita solo desde este
   repo**; desde `backend-sass` se lee.

---

## Estado por módulo

| Módulo | Backend | Frontend |
|---|---|---|
| **0.A** Fundaciones (tenancy, migraciones, seeders) | ✅ 2026-08-15 | — |
| **0.B** Registro, verificación, login, recuperación | ✅ 2026-08-22 | ✅ 2026-08-22 |
| **0.B** Onboarding (checklist + paso 1) | ✅ 2026-08-22 | ⬜ **en curso** |
| Infraestructura FE: override de mocks por recurso | — | ⬜ |
| **1.A** Categorías | ⬜ | ⬜ |
| **1.B** Servicios | ⬜ | ⬜ |
| **1.C** Clientes | ⬜ | ⬜ |
| **2.A** Empleados | ⬜ | ⬜ |
| **2.B** Configuración | ⬜ | ⬜ |
| **3.A** Locales (4 pestañas) | ⬜ | ⬜ |
| **3.B** Inventario | ⬜ | ⬜ |
| **4.A** Servicio de disponibilidad | ⬜ | — |
| **4.B** Citas | ⬜ | ⬜ |
| **4.C** Calendario | — | ⬜ |
| **5.A** Tienda pública | ⬜ | ⬜ |
| **5.B** Plantillas WhatsApp | ⬜ | ⬜ |
| **6.A** Caja | ⬜ | ⬜ |
| **6.B** Dashboard | ⬜ | ⬜ |
| **7.A** Reportes | ⬜ | ⬜ |
| **7.B** Soporte | ⬜ | ⬜ |
| **7.C** Mi Plan / Suscripción | ⬜ | ⬜ |
| **8** Lifecycle, landing y cierre | ⬜ | ⬜ |

✅ terminado · 🚧 en curso · ⬜ sin empezar · — no aplica a ese lado

Las 16 vistas del panel y la tienda pública **están maquetadas con mocks**
desde antes del Sprint 0: ⬜ en la columna frontend significa "sin conectar al
backend real", no "sin pantalla". Las excepciones, sin maquetar todavía, son
el **checklist de onboarding**, la **landing del SaaS** y el registro de
prueba.

---

## Sesión FRONTEND (repo `mi-saas`)

**Ahora:** checklist de onboarding — `features/onboarding/`, drawer lateral
cerrable en el layout del dashboard, progreso "1/6", y el modal del paso 1
(nombre del negocio con la URL de la tienda en vivo). Contra
`GET /onboarding`, `POST /onboarding/nombre` y
`PUT /onboarding/pasos/{clave}`, que ya están servidos.

**Después, por orden:**
1. Montar `useUsuarioActual` (`GET /user`) en el layout del panel: hoy el
   header sigue con el usuario de la plantilla.
2. Deshabilitar el enlace a la tienda mientras `slug` sea `NULL`.
3. Override de mocks por recurso (`plan-sprints.md` § Infraestructura
   frontend): `env.usarMocks` es global y apagarlo tumbaría los 14 módulos
   que aún no tienen backend. Es prerequisito para cerrar el Sprint 1.

**No toca:** nada dentro de `F:\PERSONAL_JEAN\backend-sass`.

---

## Sesión BACKEND (repo `backend-sass`)

**Hecho:** 0.A completo; 0.B completo — registro, verificación con firma,
login, recuperación, onboarding y el envío real de correo por Resend
encolado. 35 tests, 151 aserciones en verde (2026-08-22).

**Ahora:** Sprint 1 — Categorías, Servicios y Clientes.

**No toca:** `web/`, ni las fichas de `docs/vistas/`, ni `api-contract.md`
(se lee, no se edita).

---

## Traspasos

Lo que un lado espera del otro. Se borra la línea cuando se resuelve.

| Fecha | De → a | Qué |
|---|---|---|
| 2026-08-22 | FE → BE | La categoría **"Otro"** del seeder debería pedir un detalle libre (`tenants.categoria_otro_detalle`), pero `POST /register` no acepta ese campo: o se añade al contrato o se quita la columna |
| 2026-08-22 | FE → BE | Qué responde el login si el tenant está **suspendido** (§1.6): hoy entra igual que uno activo |

---

## Trampas de coordinación

- **Dos sesiones sobre el mismo repo se pisan.** El 2026-08-22 la sesión de
  frontend creó una rama en `backend-sass` y preparó el índice; la de backend
  commiteó encima sin saberlo. Salió bien de casualidad. Cada sesión hace
  `git` **solo en su repo**.
- **Un módulo no está cerrado hasta que su ficha de `vistas/` lo dice.** Es lo
  que mantiene la especificación cierta (`plan-sprints.md` §2 y §4).
