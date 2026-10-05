---
title: DESIGN — ChiraFlow
status: draft
created: 2026-09-19
updated: 2026-09-19
name: ChiraFlow
description: Sistema visual de ChiraFlow. Hereda la plantilla Modernize (MUI 7, AQUA_THEME) para el panel y la plataforma; la tienda pública y la página de la cita visten la identidad de cada negocio; la landing sigue una base Calendly con los colores de la plataforma.
sources:
  - ../../prds/prd-ChiraFlow-2026-09-19/prd.md
  - ../../architecture/architecture-ChiraFlow-2026-09-19/ARCHITECTURE-SPINE.md
  - ../../propuesta-decisiones-2026-09-19.md
  - D:/PERSONAL_JEAN/Sass-ChiraFlow/web/src/utils/theme (tema real)
  - D:/PERSONAL_JEAN/mi-modernize-app/mi-modernize-app/packages/typescript/main/src/app (plantilla de referencia)
  - imports/referencias-landing-2.md
colors:
  # Plataforma (panel del negocio, panel de plataforma, landing, correos de la plataforma) — AQUA_THEME real
  primary: '#0074BA'
  primary-light: '#EFF9FF'
  primary-dark: '#006DAF'
  secondary: '#47D7BC'
  secondary-light: '#EDFBF7'
  success: '#13DEB9'
  success-light: '#E6FFFA'
  info: '#539BFF'
  warning: '#FFAE1F'
  warning-light: '#FEF5E5'
  error: '#FA896B'
  error-light: '#FDEDE8'
  text-primary: '#2A3547'
  text-muted: '#5A6A85'
  grey-100: '#F2F6FA'
  grey-200: '#EAEFF4'
  grey-300: '#DFE5EF'
  grey-400: '#7C8FAC'
  divider: '#E5EAEF'
  surface: '#FFFFFF'
  # Panel de plataforma: marca de contexto (solo su barra y su etiqueta)
  platform-bar: '#0B2A45'
  platform-badge: '#FFD54F'
  platform-badge-text: '#3D2E00'
  # Landing (base Calendly adaptada)
  landing-ink: '#0B3558'
  landing-muted: '#476788'
  landing-canvas: '#F8F9FB'
  landing-fill: '#F0F3F8'
  landing-hairline: '#D4E0ED'
  # Tienda pública: neutros fijos; el color del negocio es una variable (negocio-primario)
  store-canvas: '#F7F8FA'
  store-card: '#FFFFFF'
  store-line: '#E3E8EE'
  store-ink: '#1E2A38'
  store-ink-dark-button: '#0B2A45'
  # Marcas de terceros: siempre en su color original
  yape: '#742284'
  whatsapp: '#25D366'
typography:
  family:
    fontFamily: "'Plus Jakarta Sans', Helvetica, Arial, sans-serif"
  h1: { fontSize: 2.25rem, fontWeight: 600, lineHeight: 2.75rem }
  h2: { fontSize: 1.875rem, fontWeight: 600, lineHeight: 2.25rem }
  h3: { fontSize: 1.5rem, fontWeight: 600, lineHeight: 1.75rem }
  h4: { fontSize: 1.3125rem, fontWeight: 600, lineHeight: 1.6rem }
  h5: { fontSize: 1.125rem, fontWeight: 600, lineHeight: 1.6rem }
  h6: { fontSize: 1rem, fontWeight: 600, lineHeight: 1.2rem }
  body1: { fontSize: 0.875rem, fontWeight: 400, lineHeight: 1.334rem }
  body2: { fontSize: 0.75rem, fontWeight: 400, lineHeight: 1rem }
  button: { fontWeight: 400, note: 'MUI capitalize; en la tienda y la landing, peso 700' }
  store-business-name: { fontSize: 30px, fontWeight: 800, lineHeight: 1.1, note: 'móvil 24px' }
  landing-display: { fontSize: 56px, fontWeight: 700, lineHeight: 1.1, note: 'móvil 36px; rango 38–64px' }
  landing-heading: { fontSize: 38px, fontWeight: 700, lineHeight: 1.2 }
  landing-body: { fontSize: 18px, fontWeight: 500, lineHeight: 1.5 }
rounded:
  DEFAULT: 7px
  sm: 6px
  md: 8px
  lg: 12px
  xl: 16px
  hero-panel: 24px
  phone-sheet: 30px
  full: 9999px
spacing:
  '1': 4px
  '2': 8px
  '3': 12px
  '4': 16px
  '5': 20px
  '6': 24px
  '8': 32px
  '10': 40px
  '12': 48px
  '16': 64px
  gutter-mobile: 16px
  sidebar: 270px
  topbar: 70px
