# Tienda pública de reservas

**Rutas:** `/reservar/{slug}` · `/reservar/{slug}/sucursal/{localId}`
**Estado:** ✅ Validado contra el código Laravel (`feat/planes-suscripcion`)
· ⚠️ Reordena un paso del asistente por una razón de correctitud
**Archivos:**
- `web/src/middleware.ts` (subdominios)
- `web/src/app/(publico)/`
- `web/src/features/publico/`

**Fuente en la app actual:**
- `app/Http/Controllers/Publico/ReservaController.php`
- `app/Http/Middleware/ResolveSubdomainNegocio.php`
- `app/helpers.php` → `subdominio_url()`
- `routes/web.php` (bloque "Público" y `Route::domain`)
- `resources/views/public/reservar/` (index, sucursal, confirmacion)

---

## Qué es

La cara que ve el **cliente final** del negocio: entra, elige servicios y
reserva. No es el panel, no hay sesión, y no debe verse ni una pista de la
administración.

Cada negocio la tiene desde que se registra: `HomeController::registroPrueba`
crea el negocio con un **`slug` único** derivado del nombre, el usuario dueño
y un "Local 1" principal. Ese slug **es** el subdominio.

---

## Cómo se llega

Dos caminos, igual que en Laravel:

| Vía | URL | Cuándo |
|---|---|---|
| Subdominio | `mademoiselle.lienaben.com` | Con `NEXT_PUBLIC_APP_DOMAIN` puesto |
| Ruta | `lienaben.com/reservar/mademoiselle` | Siempre; es el fallback |

### El middleware

`web/src/middleware.ts` reescribe `{slug}.dominio.com/...` a
`/reservar/{slug}/...` **sin cambiar la URL en la barra**. Es el equivalente a
`Route::domain('{subdomain}.'.$appDomain)` más `ResolveSubdomainNegocio`.

Replica sus mismas reglas:

- Descarta el dominio raíz.
- Descarta los subdominios de infraestructura: `www`, `api`, `admin`, `app`,
  `mail`, `ftp`.
- Solo un nivel: `a.b.dominio.com` no es una tienda.
- Ignora el puerto (`localhost:3000` en desarrollo).

Si `NEXT_PUBLIC_APP_DOMAIN` está vacío no reescribe nada y todo funciona por
ruta, que es lo mismo que hace el backend cuando `config('app.domain')` está
vacío.

> **Trampa con Turbopack:** el `matcher` del middleware **no** puede excluir
> "cualquier ruta con punto" (`.*\..*`). Con ese patrón el servidor devuelve
> respuestas **vacías con HTTP 200 y sin ningún error en consola** — y no solo
> en las rutas públicas: se cae la app entera. Hay que usar el matcher
> estándar (`/((?!api|_next/static|_next/image|images|favicon.ico).*)`). Me
> costó un rato localizarlo porque no hay mensaje de error.

### En producción (Vercel)

Hace falta un **dominio comodín** `*.lienaben.com` apuntando al proyecto. Con
eso el middleware resuelve el resto; no hay que dar de alta cada negocio.

---

## Las dos pantallas

### 1. Selector de sucursal — `/reservar/{slug}`

Rejilla de tarjetas con banner, dirección, teléfono y horario. En Laravel, si
el negocio tiene **una sola sede** este paso se salta con un redirect; aquí
igual.

### 2. Sucursal — `/reservar/{slug}/sucursal/{localId}`

Dos columnas:

**Portada:** a pantalla completa, con el logo a 96px, el nombre del negocio en
grande, la sede, la descripción y los tres datos que se buscan antes de
reservar (dirección, teléfono, horario). Si el local no tiene banner cargado,
el fondo se construye con **su color de marca en degradado**, así nunca queda
un hueco gris.

La portada lleva además dos botones: **"Ver servicios y reservar"**, que baja
al catálogo, y **"Llamar"** (`tel:`). Sin ellos, en móvil la portada ocupa la
primera pantalla entera y el cliente no ve ni un servicio antes de scrollear.

El fondo lleva dos halos radiales superpuestos al degradado. Sin ellos se lee
como un rectángulo plano de color, que es exactamente lo que hacía que la
página pareciera sin terminar.

**Izquierda (fija al hacer scroll):** **"Quién te atiende"** como rejilla de
caras —no lista de texto: la foto de quien te atenderá vende más que su
biografía, que se lee al pasar el ratón— y el **mapa** de la sede.

**Derecha:** el catálogo, con **pestañas de categoría** fijas arriba
(`Todos (11) · Consultas (3) · Odontología (3)…`) y los servicios como
**tarjetas en rejilla de dos columnas**: imagen o franja de color a lo ancho,
la duración en una píldora sobre ella, el nombre, la descripción a dos líneas
y el precio en grande junto al botón.

