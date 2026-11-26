---
title: 'Story 12.3 — Presupuestos'
type: 'feature'
created: '2026-11-26'
status: 'in-progress'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

# Story 12.3 — Presupuestos

Épica 12 (lo que Premium promete y aún no existe). Función de plan
`presupuestos`, que ya está en `CatalogoFunciones::PREMIUM_EXTRA`.
Decisiones y textos aprobados por Jean el 2026-11-26.

## Decisiones (2026-11-26)

1. **Sin adelanto al aceptar.** Aceptar marca el presupuesto y avisa al
   dueño; el cobro va por la caja, como siempre. El adelanto con Yape (Épica
   7) queda para después si hace falta.
2. **Aceptado, se convierte de dos formas:**
   - **Agendar por línea:** cada línea con servicio tiene «Agendar», que abre
     el formulario de cita con ese servicio, el cliente y el precio por sesión
     del presupuesto (con su descuento). Lleva la cuenta: «2 de 6 agendadas».
   - **Vender como paquete** (Story 11.4): un paquete con el total del
     presupuesto y tantas sesiones como la suma de sus cantidades, sobre una
     plantilla de paquete existente (que fija servicios y vigencia). Una vez.
3. **Textos aprobados:** PR-1 (al cliente) y PR-2 (al dueño), abajo. Los
   códigos P-1…P-8 ya eran de los pagos de citas.
4. **Sin PDF:** la página pública hace de documento, como la reserva.

## Qué hace

### En el panel

- **Presupuestos** en el sidebar (módulo `clientes`, función `presupuestos`):
  la lista con filtros por estado (Borrador, Enviado, Aceptado, Vencido) y
  búsqueda por cliente o número.
- **Nuevo presupuesto** desde ahí o desde **Clientes** (icono en cada fila):
  cliente, vigencia (por defecto **15 días**), sede si hay varias, y líneas
  con servicio del catálogo (precio editable) o texto libre, cantidad y
  descuento. Total en vivo. «Guardar borrador» o «Guardar y enviar».
- Número **correlativo** por negocio. Precios y totales se guardan
  **congelados**.
- **Estados:** `borrador` → `enviado` → `aceptado`; **`vencido`** es un
  enviado que pasó su vigencia (se calcula, no se guarda). Solo el borrador se
  edita o se borra.
- Enviado: muestra si lo abrió (`visto_el`), «Reenviar», «Copiar enlace»
  (para mandarlo a mano; si el cliente no tiene correo ni WhatsApp aceptado,
  se ofrece al enviar) y «Duplicar».
- Aceptado: «Agendar» por línea y «Vender como paquete» (decisión 2).
- Vencido: «Duplicar» crea un borrador nuevo con las mismas líneas.

### La página del cliente (pública, sin cuenta)

- `{slug}.tivuapp.store/presupuesto/{secreto}` con la marca del negocio: el
  detalle, el total, la nota y la vigencia.
- **«Aceptar el presupuesto»** → `aceptado` y PR-2 al dueño. Una sola vez.
- **«Tengo una consulta»** → el WhatsApp del negocio con «Hola, tengo una
  consulta sobre el presupuesto N.º 12.» (o su teléfono si no hay WhatsApp).
- Vencido: 410 con el contacto del negocio. Borrador: 404 (no existe para el
  cliente).
- El enlace es como el de la encuesta: 40 caracteres al azar, en la base
  solo su sha256 (`accesos_presupuesto`), uno nuevo por mensaje.

### Avisos

- **PR-1** (al cliente, al enviar): correo con el detalle y «Ver y aceptar»;
  WhatsApp si lo aceptó. Esencial (lo pide el dueño a mano).

  > ¡Hola, Lucía! 📋 *Clínica Dental Sonrisa* te envió tu presupuesto *N.º 12*
  > por *S/ 1,850.00*.
  > Míralo y acéptalo aquí 👉 {enlace}
  > Vale hasta el viernes 11 de diciembre.

- **PR-2** (al dueño, al aceptar): correo y WhatsApp del equipo. Se apaga en
  Mis avisos → «Presupuestos aceptados» (solo con la función).

  > ✅ *Presupuesto aceptado*
  > 👤 Lucía Juárez · N.º 12 · *S/ 1,850.00*
  > Ya puedes agendar sus citas desde el panel.

## Tablas (tenant)

`presupuestos` (numero único, cliente_id, local_id, estado, vence_el, nota,
subtotal, descuento, total, enviado_el, visto_el, aceptado_el, paquete_id,
duplicado_de, creado_por/_nombre), `presupuesto_items` (servicio_id,
descripcion, cantidad, precio_unitario, descuento, total, orden),
`presupuesto_citas` (item_id, cita_id único), `accesos_presupuesto`.

## Contrato

`docs/api-contract.md` § «Presupuestos — Story 12.3».

## Pruebas

`tests/Feature/Presupuestos/PresupuestoTest.php`: totales y correlativo,
envío con PR-1 por correo y WhatsApp, página pública y aceptar con PR-2,
vencido (410) y duplicar, agendar por línea con sus topes, vender como
paquete una vez, y plan sin la función.

## Fuera de alcance

- Adelanto al aceptar (decisión 1).
- PDF descargable.
- Rechazar desde la página pública (el cliente escribe por «Tengo una
  consulta»).
