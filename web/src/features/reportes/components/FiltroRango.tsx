"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconDownload } from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { formatFechaLarga } from "@/lib/format";
import type { ParamsReporte } from "../types";

/** Atajos de rango. El Blade solo tiene los dos campos de fecha. */
const PRESETS = [
  { label: "Este mes", dias: null as number | null },
  { label: "Últimos 7 días", dias: 7 },
  { label: "Últimos 30 días", dias: 30 },
  { label: "Últimos 90 días", dias: 90 },
];

function hoy() {
  return new Date().toISOString().slice(0, 10);
}

function haceDias(dias: number) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() - dias + 1);
  return fecha.toISOString().slice(0, 10);
}

function inicioDeMes() {
  const fecha = new Date();
  return `${fecha.getFullYear()}-${String(fecha.getMonth() + 1).padStart(2, "0")}-01`;
}

/** Rango por defecto: el mes en curso, igual que Laravel. */
export function rangoPorDefecto(): ParamsReporte {
  return { desde: inicioDeMes(), hasta: hoy() };
}

interface Props {
  valor: ParamsReporte;
  onChange: (params: ParamsReporte) => void;
  onExportar: () => void;
  exportando: boolean;
}

const FiltroRango = ({ valor, onChange, onExportar, exportando }: Props) => {
  const aplicarPreset = (dias: number | null) => {
    onChange(
      dias === null
        ? { desde: inicioDeMes(), hasta: hoy() }
        : { desde: haceDias(dias), hasta: hoy() }
    );
  };

  return (
    <Card elevation={9}>
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          alignItems={{ xs: "stretch", md: "flex-end" }}
        >
          <Box>
            <CustomFormLabel htmlFor="desde" sx={{ mt: 0 }}>
              Desde
            </CustomFormLabel>
            <CustomTextField
              id="desde"
              type="date"
              value={valor.desde}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({ ...valor, desde: e.target.value })
              }
            />
          </Box>

          <Box>
            <CustomFormLabel htmlFor="hasta" sx={{ mt: 0 }}>
              Hasta
            </CustomFormLabel>
            <CustomTextField
              id="hasta"
              type="date"
              value={valor.hasta}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onChange({ ...valor, hasta: e.target.value })
              }
            />
          </Box>

          <Box flex={1} />

          <Button
            variant="outlined"
            startIcon={<IconDownload size={18} />}
            onClick={onExportar}
            disabled={exportando}
            sx={{ whiteSpace: "nowrap" }}
          >
            {exportando ? "Generando…" : "Exportar CSV"}
          </Button>
        </Stack>

        <Stack direction="row" spacing={1} mt={2} flexWrap="wrap" useFlexGap>
          {PRESETS.map((preset) => (
            <Chip
              key={preset.label}
              label={preset.label}
              size="small"
              variant="outlined"
              onClick={() => aplicarPreset(preset.dias)}
            />
          ))}
        </Stack>

        <Typography variant="caption" color="textSecondary" display="block" mt={2}>
          Mostrando {formatFechaLarga(valor.desde)} – {formatFechaLarga(valor.hasta)}
          {" · "}comparado con el período anterior de la misma duración.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default FiltroRango;
