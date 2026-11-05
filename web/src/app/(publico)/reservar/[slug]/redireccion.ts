/**
 * La subpágina y la consulta que dejó el middleware (`x-tienda-resto`), solo si
 * es una ruta relativa de verdad: nada que empiece por `//` ni tenga esquema,
 * para que una redirección nunca pueda mandar fuera de la tienda. Lo usan los
 * layouts del negocio (6.1) y de la sede (6.2).
 */
export function restoSeguro(resto: string | null): string {
  if (!resto) return "";
  if (resto.startsWith("//") || resto.includes("\\") || !/^[/?]/.test(resto)) return "";
  return resto;
}
