/** Tipos y helpers de dominio de la autenticación. */

/** Categoría de negocio del select del registro (`business_categories`). */
export interface CategoriaNegocio {
  id: number;
  nombre: string;
}

/** Los 5 valores que acepta el backend en `rango_profesionales`. */
export const RANGOS_PROFESIONALES = [
  { valor: "independiente", etiqueta: "Solo yo, trabajo independiente" },
  { valor: "2", etiqueta: "2 profesionales" },
  { valor: "3-5", etiqueta: "Entre 3 y 5 profesionales" },
  { valor: "6-15", etiqueta: "Entre 6 y 15 profesionales" },
  { valor: "+16", etiqueta: "Más de 16 profesionales" },
] as const;

export type RangoProfesionales = (typeof RANGOS_PROFESIONALES)[number]["valor"];

/** Prefijo del único país soportado hoy: Perú. */
export const PREFIJO_TELEFONO = "+51";

/**
 * El formulario pide "nombre y apellido" en un solo campo, como la referencia,
 * pero el contrato los guarda separados. La primera palabra es el nombre y el
 * resto el apellido: "María de los Ángeles Quispe" → "María" + "de los Ángeles
 * Quispe". El esquema exige dos palabras, así que `apellido` nunca sale vacío.
 */
export function separarNombre(nombreCompleto: string): {
  nombre: string;
  apellido: string;
} {
  const partes = nombreCompleto.trim().split(/\s+/);
  return {
    nombre: partes[0] ?? "",
    apellido: partes.slice(1).join(" "),
  };
}

/** Solo dígitos, para contar los 9 que pide el backend. */
export function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, "");
}

/** `987 654 321` → `+51987654321`, que es el formato que usará WhatsApp. */
export function normalizarTelefono(valor: string): string {
  return `${PREFIJO_TELEFONO}${soloDigitos(valor)}`;
}

/** Etiquetas de los roles. El backend manda la clave; el texto lo pone aquí. */
const ETIQUETAS_ROL: Record<string, string> = {
  dueno: "Dueño",
  admin: "Administrador",
  profesional: "Profesional",
};

export function etiquetaRol(rol: string | null | undefined): string {
  if (!rol) return "";
  return ETIQUETAS_ROL[rol] ?? rol;
}

/** Iniciales para el avatar de quien no ha subido foto. */
export function inicialesDe(nombreCompleto: string | null | undefined): string {
  if (!nombreCompleto) return "?";
  const partes = nombreCompleto.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  // Primera y ÚLTIMA palabra, no las dos primeras: "María de los Ángeles
  // Quispe Rojas" da "MR" y no "MD", que no dice nada.
  const primera = partes[0][0] ?? "";
  const ultima = partes.length > 1 ? (partes[partes.length - 1][0] ?? "") : "";
  return `${primera}${ultima}`.toUpperCase();
}
