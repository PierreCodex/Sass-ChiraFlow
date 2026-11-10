---
title: 'Story 4.2 — Correos que parecen del negocio y están en español'
type: 'feature'
created: '2026-11-10'
status: 'done'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

# Story 4.2 — Correos que parecen del negocio y están en español

## Intent

Que todo correo use una plantilla común con la identidad de quien habla, en
español, con versión de texto y legible en el móvil (UX-DR6, PRD FR-73/FR-74),
para que el cliente lo reconozca y no lo borre por sospechoso.

## Decisiones

- **Quién habla** (`App\Mail\Marca`, EXPERIENCE.md): citas, pagos y equipo, el
  **negocio** (su nombre como remitente, su color, su contacto en el pie y
  «Enviado con tivu en nombre de…»; las respuestas van a su correo). Cuenta,
  seguridad y suscripción, **tivu**.
- **Plantilla común** (`App\Mail\Correo` + `emails/correo` y
  `emails/correo-texto`): estado arriba, título que dice qué pasó, datos, qué
  hacer ahora, botones (el primero lleno, los demás con borde; al 100 % del
  ancho) y el enlace en texto de respaldo. **Siempre** versión de texto. 600 px
  máximo, una columna, tablas y estilos en línea.
- **Sin logo de imagen todavía.** La URL de las imágenes lleva el id interno
  del negocio hasta la Story 5.2 (decisión de la 6.1), y la mayoría de los
  clientes bloquean imágenes externas. La cabecera lleva las **iniciales sobre
  el color del negocio**, que llegan siempre. El logo entra con la 5.2.
- **Seguridad del HTML:** `datos` y `botones` se escapan en la vista;
  `parrafos` y `nota` admiten negritas, así que quien arma el correo escapa con
  `e()` lo que viene de fuera. El color solo llega al estilo si es un hex de 6
  dígitos.
- **Migrados a la plantilla:** K-1 verificar correo (tivu, 48 h), **K-2
  recuperar contraseña, ahora en español** (tivu), E-1 invitación (negocio,
  conserva quién invita, el usuario y los días de vigencia) y C-4 cita agendada
  (negocio). Se borra `emails/invitacion.blade.php`.
- **Botones de gestión:** la plantilla los admite en todos los planes y van a
  páginas sin sesión. «Gestionar mi cita» se añade a C-4 cuando exista la
  página de la cita (Story 6.8).
- **Remitente:** `no-responder@tivuapp.com` con el nombre de quien habla. El
  dominio tiene SPF, DKIM y DMARC configurados en Resend y Cloudflare desde el
  2026-11-07 (`docs/infra/cloudflare-dns.md`, pasos 11–15): cubre el «And» de
  la historia (L-1).

## Pruebas (`tests/Feature/Avisos/CorreosTest.php`, backend)

- Marca del negocio en HTML (nombre, iniciales, color, contacto, «en nombre
  de») y en texto (sin etiquetas, datos y botones con su URL).
- Remitente con el nombre del negocio desde nuestro dominio; respuesta al
  negocio. Lo de tivu, sin «en nombre de».
- Escapado de datos de fuera y color inválido → color de tivu.
- K-2 en español, con su enlace y su vigencia; sin el texto en inglés.
- Invitación con su enlace, quién invita, el usuario y los días.
- Verificación con su enlace firmado de 48 h.

Verificado en el navegador: cita agendada y recuperar contraseña a 390 px, e
invitación a ancho de escritorio.

## Depende de

- 4.1 (`Notificador`, C-4).
