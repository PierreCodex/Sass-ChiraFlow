# Plan del backend nuevo

Laravel **solo como API**. Sin Blade, sin vistas: el frontend es el Next que
se está maquetando. Del backend anterior se conserva la idea de negocio y
algunos patrones buenos; el resto se rehace.

---

## Lo que ya está decidido sin darse cuenta

**La maqueta es la especificación.** Las 17 fichas de [`vistas/`](vistas/)
documentan, endpoint a endpoint, el JSON que cada pantalla espera, con las
reglas de validación y los campos reales. No hay que diseñar la API: hay que
implementarla.

Eso invierte el orden habitual y es una ventaja: el contrato ya está probado
contra pantallas que funcionan.

---

## 1. La decisión que hay que tomar el primer día

### Dónde vive cada cosa, y qué dominio usa

Es lo más caro de cambiar después, porque afecta a las cookies de sesión.

El producto tiene tres superficies y **una de ellas es multi-inquilino por
subdominio**:

| Superficie | Quién entra | Autenticada |
|---|---|---|
| Panel | Dueño y empleados | Sí |
| API | — | Sí (panel) / No (tienda) |
| Tiendas `{slug}.…` | Cliente final, cualquiera | **No** |

Si el panel y las tiendas cuelgan del **mismo dominio registrable**, la cookie
de sesión (`SESSION_DOMAIN=.midominio.com`) viaja **a todas las tiendas**.
Hoy no pasa nada porque la tienda es nuestro propio React. Pero el plan Pro
promete `dominio_personalizado`, y en cuanto un inquilino pueda meter
contenido propio, un XSS en su tienda alcanza la sesión del panel de
**cualquier otro** negocio.

**Recomendación:** separar los dominios registrables desde el principio.

```
app.midominio.com      -> panel (Next)
api.midominio.com      -> Laravel
{slug}.otrodominio.pe  -> tiendas publicas
```

Con eso:

- La cookie de sesión del panel es del dominio del panel y de nadie más
- Las rutas de tienda son **públicas**: no necesitan cookie, solo `throttle`

Cambiar esto con clientes en producción significa migrar dominios y romper
enlaces que los negocios ya repartieron a sus clientes.

> **Decisión tomada.** Se separan los dominios. El motivo ya no es la cookie
> —con el BFF la sesión no se derrama, ver más abajo— sino el
> `dominio_personalizado` que promete el plan Pro.

### Autenticación

**Sanctum por tokens, detrás de un BFF en Next.** Decidido y ya montado en la
maqueta; sustituye al modo SPA con cookies que planteaba este documento.

```
navegador ──/api/*──> BFF (Next, servidor) ──Bearer──> Laravel
```

- El token **nunca toca el navegador**: vive en una cookie httpOnly que solo
  lee el BFF. Nada de `localStorage`, que con un XSS se lo lleva cualquiera.
- Laravel solo recibe tráfico del BFF: **no hace falta CORS**, ni
  `SANCTUM_STATEFUL_DOMAINS`, ni `SESSION_DOMAIN`, ni `statefulApi()`, ni
  `/sanctum/csrf-cookie`.
- Lo que tiene que implementar Laravel: `POST /login` → `{ data: { token,
  usuario } }` y `POST /logout` revocando **solo** el token en uso.
- El BFF manda `X-Tenant` con el id del negocio. Si se resuelve el inquilino
  desde el token, la cabecera sobra.

El contrato completo está en [`api-contract.md`](api-contract.md) § "Base y
transporte".

Las rutas públicas de la tienda no llevan autenticación de ningún tipo.

---

## 2. Qué conservar del backend anterior

No todo hay que tirarlo. Estas decisiones eran buenas:

| Patrón | Por qué conservarlo |
|---|---|
| `negocio_id` en **todas** las tablas | Multi-inquilino consistente; es lo más difícil de añadir después |
| **Planes por `features[]`**, no por niveles | Mover una función de plan sin tocar código |
| Límites como columnas del plan | Ajustar cupos y precios sin desplegar |
| **Auditoría de soporte** (acción, antes, después, IP) | Poder responder por lo que tocó un agente |
| `citas.fuente` | Saber qué canal trae las reservas |
| `cita_servicio` con cantidad/precio/duración | Reserva de varios servicios |
| `local_profesional` con nombre público y perfil | Identidad del profesional por sede |
| Resolución de negocio por subdominio | Ya está bien pensada, incluidos los subdominios reservados |

## 3. Qué no arrastrar

| Qué | Por qué |
|---|---|
| `grupos` + sus 3 pivotes | CRUD completo que **nadie consulta** |
| Sede principal duplicada | `negocios` con dirección/horario **y** un "Local 1" en `locales` |
| Las 4 migraciones que pisan los planes | Un **seeder** único |
| `adelanto` y `gasto` en el enum de caja | Declarados y sin usar |
| `caja_cierres.saldo` como campo único | Partir en `monto_inicial` + `monto_final` |
| Blade y todo `resources/views` | El frontend es Next |

