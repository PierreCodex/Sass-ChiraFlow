/**
 * Sesión del panel de plataforma, todavía SIMULADA.
 *
 * El acceso sí pasa por Laravel (contraseña + código por correo), pero Laravel
 * aún no emite token de plataforma: eso llega con el guard propio de la Story
 * 8.4. Mientras tanto basta un indicador en `sessionStorage`, que se pierde
 * al cerrar la pestaña.
 */

const CLAVE = "mock:plataforma:sesion";

export interface SesionPlataforma {
  nombre: string;
  email: string;
  rol: "superadmin" | "soporte";
}

export const sesionPlataforma = {
  leer(): SesionPlataforma | null {
    if (typeof window === "undefined") return null;
    try {
      const crudo = window.sessionStorage.getItem(CLAVE);
      return crudo ? (JSON.parse(crudo) as SesionPlataforma) : null;
    } catch {
      return null;
    }
  },
  abrir(sesion: SesionPlataforma) {
    try {
      window.sessionStorage.setItem(CLAVE, JSON.stringify(sesion));
    } catch {
      // Sin almacenamiento la sesión dura lo que dure la página.
    }
  },
  cerrar() {
    try {
      window.sessionStorage.removeItem(CLAVE);
    } catch {
      // Nada que cerrar.
    }
  },
};
