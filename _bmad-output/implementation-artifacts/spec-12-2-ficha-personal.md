---
title: 'Story 12.2 — Ficha personal del cliente'
type: 'feature'
created: '2026-11-26'
status: 'in-progress'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

# Story 12.2 — Ficha personal del cliente

Épica 12 (lo que Premium promete y aún no existe). Función de plan
`ficha_personal`, que ya está en `CatalogoFunciones::PREMIUM_EXTRA`.
Decisiones de Jean del 2026-11-26.

## Decisiones (2026-11-26)

1. **El profesional ve solo las fichas de sus clientes**: los que tienen o
   tuvieron alguna cita con él (no cancelada). Es la regla de `solo_propios`,
   la misma que ya acota sus citas. Una ficha ajena responde **404**, no 403:
   no confirma que el cliente exista.
2. **Permiso nuevo «Fichas personales»** (módulo `fichas`, ver/gestionar). De
   serie lo traen el **administrador general**, el **de sede** y el
   **profesional**. **Recepción no**: agenda y cobra, pero no lee alergias ni
   antecedentes. El dueño puede dárselo en Roles.
3. **Hasta 6 fotos por visita**, de antes o de después, **privadas**: nunca
   una URL pública; se sirven firmadas (30 min) por el BFF, con sesión y
   permiso. Hasta 5 MB cada una; se reducen a 2000 px y se guardan en WebP
   (`ImagenService::guardarPrivada`, como las capturas de la caja).

## Qué hace

### Configuración › Ficha personal

- `Administración › General › Ficha personal` (módulo `configuracion`). El
  dueño define sus campos: **texto, sí/no, lista, número, fecha**, con una
  ayuda opcional. Se ordenan con flechas. Hasta 40 activos.
- **Plantillas por rubro**: Clínica o consultorio, Spa o estética, Barbería o
  salón, Veterinaria, Gimnasio o entrenamiento. Aplicar una **solo añade** los
  campos que falten (por nombre). Se sugiere la del rubro del negocio
  (`business_categories.slug`).
- **Quitar** un campo que ya tiene datos lo **archiva**: deja de pedirse, pero
  lo anotado sigue en la ficha de cada cliente (de solo lectura). Un archivado
  se puede «volver a usar». No se cambia el tipo de un campo con datos.

### La ficha del cliente

- `Clientes` → icono de ficha → `/clientes/{id}/ficha` (solo con el módulo).
- A la izquierda, **sus datos** (los campos), editables con `fichas`
  gestionar. A la derecha, la **línea de tiempo** de visitas atendidas (o en
  curso): fecha, servicio, profesional, sede, la nota de la atención y las
  fotos de antes y después, de la más reciente a la más antigua (20 por
  página).
- Para quien gestiona la configuración (el dueño), **«Quién la abrió»**: el
  registro de accesos de esa ficha.

### Desde la cita

- En la bandeja de **Citas** (pestaña nueva **«Visita»**) y en la ficha de la
  cita del **Calendario**, cuando la cita está **en curso o atendida**: la nota
  de la visita (hasta 3000 caracteres) y **subir fotos** de antes/después
  (en el móvil abre la cámara). Enlace a la ficha del cliente.

### Datos sensibles (Ley 29733)

- Solo con el módulo `fichas`; el profesional, solo lo suyo (decisión 1).
- **Cada lectura y cada cambio** queda en `ficha_accesos`: `ver`, `editar`,
  `nota`, `foto`, `borrar_foto`, con cuenta, nombre, IP y hora.
- **Nunca** en la tienda, en los avisos ni en `GET /clientes/{id}`: no hay
  ningún camino público que lea estas tablas.
- **Borrar los datos personales del cliente** (Story 9.2) borra también sus
  valores, sus notas y sus fotos (los archivos, al confirmar la transacción).
  El registro de accesos se queda: no lleva datos del cliente.
- Sin la función en el plan (en vivo), `fichas` queda en `null` para todos
  (`Capacidades::MODULO_FUNCION`) y todo responde 403; el panel esconde el
  icono, la pestaña y la sección muestra «viene con Premium».

## Tablas (tenant)

`ficha_campos` (etiqueta, tipo, opciones json, ayuda, orden, archivado_el),
`ficha_valores` (cliente_id, campo_id, valor, actualizado_por; único por
cliente y campo), `visitas` (cita_id único, cliente_id, nota,
actualizado_por), `visita_fotos` (visita_id, momento, ruta, subida_por),
`ficha_accesos` (cliente_id, usuario_id, usuario_nombre, accion, ip, cuando).
La migración da `fichas: gestionar` al admin general, y al de sede y al
profesional si su rol no está personalizado (`editado_at` NULL), como la
Story 1.6 con `pagos`.

## Contrato

`docs/api-contract.md` § «Ficha personal — Story 12.2».

## Pruebas

`tests/Feature/Fichas/FichaPersonalTest.php` (backend): campos y plantillas,
validación por tipo, línea de tiempo con nota y fotos privadas, tope de 6
fotos, alcance del profesional y de recepción, registro de accesos, plan sin
la función, y borrado al anonimizar.

## Fuera de alcance

- Firmas o consentimientos informados escaneados.
- Exportar la ficha a PDF.
- Campos por servicio o por sede (la ficha es una sola por negocio).
