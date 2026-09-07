import type { RolResumen } from "@/features/roles/types";

/**
 * Una cuenta del panel: quién puede entrar y con qué rol.
 *
 * **No confundir con `features/auth/services/auth.api.ts › Usuario`**, que es
 * quien tiene la sesión abierta ahora mismo. Aquel describe a quien está
 * mirando; este, a cada miembro del equipo que puede entrar. El backend hace
 * la misma distinción con `UsuarioResource` y `CuentaResource`.
 *
 * Y tampoco confundir con `Profesional`, que es quien presta los servicios.
 * Desde el 2026-09-04 son **dos cosas distintas y ninguna implica la otra**:
 * una recepcionista es solo esto, un barbero que nunca toca el sistema es solo
 * lo otro, y quien es ambas cosas tiene las dos fichas. Por eso aquí no hay
 * horario, ni tipo de pago, ni comisión: pedírselos a quien solo contesta el
 * teléfono era exactamente el síntoma que separó los dos módulos.
 */
export interface Usuario {
  id: number;
  nombre: string;
  apellido: string | null;
  email: string;
  telefono: string | null;
  activo: boolean;

  /** Id del rol del negocio. Es lo que come el formulario. */
  rol_id: number;
  /** El rol resuelto, para pintar su nombre sin pedir la lista entera. */
  rol: RolResumen;

  /**
   * Su ficha de profesional, si además presta servicios. `null` en quien solo
   * entra al panel — y eso es justo lo que la separación vino a permitir.
   */
  profesional: { id: number; nombre: string; atiende: boolean } | null;
}

/**
 * Lo que viaja al crear o editar una cuenta.
 *
 * **Sin contraseña, ni al crear ni al editar.** La cuenta nace con una
 * aleatoria que no conoce ni quien la crea, y a la persona le llega una
 * invitación para elegir la suya. El jefe no debería conocer la clave de su
 * empleado, y de paso es un campo menos.
 */
export interface UsuarioPayload {
  nombre: string;
  apellido: string | null;
  email: string;
  /** Normalizado a `+51` + 9 dígitos, que es lo único que acepta el backend. */
  telefono: string | null;
  rol_id: number;
  activo: boolean;
}

/** Nombre completo para pintar, con el apellido si lo hay. */
export function nombreCompleto(usuario: Usuario): string {
  return [usuario.nombre, usuario.apellido].filter(Boolean).join(" ");
}
