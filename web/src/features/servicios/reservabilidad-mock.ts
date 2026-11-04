import type { Profesional } from "@/features/profesionales/types";
import type { LocalProfesional } from "@/features/locales/types";
import type { Servicio } from "./types";

/** Estado de la habilitación por sede, compartido por los endpoints mock. */
export const serviciosHabilitadosMock: Record<string, boolean> = {};
export const seOfreceMock = (localId: number, servicioId: number) =>
  serviciosHabilitadosMock[`${localId}:${servicioId}`] ?? true;

/** Solo simula el contrato en mocks. En producción la regla la calcula Laravel. */
export function reservabilidadMock(
  servicio: Pick<Servicio, "id" | "activo" | "empleados">,
  sedes: { id: number; nombre: string; activo?: boolean }[],
  profesionales: Pick<Profesional, "id" | "activo" | "atiende">[],
  porSede: Record<number, LocalProfesional[]>
): Servicio["reservabilidad"] {
  if (!servicio.activo) return { reservable: false, sedes_sin_quien_lo_preste: [] };
  const prestadores = profesionales.filter((profesional) =>
    profesional.activo && profesional.atiende &&
    servicio.empleados.some((empleado) => empleado.id === profesional.id)
  );
  if (!sedes.length) return { reservable: prestadores.length > 0, sedes_sin_quien_lo_preste: [] };

  const habilitadas = sedes.filter((sede) => sede.activo !== false && seOfreceMock(sede.id, servicio.id));
  const tienePrestador = (localId: number) => prestadores.some((profesional) =>
    porSede[localId]?.some((fila) => fila.id === profesional.id && fila.habilitado)
  );
  return {
    reservable: habilitadas.some((sede) => tienePrestador(sede.id)),
    sedes_sin_quien_lo_preste: habilitadas
      .filter((sede) => !tienePrestador(sede.id))
      .map(({ id, nombre }) => ({ id, nombre })),
  };
}
