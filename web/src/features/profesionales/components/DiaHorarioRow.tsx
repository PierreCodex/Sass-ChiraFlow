"use client";
import { Controller, useFieldArray, type Control } from "react-hook-form";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconPlus, IconX } from "@tabler/icons-react";

import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import type { ProfesionalFormValues } from "../schemas/profesional.schema";

interface Props {
  control: Control<ProfesionalFormValues>;
  indice: number;
  nombreDia: string;
  activo: boolean;
  errorHoras?: string;
}

/**
 * Una fila del horario semanal: día, jornada y sus breaks.
 * Los breaks son un field array anidado, por eso vive en su propio componente.
 */
const DiaHorarioRow = ({
  control,
  indice,
  nombreDia,
  activo,
  errorHoras,
}: Props) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `horario.${indice}.breaks` as const,
  });

  return (
    <Paper variant="outlined" sx={{ p: 2 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1.5}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <Controller
          name={`horario.${indice}.activo`}
          control={control}
          render={({ field }) => (
            <FormControlLabel
              sx={{ minWidth: 130, m: 0 }}
              control={
                <Checkbox
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                />
              }
              label={<Typography variant="subtitle2">{nombreDia}</Typography>}
            />
          )}
        />

        <Stack direction="row" spacing={1} alignItems="center" flexGrow={1}>
          <Controller
            name={`horario.${indice}.desde`}
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                type="time"
                size="small"
                disabled={!activo}
                sx={{ width: 140 }}
              />
            )}
          />
          <Typography variant="body2" color="textSecondary">
            a
          </Typography>
          <Controller
            name={`horario.${indice}.hasta`}
            control={control}
            render={({ field }) => (
              <CustomTextField
                {...field}
                type="time"
                size="small"
                disabled={!activo}
                sx={{ width: 140 }}
                error={!!errorHoras}
              />
            )}
          />
        </Stack>
      </Stack>

      {errorHoras ? (
        <Typography variant="caption" color="error" display="block" mt={0.5}>
          {errorHoras}
        </Typography>
      ) : null}

      <Box mt={1.5} sx={{ opacity: activo ? 1 : 0.5 }}>
        <Typography variant="caption" color="textSecondary">
          Breaks / descansos:
        </Typography>

        <Stack spacing={1} mt={0.5}>
          {fields.map((campo, i) => (
            <Stack key={campo.id} direction="row" spacing={1} alignItems="center">
              <Controller
                name={`horario.${indice}.breaks.${i}.desde`}
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    type="time"
                    size="small"
                    disabled={!activo}
                    sx={{ width: 130 }}
                  />
                )}
              />
              <Typography variant="body2" color="textSecondary">
                a
              </Typography>
              <Controller
                name={`horario.${indice}.breaks.${i}.hasta`}
                control={control}
                render={({ field }) => (
                  <CustomTextField
                    {...field}
                    type="time"
                    size="small"
                    disabled={!activo}
                    sx={{ width: 130 }}
                  />
                )}
              />
              <IconButton
                size="small"
                color="error"
                onClick={() => remove(i)}
                disabled={!activo}
              >
                <IconX size={16} />
              </IconButton>
            </Stack>
          ))}

          <Box>
            <Button
              size="small"
              startIcon={<IconPlus size={16} />}
              onClick={() => append({ desde: "13:00", hasta: "14:00" })}
              disabled={!activo}
            >
              Agregar break
            </Button>
          </Box>
        </Stack>
      </Box>
    </Paper>
  );
};

export default DiaHorarioRow;
