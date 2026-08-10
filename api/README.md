# API (Laravel)

Esta carpeta está vacía a propósito. Crea el proyecto aquí:

```bash
cd F:/PERSONAL_JEAN/mi-saas
composer create-project laravel/laravel api
cd api
php artisan install:api          # instala Sanctum y crea routes/api.php
```

## Configuración para el SPA de `web/`

**`.env`**

```env
APP_URL=http://localhost:8000
FRONTEND_URL=http://localhost:3000

SESSION_DRIVER=cookie
SESSION_DOMAIN=localhost
SANCTUM_STATEFUL_DOMAINS=localhost:3000
```

En producción, con `app.tudominio.com` y `api.tudominio.com`:

```env
SESSION_DOMAIN=.tudominio.com
SANCTUM_STATEFUL_DOMAINS=app.tudominio.com
```

**`config/cors.php`** — debe permitir credenciales y el path del CSRF:

```php
'paths' => ['api/*', 'sanctum/csrf-cookie', 'login', 'logout', 'register'],
'allowed_origins' => [env('FRONTEND_URL', 'http://localhost:3000')],
'supports_credentials' => true,
```

**`bootstrap/app.php`** — activa el middleware de sesión para el SPA:

```php
->withMiddleware(function (Middleware $middleware) {
    $middleware->statefulApi();
})
```

## Endpoints que espera el frontend

### Ya consumidos por pantallas construidas

| Método | Ruta | Usado por |
|---|---|---|
| GET | `/sanctum/csrf-cookie` | `fetchCsrfCookie()` antes de cada login/register |
| POST | `/api/login` | `authApi.login` |
| POST | `/api/register` | `authApi.register` |
| POST | `/api/logout` | `authApi.logout` |
| GET | `/api/user` | `authApi.me` |
| GET | `/api/dashboard` | Dashboard completo (ver forma abajo) |
| GET | `/api/suscripcion` | Banner de prueba gratuita + "Mi Plan" |
| GET | `/api/planes` | Pantalla "Mi Plan" |
| GET | `/api/clientes` | `clientesApi.list` — debe devolver `->paginate()` |
| GET/POST/PUT/DELETE | `/api/clientes/{id}` | resto de `clientesApi` |

### Pendientes (rutas del frontend ya creadas, sin implementar)

`/api/citas`, `/api/servicios`, `/api/categorias`, `/api/empleados`, `/api/locales`,
`/api/caja`, `/api/inventario`, `/api/reportes`, `/api/whatsapp`,
`/api/configuracion`, `/api/soporte/tickets`.

### Forma de `GET /api/dashboard`

```json
{
  "data": {
    "citas_hoy": 0,
    "citas_pendientes": 14,
    "total_clientes": 11,
    "ingresos_hoy": 0,
    "ventas_ultimos_dias": [
      { "fecha": "2026-08-03", "total": 0 },
      { "fecha": "2026-08-07", "total": 40 }
    ],
    "citas_del_dia": [
      {
        "id": 1,
        "hora": "14:30",
        "cliente": "Ana Torres",
        "servicio": "Consulta general",
        "empleado": "Dr. Pérez",
        "estado": "confirmada"
      }
    ]
  }
}
```

`estado` acepta: `pendiente`, `confirmada`, `atendida`, `cancelada`, `no_asistio`
(ver `web/src/features/citas/constants.ts`).

### Forma de `GET /api/suscripcion`

```json
{
  "data": {
    "estado": "prueba",
    "plan": null,
    "dias_restantes": 5,
    "renueva_el": null
  }
}
```

`estado` acepta: `prueba`, `activa`, `vencida`, `cancelada`. El banner se oculta
solo cuando es `activa`.

El frontend asume las respuestas estándar de Laravel: `{ data: ... }` para un
recurso, y `{ data, links, meta }` para colecciones paginadas. Los errores de
validación 422 (`{ message, errors }`) ya se normalizan en `toApiError()`.
