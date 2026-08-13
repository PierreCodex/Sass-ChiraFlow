"use client";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
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
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { IconBrandWhatsapp } from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { dialogoResponsive, formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import {
  EVENTOS_WHATSAPP,
  GRUPOS_VARIABLES,
  MAX_CONTENIDO,
} from "../constants";
import { plantillasWhatsappApi } from "../services/whatsapp.api";
import {
  useActualizarPlantilla,
  useCrearPlantilla,
} from "../hooks/usePlantillas";
import VistaPreviaWhatsapp from "./VistaPreviaWhatsapp";
import type {
  EventoWhatsapp,
  PlantillaWhatsapp,
  PlantillaWhatsappPayload,
} from "../types";

/** Reglas de `PlantillaWhatsappController::store` / `update`. */
const esquema = yup.object({
  nombre: yup
    .string()
    .trim()
    .max(100, "Máximo 100 caracteres")
    .required("El nombre es obligatorio"),
  evento: yup
    .string()
    .oneOf(Object.keys(EVENTOS_WHATSAPP) as EventoWhatsapp[])
    .required(),
  contenido: yup
    .string()
    .trim()
    .max(MAX_CONTENIDO, `Máximo ${MAX_CONTENIDO} caracteres`)
    .required("Escribe el mensaje"),
  activo: yup.boolean().required(),
});

type FormValues = yup.InferType<typeof esquema>;

const valoresIniciales: FormValues = {
  nombre: "",
  evento: "personalizado",
  contenido: "",
  activo: true,
};

interface Props {
  abierto: boolean;
  plantilla?: PlantillaWhatsapp | null;
  /** Contenido y nombre de una prediseñada, al crear desde la galería. */
  inicial?: Partial<FormValues> | null;
  /** Plantillas existentes: para avisar de que el evento ya está ocupado. */
  existentes: PlantillaWhatsapp[];
  onCerrar: () => void;
}

const PlantillaFormDialog = ({
  abierto,
  plantilla,
  inicial,
  existentes,
  onCerrar,
}: Props) => {
  const theme = useTheme();

  const esEdicion = !!plantilla;
  const crear = useCrearPlantilla();
  const actualizar = useActualizarPlantilla();
  const mutacion = esEdicion ? actualizar : crear;

  const areaRef = useRef<HTMLTextAreaElement | null>(null);
  const [telefono, setTelefono] = useState("");
  const [errorPrueba, setErrorPrueba] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(esquema),
    defaultValues: valoresIniciales,
  });

  const contenido = useWatch({ control, name: "contenido" }) ?? "";
  const evento = useWatch({ control, name: "evento" });

  useEffect(() => {
    if (!abierto) return;

    crear.reset();
    actualizar.reset();
    setTelefono("");
    setErrorPrueba(null);

    reset(
      plantilla
        ? {
            nombre: plantilla.nombre,
            evento: plantilla.evento,
            contenido: plantilla.contenido,
            activo: plantilla.activo,
          }
        : { ...valoresIniciales, ...inicial }
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, plantilla, inicial, reset]);

  /** Inserta `{{clave}}` donde está el cursor, no al final. */
  const insertarVariable = (clave: string) => {
    const area = areaRef.current;
    const marca = `{{${clave}}}`;

    if (!area) {
      setValue("contenido", `${contenido}${marca}`, { shouldDirty: true });
      return;
    }

    const inicio = area.selectionStart ?? contenido.length;
    const fin = area.selectionEnd ?? contenido.length;
    const nuevo = contenido.slice(0, inicio) + marca + contenido.slice(fin);

    setValue("contenido", nuevo, { shouldDirty: true });

    // Deja el cursor después de la variable recién insertada.
    requestAnimationFrame(() => {
      area.focus();
      area.setSelectionRange(inicio + marca.length, inicio + marca.length);
    });
  };

  const onSubmit = handleSubmit((valores) => {
    const payload = valores as PlantillaWhatsappPayload;

    const alTerminar = {
      onSuccess: () => onCerrar(),
      onError: (error: unknown) => {
        const apiError = toApiError(error);
        if (apiError.errors) {
          Object.entries(apiError.errors).forEach(([campo, mensajes]) => {
            setError(campo as keyof FormValues, { message: mensajes[0] });
          });
        }
      },
    };

    if (esEdicion) {
      actualizar.mutate({ id: plantilla.id, payload }, alTerminar);
    } else {
      crear.mutate(payload, alTerminar);
    }
  });

  const enviarPrueba = () => {
    setErrorPrueba(null);
    try {
      plantillasWhatsappApi.enviarPrueba({ telefono, contenido });
    } catch (error) {
      setErrorPrueba((error as Error).message);
    }
  };

  // El backend hace updateOrCreate por (negocio, evento): elegir un evento ya
  // usado por otra plantilla la sobrescribe sin avisar.
  const ocupada = existentes.find(
    (item) => item.evento === evento && item.id !== plantilla?.id
  );

  const errorGeneral = mutacion.isError ? toApiError(mutacion.error) : null;

  return (
    <Dialog
      sx={dialogoResponsive}
      open={abierto}
      onClose={mutacion.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="md"
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
            {esEdicion ? "Editar plantilla" : "Nueva plantilla"}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Haz clic en una variable para insertarla donde tengas el cursor.
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={formularioCompacto}>
          {errorGeneral && !errorGeneral.errors ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorGeneral.message}
            </Alert>
          ) : null}

          <Grid container spacing={3}>
            {/* Columna de edición */}
            <Grid size={{ xs: 12, md: 7 }}>
              <CustomFormLabel htmlFor="nombre">
                Nombre del mensaje
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
                    helperText={
                      errors.nombre?.message ??
                      "Se usa para reconocer el mensaje en la agenda."
                    }
                  />
                )}
              />

              <CustomFormLabel htmlFor="evento">Evento</CustomFormLabel>
              <Controller
                name="evento"
                control={control}
                render={({ field }) => (
                  <CustomTextField {...field} select id="evento" fullWidth>
                    {(Object.keys(EVENTOS_WHATSAPP) as EventoWhatsapp[]).map(
                      (clave) => (
                        <MenuItem key={clave} value={clave}>
                          {EVENTOS_WHATSAPP[clave]}
                        </MenuItem>
                      )
                    )}
                  </CustomTextField>
                )}
              />

              {ocupada ? (
                <Alert severity="warning" sx={{ mt: 1.5 }}>
                  Ya existe una plantilla para este evento (
                  <strong>{ocupada.nombre}</strong>). Solo puede haber una por
                  evento: al guardar, esta la reemplaza.
                </Alert>
              ) : null}

              <CustomFormLabel>Variables disponibles</CustomFormLabel>
              <Stack spacing={1.5}>
                {GRUPOS_VARIABLES.map((grupo) => (
                  <Box key={grupo.titulo}>
                    <Typography
                      variant="caption"
                      color="textSecondary"
                      textTransform="uppercase"
                      fontWeight={600}
                    >
                      {grupo.titulo}
                    </Typography>
                    <Stack
                      direction="row"
                      spacing={0.75}
                      flexWrap="wrap"
                      useFlexGap
                      mt={0.5}
                    >
                      {grupo.variables.map((variable) => (
                        <Chip
                          key={variable.key}
                          label={variable.label}
                          size="small"
                          variant="outlined"
                          onClick={() => insertarVariable(variable.key)}
                        />
                      ))}
                    </Stack>
                  </Box>
                ))}
              </Stack>

              <CustomFormLabel htmlFor="contenido">
                Personaliza el mensaje
              </CustomFormLabel>
              <Controller
                name="contenido"
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    id="contenido"
                    fullWidth
                    multiline
                    rows={7}
                    inputRef={areaRef}
                    error={!!errors.contenido}
                    helperText={
                      errors.contenido?.message ??
                      `${contenido.length} / ${MAX_CONTENIDO}`
                    }
                  />
                )}
              />

              {esEdicion ? (
                <Controller
                  name="activo"
                  control={control}
                  render={({ field }) => (
                    <FormControlLabel
                      sx={{ mt: 1 }}
                      control={
                        <Switch
                          checked={field.value}
                          onChange={(e) => field.onChange(e.target.checked)}
                        />
                      }
                      label="Plantilla activa"
                    />
                  )}
                />
              ) : null}
            </Grid>

            {/* Columna de vista previa */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Box sx={{ position: "sticky", top: 0 }}>
                <VistaPreviaWhatsapp contenido={contenido} />

                <Divider sx={{ my: 3 }} />

                <Typography variant="subtitle2" fontWeight={600} mb={1}>
                  Enviar una prueba
                </Typography>
                <Typography variant="caption" color="textSecondary" display="block" mb={1}>
                  Abre WhatsApp con el mensaje listo para enviar.
                </Typography>

                <Stack direction="row" spacing={1}>
                  <CustomTextField
                    value={telefono}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setTelefono(e.target.value)
                    }
                    placeholder="51999888777"
                    fullWidth
                    size="small"
                  />
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={enviarPrueba}
                    disabled={!telefono.trim() || !contenido.trim()}
                    startIcon={<IconBrandWhatsapp size={18} />}
                    sx={{ whiteSpace: "nowrap" }}
                  >
                    Probar
                  </Button>
                </Stack>

                {errorPrueba ? (
                  <Alert severity="error" sx={{ mt: 1.5 }}>
                    {errorPrueba}
                  </Alert>
                ) : null}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={mutacion.isPending}>
              {mutacion.isPending ? "Guardando…" : "Guardar plantilla"}
            </Button>
            <Button onClick={onCerrar} color="inherit" disabled={mutacion.isPending}>
              Cancelar
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default PlantillaFormDialog;
