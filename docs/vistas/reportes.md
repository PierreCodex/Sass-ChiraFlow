# Reportes

**Ruta:** `/reportes`
**Estado:** ✅ Métricas y campos validados contra el código Laravel
(`feat/planes-suscripcion`) · ⚠️ una gráfica cambia de forma a propósito
**Archivos:**
- `web/src/app/(dashboard)/reportes/page.tsx`
- `web/src/features/reportes/`

**Fuente en la app actual:**
- `app/Http/Controllers/Admin/ReporteController.php`
- `resources/views/admin/reportes/index.blade.php`

---

## Qué muestra

Una sola pantalla con filtro de rango arriba y, debajo, cuatro cifras, tres
gráficas y dos desgloses. Todo se recalcula al cambiar el rango.

### 1. Filtro de rango

Desde · Hasta · **Exportar CSV**, más cuatro atajos: *Este mes* (el
predeterminado, igual que Laravel), *Últimos 7 / 30 / 90 días*. Los atajos son
añadido mío; el Blade solo tiene los dos campos de fecha y un botón "Filtrar".

No hay botón de filtrar: al cambiar cualquiera de las dos fechas se vuelve a
pedir el reporte. React Query cachea por rango, así que volver a uno ya visto
es instantáneo.

Debajo, la leyenda: *"Mostrando sábado, 1 de agosto de 2026 – miércoles, 12 de
agosto de 2026 · comparado con el período anterior de la misma duración."*

### 2. Las cuatro cifras

Cada tarjeta lleva el valor grande, el del período anterior y la variación.

| Tarjeta | Cálculo |
|---|---|
| Reservas totales | Citas del rango, cualquier estado |
| Ocupación | Minutos reservados ÷ minutos disponibles × 100 |
| Tasa de inasistencias | Canceladas ÷ total × 100 |
| Ingresos | Suma de `monto` de las **completadas** |

**La flecha acompaña siempre al porcentaje.** En la app actual el signo va en
el color (verde/rojo) y en una flecha unicode; aquí es un icono explícito, para
que no dependa solo del color.

**"Menos es mejor" está invertido en inasistencias.** El Blade pinta de verde
cualquier subida, así que un aumento de cancelaciones sale en verde como si
fuera bueno. Aquí subir inasistencias sale en rojo.

### 3. Reservas por hora — mapa de calor

**Aquí cambié la forma de la gráfica, no los datos.**

La app actual dibuja **siete líneas superpuestas** —una por día de la semana—
sobre el mismo eje de horas, cada una de un color. Con siete series cruzándose
en once franjas no se distingue ninguna, y obliga a siete colores categóricos
que ninguna paleta separa de forma segura para daltonismo.

Los datos son una **matriz**: día × hora → número de reservas. La forma que le
corresponde es un mapa de calor, con **un solo tono** de claro a oscuro donde
el color codifica cantidad, no identidad. Se responde de un vistazo la
pregunta que hace el gráfico: *¿qué franjas están llenas?*

Mismos datos, mismo endpoint. Solo cambia cómo se dibujan.

Los domingos salen vacíos y los sábados solo por la mañana porque así está el
horario en los datos: el mapa lo hace evidente, que es parte de la gracia.

### 4. Origen de las reservas

Barras agrupadas: Web · Panel · Pública, período actual contra anterior.

### 5. Ingresos diarios

Área con dos series. El período actual va en línea continua y el anterior
**punteado**, para que la identidad no dependa solo del color.

Línea **recta, no suavizada**: con los domingos a cero, el suavizado hunde la
curva por debajo del eje e insinúa ingresos negativos que nunca existieron.

### 6. Por servicio · Por profesional

Lista ordenada de mayor a menor con `12 · S/ 840.00` y **una barra
proporcional al mayor de la lista**. La app actual solo pone los números; con
diez filas de cifras sueltas no se ve quién manda, y la barra responde eso sin
leer una sola cifra.