Elegir un servicio marca la tarjeta con borde de color y una insignia con la
cantidad; el botón se convierte en un contador `− 2 +`.

> La primera versión era una lista de filas donde todo pesaba igual y las
> categorías eran chips arrinconados en la barra lateral. En una tienda el
> producto tiene que poder mirarse, y las categorías tienen que guiar la
> navegación: por eso ahora son tarjetas y pestañas.

### El mapa

`MapaLocal.tsx` usa el **embed de OpenStreetMap**: solo un iframe, **sin clave
de API ni script externo**. Con Google Maps haría falta registrar una clave y
pagarla por carga, que en una tienda pública multiplica el coste por cada
negocio y cada visita.

El botón **"Cómo llegar"** sí abre Google Maps, que es lo que la gente tiene
en el móvil.

Si el local no tiene coordenadas, la tarjeta no se pinta.

**Abajo:** barra fija con el resumen (`2 servicios · 1 h 10 min · S/ 190.00`)
y el botón Reservar. Solo aparece con algo en el carrito.

### Sobre las imágenes que faltan

Un catálogo de reservas es un producto visual, así que el maquetado no puede
depender de que el negocio haya subido fotos — la mayoría no lo hace el primer
día. Por eso:

- **Servicio sin foto** → pastilla en degradado de **su propio color** con la
  inicial, no un recuadro gris. Se ve intencionado, no roto.
- **Local sin banner** → la portada usa el color de marca en degradado.
- **Profesional sin foto** → avatar con su inicial.

En la maqueta los profesionales sí tienen foto (las de la plantilla). Los
servicios se dejaron **sin** imagen a propósito: las fotos de producto que
trae Modernize son de e-commerce, y una portada de libro sobre "Consulta
general" queda peor que la pastilla de color. Cuando el negocio suba sus
fotos, el hueco ya está.

---

## El asistente de reserva

### Reordené un paso, y es importante

La app actual tiene los pasos así: **modalidad → fecha y hora → profesional →
datos**.

Eso no puede funcionar. El endpoint de horarios es
`horarios(profesional_id, fecha)`: **los huecos dependen del profesional**. No
se pueden ofrecer horas antes de saber quién atiende.

Aquí el orden es:

1. **Modalidad** — solo si hay más de un servicio en el carrito
2. **Profesional → fecha → hora**, en ese orden y en la misma pantalla
3. **Tus datos**
4. **Confirmar**

### Las dos modalidades

Son las del backend (`modo: 'unica' | 'separada'`):

| Modo | Qué hace |
|---|---|
| `unica` | Una sola cita seguida con el mismo profesional. La duración es la **suma** de todos los servicios y se cobra junto. En la BD: **una** fila en `citas` y N en `cita_servicio` |
| `separada` | Una cita por servicio, cada una con su profesional, fecha y hora. N filas en `citas` |

Con un solo servicio el paso no aparece: siempre es `unica`.

### Las horas son chips, no un campo libre

Se piden a la misma máquina de disponibilidad que usa el calendario del panel
(`features/calendario/disponibilidad`): jornada del profesional, breaks,
excepciones y citas ya tomadas.

Comprobado en la maqueta con dos servicios (70 min) y la Dra. Carmen:

| Fecha | Huecos |
|---|---|
| jue 13/08 | ninguno (no trabaja) |
| vie 14/08 | 09:00 · 10:10 · 11:20 |
| lun 17/08 | 09:00 · 10:10 · 11:20 · 14:00 · 14:50 · 16:00 |

Se ve encadenar la duración (09:00 → 10:10 → 11:20) y el hueco del mediodía
por el break. **Si una hora no está en la lista, no se puede elegir**: reservar
fuera del horario del profesional deja de ser posible, en vez de ser algo que
el negocio tenga que rechazar después.

> Esto es exactamente lo que pedías cuando revisamos el calendario: *"el
> usuario en la vista pública al agendar verá los horarios que tiene
> disponible ese profesional"*.

### Comprobante

Tras confirmar: código de reserva, el desglose de citas con fecha, hora y
profesional, el total, y el aviso de que **queda pendiente** hasta que el
negocio la confirme (`estado: 'pendiente'`, `fuente: 'publica'`).

---

## Esto explica los "campos sin uso" del panel

Casi todo lo que en las otras fichas quedó marcado como *"existe en la BD pero
el panel no lo usa"* **lo consume esta pantalla**:

