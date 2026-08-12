# Inventario

**Ruta:** `/inventario`
**Estado:** ✅ Campos validados contra el código Laravel (`feat/planes-suscripcion`)
**Archivos:**
- `web/src/app/(dashboard)/inventario/page.tsx`
- `web/src/features/inventario/`

**Fuente en la app actual:**
- `app/Http/Controllers/Admin/InventarioController.php`
- `database/migrations/2026_07_24_000008_create_inventario_tables.php`
- `resources/views/admin/inventario/index.blade.php`

---

## Qué muestra

Tabla de productos con su stock, el umbral mínimo y los dos precios. Botón
"Nuevo producto" en la cabecera y tres acciones por fila: registrar
movimiento, editar y eliminar.

### Columnas

| Columna | Contenido |
|---|---|
| Producto | Nombre en negrita + `descripcion` debajo en gris |
| Stock | Número grande + chip de aviso si toca el mínimo |
| Mínimo | `stock_minimo`, en gris |
| Compra | `formatMoneda(precio_compra)` → `S/ 11.00` |
| Venta | `formatMoneda(precio_venta)` en negrita |
| Acciones | Movimiento (flechas), Editar (lápiz), Eliminar (papelera) |

### El aviso de stock bajo

La app actual guarda `stock_minimo` en cada producto **pero no lo usa en
ninguna parte**: la tabla Blade ni siquiera lo muestra. Aquí sí se aprovecha:

| Condición | Qué se ve |
|---|---|
| `stock === 0` | Número en rojo + chip rojo "Agotado" |
| `stock <= stock_minimo` | Número en rojo + chip naranja "Stock bajo" |
| resto | Número normal |

El umbral vive en `stockBajo(producto)`
(`web/src/features/inventario/types.ts`), para que el dashboard o un futuro
panel de alertas usen exactamente el mismo criterio.

### Estados de la UI

| Estado | Qué se muestra |
|---|---|
| Cargando | 5 skeletons de fila |
| Vacío | "Todavía no has registrado productos." |
| Error | Alert rojo |

---

## Endpoints

### `GET /api/inventario`

Parámetros: `page`, `per_page`, `search` (filtra por nombre).

> ⚠️ En Laravel el parámetro se llama **`buscar`**, no `search`, y la
> paginación está fija en **15**. Al conectar hay que unificarlo con el resto
> de módulos (todos los demás usan `search` + `per_page`).

```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Enjuague bucal 500ml",
      "descripcion": "Sin alcohol, menta",
      "precio_compra": 11,
      "precio_venta": 18,
      "stock": 24,
      "stock_minimo": 5,
      "activo": true
    },
    {
      "id": 4,
      "nombre": "Protector bucal",
      "descripcion": null,
      "precio_compra": 25,
      "precio_venta": 45,
      "stock": 3,
      "stock_minimo": 5,
      "activo": true
    }
  ],
  "meta": { "current_page": 1, "per_page": 10, "total": 6, "last_page": 1 }
}
```

### `POST /api/inventario`

JSON plano (no hay archivos en este módulo).

```json
{
  "nombre": "Cera dental",
  "descripcion": "Caja de 12 unidades",
  "stock": 30,
  "stock_minimo": 5,
  "precio_compra": 4.5,
  "precio_venta": 9
}
```

Validación replicada tal cual del controlador:

| Campo | Reglas |
|---|---|
| `nombre` | requerido, string, máx. 150 |
| `descripcion` | opcional, string, máx. 255 |
| `stock` | requerido, entero, ≥ 0 |
| `stock_minimo` | requerido, entero, ≥ 0 |
| `precio_compra` | requerido, numérico, ≥ 0 |
| `precio_venta` | requerido, numérico, ≥ 0 |

### `PUT /api/inventario/{id}`

⚠️ **Este endpoint todavía no existe en Laravel.** El controlador solo tiene
`index`, `store`, `movimiento` y `destroy`: hoy un producto no se puede
editar, hay que borrarlo y volver a crearlo.

El frontend ya asume que existirá y usa el mismo cuerpo que `POST`, **menos
`stock`**: el stock solo se mueve por movimientos, nunca por edición directa
(en el formulario de edición el campo aparece deshabilitado con la ayuda
*"Se cambia con movimientos"*).

Hay que añadir el método `update` al backend con las mismas reglas que
`store`, ignorando `stock`.

### `POST /api/inventario/{id}/movimiento`

```json
{
  "tipo": "salida",
  "cantidad": 4,
  "motivo": "Venta en mostrador"
}
```

| Campo | Reglas |
|---|---|
| `tipo` | requerido, `entrada` \| `salida` |
| `cantidad` | requerido, entero, ≥ 1 |
| `motivo` | opcional, string, máx. 255 |

El backend crea la fila en `inventario_movimientos` (guardando `user_id`, o
sea quién lo registró) y recalcula `producto.stock`. La respuesta debería
devolver el **producto actualizado** para que la tabla se refresque sin pedir
el listado entero.

### `DELETE /api/inventario/{id}`

Responde 204. Existe la ruta en Laravel aunque la vista Blade no tenga botón.

---

## Campos

| Campo | Tipo | Confirmado | Notas |
|---|---|---|---|
| `id` | int | ✅ | |
| `nombre` | string(150) | ✅ | |
| `descripcion` | string(255) \| null | ✅ | |
| `precio_compra` | decimal(10,2) | ✅ | Por defecto 0 |
| `precio_venta` | decimal(10,2) | ✅ | Por defecto 0 |
| `stock` | int | ✅ | Por defecto 0. **Puede ser negativo** en la BD |
| `stock_minimo` | int | ✅ | Por defecto 5 |
| `activo` | bool | ⚠️ | Existe en la BD, **nadie lo usa** — ver abajo |

