# <Módulo>

**Ruta:** `/<ruta>`
**Estado:** ⬜ Sin maquetar
**Archivos:**
- `web/src/app/(dashboard)/<ruta>/page.tsx`
- `web/src/features/<modulo>/`

---

## Qué muestra

<Descripción de la pantalla: qué ve el usuario, qué acciones tiene.>

### Elementos

| Elemento | Descripción |
|---|---|
| | |

### Estados de la UI

| Estado | Qué se muestra |
|---|---|
| Cargando | |
| Vacío | |
| Error | |

---

## Endpoints

### `GET /api/<ruta>`

Parámetros: `page`, `per_page`, `search`

**Respuesta:**

```json
{
  "data": [],
  "meta": { "current_page": 1, "per_page": 10, "total": 0, "last_page": 1 }
}
```

### `POST /api/<ruta>`

**Body:**

```json
{}
```

---

## Campos

| Campo | Tipo | Confirmado | Notas |
|---|---|---|---|
| `id` | int | ⬜ | |

---

## Pendiente

- [ ] Validar campos contra la vista real
- [ ] Formulario de creación/edición
