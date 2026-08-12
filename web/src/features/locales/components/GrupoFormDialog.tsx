"use client";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import { useTodosLosLocales } from "../hooks/useLocales";
import { useTodosLosServicios } from "@/features/servicios/hooks/useServicios";
import { profesionalesMock } from "../services/recursos.api";
import { useActualizarGrupo, useCrearGrupo } from "../hooks/useRecursos";
import type { Grupo, GrupoPayload } from "../types";

const esquema = yup.object({
  nombre: yup
    .string()
    .trim()
    .max(150, "Máximo 150 caracteres")
    .required("El nombre es obligatorio"),
  locales: yup.array(yup.number().required()).required(),
  profesionales: yup.array(yup.number().required()).required(),
  servicios: yup.array(yup.number().required()).required(),
});

type FormValues = yup.InferType<typeof esquema>;

const valoresIniciales: FormValues = {
  nombre: "",
  locales: [],
  profesionales: [],
  servicios: [],
};

interface SelectorProps {
  etiqueta: string;
  opciones: { id: number; nombre: string }[];
  valor: number[];
  onChange: (ids: number[]) => void;
  vacio: string;
}

/** Chips seleccionables: el equivalente compacto a la lista de checkboxes. */
const SelectorChips = ({
  etiqueta,
  opciones,
  valor,
  onChange,
  vacio,
}: SelectorProps) => (
  <Box>
    <CustomFormLabel>{etiqueta}</CustomFormLabel>
    {opciones.length === 0 ? (
      <Typography variant="body2" color="textSecondary">
        {vacio}
      </Typography>
    ) : (
      <Stack
        direction="row"
        spacing={1}
        flexWrap="wrap"
        useFlexGap
        sx={{ maxHeight: 132, overflowY: "auto", py: 0.5 }}
      >
        {opciones.map((opcion) => {
          const marcado = valor.includes(opcion.id);
          return (
            <Chip
              key={opcion.id}
              label={opcion.nombre}
              size="small"
              color={marcado ? "primary" : "default"}
              variant={marcado ? "filled" : "outlined"}
              onClick={() =>
                onChange(
                  marcado
                    ? valor.filter((id) => id !== opcion.id)
                    : [...valor, opcion.id]
                )
              }
            />
          );
        })}
      </Stack>
    )}
  </Box>
);

interface Props {
  abierto: boolean;
  grupo?: Grupo | null;
  onCerrar: () => void;
}

const GrupoFormDialog = ({ abierto, grupo, onCerrar }: Props) => {
  const esEdicion = !!grupo;
  const crear = useCrearGrupo();
  const actualizar = useActualizarGrupo();
  const mutacion = esEdicion ? actualizar : crear;

  const { data: locales } = useTodosLosLocales();
  const { data: servicios } = useTodosLosServicios();

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(esquema),
    defaultValues: valoresIniciales,
  });

  useEffect(() => {
    if (!abierto) return;

    crear.reset();
    actualizar.reset();

    reset(
      grupo
        ? {
            nombre: grupo.nombre,
            locales: grupo.locales.map((local) => local.id),
            profesionales: grupo.profesionales.map((item) => item.id),
            servicios: grupo.servicios.map((item) => item.id),
          }
        : valoresIniciales
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, grupo, reset]);

  const onSubmit = handleSubmit((valores) => {
    const payload = valores as GrupoPayload;

    const alTerminar = {
      onSuccess: () => onCerrar(),
      onError: (error: unknown) => {
        const apiError = toApiError(error);
        if (apiError.errors?.nombre) {
          setError("nombre", { message: apiError.errors.nombre[0] });
        }
      },
    };

    if (esEdicion) {
      actualizar.mutate({ id: grupo.id, payload }, alTerminar);
    } else {
      crear.mutate(payload, alTerminar);
    }
  });

  const errorGeneral = mutacion.isError ? toApiError(mutacion.error) : null;

  return (
    <Dialog
      open={abierto}
      onClose={mutacion.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="sm"
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        noValidate
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <DialogTitle component="div">
          <Typography variant="h5" fontWeight={600}>
            {esEdicion ? "Editar grupo" : "Nuevo grupo"}
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={formularioCompacto}>
          {errorGeneral && !errorGeneral.errors ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorGeneral.message}
            </Alert>
          ) : null}

          <Stack spacing={1}>
            <Box>
              <CustomFormLabel htmlFor="nombre">
                Nombre del grupo
              </CustomFormLabel>
              <Controller
                name="nombre"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="nombre"
                    fullWidth
                    autoFocus
                    error={!!errors.nombre}
                    helperText={errors.nombre?.message}
                  />
                )}
              />
            </Box>

            <Controller
              name="locales"
              control={control}
              render={({ field }) => (
                <SelectorChips
                  etiqueta="Locales"
                  opciones={locales ?? []}
                  valor={field.value}
                  onChange={field.onChange}
                  vacio="No hay locales."
                />
              )}
            />

            <Controller
              name="profesionales"
              control={control}
              render={({ field }) => (
                <SelectorChips
                  etiqueta="Profesionales"
                  opciones={profesionalesMock}
                  valor={field.value}
                  onChange={field.onChange}
                  vacio="No hay profesionales."
                />
              )}
            />

            <Controller
              name="servicios"
              control={control}
              render={({ field }) => (
                <SelectorChips
                  etiqueta="Servicios"
                  opciones={servicios ?? []}
                  valor={field.value}
                  onChange={field.onChange}
                  vacio="No hay servicios."
                />
              )}
            />
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button
              type="submit"
              variant="contained"
              disabled={mutacion.isPending}
            >
              {mutacion.isPending
                ? "Guardando…"
                : esEdicion
                  ? "Guardar"
                  : "Crear grupo"}
            </Button>
            <Button
              onClick={onCerrar}
              color="inherit"
              disabled={mutacion.isPending}
            >
              Cancelar
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default GrupoFormDialog;
