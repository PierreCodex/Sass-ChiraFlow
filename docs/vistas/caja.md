# Caja

**Ruta:** `/caja`
**Estado:** ✅ Campos validados contra el código Laravel (`feat/planes-suscripcion`)
· ⚠️ Modelo de datos corregido a propósito — ver "Divergencias"
**Archivos:**
- `web/src/app/(dashboard)/caja/page.tsx`
- `web/src/features/caja/`

**Fuente en la app actual:**
- `app/Http/Controllers/Admin/CajaController.php`
- `database/migrations/2026_07_24_000007_create_caja_tables.php`
- `resources/views/admin/caja/index.blade.php`

---

## Qué muestra

La pantalla tiene **tres estados** según en qué punto del día esté la caja.
No es una tabla con un formulario: es una máquina de estados.

### 1. Sin abrir

No existe caja para hoy. Ocupa la pantalla entera una tarjeta vacía con
icono, la fecha en largo y un único botón grande: **Abrir caja**.

> La caja de hoy todavía no está abierta
> *miércoles, 12 de agosto de 2026.* Abre caja con el efectivo inicial para
> empezar a registrar movimientos.
> `[Abrir caja]`

No se muestra nada más: sin caja abierta no hay movimientos que listar y el
backend rechaza registrarlos.

### 2. Abierta

Cuatro tarjetas de cifra + tabla de movimientos del día, con dos acciones en
la cabecera de la tabla: **Nuevo movimiento** y **Cerrar caja**.

| Tarjeta | Valor | Detalle |
|---|---|---|
| Saldo inicial | `monto_inicial` | "Apertura de Ana Torres" |
| Ingresos | `ingresos` | verde |
| Egresos | `egresos` | rojo |
| **Saldo esperado** | `inicial + ingresos − egresos` | "Inicial + ingresos − egresos" |

### 3. Cerrada

Igual que la anterior, pero:

- Arriba aparece un Alert con el resultado del arqueo.
- La cuarta tarjeta cambia a **Monto contado**, con "Esperado S/ 435.00"
  debajo.
- **Desaparecen los botones** de nuevo movimiento y cerrar caja: la tabla
  queda de solo lectura.

> 🔒 **Caja cerrada**
> Cerrada a las 02:36. Se contaron **S/ 420.00** frente a **S/ 435.00**
> esperados: faltan S/ 15.00.

El Alert es verde si el arqueo cuadra y naranja si hay descuadre.

### Tabla de movimientos

Sin paginar — son los de una sola jornada, igual que en la app actual.

| Columna | Contenido |
|---|---|
| Hora | `creado_en` en 24h |
| Tipo | Chip verde "Ingreso" / rojo "Egreso" |
| Concepto | Texto |
| Registrado por | Usuario que lo registró |
| Monto | `+ S/ 90.00` en verde / `− S/ 45.00` en rojo |

Vacío: *"No hay movimientos registrados hoy."*

---

## Endpoints

### `GET /api/caja`

Un solo endpoint devuelve todo el estado de la pantalla. No tiene sentido
pedir los movimientos por separado: sin sesión no hay movimientos.

```json
{
  "data": {
    "fecha": "2026-08-12",
    "sesion": {
      "id": 1,
      "fecha": "2026-08-12",
      "monto_inicial": 150,
      "ingresos": 430,
      "egresos": 85,
      "monto_final": null,
      "abierta_por": "Ana Torres",
      "abierta_en": "2026-08-12T08:45:00",
      "cerrada_en": null
    },
    "movimientos": [
      {
        "id": 1,
        "tipo": "ingreso",
        "monto": 90,
        "concepto": "Limpieza dental — Lucía Ramos",
        "fecha": "2026-08-12",
        "creado_en": "2026-08-12T09:20:00",
        "usuario": "Ana Torres"
      }
    ]
  }
}
```

**`sesion: null`** = todavía no se ha abierto caja hoy.
**`monto_final: null`** = la caja sigue abierta.

### `POST /api/caja/abrir`

```json
{ "monto_inicial": 150 }
```

| Campo | Reglas |
|---|---|
| `monto_inicial` | requerido, numérico, ≥ 0 |

Devuelve la sesión creada.

### `POST /api/caja/movimientos`

```json
{ "tipo": "egreso", "monto": 60, "concepto": "Pago de recibo de luz" }
```

| Campo | Reglas |
|---|---|
| `tipo` | requerido, `ingreso` \| `egreso` |
| `monto` | requerido, numérico, ≥ 0.01 |
| `concepto` | requerido, string, máx. 150 |

