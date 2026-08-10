"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import {
  IconChevronLeft,
  IconChevronRight,
  IconLayoutList,
  IconPlus,
  IconCalendarEvent,
} from "@tabler/icons-react";

import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import type { Empleado } from "@/features/empleados/types";

export type VistaCalendario = "calendario" | "lista";

interface Props {
  fecha: string;
  onCambiarFecha: (fecha: string) => void;
  profesionales: Empleado[];
  profesionalId: number | "";
  onCambiarProfesional: (id: number | "") => void;
  vista: VistaCalendario;
  onCambiarVista: (vista: VistaCalendario) => void;
  onNuevaCita: () => void;
}

/** Suma o resta días a una fecha en formato Y-m-d. */
function desplazarDias(fecha: string, dias: number) {
  const d = new Date(`${fecha}T00:00:00`);
  d.setDate(d.getDate() + dias);
  return d.toISOString().slice(0, 10);
}

const CalendarioToolbar = ({
  fecha,
  onCambiarFecha,
  profesionales,
  profesionalId,
  onCambiarProfesional,
  vista,
  onCambiarVista,
  onNuevaCita,
}: Props) => (
  <Stack
    direction={{ xs: "column", md: "row" }}
    spacing={2}
    alignItems={{ xs: "stretch", md: "center" }}
    mb={3}
  >
    <Stack direction="row" spacing={1} alignItems="center">
      <IconButton
        onClick={() => onCambiarFecha(desplazarDias(fecha, -1))}
        aria-label="Día anterior"
      >
        <IconChevronLeft size={20} />
      </IconButton>

      <CustomTextField
        type="date"
        size="small"
        value={fecha}
        onChange={(e: any) => onCambiarFecha(e.target.value)}
        sx={{ width: 175 }}
      />

      <IconButton
        onClick={() => onCambiarFecha(desplazarDias(fecha, 1))}
        aria-label="Día siguiente"
      >
        <IconChevronRight size={20} />
      </IconButton>
    </Stack>

    <CustomTextField
      select
      size="small"
      value={profesionalId}
      onChange={(e: any) =>
        onCambiarProfesional(e.target.value === "" ? "" : Number(e.target.value))
      }
      sx={{ minWidth: 220 }}
      slotProps={{ select: { displayEmpty: true } }}
    >
      <MenuItem value="">Todos los profesionales</MenuItem>
      {profesionales.map((empleado) => (
        <MenuItem key={empleado.id} value={empleado.id}>
          {empleado.nombre}
        </MenuItem>
      ))}
    </CustomTextField>

    <Box flexGrow={1} />

    <Stack direction="row" spacing={1.5} alignItems="center">
      <ToggleButtonGroup
        exclusive
        size="small"
        value={vista}
        onChange={(_, valor) => valor && onCambiarVista(valor)}
      >
        <ToggleButton value="calendario">
          <IconCalendarEvent size={18} style={{ marginRight: 6 }} />
          Calendario
        </ToggleButton>
        <ToggleButton value="lista">
          <IconLayoutList size={18} style={{ marginRight: 6 }} />
          Lista
        </ToggleButton>
      </ToggleButtonGroup>

      <Button
        variant="contained"
        startIcon={<IconPlus size={18} />}
        onClick={onNuevaCita}
        sx={{ whiteSpace: "nowrap" }}
      >
        Nueva cita
      </Button>
    </Stack>
  </Stack>
);

export default CalendarioToolbar;
