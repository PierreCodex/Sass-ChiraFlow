/** Lo que Mi perfil puede cambiar de la cuenta (contrato § Autenticación). */
export interface PerfilPayload {
  nombre: string;
  apellido: string;
  telefono: string | null;
  /** DNI del titular. Opcional: hoy solo sirve para conciliar pagos. */
  documento: string | null;
  /** URL de la foto; null la quita. */
  foto: string | null;
}

/**
 * Cambio de contraseña **con sesión abierta**. Pide la actual a propósito: sin
 * eso, cualquiera que se siente frente a una sesión abierta se queda con la
 * cuenta. El flujo por correo (`/forgot-password`) es para quien no puede
 * entrar, que es otro caso.
 */
export interface PasswordPayload {
  password_actual: string;
  password: string;
  password_confirmation: string;
}

/** Qué puede hacer cada rol, en una línea, para el aviso de Mi perfil. */
const PERMISOS_POR_ROL: Record<string, string> = {
  dueno:
    "Configuras la cuenta del negocio y das acceso a tu equipo. Es el rol con todos los permisos.",
  admin:
    "Gestionas el día a día del negocio: agenda, clientes, servicios y caja.",
  profesional: "Ves y gestionas tu propia agenda.",
};

export function permisosDelRol(rol: string | null | undefined): string {
  if (!rol) return "";
  return PERMISOS_POR_ROL[rol] ?? "";
}