---

## 4. Reglas de la API

Ya están en [README.md](README.md), pero las que más se incumplían:

- **Paginar siempre** lo que sea lista. Nada de `->get()` suelto.
- **Un solo nombre para buscar**: `search`. No `buscar`.
- **Una sola forma de respuesta**: `{ data: … }` y `{ data: […], meta: {…} }`.
- **Filtros como query params** (`?estado=abierto`), no rutas nuevas.
- **422 con `errors` por campo**, que es lo que la maqueta ya sabe pintar.
- **Los colores y etiquetas no son del backend.** El anterior mandaba
  `borderColor` en el JSON de reportes; eso es del frontend.

Cuando el contrato esté estable, generar **OpenAPI** y de ahí los tipos de
TypeScript. Así se acaba la doble validación: hoy las reglas están escritas
en el `validate()` de Laravel y otra vez en los esquemas yup, y ya se han
desincronizado.

---

## 5. Orden de construcción

Ordenado para llegar cuanto antes a algo **cobrable**, no a algo completo.

### Fase 1 — Núcleo

Negocios, usuarios y roles, autenticación, planes con seeder único.
Multi-inquilino resuelto de raíz.

Al terminar: se puede entrar al panel y ver datos propios.

### Fase 2 — Catálogo

Clientes, categorías, servicios, empleados con su horario, locales.

Al terminar: el negocio configura su operación.

### Fase 3 — Agenda

**Aquí va el servicio de disponibilidad, y va con tests desde el primer día.**

`Disponibilidad::huecos($profesional, $fecha, $duracion)` — uno solo, que usen
la tienda **y** el panel. En el backend anterior solo existía para la tienda,
y por eso desde el panel se podían crear citas solapadas.

La lógica ya está escrita y probada en
`web/src/features/calendario/disponibilidad.ts`: sirve de especificación.
Casos que los tests deben cubrir:

- Profesional sin horario propio → rige el del negocio
- Día no laborable → sin huecos
- Excepción no disponible → sin huecos, aunque sea día laborable
- Excepción disponible → **reemplaza** el horario de ese día
- Descansos parten la jornada
- Una cita existente bloquea su tramo
- El hueco debe caber **entero** antes del cierre
- Tras un descanso o una cita hay que ofrecer ese instante exacto, no esperar
  al siguiente múltiplo de la rejilla

### Fase 4 — Tienda pública

Endpoints sin autenticación, resolución por subdominio, reserva con carrito.

Al terminar: el negocio ya tiene algo que enseñar a sus clientes. **Es el
argumento de venta.**

### Fase 5 — Cobro

Suscripciones de verdad: pasarela, renovación, aviso previo, gracia y corte
automáticos.

**Laravel Cashier** resuelve casi todo esto. Es la razón principal por la que
Laravel gana aquí: en el backend anterior "Pagar" abría un ticket y alguien
activaba el plan a mano.

También aquí: el **servicio de cuotas** único —`Cuotas::disponible($negocio,
'profesionales')`— que sume plan + extras contratados y sea el único que
responda a "¿puede añadir otro?". Hoy esa lógica está repartida y los extras
que se pagan no suben ningún cupo.

### Fase 6 — Operación

Caja (con `monto_inicial`/`monto_final` bien separados), inventario **con
editar**, reportes.

### Fase 7 — Crecimiento

WhatsApp con **contador de consumo** contra el cupo, reseñas ligadas a
`cita_id`, soporte con auditoría.

---

## 6. Tablas nuevas que el anterior no tenía

Salen de huecos detectados al maquetar:

| Tabla | Para qué | Detalle |
|---|---|---|
| `resenas` | Valoraciones de la tienda | Esquema en [vistas/tienda-publica.md](vistas/tienda-publica.md) |
| `whatsapp_envios` | Medir el cupo del plan | Hoy se vende un límite que nadie cuenta |
| `suscripciones` / `pagos` | Historial de cobro | Sin esto no hay renovación automática |
| `local_servicio` | Qué servicios da cada sede | La pestaña existe y no filtra por nada |

Y una que **desaparece**: `negocios` deja de tener dirección, teléfono y
horario. Un negocio es la cuenta; **toda** sede vive en `locales`, incluida la
primera.

---

## 7. Lo que no haría todavía

- **Websockets / tiempo real.** Suena bien y no lo pide nadie aún.
- **Multi-idioma.** El mercado es uno.
- **Una landing por negocio.** La tienda ya presenta al negocio y encima
  convierte.
- **Features nuevas antes de la fase 5.** El producto ya hace más de lo que
  cobra; el problema no es que falten funciones.