Si no hay caja abierta el backend responde error. El frontend ni siquiera
muestra el botón en ese caso, pero conviene que la API lo valide igual.

Debería devolver el **movimiento creado**; la pantalla refresca el estado
completo después.

### `POST /api/caja/cerrar`

```json
{ "monto_final": 420 }
```

| Campo | Reglas |
|---|---|
| `monto_final` | requerido, numérico, ≥ 0 |

Devuelve la sesión con `monto_final` y `cerrada_en` rellenos.

---

## Divergencias con el backend actual

Este es el módulo donde más me he separado del código existente, porque el
modelo actual **pierde información**. Todo lo de abajo hay que decidirlo
antes de conectar.

### 1. `saldo` se sobrescribe al cerrar

`caja_cierres` tiene un solo campo `saldo`. `CajaController::abrir` guarda
ahí el monto inicial, y `cerrar` hace:

```php
$cierre->update(['saldo' => $datos['monto_final']]);
```

Es decir, **al cerrar se pierde con cuánto se abrió**. Y como la vista calcula
`$saldoCalculado = $cierre->saldo + $cierre->ingresos - $cierre->egresos`,
después de cerrar esa cifra pasa a ser un número sin sentido (monto contado +
ingresos − egresos).

**Propuesta:** dos columnas, `monto_inicial` y `monto_final` (nullable). Es
una migración de dos líneas y arregla también los dos puntos siguientes.

### 2. No se sabe si la caja está abierta o cerrada

Con un solo campo `saldo` no hay forma de distinguir "abierta con S/ 420" de
"cerrada contando S/ 420". Hoy, después de cerrar, se pueden seguir
registrando movimientos como si nada.

Con `monto_final` nullable, `null` significa abierta y la UI ya oculta las
acciones.

### 3. La diferencia del arqueo no se calcula

El propio Blade promete: *"El sistema calcula la diferencia respecto al saldo
esperado."* Pero nada la calcula ni la guarda.

Aquí sí: `diferenciaArqueo()` (`web/src/features/caja/types.ts`) devuelve
`contado − esperado`, se muestra en vivo mientras escribes en el modal de
cierre y queda en el banner de caja cerrada.

Se calcula en el frontend a partir de los cuatro montos, así que **no hace
falta guardarla**. Pero si quieres reportes de descuadres históricos, sí
conviene una columna `diferencia`.

### 4. `caja_movimientos.tipo` tiene cuatro valores, el controlador acepta dos

La migración declara `enum('tipo', ['ingreso', 'egreso', 'adelanto', 'gasto'])`
pero `movimiento()` valida `in:ingreso,egreso`. **`adelanto` y `gasto` no se
usan en ninguna parte.**

Aquí solo están los dos que funcionan. Si `adelanto` es el adelanto de sueldo
de un empleado (encajaría con el módulo de Empleados, que ya tiene comisión y
sueldo), habría que decidir si es un tipo de movimiento o una categoría de
egreso — porque además existe la columna `categoria`, también sin uso.

### 5. `categoria` no se usa

`caja_movimientos.categoria` (string 100, nullable) no se valida, no se
guarda ni se muestra. Es el sitio natural para clasificar egresos (insumos,
servicios, sueldos) si quieres reportes por rubro. No lo he puesto en el
formulario por no inventar la lista de categorías.

### 6. `concepto` vs `descripcion`

El formulario envía `concepto`, el controlador lo guarda en la columna
`descripcion`. Mantengo `concepto` en la API porque es como se llama en la
UI, pero hay que tenerlo presente al mapear.

Ojo: `descripcion` es **nullable en la BD** pero **requerido en el
controlador**. Aquí es obligatorio, siguiendo al controlador.

---

## Campos

### `caja_cierres` (sesión)

| Campo | Tipo | Confirmado | Notas |
|---|---|---|---|
| `id` | int | ✅ | |
| `fecha` | date | ✅ | Único por negocio + fecha |
| `ingresos` | decimal(10,2) | ✅ | Acumulado, `increment()` por movimiento |
| `egresos` | decimal(10,2) | ✅ | Ídem |
| `saldo` | decimal(10,2) | ⚠️ | **Propongo partirlo** en `monto_inicial` + `monto_final` |
| `user_id` | int | ✅ | Quién abrió (aquí `abierta_por`) |
| `monto_final` | decimal \| null | 🆕 | No existe todavía |
| `cerrada_en` | datetime \| null | 🆕 | No existe todavía |

