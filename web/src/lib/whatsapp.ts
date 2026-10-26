/**
 * Enlaces «click to chat» de WhatsApp (`wa.me`).
 *
 * No envía nada: abre WhatsApp (app o web) en el chat de esa persona con el
 * mensaje ya escrito, y quien lo manda es la persona del negocio. Por eso no
 * necesita la API de WhatsApp ni cuenta verificada en Meta.
 */

/** Código de país que se asume cuando el número viene sin él. */
const CODIGO_PAIS = "51";

/**
 * "976 645 666" → "51976645666". `null` si no parece un celular.
 *
 * En Perú los celulares tienen 9 dígitos y empiezan por 9: a esos se les pone
 * el 51. Lo que ya trae código de país (más de 9 dígitos) se deja tal cual.
 */
export function numeroWhatsapp(telefono: string | null | undefined): string | null {
  const digitos = (telefono ?? "").replace(/\D/g, "");
  if (digitos.length === 9 && digitos.startsWith("9")) return `${CODIGO_PAIS}${digitos}`;
  if (digitos.length >= 10 && digitos.length <= 15) return digitos;
  return null;
}

export function enlaceWhatsapp(telefono: string | null | undefined, mensaje: string) {
  const numero = numeroWhatsapp(telefono);
  if (!numero) return null;
  return `https://wa.me/${numero}?text=${encodeURIComponent(mensaje)}`;
}
