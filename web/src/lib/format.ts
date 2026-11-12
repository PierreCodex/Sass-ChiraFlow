import { env } from "@/config/env";

const moneda = new Intl.NumberFormat(env.locale, {
  style: "currency",
  currency: env.currency,
});

/** 1234.5 -> "$1,234.50" */
export function formatMoneda(valor: number) {
  return moneda.format(valor);
}

/** "2026-08-09" -> "09/08" (etiquetas de gráfica) */
export function formatDiaMes(fechaISO: string) {
  const fecha = new Date(fechaISO);
  const dia = String(fecha.getDate()).padStart(2, "0");
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  return `${dia}/${mes}`;
}

/** "2026-08-09" -> "09/08/2026" */
export function formatFecha(fechaISO: string) {
  return new Date(`${fechaISO.slice(0, 10)}T00:00:00`).toLocaleDateString(
    env.locale,
    { day: "2-digit", month: "2-digit", year: "numeric" }
  );
}

/**
 * "2026-11-04T04:30:00+00:00" -> "03/11/2026" (en Lima)
 *
 * Para un INSTANTE con hora y zona, como el `momento` del historial. No vale
 * `formatFecha`, que corta los diez primeros caracteres: ese texto viene en
 * UTC, y de noche en Perú ya es el día siguiente, mientras `formatHora` sí
 * convierte a la hora local. Saldría «04/11 · 23:30».
 */
export function formatFechaDeMomento(momentoISO: string) {
  return new Date(momentoISO).toLocaleDateString(env.locale, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/** "2026-08-10" -> "lunes, 10 de agosto de 2026" */
export function formatFechaLarga(fechaISO: string) {
  return new Date(`${fechaISO.slice(0, 10)}T00:00:00`).toLocaleDateString(
    env.locale,
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );
}

/**
 * "14:30:00" | "2026-08-09T14:30:00" -> "14:30"
 *
 * Siempre en 24h: los horarios de trabajo y las citas se manejan así en todo
 * el sistema, y `es-PE` por defecto formatearía "02:30 p. m.".
 */
/**
 * «4:00 pm»: lo que lee el cliente en la tienda y en los avisos (decisión del
 * 2026-11-12). Recibe «HH:mm».
 */
export function formatHora12(hora: string) {
  const [h, m] = hora.slice(0, 5).split(":").map(Number);
  return `${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, "0")} ${h < 12 ? "am" : "pm"}`;
}

export function formatHora(hora: string) {
  if (hora.includes("T")) {
    const fecha = new Date(hora);
    return fecha.toLocaleTimeString(env.locale, {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  }
  return hora.slice(0, 5);
}