### `caja_movimientos`

| Campo | Tipo | Confirmado | Notas |
|---|---|---|---|
| `id` | int | ✅ | |
| `tipo` | enum | ⚠️ | 4 en la BD, 2 en uso |
| `categoria` | string(100) \| null | ⚠️ | Sin uso |
| `monto` | decimal(10,2) | ✅ | |
| `descripcion` | string(255) \| null | ✅ | Es el `concepto` de la UI |
| `fecha` | date | ✅ | Indexado con `negocio_id` |
| `user_id` | int | ✅ | Aquí `usuario` |
| `created_at` | datetime | ✅ | La columna Hora sale de aquí |

---

## Modales

Los tres son `xs`: son formularios de uno a tres campos.

### Abrir caja — 444×274, sin scroll

Un solo campo, **Monto inicial** con prefijo `S/`. Subtítulo: *"Cuenta el
efectivo con el que empiezas el día."*

### Nuevo movimiento

| # | Campo | Control | Ancho |
|---|---|---|---|
| 1 | Tipo | Select (Ingreso / Egreso) | 7/12 |
| 2 | Monto | Número con `S/` | 5/12 |
| 3 | Concepto | Texto | 12/12 |

Subtítulo con el saldo esperado actual, y un Alert que se recalcula al
escribir:

> ℹ️ El saldo esperado quedará en S/ 435.00.

Si el egreso deja la caja en negativo, pasa a naranja:

> ⚠️ Este egreso deja la caja en S/ -20.00. Revisa el monto.

Es solo un aviso, no bloquea: puede haber egresos legítimos que descuadren y
se corrijan en el arqueo.

### Cerrar caja

Arriba, el saldo esperado en grande. Debajo, **Monto final contado**, que
**arranca vacío a propósito** — el usuario tiene que contar el cajón, no
confirmar una cifra que le damos hecha. Mientras está vacío no se muestra
ninguna diferencia.

Al escribir aparece el arqueo:

| Caso | Alert |
|---|---|
| Cuadra | ✅ "El conteo cuadra con el saldo esperado." |
| Sobra | ⚠️ "Sobran S/ 15.00 respecto a lo esperado." |
| Falta | ⚠️ "Faltan S/ 15.00 respecto a lo esperado." |

Y una nota al pie: *"Al cerrar ya no se pueden registrar más movimientos del
día."* El botón de confirmar es rojo.

---

## Diferencias con la app actual

| Elemento | En tu app | Aquí |
|---|---|---|
| Abrir caja | Formulario suelto en la pantalla | Estado vacío dedicado + modal |
| Nuevo movimiento | Formulario fijo en una tarjeta, siempre visible | Modal desde un botón |
| Cerrar caja | Formulario fijo en otra tarjeta, siempre visible | Modal con arqueo en vivo |
| Estado cerrado | No existe: se puede seguir moviendo | Acciones ocultas + banner de arqueo |
| Diferencia del arqueo | Prometida en el texto, no implementada | Calculada y mostrada |
| Saldo inicial tras cerrar | Se pierde | Se conserva |
| Columna "Registrado por" | No está (aunque se guarda `user_id`) | Sí |
| Hora | `H:i` | Igual, 24h |
| Moneda | `$` fijo | `formatMoneda` → `S/` |

El cambio de fondo es el mismo que en Inventario: sacar los formularios de la
pantalla y meterlos en modales. Aquí además ordena la lectura, porque con los
tres formularios visibles a la vez no se distingue qué acción toca.

> Nota: `formatHora` ahora fuerza 24h (`hour12: false`). Con `es-PE` el
> formato por defecto era "02:33 p. m.", que chocaba con los horarios de
> trabajo y las citas, que se manejan en 24h en todo el sistema.

---

## Pendiente

- [ ] **Partir `saldo` en `monto_inicial` + `monto_final`** (migración)
- [ ] Añadir `cerrada_en`, o deducir el estado de `monto_final`
- [ ] Impedir movimientos con la caja cerrada (validación en backend)
- [ ] ¿Qué son `adelanto` y `gasto`? ¿Se usan o se quitan del enum?
- [ ] ¿Se usa `categoria`? Si sí, ¿con qué lista de valores?
- [ ] ¿Guardar la diferencia del arqueo para reportes históricos?
- [ ] ¿Historial de cajas de días anteriores? Hoy solo se ve la del día
- [ ] ¿Las citas completadas generan un ingreso automático en caja?
