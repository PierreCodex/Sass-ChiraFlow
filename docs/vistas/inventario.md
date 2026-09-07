# Inventario

**Ruta:** `/inventario`
**Estado:** ✅ **Conectada al backend** (2026-09-06)
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

Parámetros: `page`, `per_page`, `search` — filtra por nombre **y
descripción**.

> El Laravel anterior lo llamaba `buscar` y paginaba fijo de 15 en 15. El
> backend nuevo usa `search` + `per_page`, como el resto de módulos.

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

**Existe desde el Sprint 3.B** (2026-09-06). Se acabó el borrar-y-recrear que
obligaba el Laravel anterior.

Mismo cuerpo que el `POST`, **menos `stock`**: el stock solo se mueve por
movimientos, nunca por edición directa. En el formulario de edición el campo
aparece deshabilitado con la ayuda *"Se cambia con movimientos"*.

**Mandarlo igualmente no da 422**: la regla no está en el Form Request, así que
la clave no llega a `validated()` y simplemente no cambia nada. Por eso el
campo deshabilitado puede seguir enviándose.

> Un `PUT` que reescribiera el stock sería un cambio de inventario **sin
> autor**. Los movimientos dejan quién y por qué; la edición no.

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
| `motivo` | opcional, string, **máx. 150** — es el ancho de la columna |

El backend crea la fila en `inventario_movimientos` (guardando `user_id`, o
sea quién lo registró) y recalcula `producto.stock`. **Devuelve el producto
actualizado**, así que la tabla se refresca sin pedir el listado entero.

**Una salida no puede dejar el stock en negativo → 422 en `cantidad`.** Cero
justo sí pasa; lo que no puede es pasarse.

`cantidad` se guarda **siempre positiva**: el signo lo lleva `tipo`. Con signo,
la columna significaría dos cosas según la fila y sumarla daría el saldo por
accidente.

> El **stock inicial también anota su movimiento** de entrada («Stock
> inicial»). No cambia ninguna respuesta, pero sin él un producto que nace con
> 24 unidades tiene un saldo que ninguna fila explica — y el historial que esta
> ficha deja pendiente diría que aparecieron solas.

### `DELETE /api/inventario/{id}`

Responde 204. Es **soft delete**, y **recrear un producto con el nombre de uno
borrado restaura la fila pero nace limpio**: activo, con el stock y los precios
que se acaban de escribir. Para el negocio eso es un alta — rellenó un
formulario en blanco. Misma decisión que en [Servicios](servicios.md).

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

> ⚠️ No se puede: la salida supera el stock disponible (hay 12).

**Se decidió el 422**, que era la recomendación de esta ficha: un stock negativo
no es un dato, es un error de captura contado como inventario, y de ahí sale a
la tienda pública y a los reportes.

**El aviso se reescribió el 2026-09-06.** Decía *«Quedaría en 0»*, que era
cierto contra el mock —recorta en 0 y guarda— y dejó de serlo contra el backend,
que rechaza. Prometía que el movimiento se registraba.

El botón **sigue habilitado** a propósito: el 422 se pinta bajo `cantidad`, que
es donde el usuario está mirando, y así el aviso local y el del servidor dicen
lo mismo en vez de competir.

> La **venta de una cita no tiene este tope**, y es deliberado: esa venta ya
> ocurrió —el producto salió del estante— y negarse a registrarla dejaría la
> cita sin poder cerrarse por un dato de inventario que ya estaba mal. Ver
> [citas.md](citas.md).

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

- [x] ~~Añadir `update` al `InventarioController`~~ — hecho (Sprint 3.B)
- [x] ~~Unificar el parámetro de búsqueda: `buscar` → `search`, y `per_page`~~
- [x] ~~Decidir si el stock puede quedar negativo~~ — no puede: 422
- [x] ~~Que `POST /movimiento` devuelva el producto actualizado~~
- [ ] ¿Mostrar el historial de movimientos por producto? Las filas ya están
      todas, incluida la del stock inicial: falta el endpoint que las liste
- [ ] ¿Qué pasa al borrar un producto que ya está en `cita_producto`?
- [ ] ¿Llevar los productos con stock bajo al dashboard como alerta?