components:
  button-primary-panel: { background: '{colors.primary}', text: '#FFFFFF', radius: '{rounded.sm}' }
  store-hero: { minHeightDesktop: 320px, minHeightMobile: 280px, textMaxWidth: 520px, overlayMinOpacity: 0.55 }
  store-button-primary: { background: 'negocio-primario', text: 'texto-contraste(negocio-primario)', radius: '{rounded.md}', weight: 700 }
  store-button-on-hero: { background: '#FFFFFF', text: 'negocio-primario', radius: '{rounded.md}' }
  store-service-card: { background: '{colors.store-card}', border: '{colors.store-line}', radius: '{rounded.lg}', selectedBorder: 'negocio-primario' }
  store-slot: { border: '#D6DEE7', radius: '{rounded.md}', selectedBackground: 'negocio-primario' }
  platform-top-bar: { background: '{colors.platform-bar}', text: '#FFFFFF', badgeBackground: '{colors.platform-badge}', badgeText: '{colors.platform-badge-text}' }
  email-sheet: { background: '#FFFFFF', canvas: '#EEF1F5', strip: 'negocio-primario (5px)', radius: '{rounded.lg}', maxWidth: 600px }
  landing-cta: { background: '{colors.primary}', text: '#FFFFFF', radius: '{rounded.md}', weight: 700 }
  landing-product-card: { background: '#FFFFFF', radius: '{rounded.xl}', shadow: 'sombra azulada de tres capas' }
---

# DESIGN — ChiraFlow

## Brand & Style

ChiraFlow tiene **cuatro superficies**, y cada una sabe de quién es:

| Superficie | Identidad que viste | Base |
|---|---|---|
| **Panel del negocio** y **panel de plataforma** | ChiraFlow | Plantilla **Modernize**, tema `AQUA_THEME`, sin cambiar su diseño |
| **Tienda pública** y **página de la cita** | **El negocio**: su nombre, su logo, su color y su portada | Estructura fija de ChiraFlow; el negocio personaliza con opciones controladas |
| **Landing del SaaS** | ChiraFlow | **Base Calendly** (calma, capturas del producto sobre tarjetas blancas) + movimiento de **Tracky** dosificado + fotos reales al estilo **Sprout** |
| **Correos** | Del negocio (citas y pagos) o de ChiraFlow (suscripción y seguridad) | Hoja blanca sobre fondo gris, marca en la cabecera |

La marca ChiraFlow aparece en la tienda y en los correos de cita **solo de forma discreta**, en el pie. En el panel y en la landing, ChiraFlow es la protagonista. El color de un negocio **nunca** tiñe el panel ni el panel de plataforma.

## Colors

**Plataforma — AQUA_THEME, tomado del código real.** `{colors.primary}` para la acción principal y lo seleccionado; `{colors.secondary}` como acento secundario. Los semánticos (`success`, `warning`, `error`, `info`) son los de Modernize y no se usan como decoración. Texto en `{colors.text-primary}`, secundario en `{colors.text-muted}`. En modo oscuro manda el tema oscuro de Modernize. Ojo con `primary.light`: en oscuro sigue siendo casi blanco (trampa conocida del proyecto), así que texto encima no.

**Panel de plataforma.** Mismo AQUA para las acciones. Su barra superior usa `{colors.platform-bar}` y su etiqueta `{colors.platform-badge}`. Esos dos colores **solo** existen en esa barra: sirven de contexto, no de marca.

**Tienda y página de la cita — el color del negocio.** Se llama `negocio-primario` y lo elige el negocio. Se usa **solo** en:
- botones principales;
- lo seleccionado (servicio, profesional, día, hora, modalidad de pago);
- la portada, cuando el estilo es sólido o degradado, o en la capa sobre la foto.

Todo lo demás es neutro (`store-*`), para que el calendario, los servicios y los formularios se lean igual sea cual sea el color. **El texto sobre `negocio-primario` se calcula solo**: blanco si el contraste es de al menos 4.5:1; si no, `{colors.store-ink-dark-button}`. Un color con el que ninguno de los dos alcanza 4.5:1 se rechaza en el editor con un mensaje claro.

**Landing.** Texto en `{colors.landing-ink}` (azul marino, nunca negro), secundario en `{colors.landing-muted}`, lienzo `{colors.landing-canvas}`. La acción es `{colors.primary}`, el mismo AQUA del panel, para que registrarse se sienta continuar en el mismo producto. Detrás de las capturas van manchas decorativas en `{colors.secondary}` y `{colors.info}`, solo como atmósfera.

**Marcas de terceros.** Yape (`{colors.yape}`) y WhatsApp (`{colors.whatsapp}`) siempre en su color original y nunca teñidas con el color del negocio.

## Typography

**Plus Jakarta Sans en todas las superficies**: es la del panel y sustituye a la Gilroy de Calendly. La escala del panel es la de Modernize (`h1`–`h6`, `body1`, `body2`). En la tienda, el nombre del negocio usa `{typography.store-business-name}`. En la landing, títulos a 700 entre 38 y 64 px (`{typography.landing-display}`), y el texto a 18 px. **Un trazo manuscrito solo en garabatos decorativos de la landing**, nunca en títulos ni textos. Números de horas y precios con cifras tabulares.

## Layout & Spacing

