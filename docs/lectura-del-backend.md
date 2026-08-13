# Qué es este producto, leyendo el Laravel

Notas tras revisar el repo `SAAS_LINEA_BIEN` (rama `feat/planes-suscripcion`)
módulo a módulo mientras se maquetaba el frontend. No es una auditoría: es lo
que se entiende que el proyecto quería ser, qué está bien planteado y dónde se
quedó a medias.

Útil sobre todo ahora, que la base de datos se va a rehacer.

---

## 1. Qué es

Un **SaaS vertical de reservas** para negocios que venden tiempo de personas:
clínicas, salones, barberías, centros de estética. Mercado peruano (soles,
DNI, WhatsApp como canal principal).

El modelo es de **multi-inquilino con tienda pública**: cada negocio que se
registra obtiene un panel de gestión y, en el mismo acto, una tienda en su
propio subdominio donde sus clientes reservan solos.

Es, en esencia, un **Fresha / Booksy** para LatAm.

La pieza que lo confirma: al registrarse no se crea solo una cuenta. Se crea
el negocio con su `slug`, el usuario dueño y un **"Local 1"**, y se arranca
una prueba de 14 días. El producto asume desde el minuto uno que un negocio
= una tienda pública viva.

---

## 2. Lo que está bien pensado

Conviene decirlo antes que los problemas, porque hay decisiones sólidas que
merecen sobrevivir al rediseño.

### Multi-inquilino consistente

`negocio_id` en todas las tablas y un trait `BelongsToNegocio` que lo aplica.
No hay ni una tabla que se escape. Es lo más difícil de arreglar después y
está bien desde el principio.

### Planes por *features*, no por niveles

En vez de comprobar "¿es premium?", cada plan tiene un array `features` y
existe un middleware `EnsurePlanFeature`. Eso permite mover una funcionalidad
de plan sin tocar código, y vender extras sueltos.

Es el patrón correcto y mucha gente con más recursos no lo hace.

### Límites como datos

`max_profesionales`, `max_sucursales`, `max_whatsapp_mes`,
`precio_profesional_extra`… todo en la tabla `planes`. Se pueden ajustar
precios y cupos sin desplegar.

### La capa de soporte es sorprendentemente madura

Hay un rol `soporte` con su propio panel, y sobre todo una tabla
`soporte_acciones` que guarda **acción, modelo afectado, datos anteriores,
datos nuevos e IP**. Eso es una auditoría de verdad.

Además hay alertas de seguridad con confirmación/rechazo por enlace de correo
y un "modo edición protegido" para el superadmin.

Alguien pensó en el día en que un agente de soporte toque los datos de un
cliente y haya que responder por ello. No es habitual verlo en un MVP.

### La reserva pública está completa

Carrito de varios servicios, dos modalidades de agenda (todo seguido o cada
servicio por su lado), huecos calculados desde el horario real del
profesional, y creación de las citas con `fuente = 'publica'`. Funciona de
punta a punta.

---

## 3. Los patrones que revelan la intención

Leyendo el esquema se ve a dónde apuntaba, aunque el código aún no llegue:

| Señal en la BD | Hacia dónde iba |
|---|---|
| `local_profesional` con `nombre_publico`, `perfil`, `horario` | Cada profesional con identidad propia por sede, de cara al público |
| `grupos` + `grupo_local` + `grupo_profesional` + `grupo_servicio` | Agrupar por especialidad o turno, probablemente para filtrar la tienda |
| `caja_movimientos.tipo` con `adelanto` y `gasto` | Adelantos de sueldo y gastos, ligado a la comisión de los profesionales |
| `caja_movimientos.categoria` | Reportes de gasto por rubro |
| `notificaciones` | Avisos en la app, más allá del correo |
| `plantilla_whatsapps` con 9 eventos | Automatizar todo el ciclo: bienvenida, pago, cumpleaños, redes |
| `planes.precio_anual` | Cobro anual con descuento |
| `dominio_personalizado` en el plan Pro | Marca blanca completa |
| `encuesta_satisfaccion` en Premium | Reseñas / NPS |

**Nada de eso está implementado.** Son columnas y claves puestas "para
después". Lo cual está bien —es más barato añadir la columna al principio—
pero conviene no confundir esquema con producto.

---

## 4. Dónde se quedó a medias, y el patrón

Encontré unas quince cosas incompletas. Lo interesante no es la lista, es que
**todas fallan igual**: cada módulo tiene su camino feliz y se detiene justo
antes del segundo caso.

| Módulo | Funciona | Se detiene en |
|---|---|---|
| Inventario | Crear, borrar, mover stock | **No existe editar** un producto |
| Caja | Abrir, mover, cerrar | Cerrar **pisa** el saldo inicial; no se sabe si está abierta; la diferencia se promete y no se calcula |
| WhatsApp | 9 eventos configurables | Solo 4 se disparan; el consumo no se cuenta contra el cupo del plan |
| Mi Plan | Selección, extras, totales | El botón dice "Pagar" y **abre un ticket** |
| Grupos | CRUD completo | **Nadie los consulta** |
| Reportes | 6 métricas y 3 gráficas | `$totales` duplicado; ocupación con capacidad irreal |
| Locales | Sedes y profesionales | La pestaña "Servicios" no filtra por sede: no hay `local_servicio` |
| Soporte | Tickets y respuesta | Un solo turno: no hay conversación |
| Registro | Crea negocio, usuario y local | Busca un plan `profesional` **que no existe** |

