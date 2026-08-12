import { api } from "@/lib/api/client";
import { env } from "@/config/env";
import { delay } from "@/lib/mock-utils";
import type { ParamsReporte, Reporte } from "../types";
import { reporteMock } from "../mocks";

export const reportesApi = {
  /** Todo el reporte en una sola llamada, como el `index` de Laravel. */
  obtener: async (params: ParamsReporte): Promise<Reporte> => {
    if (env.usarMocks) {
      await delay(450);
      return reporteMock(params);
    }
    const { data } = await api.get<{ data: Reporte }>("/reportes", { params });
    return data.data;
  },

  /**
   * Descarga el CSV del rango. Laravel lo devuelve como stream con
   * `Content-Disposition: attachment`, así que aquí se fuerza la descarga
   * desde el blob en vez de navegar a la URL (haría falta la sesión).
   */
  exportar: async (params: ParamsReporte): Promise<void> => {
    const nombre = `reporte_${params.desde}_${params.hasta}.csv`;

    if (env.usarMocks) {
      await delay(400);
      descargar(new Blob([csvMock(params)], { type: "text/csv" }), nombre);
      return;
    }

    const { data } = await api.get<Blob>("/reportes/exportar", {
      params,
      responseType: "blob",
    });
    descargar(data, nombre);
  },
};

function descargar(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = nombre;
  enlace.click();
  URL.revokeObjectURL(url);
}

/** Mismas columnas que `ReporteController::exportar`. */
function csvMock({ desde, hasta }: ParamsReporte) {
  const reporte = reporteMock({ desde, hasta });
  const cabecera =
    "Fecha,Hora,Profesional,Servicio,Cliente,Teléfono,Estado,Monto";

  const filas = reporte.por_servicio
    .filter((fila) => fila.total > 0)
    .map(
      (fila, i) =>
        `${desde},09:${String(i * 5).padStart(2, "0")},Dra. Carmen Ríos,${
          fila.nombre
        },Cliente de ejemplo,999888777,completada,${fila.monto_total}`
    );

  // El BOM hace que Excel abra los acentos correctamente, igual que en Laravel.
  return `﻿${cabecera}\n${filas.join("\n")}\n`;
}
