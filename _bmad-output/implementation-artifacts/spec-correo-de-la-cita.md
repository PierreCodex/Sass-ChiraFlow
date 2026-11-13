---
title: 'El correo de la cita con la marca del negocio'
type: 'feature'
created: '2026-11-13'
status: 'review'
route: 'quick'
baseline_commit: 'develop'
---

# El correo de la cita con la marca del negocio

Diseño propuesto por el equipo y aprobado por el usuario el 2026-11-13
(vista previa: artifact «Correo con tu marca»). Se aplica a los correos de una
cita al cliente: **C-3** confirmada, **C-4** te agendaron, **C-5** cambió de
hora y **C-8/C-9** recordatorio. El resto (cancelaciones, equipo, cuenta)
sigue con la plantilla común.

## Qué se ve

- **Dos tarjetas.** La del fondo, con un degradado del color principal y
  formas (una ola del secundario arriba a la derecha). Encima, la blanca con
  el contenido. El **logo** (iniciales hasta la Story 5.2) queda montado en el
  borde de la blanca: mitad sobre el fondo, mitad sobre el blanco, con un aro
  del principal al secundario.
- Título y subtítulo centrados.
- **Un recuadro**: arriba la fecha («Sábado, 14 de noviembre de 2026», «9:00
  am») con su estado («Confirmada»); debajo Servicio (icono del rubro), Con,
  Dónde, Pagas en el local y el Código de reserva en una etiqueta.
- **«Reprogramar mi cita»** (lleno) y **«Cancelar mi cita»** (borde). Los dos
  llevan el mismo enlace «Gestionar mi cita» (6.8): uno a `#mover`, otro a
  `#cancelar`. Un solo acceso por correo.
- La nota «Puedes modificar o cancelar hasta 15 minutos antes de la cita.»
- El pie: «¿Tienes alguna duda?» con el teléfono del negocio, y «Gestionado
  con» con el logo de tivu.

## Colores

El negocio elige **principal y secundario** (Configuración). El resto se
calcula (`App\Mail\Paleta`): el texto del botón blanco u oscuro según el
contraste; los iconos y bordes, el principal oscurecido si no se lee sobre
blanco (3.2:1); los fondos suaves, mezclas con blanco.

## Cómo está hecho (backend)

- La cabecera y los iconos son **PNG que genera el backend con GD**
  (`App\Mail\ImagenesDeCorreo`), porque el correo no sabe dibujar degradados,
  formas ni un logo montado en un borde (Outlook usa el motor de Word; Gmail
  quita los márgenes negativos). Rutas públicas con los colores en la URL,
  guardadas un año: `GET /api/correo/cabecera/{principal}/{secundario}/{iniciales}.png`
  y `GET /api/correo/icono/{nombre}/{color}.png`.
- Fuentes recortadas en `resources/fonts/correo/`: Plus Jakarta Sans 800
  (OFL) para las iniciales y Tabler Icons (MIT) para los iconos.
- Debajo de la imagen, la tarjeta blanca es HTML con los mismos márgenes
  (2 % + 96 % + 2 %), así encajan a cualquier ancho.

## Frontend

- La página «Gestionar mi cita» abre directo «Elegir nueva fecha» con
  `#mover` o «¿Cancelar tu cita?» con `#cancelar`, si aún se puede cambiar, y
  quita el ancla para que recargar no la vuelva a abrir.

## Pruebas

- Backend `tests/Feature/Avisos/CorreoDeCitaTest.php` (4): la cabecera y los
  iconos con los colores del negocio, los datos, un solo acceso para los dos
  botones; las imágenes en PNG con caché de un año y 404 para lo inválido; un
  color claro da texto oscuro y tinta legible; iniciales y teléfono.
- Frontend: probado en el navegador con mocks (`#mover`, `#cancelar`, y fuera
  de plazo no abre nada).