**No hay `sku`.** Lo había inventado cuando armé el tipo `Producto` para el
selector de productos de Citas; ya está corregido, igual que las referencias
en `CitaFormDialog.tsx` y `citas.api.ts`, que ahora leen `precio_venta`.

### `activo` — sin uso

La columna existe con `default(true)` pero el controlador no la valida, la
tabla no la filtra y el formulario no la toca. Aquí se envía `true` al crear y
no se muestra en ningún sitio. Si más adelante quieres archivar productos sin
borrarlos, ya está el campo.

### Movimientos: el historial no se ve

`inventario_movimientos` guarda tipo, cantidad, motivo, usuario y fecha, pero
**ni la app actual ni esta maqueta muestran ese historial**. Es la ampliación
natural del módulo: un panel lateral o un modal con los últimos movimientos
del producto. Pendiente de decidir.

---

## Formulario de producto

`web/src/features/inventario/components/ProductoFormDialog.tsx`

El mismo diálogo sirve para crear y editar. Diálogo `sm`, 600×480 sin scroll.

| # | Campo | Control | Ancho | Notas |
|---|---|---|---|---|
| 1 | Nombre | Texto | 12/12 | Autofocus |
| 2 | Descripción | Texto | 12/12 | |
| 3 | Stock | Número | 3/12 | **Deshabilitado al editar** |
| 4 | Mínimo | Número | 3/12 | Por defecto 5 |
| 5 | Compra | Número con prefijo `S/` | 3/12 | |
| 6 | Venta | Número con prefijo `S/` | 3/12 | |

Los cuatro numéricos van en una sola fila en escritorio y de dos en dos en
móvil (`{ xs: 6, sm: 3 }`).

Botones: **Agregar producto** / **Guardar cambios**, y **Cancelar**.

---

## Diálogo de movimiento

`web/src/features/inventario/components/MovimientoDialog.tsx`

Diálogo `xs` — es un formulario de tres campos, no necesita más.

El subtítulo recuerda el contexto: *"Enjuague bucal 500ml · stock actual 24"*.

| # | Campo | Control | Ancho |
|---|---|---|---|
| 1 | Tipo | Select (Entrada / Salida) | 7/12 |
| 2 | Cantidad | Número | 5/12 |
| 3 | Motivo | Texto | 12/12 |

### Vista previa del resultado

Debajo hay un Alert que se recalcula mientras escribes:

> ℹ️ El stock quedará en 20.

Y si la salida se pasa del stock disponible:

> ⚠️ La salida supera el stock disponible. Quedaría en 0.

**Diferencia con el backend:** Laravel hace la resta sin tope, así que un
producto **puede quedarse con stock negativo**. La maqueta corta en 0 y avisa.
Al conectar hay que decidir cuál gana:

- **Recomendado:** validar en el backend que una salida no supere el stock, y
  devolver 422. La UI ya sabe pintar errores de validación por campo.
- Si el negocio necesita permitir negativos (venta con stock desactualizado),
  entonces quito el tope del mock y dejo el aviso solo como informativo.

> Detalle de implementación: el input numérico devuelve **string**, y yup solo
> castea al enviar. La vista previa hace su propio `Number()` — sin eso el
> cálculo daba `NaN` y el Alert mostraba el stock sin cambios.

---

## Eliminar

`ConfirmDialog` compartido:

> **Eliminar producto**
> ¿Seguro que quieres eliminar **Enjuague bucal 500ml**? Se perderá también su
> historial de movimientos.
> `[Cancelar]` `[Eliminar]`

El aviso del historial es real: la migración pone `cascadeOnDelete` en
`inventario_movimientos.producto_id`.

**Pregunta para el backend:** ¿y si el producto ya se usó en una cita?
Existe la tabla `cita_producto` (migración `2026_07_30_201553`). Borrarlo
podría romper el histórico de consumos. Lo esperable sería un 422 con el
motivo, o pasar a borrado lógico usando `activo`.

---

## Diferencias con la app actual

| Elemento | En tu app | Aquí |
|---|---|---|
| Alta | Formulario de 6 inputs sueltos **encima de la tabla**, siempre visible | Modal desde "Nuevo producto" |
| Editar | No existe | Modal de edición (falta el endpoint) |
| Eliminar | Ruta sin botón en la vista | Botón + confirmación |
| Movimiento | Select + input de cantidad **dentro de cada fila** | Modal con motivo y vista previa |
| Motivo del movimiento | Se valida pero **no hay campo** en el formulario | Campo de texto |
| `stock_minimo` | Se guarda pero no se muestra | Columna propia + avisos |
| Buscador | No hay (el controlador sí lo soporta) | Filtra mientras escribes |
| Moneda | `$` fijo en el Blade | `formatMoneda` → `S/` |

El cambio de fondo es sacar los formularios de dentro de la tabla. En el Blade
cada fila lleva un `<form>` incrustado, lo que impide poner el motivo y hace
la tabla difícil de leer.

---

## Pendiente

- [ ] **Añadir `update` al `InventarioController`** — hoy no se puede editar
- [ ] Unificar el parámetro de búsqueda: `buscar` → `search`, y `per_page`
- [ ] Decidir si el stock puede quedar negativo (ver arriba)
- [ ] Que `POST /movimiento` devuelva el producto actualizado
- [ ] ¿Mostrar el historial de movimientos por producto?
- [ ] ¿Qué pasa al borrar un producto que ya está en `cita_producto`?
- [ ] ¿Llevar los productos con stock bajo al dashboard como alerta?
