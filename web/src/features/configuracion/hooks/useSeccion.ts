"use client";
import { useCallback, useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import { toApiError } from "@/lib/api/client";

import { useConfiguracion, useGuardarConfiguracion } from "./useConfiguracion";
import {
  configuracionSchema,
  type ConfiguracionFormValues,
} from "../schemas/configuracion.schema";
import type { Configuracion, ConfiguracionPayload } from "../types";

export type CampoConfiguracion = keyof ConfiguracionFormValues;

/** Todo lo que llega de la API, con la forma que espera el formulario. */
function valoresDesde(configuracion: Configuracion): ConfiguracionFormValues {
  const { slug, logo_url, cover_url, agenda, zona_horaria, ...resto } =
    configuracion;

  return {
    ...resto,
    zona_horaria: zona_horaria ?? "America/Lima",
    logo: logo_url ? [{ url: logo_url }] : [],
    cover: cover_url ? [{ url: cover_url }] : [],
    modo_intervalo: agenda.modo_intervalo,
    intervalo_min: agenda.intervalo_min,
  } as ConfiguracionFormValues;
}

function soloLos<T extends object>(valores: T, campos: (keyof T)[]) {
  return Object.fromEntries(
    campos.map((campo) => [campo, valores[campo]])
  ) as Pick<T, keyof T>;
}

/**
 * El formulario de **una** sección de Configuración.
 *
 * Las cuatro secciones de `general/` comparten datos y forma de guardar, y lo
 * único que cambia es qué campos lleva cada una. Esto lo centraliza para que
 * una sección nueva sean sus campos y su maqueta, no otro formulario entero.
 *
 * **Cada sección manda solo lo suyo.** El `PUT` del backend es un parche:
 * clave ausente significa «no lo toques», así que guardar Agenda no puede
 * borrar el email que escribió Negocio. Es la razón de que este hook reciba la
 * lista de campos en vez de mandar el objeto completo.
 *
 * Las reglas salen de `configuracionSchema` con `.pick()`, no de un esquema
 * por sección: si cada una tuviera el suyo, la validación del intervalo o la
 * del horario acabarían divergiendo de la del backend en una sola de las
 * cuatro, que es el fallo que nadie encuentra.
 */
export function useSeccion(
  campos: CampoConfiguracion[],
  aPayload: (
    valores: ConfiguracionFormValues,
    configuracion: Configuracion
  ) => ConfiguracionPayload
) {
  const { data, isPending, error } = useConfiguracion();
  const configuracion = data?.configuracion;
  const guardar = useGuardarConfiguracion();

  const esquema = configuracionSchema.pick(campos);

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<any>({ resolver: yupResolver(esquema as any) });

  /*
    Rellenar el formulario con lo que llega de la red — pero **nunca encima de
    lo que la persona está escribiendo**.

    Sin el guardia de `isDirty` esto se dispara en cada cambio de identidad de
    `configuracion`, y React Query devuelve un objeto nuevo cada vez que
    refresca aunque los datos sean iguales: guardar otra sección invalida la
    consulta, el refetch aterriza, y los cambios a medio escribir de esta
    desaparecen sin que nadie haya tocado nada. Con el guardia, el formulario
    solo se rellena cuando no hay nada que perder.
  */
  useEffect(() => {
    if (!configuracion || isDirty) return;
    reset(soloLos(valoresDesde(configuracion), campos));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuracion, reset]);

  const descartar = useCallback(() => {
    if (configuracion) reset(soloLos(valoresDesde(configuracion), campos));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configuracion, reset]);

  const onSubmit = handleSubmit((valores) => {
    if (!configuracion) return;

    guardar.mutate(aPayload(valores as ConfiguracionFormValues, configuracion), {
      /*
        Marcar limpio con lo que se acaba de enviar, sin esperar al refetch.
        Hace falta porque el efecto de arriba ya no pisa un formulario sucio:
        si esto no estuviera, la barra de «cambios sin guardar» se quedaría
        puesta para siempre después de guardar bien.
      */
      onSuccess: () => reset(valores),
      onError: (err) => {
        const apiError = toApiError(err);
        if (!apiError.errors) return;

        Object.entries(apiError.errors).forEach(([campo, mensajes]) => {
          /*
            El backend valida el objeto anidado y devuelve `agenda.intervalo_min`;
            en pantalla ese campo se llama `intervalo_min`. Sin la traducción el
            422 más probable de la sección de Agenda no se pintaría en ninguna
            parte.
          */
          const destino = campo.startsWith("agenda.")
            ? campo.slice("agenda.".length)
            : campo;

          if (campos.includes(destino as CampoConfiguracion)) {
            setError(destino, { message: mensajes[0] });
          }
        });
      },
    });
  });

  return {
    control,
    errors,
    isDirty,
    onSubmit,
    descartar,
    configuracion,
    zonasHorarias: data?.zonasHorarias ?? [],
    cargando: isPending,
    error,
    guardando: guardar.isPending,
    errorAlGuardar: guardar.isError ? guardar.error : null,
  };
}