- **Panel y plataforma:** la retícula de Modernize (barra lateral `{spacing.sidebar}`, barra superior `{spacing.topbar}`, modo «boxed»).
- **Tienda:** portada a todo el ancho; contenido centrado con un máximo de 1100 px; margen lateral mínimo de `{spacing.gutter-mobile}`. En móvil, los servicios van en una columna y el botón de continuar se fija abajo.
- **Landing:** máximo de 1200 px, `{spacing.16}` entre secciones y retícula de 8 px.
- **Correos:** una sola columna de 600 px como máximo.

## Elevation & Depth

- **Panel:** las sombras de Modernize (tarjetas con sombra suave y botones sin sombra).
- **Tienda:** tarjetas planas con borde `{colors.store-line}`; la profundidad la da la portada, no las sombras.
- **Landing:** sombra azulada de tres capas en las tarjetas de producto, nunca negra.
- **Correos:** planos.

## Shapes

- **Panel:** `{rounded.DEFAULT}` (7 px, el `isBorderRadius` real) y botones de 6 px, como Modernize.
- **Tienda:** botones y huecos `{rounded.md}`, tarjetas `{rounded.lg}`, logo con 16 px de radio sobre fondo blanco.
- **Landing:** botones `{rounded.md}`, tarjetas de producto `{rounded.xl}`, paneles del hero `{rounded.hero-panel}` e insignias `{rounded.full}`.

## Components

**Portada de la tienda (`store-hero`).** Contiene, en orden: logo en cuadro blanco, nombre del negocio, frase corta, sede y horario de hoy, y dos botones: **«Reservar cita»** (blanco con texto `negocio-primario`) y **WhatsApp** (contorno blanco). Tres estilos:

| Estilo | Fondo | Regla de legibilidad |
|---|---|---|
| Sólido | `negocio-primario` plano | Contraste automático del texto |
| Degradado | Uno de la **selección prediseñada** (ocho, validados para texto blanco) o «degradado de tu color» generado a partir de `negocio-primario` [SUPUESTO: cantidad y valores exactos] | Solo degradados que pasan 4.5:1 con texto blanco en todo su recorrido |
| Fotografía | Foto del negocio con el **punto de enfoque** elegido + capa de `negocio-primario` oscurecido | Capa de al menos `{components.store-hero.overlayMinOpacity}` detrás del texto: horizontal en escritorio (texto a la izquierda), de abajo hacia arriba en móvil (texto abajo) |

Sin foto subida, la portada es **sólida** (o el degradado predeterminado, si el negocio lo eligió). **En el lanzamiento todas las sedes heredan logo, color y portada del negocio**; la portada propia por sede llega después (FR-80), y sin ella seguirá heredando.

**Tarjeta de servicio, chip de profesional, día y hueco** (`store-service-card`, `store-slot`): superficie blanca y borde neutro; seleccionado, borde o fondo `negocio-primario`.

**Selector de sede:** tarjetas con la foto o portada de la sede, nombre, dirección y horario de hoy. Cuando la sede viene preseleccionada, aparece como **cabecera fija con su nombre y «Cambiar sede»**.

**Etiqueta de estado de la cita** (en la tienda, en la página de la cita y en los correos): píldora con **icono + texto**, nunca solo color. **Pendiente de pago** (ámbar, ●), **Comprobante en revisión** (azul `info`, ◐), **Confirmada** (verde, ✓), **Cancelada** (gris, ✕).

**Panel de plataforma:** barra `platform-top-bar` con «ChiraFlow», la **etiqueta «▲ Administración de plataforma»** (texto permanente) y quién está conectado. Navegación propia. Contexto del negocio: cabecera fija en su ficha con **logo del negocio a 36 px, nombre, estado y sede principal**. El logo es la única presencia de la identidad del negocio: su color no tiñe nada. El resto son componentes de Modernize (`DataTable`, `Chip`, `Dialog`, `DashboardCard`).

**Correo (`email-sheet`):** franja superior de 5 px en `negocio-primario`, logo y nombre del negocio, etiqueta de estado, título que dice qué pasó, tabla de datos de la cita, botones (principal en `negocio-primario`, secundarios con contorno) y pie «Enviado por ChiraFlow en nombre de…». Los correos de la plataforma usan la misma hoja con el logo de ChiraFlow y franja `{colors.primary}`.

**Editor de apariencia:** secciones de Modernize (`MarcoSeccion`, `SeccionMarca`, que ya existen) con un **conmutador Móvil / Escritorio** y una vista previa en vivo a la derecha (debajo, en móvil).

## Do's and Don'ts

**Hacer**
- Usar los componentes y el tema de Modernize tal cual en el panel y en la plataforma.
- Limitar `negocio-primario` a botones, lo seleccionado y la portada.
- Calcular siempre el color del texto sobre `negocio-primario`.
- Mostrar Yape y WhatsApp con sus colores.
- Acompañar cada estado de icono y texto.

**Evitar**
- Teñir el panel o la plataforma con el color de un negocio.
- Poner fondos decorativos o fotos detrás del calendario, las tarjetas o los formularios.
- Llevar la foto de portada a los correos.
- Usar un color secundario del negocio: se retira de la pantalla y de la API (FR-82).
- Usar SVG como logo (puede esconder código) o letra manuscrita en texto útil.
- Dejar texto sobre una foto sin capa.
