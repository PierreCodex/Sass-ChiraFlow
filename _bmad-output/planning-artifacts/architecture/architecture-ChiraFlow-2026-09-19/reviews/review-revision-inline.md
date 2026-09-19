# Revisión previa a la entrega — hecha en línea, no en subagentes

Los revisores se aplicaron por turnos en la misma sesión (no se lanzaron
subagentes sin que el usuario lo pidiera). Veredicto: apto tras aplicar las
correcciones siguientes.

## Lint (lint_spine.py)
7 avisos de baja severidad, todos falsos positivos: `{zona}`, `{id}`, `{data}`,
`{slug}`, `{tenant}`, `{ruta}` son rutas y formas reales, no restos de la
plantilla.

## Versiones (revisor configurado 1)
- Laravel 12.66, stancl 3.9 (3.10.1 compatible), Sanctum 4.3, Pest 3.8,
  resend-laravel 1.4: leídos de composer.lock. Laravel 12 sin correcciones desde
  2026-08-13 y con seguridad hasta 2027-02-24 → Diferido con fecha.
- Next 16.3, React 19.2, MUI 7.3, TanStack 5.101: leídos de node_modules.
- Vitest 5.0.1 y Playwright 1.63.0: npm, 2026-09-19.
- **MySQL**: local 8.0.30, sin soporte desde abril de 2026 → AD-20 fija 8.4 LTS.
- Contabo, Vercel Pro, Resend, Cloudflare: condiciones consultadas en la web.

## Adversario (revisor configurado 2) — pares incompatibles encontrados y cerrados
1. Dos historias guardan eventos en tablas distintas («cita_eventos y sus
   equivalentes» no las fijaba) → AD-8: una tabla `eventos_dominio` por base;
   envíos en la misma base que el evento.
2. El service de pagos podía escribir `citas.estado` al verificar → AD-7: lo
   pide al service de citas.
3. AD-9 exigía crear tareas «en la misma transacción que el evento», imposible
   entre la base central y la del negocio → tras el commit, con reintentos, y
   la re-comprobación por versión manda.
4. La tienda podía ignorar el plan y la suscripción → AD-11 usa el mismo
   comprobador de AD-5.
5. Un único BFF para tres zonas podía reenviar la cookie equivocada → AD-15:
   el BFF decide por el host.

## Rúbrica y cotejo con las fuentes
- Faltaban invariantes adoptadas de CLAUDE.md: provisioning perezoso, ciclo de
  vida, métricas nocturnas → AD-21. Stock solo por movimientos → convención.
- Faltaba el eje de operación (monitoreo, logs) → AD-20.
- El mapa no cubría FR-47..FR-54 y FR-58/59 → filas añadidas.
- Diferidos añadidos: rastreo de errores, retención de comprobantes.
- Sin decisión que bloquee las épicas. Las preguntas F-x y L-x del PRD no
  afectan a ninguna AD.
