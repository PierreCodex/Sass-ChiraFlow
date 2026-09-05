"use client";
import { useMemo } from "react";
import { Controller } from "react-hook-form";
import Autocomplete from "@mui/material/Autocomplete";
import Grid from "@mui/material/Grid";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";

import MarcoSeccion from "../MarcoSeccion";
import SeccionCampos from "../SeccionCampos";
import { useSeccion, type CampoConfiguracion } from "../../hooks/useSeccion";
import { opcionesDeZonas } from "../../zonas";

const CAMPOS: CampoConfiguracion[] = [
  "nombre",
  "zona_horaria",
  "descripcion",
  "email",
  "telefono",
  "whatsapp",
  "direccion",
  "informacion_adicional",
  "latitud",
  "longitud",
];

/** Quién es el negocio: cómo se llama, cómo lo contactan y dónde está. */
export default function SeccionNegocio() {
  const s = useSeccion(CAMPOS, (valores) => ({
    nombre: valores.nombre,
    zona_horaria: valores.zona_horaria,
    descripcion: valores.descripcion,
    email: valores.email,
    telefono: valores.telefono,
    whatsapp: valores.whatsapp,
    direccion: valores.direccion,
    informacion_adicional: valores.informacion_adicional,
    latitud: valores.latitud,
    longitud: valores.longitud,
  }));

  const zonas = useMemo(
    () => opcionesDeZonas(s.zonasHorarias),
    [s.zonasHorarias]
  );

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
        titulo="Identidad"
        descripcion="El nombre y la descripción que ven tus clientes en la página de reservas."
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 7 }}>
            {campo("nombre", "Nombre del negocio")}
          </Grid>
          <Grid size={{ xs: 12, sm: 5 }}>
            <CustomFormLabel htmlFor="zona_horaria">Zona horaria</CustomFormLabel>
            {/*
              Con búsqueda y no un `select` plano: son 419 opciones y
              recorrerlas con la rueda no es navegar. El desfase va en el
              rótulo porque «America/Lima» no le dice nada a quien no conoce la
              nomenclatura IANA, y «GMT-5» sí.
            */}
            <Controller
              name="zona_horaria"
              control={s.control}
              render={({ field }) => (
                <Autocomplete
                  id="zona_horaria"
                  options={zonas}
                  groupBy={(o) => o.region}
                  getOptionLabel={(o) =>
                    o.desfase ? `${o.etiqueta} (${o.desfase})` : o.etiqueta
                  }
                  isOptionEqualToValue={(o, v) => o.valor === v.valor}
                  value={zonas.find((o) => o.valor === field.value) ?? null}
                  onChange={(_, opcion) => field.onChange(opcion?.valor ?? "")}
                  disabled={zonas.length === 0}
                  renderInput={(params) => (
                    <CustomTextField
                      {...params}
                      error={!!s.errors.zona_horaria}
                      helperText={s.errors.zona_horaria?.message as string}
                    />
                  )}
                />
              )}
            />
          </Grid>
          <Grid size={12}>
            {campo("descripcion", "Descripción", {
              multiline: true,
              rows: 3,
              helperText:
                (s.errors.descripcion?.message as string) ??
                "Se muestra en la página pública de reservas.",
            })}
          </Grid>
        </Grid>
      </SeccionCampos>

      <SeccionCampos
        titulo="Contacto"
        descripcion="Cómo te escriben tus clientes. El WhatsApp es por donde salen los recordatorios."
      >
        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 6 }}>
            {campo("email", "Email", { type: "email" })}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>{campo("telefono", "Teléfono")}</Grid>
          <Grid size={{ xs: 12, sm: 6 }}>{campo("whatsapp", "WhatsApp")}</Grid>
        </Grid>
      </SeccionCampos>

      <SeccionCampos
        titulo="Ubicación"
        descripcion="Dónde te encuentran. Las coordenadas sitúan el mapa de la tienda."
        sinSeparador
      >
        <Grid container spacing={2}>
          <Grid size={12}>{campo("direccion", "Dirección")}</Grid>
          <Grid size={12}>
            {campo("informacion_adicional", "Información adicional")}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {campo("latitud", "Latitud", { type: "number" })}
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            {campo("longitud", "Longitud", { type: "number" })}
          </Grid>
        </Grid>
      </SeccionCampos>
    </MarcoSeccion>
  );
}
