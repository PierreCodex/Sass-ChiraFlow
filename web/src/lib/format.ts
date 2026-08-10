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

/** "2026-08-10" -> "lunes, 10 de agosto de 2026" */
export function formatFechaLarga(fechaISO: string) {
  return new Date(`${fechaISO.slice(0, 10)}T00:00:00`).toLocaleDateString(
    env.locale,
    { weekday: "long", day: "numeric", month: "long", year: "numeric" }
  );
}

/** "14:30:00" | "2026-08-09T14:30:00" -> "14:30" */
export function formatHora(hora: string) {
  if (hora.includes("T")) {
    const fecha = new Date(hora);
    return fecha.toLocaleTimeString(env.locale, {
      hour: "2-digit",
      minute: "2-digit",
    });
  }
  return hora.slice(0, 5);
}
