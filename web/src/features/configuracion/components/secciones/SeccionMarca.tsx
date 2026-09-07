"use client";
import { Controller } from "react-hook-form";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CampoImagenes from "@/components/shared/CampoImagenes";

import MarcoSeccion from "../MarcoSeccion";
import SeccionCampos from "../SeccionCampos";
import { useSeccion, type CampoConfiguracion } from "../../hooks/useSeccion";

const CAMPOS: CampoConfiguracion[] = [
  "logo",
  "cover",
  "color_primario",
  "color_secundario",
];

/** Campo de color con la misma pinta que en el resto de formularios. */
const CampoColor = ({ id, value, onChange }: any) => (
  <Box
    component="input"
    type="color"
    id={id}
    // El de la columna de `tenants`. El #7c3aed de antes era del Laravel
    // anterior y ya no lo devuelve nadie.
    value={value ?? "#4f46e5"}
    onChange={onChange}
    sx={{
      width: "100%",
      height: 41,
      p: 0.5,
      cursor: "pointer",
      borderRadius: 1,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
    }}
  />
);

/** El logo, la portada y los colores de la tienda pública. */
export default function SeccionMarca() {
  const s = useSeccion(CAMPOS, (valores, configuracion) => ({
    color_primario: valores.color_primario,
    color_secundario: valores.color_secundario,
    /*
      El archivo solo si es nuevo. No mandarlo significa «déjalo como está»,
      así que quitarlo necesita su bandera: sin ella, vaciar el campo no
      borraría nada y la imagen volvería al recargar.
    */
    logo: valores.logo[0]?.file ?? undefined,
    logo_eliminar: !!configuracion.logo_url && valores.logo.length === 0,
    cover: valores.cover[0]?.file ?? undefined,
    cover_eliminar: !!configuracion.cover_url && valores.cover.length === 0,
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
        titulo="Imágenes"
        descripcion="El logo y la cabecera de tu página pública."
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel htmlFor="logo">Logo</CustomFormLabel>
            <Controller
              name="logo"
              control={s.control}
              render={({ field }) => (
                <CampoImagenes
                  valor={field.value ?? []}
                  onChange={field.onChange}
                  max={1}
                  ayuda="Máx. 2 MB. Admite SVG."
                  error={s.errors.logo?.message as string}
                />
              )}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel htmlFor="cover">Portada</CustomFormLabel>
            <Controller
              name="cover"
              control={s.control}
              render={({ field }) => (
                <CampoImagenes
                  valor={field.value ?? []}
                  onChange={field.onChange}
                  max={1}
                  ayuda="Máx. 4 MB. Cabecera de la página pública."
                  error={s.errors.cover?.message as string}
                />
              )}
            />
          </Grid>
        </Grid>
      </SeccionCampos>

      <SeccionCampos
        titulo="Colores"
        descripcion="Se usan en la página pública de reservas, no en este panel."
        sinSeparador
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 4 }}>
            <CustomFormLabel htmlFor="color_primario">Primario</CustomFormLabel>
            <Controller
              name="color_primario"
              control={s.control}
              render={({ field }) => (
                <CampoColor
                  id="color_primario"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {/* El color no es un CustomTextField: no tiene dónde pintar su
                helperText, así que el mensaje va debajo a mano. */}
            {s.errors.color_primario ? (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 0.5, display: "block" }}
              >
                {s.errors.color_primario.message as string}
              </Typography>
            ) : null}
          </Grid>

          <Grid size={{ xs: 6, sm: 4 }}>
            <CustomFormLabel htmlFor="color_secundario">
              Secundario
            </CustomFormLabel>
            <Controller
              name="color_secundario"
              control={s.control}
              render={({ field }) => (
                <CampoColor
                  id="color_secundario"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {s.errors.color_secundario ? (
              <Typography
                variant="caption"
                color="error"
                sx={{ mt: 0.5, display: "block" }}
              >
                {s.errors.color_secundario.message as string}
              </Typography>
            ) : null}
          </Grid>
        </Grid>
      </SeccionCampos>
    </MarcoSeccion>
  );
}