| Campo | Dónde se usa aquí |
|---|---|
| `cita_servicio` (`cantidad`, `precio`, `duracion_min`) | El carrito multi-servicio |
| `cliente_apellido`, `cliente_documento`, `cliente_email` | Formulario de contacto |
| `citas.fuente = 'publica'` | Toda reserva creada aquí |
| `citas.local_id` | La sede elegida |
| `local_profesional.habilitado` | Quién aparece en "Quién te atiende" |
| `local_profesional.nombre_publico` | Con qué nombre aparece |
| `local_profesional.perfil` | Su biografía bajo el nombre |
| `locales.descripcion` / `banner` / `logo` / `color` | Cabecera y tarjeta de sede |
| `locales.latitud` / `longitud` | El mapa (pendiente, ver abajo) |
| `servicios.galeria` | Pendiente: el Blade la muestra por servicio |
| Features de plan `sitio_publico` y `subdominio` | Habilitan esta pantalla |

No eran campos muertos: **faltaba la mitad del producto en la maqueta**.

### El nombre público, en acción

Es el mejor ejemplo de por qué la pivote es por local. La Dra. Carmen Ríos:

- En **Local 1** tiene `nombre_publico = "Dra. Carmen"` → así aparece.
- En **la molina** no tiene → aparece "Dra. Carmen Ríos".

---

## Marca por negocio

El `color` del local sobrescribe `primary` sobre el tema de la plantilla
mediante un `ThemeProvider` anidado (`TiendaShell`). Botones, chips y estados
heredan solos.

Comprobado: en Local 1 (`#763EBD`) el botón "Agregar" y el avatar salen en
`rgb(118, 62, 189)`.

Así cada negocio se ve suyo sin mantener un tema aparte por cliente.

---

## Endpoints

Todos bajo `/publico/*` y **sin autenticación**, para dejar claro que no
comparten middleware con el panel.

### `GET /api/publico/{slug}`

```json
{
  "data": {
    "negocio": { "id": 1, "nombre": "Clínica El Rosal", "slug": "clinica-el-rosal", "telefono": "976645666", "email": "contacto@elrosal.pe" },
    "locales": [
      {
        "id": 1, "nombre": "Local 1", "direccion": "piura",
        "descripcion": "Sede principal de la clínica.", "telefono": "976645666",
        "banner_url": null, "logo_url": null,
        "latitud": -5.1936, "longitud": -80.6328,
        "color": "#763EBD", "horario_desde": "09:00", "horario_hasta": "22:30"
      }
    ]
  }
}
```

### `GET /api/publico/{slug}/sucursal/{local}`

Devuelve `negocio`, `local`, `categorias` (con sus servicios **activos**) y
`profesionales` (activos **y** con `habilitado = true` en esa sede).

Los servicios sin categoría van en un grupo final "Otros servicios", igual que
en el Blade.

### `GET /api/publico/{slug}/sucursal/{local}/horarios`

Parámetros: `profesional_id`, `fecha`, **`duracion_min`**.

```json
{ "data": ["09:00", "10:10", "11:20", "14:00"] }
```

> ⚠️ En Laravel este endpoint **no recibe la duración**: solo
> `profesional_id` y `fecha`. Sin ella no se puede saber si una cita cabe
> antes del siguiente hueco ocupado, así que hay que añadirla.

### `POST /api/publico/{slug}/sucursal/{local}/reservar`

```json
{
  "modo": "unica",
  "cliente_nombre": "Lucía",
  "cliente_apellido": "Ramos",
  "cliente_telefono": "999888777",
  "cliente_email": "lucia@correo.com",
  "cliente_documento": null,
  "notas": null,
  "servicios": [
    { "id": 3, "cantidad": 1, "profesional_id": 2, "fecha": "2026-08-18", "hora_inicio": "14:00" }
  ]
}
```

Validación replicada del controlador:

| Campo | Reglas |
|---|---|
| `modo` | requerido, `unica` \| `separada` |
| `cliente_nombre` | requerido, máx. 150 |
| `cliente_apellido` | opcional, máx. 150 |
| `cliente_telefono` | requerido, máx. 30 |
| `cliente_email` | **requerido**, email, máx. 150 |
| `cliente_documento` | opcional, máx. 30 |
| `notas` | opcional, máx. 2000 |
| `servicios` | requerido, mín. 1 |
| `servicios.*.cantidad` | entero, 1–50 |
| `servicios.*.fecha` | fecha, hoy o posterior |
| `servicios.*.hora_inicio` | `H:i` |

Devuelve el comprobante (código, modo, total y las citas creadas).

---

## Diferencias con la app actual

| Elemento | En tu app | Aquí |
|---|---|---|
| Orden del asistente | Fecha y hora **antes** que profesional | Profesional → fecha → hora |
| Carrito | En la query string (`?servicios[0][id]=…`), recarga en cada cambio | En memoria, sin recargas |
| Elegir la hora | Campo libre | Chips de huecos reales |
| Marca del negocio | Violeta fijo | El `color` del local tiñe la tienda |
| Modalidad con 1 servicio | Se pregunta igual | Se salta |
| Comprobante | Página aparte | En la misma pantalla |

---

## Valoraciones — maquetadas, sin backend