Incluye los que tienen **cero** en el período, igual que Laravel: el
controlador parte de todos los servicios y profesionales activos y les pega el
agregado, así que un servicio sin citas aparece en 0. Es intencional — deja ver
qué no se está vendiendo.

---

## Endpoints

### `GET /api/reportes?desde=…&hasta=…`

Un solo endpoint devuelve la pantalla entera, como el `index` de Laravel.

```json
{
  "data": {
    "rango": {
      "desde": "2026-08-01",
      "hasta": "2026-08-12",
      "prev_desde": "2026-07-20",
      "prev_hasta": "2026-07-31"
    },
    "actual": {
      "citas": 84,
      "completadas": 69,
      "canceladas": 10,
      "ingresos": 4931,
      "ocupacion": 57.21,
      "inasistencias": 11.9
    },
    "anterior": { "citas": 94, "completadas": 78, "canceladas": 12, "ingresos": 6567, "ocupacion": 65.12, "inasistencias": 12.77 },
    "por_servicio": [
      { "id": 5, "nombre": "Control de presión", "total": 11, "monto_total": 495 }
    ],
    "por_profesional": [
      { "id": 2, "nombre": "Dra. Carmen Ríos", "total": 38, "monto_total": 2052 }
    ],
    "horas": ["09:00", "10:00", "11:00"],
    "por_hora": [
      { "dia": "Lunes", "data": [3, 7, 2] }
    ],
    "fuentes": [
      { "clave": "web", "label": "Web", "actual": 34, "anterior": 41 }
    ],
    "diario": [
      { "etiqueta": "01/08", "actual": 412, "anterior": 655 }
    ]
  }
}
```

Cambios de forma respecto a lo que hoy pasa el controlador a la vista:

| En Laravel | Aquí | Por qué |
|---|---|---|
| `$porHora` con `borderColor` y `backgroundColor` | solo `dia` + `data` | Los colores son cosa del frontend, no del backend |
| `$diario` y `$diarioAnterior` en dos arrays paralelos | un array de `{etiqueta, actual, anterior}` | Alinear por índice desde dos listas es frágil |
| `$fuentes` mapa + dos arrays paralelos | un array de objetos | Ídem |
| `$porServicio[].servicio.nombre` | `nombre` plano | La gráfica no necesita el modelo entero |
| `$totales` (4 cifras) + `$metricasActual` (6) | solo `actual` / `anterior` | `$totales` está **duplicado**: sus 4 valores ya están en `$metricasActual` y la vista no lo usa |

### `GET /api/reportes/exportar?desde=…&hasta=…`

Devuelve un CSV como descarga. Columnas exactas del controlador:

```
Fecha,Hora,Profesional,Servicio,Cliente,Teléfono,Estado,Monto
```

Lleva **BOM UTF-8** al inicio para que Excel abra bien los acentos — eso ya lo
hace tu backend (`fprintf($fh, chr(0xEF)...)`) y aquí se replica en el mock.

> El cliente lo descarga como **blob**, no navegando a la URL. Con Sanctum por
> cookies navegar funcionaría, pero por blob se puede mostrar el estado
> "Generando…" y capturar un error del backend en vez de acabar en una página
> en blanco.

---

## Cómo se calcula la ocupación

Vale la pena dejarlo escrito porque es la métrica menos obvia:

```
capacidad = minutos_del_dia × nº_profesionales × días_del_rango
minutos_reales = suma de (hora_fin − hora_inicio) de las citas completadas
ocupación = minutos_reales / capacidad × 100
```

`minutos_del_dia` sale de `horario.apertura` y `horario.cierre` de la
configuración del negocio.

Dos cosas a tener en cuenta al conectar:

- **Usa el horario del negocio, no el de cada profesional.** Un profesional a
  media jornada cuenta como disponible todo el día, así que la ocupación sale
  más baja de lo real.
- **Cuenta todos los días del rango, incluidos los cerrados.** Si el negocio no
  abre domingos, cada domingo del rango suma capacidad que nunca existió.

