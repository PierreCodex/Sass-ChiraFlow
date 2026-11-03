/** Lo que Mi perfil puede cambiar de la cuenta (contrato § Autenticación). */
export interface PerfilPayload {
  nombre: string;
  apellido: string;
  telefono: string | null;
  /** Documento del titular: letras, números y guiones. Opcional. */
  documento: string | null;
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

