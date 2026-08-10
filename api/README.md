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

| Método | Ruta | Usado por |
|---|---|---|
| GET | `/sanctum/csrf-cookie` | `fetchCsrfCookie()` antes de cada login/register |
| POST | `/api/login` | `authApi.login` |
| POST | `/api/register` | `authApi.register` |
| POST | `/api/logout` | `authApi.logout` |
| GET | `/api/user` | `authApi.me` |
| GET | `/api/clientes` | `clientesApi.list` — debe devolver `->paginate()` |
| GET/POST/PUT/DELETE | `/api/clientes/{id}` | resto de `clientesApi` |

El frontend asume las respuestas estándar de Laravel: `{ data: ... }` para un
recurso, y `{ data, links, meta }` para colecciones paginadas. Los errores de
validación 422 (`{ message, errors }`) ya se normalizan en `toApiError()`.