Ninguna de las dos rompe nada, pero la cifra es sistemáticamente pesimista.
Si quieres que sea exacta, la capacidad debería salir del horario real de cada
profesional (que ya está en Empleados) en vez del rango del negocio.

---

## Decisiones de color

`web/src/features/reportes/colores.ts`

Los dos períodos aparecen en dos gráficas distintas, así que el par tiene que
ser el mismo en ambas: si "anterior" cambia de color entre gráficas, la
comparación deja de leerse.

El par no se eligió a ojo — se validó con un script que mide separación en
visión normal y en los tres tipos de daltonismo, banda de luminosidad y
contraste contra la superficie:

| Par | Modo | ΔE normal | ΔE peor CVD | Resultado |
|---|---|---|---|---|
| `#5D87FF` / `#FA896B` | claro | 31.1 | 24.0 | ✅ |
| `#5D87FF` / `#E2674A` | oscuro | 30.9 | 26.1 | ✅ |
| azul + gris `#7C8FAC` | claro | 13.6 | 13.1 | ❌ indistinguibles |
| azul + violeta `#763EBD` | oscuro | 18.6 | 14.8 | ❌ contraste 2.6:1 |
| azul + celeste `#49BEFF` | claro | 14.4 | 13.9 | ❌ indistinguibles |

El modo oscuro usa **su propio paso del mismo ramp coral**: el `#FA896B` del
tema claro queda demasiado claro sobre el fondo oscuro. Es la forma correcta de
portar una paleta —re-escalonar, no invertir.

El mapa de calor usa una rampa **secuencial de un solo tono** (azul, claro →
oscuro), verificada monótona en luminosidad en ambos modos.

> Ojo con la paleta de Modernize en oscuro: `success.light`, `info.light`,
> `error.light` y `warning.light` son tintes oscuros, pero **`primary.light`
> sigue siendo `#ECF2FF`**, casi blanco. Ya nos había mordido en
> [soporte.md](soporte.md).

---

## Sobre los datos ficticios

Este es el único módulo cuyo mock **no sale de `citasMock`**. Esos datos cubren
unas dos semanas, así que cualquier rango normal daría un reporte casi vacío —
justo lo que no sirve para revisar la maqueta.

Las cifras se generan de forma determinista a partir de la fecha: el mismo
rango da siempre el mismo reporte. Los **nombres** sí salen de los mocks reales
de servicios y empleados, y se respetan las reglas del negocio (domingos
cerrado, sábados medio turno, solo servicios y profesionales activos).

---

## Diferencias con la app actual

| Elemento | En tu app | Aquí |
|---|---|---|
| Reservas por hora | 7 líneas superpuestas, 7 colores | Mapa de calor de un tono |
| Ingresos diarios | Curva suavizada (se hunde bajo cero) | Línea recta |
| Distinguir períodos | Solo color | Color + línea punteada |
| Variación | Flecha unicode + color | Icono + color |
| Inasistencias al alza | Verde (como si fuera bueno) | Rojo |
| Filtrar | Botón "Filtrar" | Al cambiar la fecha |
| Atajos de rango | No hay | Este mes / 7 / 30 / 90 días |
| Desgloses | Solo cifras | Cifras + barra proporcional, ordenado |
| Exportar | Enlace directo | Descarga con estado y manejo de error |
| Moneda | `$` fijo | `formatMoneda` → `S/` |

---

## Pendiente

- [ ] **Quitar `$totales` del controlador**: está duplicado en `$metricasActual`
      y la vista no lo usa
- [ ] Aplanar la respuesta como arriba (dos arrays paralelos → un array de
      objetos)
- [ ] Sacar los colores del backend (`borderColor` / `backgroundColor` en
      `$porHora`)
- [ ] ¿La ocupación debería usar el horario real de cada profesional?
- [ ] ¿Debería descontar los días que el negocio no abre?
- [ ] ¿Filtrar el reporte por local? Ahora que hay varias sedes es la pregunta
      obvia, y `citas` ya tiene `local_id`
      (migración `2026_08_09_081559`)
- [ ] ¿Exportar también en Excel o PDF, o basta el CSV?
