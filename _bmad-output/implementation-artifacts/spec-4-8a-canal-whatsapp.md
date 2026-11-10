---
title: 'Story 4.8a — Canal de WhatsApp de la plataforma'
type: 'feature'
created: '2026-11-10'
status: 'review'
route: 'full'
review: 'thorough'
baseline_commit: 'develop'
---

# Story 4.8a — Canal de WhatsApp de la plataforma

Primera de las tres partes de la Story 4.8 (AD-22, FR-83, FR-85; cambio del
2026-11-09):

| Parte | Qué |
|---|---|
| **4.8a** (esta) | Números como configuración, interfaz de canal + Evolution, envío desde el `Notificador` con consentimiento, cupo, horario, ritmo y tope |
| 4.8b | Número en Mi perfil con código, webhook de entrada (ACTIVAR, AYUDA, bajas) y la base para APROBAR / ACTIVAR / CAMBIAR |
| 4.8c | Consentimiento del cliente (casilla y contrato), C-3/C-4/C-5/C-6/recordatorios por WhatsApp, alerta X-2 y paso al de reserva |

## Decisiones

- **Los números son registros** (`canales_whatsapp`, central): proveedor,
  número, instancia, uso (`equipo`, `clientes`, `ambos`, `ninguno`) y estado
  (`calentando`, `activo`, `caido`, `retirado`). Se gestionan con
  `php artisan whatsapp:numero` hasta que tengan pantalla en el panel de
  plataforma (épica 8). Nacen `calentando` y no envían nada hasta `activo`.
- **Interfaz de canal** (`App\WhatsApp\Canal`): un adaptador por proveedor en
  `config('whatsapp.adaptadores')`. Evolution habla por la red interna con la
  cabecera `apikey`. Un canal simulado para pruebas y local.
- **Datos con nombre, no texto:** los avisos implementan `ConWhatsapp` y
  devuelven `MensajeWhatsapp(plantilla, datos, imagen?)`. Los textos viven en
  `config/whatsapp.php` con `meta` y `variables` (el orden de la API oficial).
- **El WhatsApp es un envío aparte** del correo, con su fila (`canal =
  whatsapp`, `destinatario_telefono`) y su clave anti-duplicados. El correo
  sale siempre.
- **Cuándo sale:** con el consentimiento de la persona (`Destinatario::
  aceptaWhatsapp`); a clientes, además, si el plan tiene cupo
  (`max_whatsapp_mes`, contado en el mes). Si no, `omitido` con motivo.
- **Antes de enviar:** número activo para ese uso; horario del negocio (fuera,
  se reprograma a la apertura); turno atómico por número en la central (pausa
  al azar de 8–25 s y tope diario, **globales** para todos los negocios porque
  la caché está separada por negocio). Reprogramar no gasta intentos; ante un
  fallo del proveedor, 2 intentos como máximo.

## Pruebas (backend, `tests/Feature/Avisos/WhatsappTest.php`)

11 pruebas: correo + WhatsApp al equipo, sin consentimiento, sin número activo
y reasignación, cupo de clientes, proveedor caído, fuera de horario, pausa y
tope, duplicado, adaptador de Evolution, orden de variables y el comando.

## Despliegue

`EVOLUTION_URL` y `EVOLUTION_API_KEY` en el recurso `backend`; instancias y
alta de números según `docs/despliegue-coolify.md` (backend), sección
WhatsApp.

## Depende de

- 4.1 (`Notificador`), 4.2 (plantilla de correo).
