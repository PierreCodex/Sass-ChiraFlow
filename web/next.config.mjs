/**
 * Las pantallas que se mudan a la vista de Administración dejan aquí su
 * redirección. La ruta vieja no deja de responder: hay enlaces guardados en
 * marcadores, en correos del onboarding y en `href` del propio panel.
 *
 * `source` **exacto**, sin comodín: `/configuracion` se muda pero
 * `/configuracion/perfil` (Mi perfil) se queda donde está, y un `/:path*`
 * se lo llevaría por delante.
 *
 * `permanent: false` (307) a propósito: el 308 lo cachea el navegador para
 * siempre, y mientras la mudanza está en curso eso deja a quien la probó
 * atado a un destino que todavía puede cambiar.
 */
const nextConfig = {
  reactStrictMode: false,
  images: { unoptimized: true },
  redirects() {
    return [
      {
        source: "/empleados",
        destination: "/administracion/equipo/profesionales",
        permanent: false,
      },
      /*
       * La sección se llamó `equipo/empleados` durante esta misma rama, sin
       * llegar a `main`. Se redirige igual porque el enlace se repartió en
       * capturas y en el historial de esta sesión, y cuesta una línea.
       */
      {
        source: "/administracion/equipo/empleados",
        destination: "/administracion/equipo/profesionales",
        permanent: false,
      },
      /*
       * `source` exacto y no `/configuracion/:path*`: **Mi perfil** vive en
       * `/configuracion/perfil` y NO se muda —es personal, no administración
       * del negocio—, así que un comodín se lo llevaría por delante.
       */
      {
        source: "/configuracion",
        destination: "/administracion/general/negocio",
        permanent: false,
      },
      {
        source: "/locales",
        destination: "/administracion/locales/sedes",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
