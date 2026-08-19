import { usePlanes, useSuscripcion } from "@/features/suscripcion/hooks/useSuscripcion";
import { esIlimitado } from "@/features/suscripcion/types";
import { useTodosLosLocales } from "./useLocales";

/**
 * Cuántos locales puede tener el negocio según su plan actual, y si ya llegó
 * al límite. `max_sucursales` viene del `Plan` (999 = ilimitado, ver
 * `esIlimitado`) — el Básico solo trae 1, Premium y Pro traen ilimitados.
 *
 * Todo se crea en "Local 1" (el principal); pasar de ahí depende del plan.
 */
export function useLimiteLocales() {
  const { data: locales } = useTodosLosLocales();
  const { data: suscripcion } = useSuscripcion();
  const { data: planes } = usePlanes();

  const planActual = planes?.find((p) => p.id === suscripcion?.plan?.id) ?? null;
  const maxSucursales = planActual?.max_sucursales ?? 1;
  const cantidadActual = locales?.length ?? 0;
  const ilimitado = esIlimitado(maxSucursales);
  const alcanzado = !ilimitado && cantidadActual >= maxSucursales;
  const cargando = !locales || !suscripcion || !planes;

  return { planActual, maxSucursales, cantidadActual, ilimitado, alcanzado, cargando };
}
