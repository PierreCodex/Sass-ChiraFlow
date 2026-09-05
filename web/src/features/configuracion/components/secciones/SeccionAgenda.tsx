"use client";
import { Controller, useWatch } from "react-hook-form";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";

import MarcoSeccion from "../MarcoSeccion";
import SeccionCampos from "../SeccionCampos";
import { useSeccion, type CampoConfiguracion } from "../../hooks/useSeccion";

const CAMPOS: CampoConfiguracion[] = [
  "horario_apertura",
  "horario_cierre",
  "modo_intervalo",
  "intervalo_min",
];

/** El horario de respaldo del negocio y cómo se generan los huecos. */
export default function SeccionAgenda() {
  const s = useSeccion(CAMPOS, (valores) => ({
    horario_apertura: valores.horario_apertura,
    horario_cierre: valores.horario_cierre,
    /*
      Los dos campos de agenda viajan JUNTOS: la regla del intervalo se apoya
      en el modo para saber si aplica, así que mandar el intervalo solo no
      hace nada.
    */
    agenda: {
      modo_intervalo: valores.modo_intervalo,
      intervalo_min: valores.intervalo_min,
    },
  }));

  const modo = useWatch({ control: s.control, name: "modo_intervalo" });

  const campo = (
    name: CampoConfiguracion,
    label: string,
    extra: Record<string, unknown> = {}
  ) => (
    <>
      <CustomFormLabel htmlFor={name}>{label}</CustomFormLabel>
      <Controller
        name={name}
        control={s.control}
        render={({ field }) => (
          <CustomTextField
            {...field}
            value={(field.value as string) ?? ""}
            id={name}
            fullWidth
            error={!!s.errors[name]}
            helperText={s.errors[name]?.message as string}
            {...extra}
          />
        )}
      />
    </>
  );

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
        titulo="Horario de atención"
        descripcion="Se aplica a los profesionales que no tienen horario propio."
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 6, sm: 5 }}>
            {campo("horario_apertura", "Apertura", { type: "time" })}
          </Grid>
          <Grid size={{ xs: 6, sm: 5 }}>
            {campo("horario_cierre", "Cierre", { type: "time" })}
          </Grid>
        </Grid>
      </SeccionCampos>

      <SeccionCampos
        titulo="Huecos de reserva"
        descripcion="Cada cuánto se le ofrece un turno al cliente en la tienda."
        sinSeparador
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 7 }}>
            <CustomFormLabel htmlFor="modo_intervalo">
              Cada cuánto se ofrece un turno
            </CustomFormLabel>
            <Controller
              name="modo_intervalo"
              control={s.control}
              render={({ field }) => (
                <CustomTextField
                  {...field}
                  value={field.value ?? "duracion_servicio"}
                  select
                  id="modo_intervalo"
                  fullWidth
                >
                  <MenuItem value="duracion_servicio">
                    Según la duración del servicio
                  </MenuItem>
                  <MenuItem value="fijo">Cada N minutos</MenuItem>
                </CustomTextField>
              )}
            />
          </Grid>

          {/* El intervalo solo tiene sentido con la rejilla fija: con
              `duracion_servicio` el paso lo pone el servicio y el backend lo
              ignora aunque se mande. */}
          {modo === "fijo" ? (
            <Grid size={{ xs: 12, sm: 5 }}>
              {campo("intervalo_min", "Intervalo (min)", { type: "number" })}
            </Grid>
          ) : null}

          <Grid size={12}>
            <Alert severity="info" variant="outlined">
              {modo === "fijo"
                ? "Rejilla fija: más opciones para el cliente, pero puede dejar huecos que nadie llene."
                : "Los turnos se encadenan con la duración de cada servicio, para no dejar huecos muertos."}
            </Alert>
          </Grid>
        </Grid>
      </SeccionCampos>
    </MarcoSeccion>
  );
}
