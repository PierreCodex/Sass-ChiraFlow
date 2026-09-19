# Referencias de landing preferidas por el usuario (2026-09-19)

1. Contractbook — https://styles.refero.design/style/fbc60c55-da20-4684-a279-0ed86590272e
   Crema #f0f0ec dominante, ultramar #1009f6 como único color de marca, CTA píldora amarillo #ffba09 con borde negro,
   tarjetas 24px y paneles hero 40px, sin sombras, ilustración editorial plana en pastel, capturas en marcos blancos.
   Fuente propietaria Abcwhyte (alternativas Inter / DM Sans). Movimiento: no documentado.
2. Sprout Social — https://styles.refero.design/style/da7c4464-f135-41fc-b635-99c6f4dc58e6
   Blanco y negro #040404 con un solo verde #98e58e reservado a acciones; titulares 800 muy grandes; hero oscuro con captura
   de correo; fotos reales de personas usando el celular; capturas sobre degradados suaves; logos en su color nativo.
   Fuente propietaria Proxima Nova (alternativas Montserrat / Nunito Sans). Movimiento: no documentado.
3. Tracky — https://styles.refero.design/style/34788d94-1147-4d38-8df7-6f47ef7efb12
   Cuaderno de notas: marino #151b31, coral #ff5858 en una palabra por titular, menta y amarillo mantequilla; display
   GRIFTER manuscrita (alternativa Bagel Fat One) + Inter; garabatos, flechas y mascota ilustrada; sombras cálidas suaves.
   Movimiento: no documentado.

Estado: preferidas sobre Frame.io; dirección aún por elegir.

## Movimiento observado en https://www.tracky.so/ (HTML inspeccionado el 2026-09-19)

Hecho en Webflow. Cinco técnicas:
1. Titular con texto que se escribe y se borra: typed.js 2.0.10, typeSpeed 75, backSpeed 50, strings
   «actually love.» / «just admire.» / «be addicted to.», cursor con @keyframes blink.
2. 50 elementos con interacciones de Webflow (data-w-id): 17 aparecen desde opacity 0, 19 brotan desde
   scale3d(0,0,1) (garabatos, flechas, iconos), 2 suben desde translate3d(0,105px,0).
3. Cinta infinita: @keyframes marquee-horizontal, 25s linear infinite.
4. Confeti Lottie (74694-confetti.json) al enviar el formulario, una sola reproducción.
5. Pestañas de producto con capturas (Webflow tabs) y un cursor dibujado en el hero.

Equivalentes en el stack: componente propio de escritura, motion (Framer Motion) para apariciones,
CSS para la cinta, lottie-react con animación propia, pestañas MUI. Respetar prefers-reduced-motion y
no dejar contenido esencial oculto esperando el scroll. No copiar recursos gráficos ni textos de Tracky.

## 4. Calendly — https://styles.refero.design/style/9946887b-ffa9-4276-af81-ae6352795afb (elegida como base el 2026-09-19)

«Tinta marina sobre mármol frío». Texto #0b3558 (nunca negro), acción #006bff, secundario #476788, lienzo #f8f9fb,
tarjetas #ffffff, relleno #f0f3f8, bordes #d4e0ed; manchas decorativas #e55cff y #0099ff solo detrás de capturas.
Fuente propietaria Gilroy (alternativas Manrope / Inter). Titulares 700 de 38–80px. Botones 8px, tarjetas de producto
16px, paneles 24px, insignias en píldora. Sombras de tres capas teñidas de azul rgba(71,103,136,…), nunca negras.
Sin degradados de fondo. Capturas del producto sobre tarjetas blancas. Tono editorial, seguro, cálido y contenido.
