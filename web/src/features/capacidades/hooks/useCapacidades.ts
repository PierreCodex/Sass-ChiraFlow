import { useQuery } from "@tanstack/react-query";
import { useUsuarioActual } from "@/features/auth/hooks/useAuth";
import { etiquetaRol } from "@/features/auth/types";
import { capacidadesApi } from "../services/capacidades.api";
import { puedeGestionar, puedeVer, type Modulo } from "../types";

export const capacidadesKeys = {
  all: ["capacidades"] as const,
};

/**
 * Lo que puede hacer quien está mirando.
 *
 * Se pide **una vez** y se cachea de largo: cambia cuando alguien le toca el
 * rol, y eso no pasa a mitad de sesión. Sin `staleTime` alto, cada pantalla
 * que preguntara por un permiso dispararía su propia petición.
 *
 * `retry: false` porque un fallo aquí no se arregla reintentando: o hay sesión
 * o no la hay, y el 401 ya lo recoge el interceptor.
 */
export function useCapacidades() {
  return useQuery({
    queryKey: capacidadesKeys.all,
    queryFn: capacidadesApi.obtener,
    staleTime: 10 * 60 * 1000,
    retry: false,
  });
}

/**
 * El nombre del rol de quien mira, para MOSTRARLO (Story 1.11).
 *
 * El del negocio, de `GET /capacidades`: `usuario.rol` es el central y dice
 * «Profesional» a una recepcionista y a cualquier rol propio. Mientras las
 * capacidades no llegan, o sin backend que las mande, cae al central.
 */
export function useNombreDelRol(): string {
  const { data: capacidades } = useCapacidades();
  const { data: usuario } = useUsuarioActual();

  return capacidades?.rol?.nombre ?? etiquetaRol(usuario?.rol);
}

/**
 * Los dos permisos de un módulo, listos para usar en un componente.
 *
 * Mientras carga devuelve `false` en los dos: se enseña de menos y se corrige,
 * que es el orden correcto. Al revés se vería un botón un instante y
 * desaparecería debajo del cursor.
 */
export function usePermisos(modulo: Modulo) {
  const { data, isPending } = useCapacidades();

  return {
    puedeVer: puedeVer(data, modulo),
    puedeGestionar: puedeGestionar(data, modulo),
    cargando: isPending,
  };
}