**Nada de esto existe en la base de datos todavía.** Se maquetó porque es lo
que más pesa al decidir dónde reservar: sin reseñas, una tienda nueva compite
solo por precio.

Se muestra en dos sitios:

- **En la portada**, junto al nombre de la sede: `★★★★☆ 4.4 (5)`.
- **Bajo el catálogo**, con la media grande, la **distribución por estrellas**
  y las reseñas con la respuesta del negocio destacada.

Detalles que no son cosméticos:

- **La distribución importa tanto como la media.** Un 4,3 con 2 reseñas no
  dice lo mismo que un 4,3 con 200, y la barra lo enseña sin leer nada.
- **Sin reseñas la sección no se pinta.** Un "0 reseñas · sin valoraciones" en
  una tienda recién abierta resta más de lo que suma. Compruébalo en la sede 3
  (Miraflores), que se dejó vacía a propósito.
- **La respuesta del negocio se ve**, con su franja de color. Contestar una
  reseña de 3 estrellas convierte más que la reseña de 5.

### Esquema propuesto

```php
Schema::create('resenas', function (Blueprint $table) {
    $table->id();
    $table->foreignId('negocio_id')->constrained('negocios')->cascadeOnDelete();
    $table->foreignId('local_id')->nullable()->constrained('locales')->nullOnDelete();
    // De dónde viene: garantiza que quien opina realmente vino.
    $table->foreignId('cita_id')->nullable()->constrained('citas')->nullOnDelete();
    $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete(); // profesional
    $table->string('cliente_nombre', 150);
    $table->unsignedTinyInteger('puntuacion');   // 1..5
    $table->text('comentario')->nullable();
    $table->text('respuesta')->nullable();       // la escribe el negocio
    $table->timestamp('respondida_el')->nullable();
    // El negocio no debería poder borrar las malas, pero sí ocultarlas
    // mientras soporte revisa un abuso.
    $table->boolean('publicada')->default(true);
    $table->timestamps();
    $table->index(['negocio_id', 'local_id', 'publicada']);
});
```

Tres decisiones que conviene tomar con esto:

1. **¿Solo puede opinar quien tuvo una cita?** Es lo que recomiendo:
   `cita_id` obligatorio y un token de un solo uso enviado tras la cita. Sin
   eso las reseñas no valen nada y se llenan de spam.
2. **¿Puede el negocio borrar una reseña?** No debería. `publicada` sirve para
   que **soporte** oculte abusos, no para que el negocio maquille su media.
3. **¿La media se guarda o se calcula?** Con pocos volúmenes, calcularla.
   Cuando pese, una columna `valoracion_promedio` en `locales` actualizada por
   evento.

Encaja con la feature `encuesta_satisfaccion` que el plan Premium ya vende y
con las plantillas de WhatsApp: el evento `finalizado` es exactamente el
momento de pedir la reseña.

---

## Un bug de paso, en el registro

`HomeController::registroPrueba` asigna el plan así:

```php
$plan = Plan::where('slug', 'profesional')->first() ?? Plan::first();
```

**No existe ningún plan con slug `profesional`.** Los slugs son `basico`,
`premium` y `pro`. Siempre cae al `?? Plan::first()`, así que cada negocio
nuevo recibe el plan que salga primero por id, no uno elegido a propósito.

---

## Pendiente

- [ ] **Galería del servicio.** El Blade muestra las fotos por servicio; aquí
      solo se usa `imagen_principal`. Falta un visor al tocar la tarjeta
- [ ] **Valoraciones: falta el backend.** La UI ya está montada (ver abajo)
- [ ] **Redes sociales del negocio.** Las plantillas de WhatsApp ya usan
      `{{instagram}}`, `{{facebook}}` y `{{web}}`, pero hoy están escritas a
      fuego en `WhatsAppMensajeService`. Deberían estar en Configuración y
      salir también en el pie de la tienda
- [ ] `duracion_min` en el endpoint de horarios (ver arriba)
- [ ] **SEO**: hoy las dos páginas son cliente (`"use client"`). Para que
      Google indexe cada tienda hacen falta Server Components con
      `generateMetadata` por negocio. Es un cambio de fondo: decidir antes de
      lanzar
- [ ] ¿Qué pasa si el negocio está **suspendido**? El middleware de Laravel lo
      excluye; falta la pantalla de "tienda no disponible"
- [ ] ¿Se respeta `sitio_publico_activo` de Configuración? Hoy no se comprueba
- [ ] ¿Bloquear la tienda si el plan no incluye `sitio_publico`?
- [ ] Reserva sin cuenta: hoy el cliente no queda registrado en `clientes`,
      solo se copian sus datos en la cita. ¿Debería crearse o vincularse?
- [ ] Confirmación por correo/WhatsApp al reservar — el módulo de plantillas
      ya tiene el evento `confirmacion` listo
