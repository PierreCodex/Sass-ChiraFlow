/**
 * Roles del negocio.
 *
 * Cada negocio tiene los suyos: tres de sistema que llegan con el
 * provisioning y los que cree el dueño. Sustituyen al ENUM central de
 * `users.rol`, que desde el Sprint 2 se **deriva** del rol elegido y ya no es
 * algo que el formulario mande.
 */

/** Dos niveles por módulo. Sin acceso se representa con `null`. */
export type NivelPermiso = "ver" | "gestionar";

/**
 * Los tres roles de sistema. La clave sobrevive al renombrado del NOMBRE —el
 * negocio puede llamar «Encargada» a Administrador local—, así que es lo que
 * hay que mirar para reconocerlos. Los roles propios del negocio la traen en
 * `null`.
 *
 * Ojo: el 2026-09-04 cambiaron las claves mismas (`dueno` → `admin_general`,
 * `admin` → `admin_local`), y eso es otra cosa. No fue un renombrado de
 * etiqueta sino de concepto: lo que separa a los dos administradores no es un
 * permiso de más, es el ALCANCE — uno manda en la empresa, el otro en su sede.
 */
export type ClaveRolSistema = "admin_general" | "admin_local" | "profesional";

/** Módulo del panel → nivel de acceso. Vienen **siempre los 14**. */
export type MatrizPermisos = Record<string, NivelPermiso | null>;

export interface Rol {
  id: number;
  nombre: string;
  clave: ClaveRolSistema | null;
  sistema: boolean;
  /** Los 14 módulos siempre, con `null` donde no hay acceso. */
  permisos: MatrizPermisos;
  /** Del rol, no de cada vista: un profesional ve SUS citas. */
  solo_propios: boolean;

  /*
   * Las barandillas llegan **resueltas por el backend**. No se deducen de
   * `sistema` ni de `clave`: reimplementar esa matriz aquí sería tener dos, y
   * la de allá es la que manda. Sirven para deshabilitar el botón antes; el
   * 422 salta igual si se intenta.
   */
  editable: boolean;
  borrable: boolean;
  duplicable: boolean;

  /**
   * Cuántas CUENTAS llevan este rol. Solo cuando el backend lo cuenta
   * (listado). Se llamaba `empleados_count`: cuenta cuentas del panel, no
   * fichas de profesional, que desde el Sprint 2 son cosas distintas.
   */
  usuarios_count?: number;
}

export interface RolPayload {
  nombre: string;
  permisos: MatrizPermisos;
  solo_propios: boolean;
}

/**
 * El rol tal como lo emite un empleado: lo justo para pintar su nombre sin
 * pedir la lista entera solo para traducir un id.
 */
export interface RolResumen {
  id: number;
  nombre: string;
  clave: ClaveRolSistema | null;
}

/**
 * El rol del titular de la cuenta.
 *
 * Hay exactamente uno por negocio y lo crea el registro: no se reparte, no se
 * borra y no cambia de rol. Se llama «Administrador general» y no «Dueño»
 * porque quien registra la cuenta no siempre es el propietario — en una
 * clínica con socios suele ser la administradora.
 *
 * Se mira la `clave` y nunca el nombre: el negocio puede renombrarlo.
 */
export function esAdminGeneral(rol?: RolResumen | Rol | null): boolean {
  return rol?.clave === "admin_general";
}
