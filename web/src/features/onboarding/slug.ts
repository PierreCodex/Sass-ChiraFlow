/**
 * Vista previa del enlace de la tienda mientras se escribe el nombre.
 *
 * Replica `Str::slug()` de Laravel, que es quien manda: esto es solo para que
 * el modal enseñe la URL antes de enviar. El backend puede añadir un sufijo
 * (`-2`) si el slug ya está tomado o es reservado, así que la vista previa se
 * presenta como aproximada y la definitiva es la que vuelve en la respuesta.
 */
export function previsualizarSlug(nombre: string): string {
  return nombre
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // quita tildes, deja la letra base
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "-");
}
