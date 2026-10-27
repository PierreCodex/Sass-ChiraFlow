import { delay } from "@/lib/mock-utils";
import { almacenPlataforma } from "../mocks";
import type {
  AccionPlataforma,
  EstadoNegocio,
  MetodoPagoSuscripcion,
  NegocioPlataforma,
  PagoSuscripcion,
  PlanPlataforma,
  ResumenPlataforma,
} from "../types";

/**
 * API del panel de plataforma.
 *
 * ⚠️ **Prototipo, solo mocks.** Las rutas reales vivirían en Laravel bajo su
 * propio guard (`platform_admins`, sin tenancy, con 2FA — AD-3, AD-12) y todo
 * cambio de plan pasaría por `SuscripcionService::aplicar` (Story 8.1). Aquí
 * nada de eso existe: se lee y escribe en `localStorage`.
 */

const AUTOR = "Admin Plataforma";

export const plataformaApi = {
  resumen: async (): Promise<ResumenPlataforma> => {
    await delay(300);
    const { negocios, planes } = almacenPlataforma.leer();
    const vivos = negocios.filter((item) => item.estado !== "cancelado");
    const pagan = vivos.filter((item) => item.estado === "activo" || item.estado === "por_vencer");
    const precio = (slug: string) => planes.find((plan) => plan.slug === slug)?.precio_mensual ?? 0;

    return {
      negocios: negocios.length,
      activos: negocios.filter((item) => item.estado === "activo").length,
      en_prueba: negocios.filter((item) => item.estado === "prueba").length,
      por_vencer: negocios.filter((item) => item.estado === "por_vencer").length,
      suspendidos: negocios.filter((item) => item.estado === "suspendido").length,
      locales: vivos.reduce((suma, item) => suma + item.locales, 0),
      profesionales: vivos.reduce((suma, item) => suma + item.profesionales, 0),
      citas_mes: vivos.reduce((suma, item) => suma + item.citas_mes, 0),
      ingreso_mensual: pagan.reduce((suma, item) => suma + precio(item.plan_slug), 0),
      por_plan: planes.map((plan) => ({
        plan,
        negocios: vivos.filter((item) => item.plan_slug === plan.slug).length,
      })),
    };
  },

  negocios: async (): Promise<NegocioPlataforma[]> => {
    await delay(300);
    return almacenPlataforma.leer().negocios;
  },

  negocio: async (id: string) => {
    await delay(250);
    const datos = almacenPlataforma.leer();
    const negocio = datos.negocios.find((item) => item.id === id);
    if (!negocio) throw new Error("Ese negocio no existe.");
    return {
      negocio,
      pagos: datos.pagos.filter((pago) => pago.negocio_id === id),
      acciones: datos.acciones
        .filter((accion) => accion.negocio_id === id)
        .sort((a, b) => b.fecha.localeCompare(a.fecha)),
    };
  },

  planes: async (): Promise<PlanPlataforma[]> => {
    await delay(250);
    return almacenPlataforma.leer().planes;
  },

  guardarPlan: async (plan: PlanPlataforma): Promise<PlanPlataforma> => {
    await delay(400);
    const datos = almacenPlataforma.leer();

    // `id` 0: un plan nuevo. Se le da el siguiente id y un slug único.
    if (!plan.id) {
      const base =
        plan.nombre
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-|-$/g, "") || "plan";
      let slug = base;
      for (let n = 2; datos.planes.some((item) => item.slug === slug); n++) slug = `${base}-${n}`;

      const nuevo = { ...plan, id: Math.max(0, ...datos.planes.map((item) => item.id)) + 1, slug };
      datos.planes = [...datos.planes, nuevo];
      almacenPlataforma.guardar(datos);
      return nuevo;
    }

    datos.planes = datos.planes.map((item) => (item.id === plan.id ? plan : item));
    almacenPlataforma.guardar(datos);
    return plan;
  },

  pagos: async (): Promise<PagoSuscripcion[]> => {
    await delay(300);
    return [...almacenPlataforma.leer().pagos].sort((a, b) => b.fecha.localeCompare(a.fecha));
  },

  /** Story 8.5: el cambio queda en el historial de la propia ficha. */
  cambiarPlan: async (id: string, planSlug: string, nota: string | null) => {
    await delay(500);
    const datos = almacenPlataforma.leer();
    const negocio = datos.negocios.find((item) => item.id === id)!;
    const anterior = datos.planes.find((plan) => plan.slug === negocio.plan_slug)?.nombre;
    const nuevo = datos.planes.find((plan) => plan.slug === planSlug)?.nombre;

    negocio.plan_slug = planSlug;
    // Salir de la prueba a un plan de pago lo deja activo un mes.
    if (negocio.estado === "prueba" && planSlug !== "prueba") {
      negocio.estado = "activo";
      negocio.vence_el = enDias(30);
    }
    anotar(datos.acciones, id, `Cambio de plan: ${anterior} → ${nuevo}.${nota ? ` ${nota}` : ""}`);
    almacenPlataforma.guardar(datos);
    return negocio;
  },

  /** Registrar un pago NO cambia el plan: activar nunca equivale a cobrar. */
  registrarPago: async (
    id: string,
    pago: { monto: number; metodo: MetodoPagoSuscripcion; periodo: string; nota: string | null }
  ) => {
    await delay(500);
    const datos = almacenPlataforma.leer();
    const negocio = datos.negocios.find((item) => item.id === id)!;
    datos.pagos.unshift({
      id: Math.max(0, ...datos.pagos.map((item) => item.id)) + 1,
      negocio_id: id,
      negocio_nombre: negocio.nombre,
      plan_slug: negocio.plan_slug,
      monto: pago.monto,
      metodo: pago.metodo,
      periodo: pago.periodo,
      fecha: enDias(0),
      confirmado: true,
      nota: pago.nota,
    });
    anotar(datos.acciones, id, `Pago registrado: S/ ${pago.monto.toFixed(2)} (${pago.periodo}).`);
    almacenPlataforma.guardar(datos);
  },

  /** Renovar un mes desde el vencimiento (o desde hoy, si ya venció). */
  renovar: async (id: string) => {
    await delay(400);
    const datos = almacenPlataforma.leer();
    const negocio = datos.negocios.find((item) => item.id === id)!;
    const base = negocio.vence_el > enDias(0) ? new Date(negocio.vence_el) : new Date();
    base.setDate(base.getDate() + 30);
    negocio.vence_el = base.toISOString().slice(0, 10);
    negocio.estado = "activo";
    anotar(datos.acciones, id, `Plan renovado hasta el ${negocio.vence_el}.`);
    almacenPlataforma.guardar(datos);
    return negocio;
  },

  cambiarEstado: async (id: string, estado: EstadoNegocio, motivo: string) => {
    await delay(400);
    const datos = almacenPlataforma.leer();
    const negocio = datos.negocios.find((item) => item.id === id)!;
    negocio.estado = estado;
    const verbo = estado === "suspendido" ? "Suspendido" : estado === "activo" ? "Reactivado" : "Cancelado";
    anotar(datos.acciones, id, `${verbo}: ${motivo}`);
    almacenPlataforma.guardar(datos);
    return negocio;
  },

  confirmarPago: async (pagoId: number) => {
    await delay(300);
    const datos = almacenPlataforma.leer();
    const pago = datos.pagos.find((item) => item.id === pagoId)!;
    pago.confirmado = true;
    anotar(datos.acciones, pago.negocio_id, `Pago de S/ ${pago.monto.toFixed(2)} confirmado.`);
    almacenPlataforma.guardar(datos);
  },

  reiniciarDatos: async () => {
    almacenPlataforma.reiniciar();
  },
};

function enDias(dias: number) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

function anotar(acciones: AccionPlataforma[], negocioId: string, descripcion: string) {
  acciones.unshift({
    id: Math.max(0, ...acciones.map((item) => item.id)) + 1,
    negocio_id: negocioId,
    fecha: new Date().toISOString(),
    autor: AUTOR,
    descripcion,
  });
}
