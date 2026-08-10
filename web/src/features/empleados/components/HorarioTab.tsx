"use client";
import {
  Controller,
  useFieldArray,
  useWatch,
  type Control,
  type FieldErrors,
} from "react-hook-form";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconPlus, IconTrash } from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { DIAS_SEMANA } from "../constants";
import type { EmpleadoFormValues } from "../schemas/empleado.schema";
import DiaHorarioRow from "./DiaHorarioRow";

interface Props {
  control: Control<EmpleadoFormValues>;
  errors: FieldErrors<EmpleadoFormValues>;
}

const HorarioTab = ({ control, errors }: Props) => {
  const horario = useWatch({ control, name: "horario" });

  const {
    fields: excepciones,
    append: agregarExcepcion,
    remove: quitarExcepcion,
  } = useFieldArray({ control, name: "excepciones" });

  return (
    <Box>
      <Typography variant="h6" fontWeight={600} mb={2}>
        Horario semanal
      </Typography>

      <Stack spacing={1.5}>
        {DIAS_SEMANA.map(({ dia, nombre }, indice) => (
          <DiaHorarioRow
            key={dia}
            control={control}
            indice={indice}
            nombreDia={nombre}
            activo={horario?.[indice]?.activo ?? false}
            errorHoras={errors.horario?.[indice]?.hasta?.message}
          />
        ))}
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" fontWeight={600}>
        Excepciones
      </Typography>
      <Typography variant="body2" color="textSecondary" mb={2}>
        Permisos, emergencias o medio turno en una fecha concreta.
      </Typography>

      <Stack spacing={1.5}>
        {excepciones.map((campo, i) => (
          <Paper key={campo.id} variant="outlined" sx={{ p: 2 }}>
            <Grid container spacing={2} alignItems="flex-start">
              <Grid size={{ xs: 12, sm: 3 }}>
                <CustomFormLabel htmlFor={`exc-fecha-${i}`} sx={{ mt: 0 }}>
                  Fecha
                </CustomFormLabel>
                <Controller
                  name={`excepciones.${i}.fecha`}
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      id={`exc-fecha-${i}`}
                      type="date"
                      fullWidth
                      size="small"
                      error={!!errors.excepciones?.[i]?.fecha}
                      helperText={errors.excepciones?.[i]?.fecha?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 3 }}>
                <CustomFormLabel htmlFor={`exc-disp-${i}`} sx={{ mt: 0 }}>
                  ¿Disponible?
                </CustomFormLabel>
                <Controller
                  name={`excepciones.${i}.disponible`}
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      select
                      id={`exc-disp-${i}`}
                      fullWidth
                      size="small"
                      value={field.value ? "1" : "0"}
                      onChange={(e: any) => field.onChange(e.target.value === "1")}
                    >
                      <MenuItem value="0">No disponible</MenuItem>
                      <MenuItem value="1">Disponible</MenuItem>
                    </CustomTextField>
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 5 }}>
                <CustomFormLabel htmlFor={`exc-nota-${i}`} sx={{ mt: 0 }}>
                  Nota
                </CustomFormLabel>
                <Controller
                  name={`excepciones.${i}.nota`}
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      value={field.value ?? ""}
                      id={`exc-nota-${i}`}
                      fullWidth
                      size="small"
                      placeholder="Motivo"
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 1 }}>
                <Box sx={{ mt: { xs: 0, sm: 4.5 } }}>
                  <Button
                    color="error"
                    size="small"
                    startIcon={<IconTrash size={16} />}
                    onClick={() => quitarExcepcion(i)}
                  >
                    Quitar
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        ))}

        <Box>
          <Button
            startIcon={<IconPlus size={16} />}
            onClick={() =>
              agregarExcepcion({
                fecha: new Date().toISOString().slice(0, 10),
                disponible: false,
                nota: null,
              })
            }
          >
            Agregar excepción
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default HorarioTab;
