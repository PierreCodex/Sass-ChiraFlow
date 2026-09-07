"use client";
import { Controller } from "react-hook-form";
import FormControlLabel from "@mui/material/FormControlLabel";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";

import EnlaceTienda from "../EnlaceTienda";
import MarcoSeccion from "../MarcoSeccion";
import SeccionCampos from "../SeccionCampos";
import { useSeccion, type CampoConfiguracion } from "../../hooks/useSeccion";

const CAMPOS: CampoConfiguracion[] = [
  "sitio_publico_activo",
  "mostrar_en_marketplace",
  "terminos_servicio",
];

/** El enlace de la tienda, si está encendida y sus términos. */
export default function SeccionSitioPublico() {
  const s = useSeccion(CAMPOS, (valores) => ({
    /*
      Los dos booleanos viajan aunque sean `false`. La distinción del parche es
      entre clave AUSENTE —«no lo toques»— y clave presente con valor falso,
      que sí escribe: si `false` no viajara, apagar la tienda no la apagaría.
    */
    sitio_publico_activo: valores.sitio_publico_activo,
    mostrar_en_marketplace: valores.mostrar_en_marketplace,
    terminos_servicio: valores.terminos_servicio,
  }));

  return (
    <MarcoSeccion
      cargando={s.cargando}
      error={s.error}
      errorAlGuardar={s.errorAlGuardar}
      isDirty={s.isDirty}
      guardando={s.guardando}
      onSubmit={s.onSubmit}
      onDescartar={s.descartar}
    >
      <SeccionCampos
        titulo="Tu enlace"
        descripcion="La dirección que repartes a tus clientes."
      >
        {/*
          El guardia no sobra aunque `MarcoSeccion` no pinte los hijos mientras
          carga: en JSX los hijos se EVALÚAN antes de pasarse, así que sin esto
          el `.slug` se ejecuta con la configuración todavía en `undefined` y
          la sección revienta en el primer render.
        */}
        {s.configuracion ? (
          <EnlaceTienda
            slug={s.configuracion.slug}
            nombreNegocio={s.configuracion.nombre}
            variante="compacto"
          />
        ) : null}
      </SeccionCampos>

      <SeccionCampos
        titulo="Visibilidad"
        descripcion="Si apagas la página, el enlace deja de responder para tus clientes."
      >
        <Stack spacing={1}>
          <Controller
            name="sitio_publico_activo"
            control={s.control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="Página pública de reservas activa"
              />
            )}
          />

          <Controller
            name="mostrar_en_marketplace"
            control={s.control}
            render={({ field }) => (
              <FormControlLabel
                control={
                  <Switch
                    checked={!!field.value}
                    onChange={(e) => field.onChange(e.target.checked)}
                  />
                }
                label="Aparecer en el marketplace"
              />
            )}
          />
        </Stack>
      </SeccionCampos>

      <SeccionCampos
        titulo="Términos del servicio"
        descripcion="Tus condiciones de reserva y cancelación, tal como las verá el cliente."
        sinSeparador
      >
        <CustomFormLabel htmlFor="terminos_servicio">Texto</CustomFormLabel>
        <Controller
          name="terminos_servicio"
          control={s.control}
          render={({ field }) => (
            <CustomTextField
              {...field}
              value={field.value ?? ""}
              id="terminos_servicio"
              fullWidth
              multiline
              rows={6}
              error={!!s.errors.terminos_servicio}
              helperText={s.errors.terminos_servicio?.message as string}
            />
          )}
        />
      </SeccionCampos>
    </MarcoSeccion>
  );
}