Ninguno es un error de programación: son decisiones aplazadas. Es exactamente
lo que pasa cuando una persona construye a lo ancho contra reloj — y por eso
la mitad de las columnas "para después" siguen vacías.

**Para el rediseño esto importa** porque marca qué se puede tirar sin miedo:
si nada consume `grupos` y nadie ha pedido esa función, no hace falta migrarla.

---

## 5. La deuda estructural que sí conviene arreglar ahora

Estas cuatro son de esquema. Son las que duelen si se arrastran.

### 5.1 El "local principal" es un fantasma

Un negocio tiene su `direccion`, `telefono` y horario en `negocios`. Pero
**también** existe la tabla `locales`, y hay una migración
(`backfill_locales_principales`) que crea un "Local 1" por negocio.

Resultado: la sede principal existe **dos veces**. Y se nota en la interfaz —
el "Local 1" se edita desde **Configuración**, y los demás desde **Locales**.
Dos formularios distintos para lo mismo.

**Recomendación:** que `negocios` no tenga dirección ni horario. Un negocio es
la cuenta; **todas** las sedes viven en `locales`, incluida la primera. Es un
cambio pequeño ahora e imposible dentro de un año.

### 5.2 Los límites del plan no se aplican de verdad

`max_profesionales` se comprueba al crear un empleado. `max_sucursales` se
comprueba en otro sitio, de otra manera. `max_whatsapp_mes` **no se comprueba
en ninguna parte**: no hay ni tabla de mensajes enviados.

**Recomendación:** un único servicio de cuotas —`Cuotas::disponible($negocio,
'profesionales')`— que sume plan + extras contratados y sea el único que
responda. Hoy la lógica está repartida y los extras que se pagan no suben
ningún cupo automáticamente.

### 5.3 La disponibilidad solo existe para el público

`generarHorarios` es un **método privado dentro de
`Publico\ReservaController`**, y está ahí una sola vez. El problema no es que
esté duplicado: es que **el panel de administración no lo usa**.

`Admin\CitaController::store` valida `hora_inicio` con `date_format:H:i` y
nada más. No comprueba si el profesional trabaja ese día, si está en su
descanso, ni si ya tiene otra cita a esa hora.

Consecuencia concreta: un cliente **no puede** reservar fuera de horario desde
la tienda, pero la recepcionista **sí** puede crear una cita solapada desde el
panel, y nada avisa. Las dos citas acaban en el mismo calendario.

**Recomendación:** un servicio único —`Disponibilidad::huecos($profesional,
$fecha, $duracion)`— que usen la tienda **y** el panel, con tests. Es el
corazón del producto: si falla, se duplican reservas.

Además hoy ignora `local_profesional.horario`, así que el horario por sede que
sí se puede configurar no afecta a nada.

> En la maqueta esto ya está resuelto del lado del cliente: el motor está en
> `web/src/features/calendario/disponibilidad.ts` y lo usan el calendario, el
> formulario de citas del panel y la tienda pública. Sirve como especificación
> de lo que debería hacer el backend.

### 5.4 No hay ciclo de vida de suscripción

Hay `estado` (prueba, activa, vencida, suspendida) y
`suscripcion_vence_el`, pero **nada los mueve solos**. No hay cobro, ni
renovación, ni aviso previo, ni periodo de gracia, ni corte. Todo pasa por que
alguien lea un ticket.

**Es el agujero más grande del producto.** Funciona con 5 clientes y se rompe
con 30.

---

## 6. Por dónde empezaría

Ordenado por lo que más duele si falta, no por dificultad:

1. **Cobro y ciclo de suscripción.** Pasarela + estados automáticos + avisos.
   Sin esto no hay negocio, solo software.
2. **Servicio de disponibilidad con tests.** Es donde se pierde la confianza
   del cliente final.
3. **Servicio de cuotas único.** Que lo que se paga se refleje solo.
4. **Unificar sedes** (5.1) antes de que haya datos que migrar.
5. **Contador de WhatsApp.** Se está vendiendo un cupo que nadie mide.
6. **Reseñas.** Es lo que más convierte en la tienda pública y ya está
   maquetado; falta la tabla
   (ver [tienda-publica.md](vistas/tienda-publica.md)).
7. Cerrar los cabos sueltos del punto 4: editar producto, arreglar caja,
   quitar o justificar los grupos.

Y dos de higiene que cuestan una tarde:

- **Un seeder de planes**, en vez de cuatro migraciones que se pisan entre sí.
  Hoy los precios reales dependen de cuál corrió última.
- **Unificar la API**: paginar siempre, un solo nombre para el buscador
  (`search`, no `buscar`), y que los recursos devuelvan la misma forma.

---

## 7. Lo que no haría

- **Una landing por negocio.** Eso es un constructor de webs, otro producto.
  La tienda de reservas ya presenta el negocio y encima convierte.
- **Mantener `grupos`** si no aparece un uso claro.
- **Google Maps** en la tienda pública: se paga por carga y se multiplica por
  cada negocio y cada visita. El embed de OpenStreetMap no cuesta nada.
- **Perseguir features nuevas** antes del punto 1. El producto ya hace más de
  lo que cobra.
