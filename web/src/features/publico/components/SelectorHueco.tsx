"use client";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { toApiError } from "@/lib/api/client";
import { publicoKeys, useHorarios } from "../hooks/useTienda";
import { CUALQUIER_PROFESIONAL, type ProfesionalPublico } from "../types";

interface Props {
  slug: string;
  localId: number;
  profesionales: ProfesionalPublico[];
  /** Un id por unidad: dos cortes = el id dos veces. El servidor suma. */
  servicios: number[];
  profesionalId: number | null;
  fecha: string | null;
  hora: string | null;
  onProfesional: (id: number) => void;
  onFecha: (fecha: string) => void;
  onHora: (hora: string | null) => void;
}

/**
 * Hoy en la hora del navegador. `toISOString()` da la fecha en UTC: en Lima,
 * desde las 19:00 ya sería mañana y no se podría reservar para esta noche.
 */
function hoy() {
  const ahora = new Date();
  const dos = (n: number) => String(n).padStart(2, "0");
  return `${ahora.getFullYear()}-${dos(ahora.getMonth() + 1)}-${dos(ahora.getDate())}`;
}

/**
 * Profesional → fecha → hueco, en ese orden.
 *
 * Los huecos dependen de quién atiende, así que se elige primero. «Cualquier
 * profesional» (Story 6.4) junta las horas de todos los que pueden, y la
 * reserva asigna uno.
 *
 * Las horas son chips, no un campo libre: si un hueco no está en la lista, no
 * se puede reservar. La lista se refresca cada 30 s; si la hora elegida
 * desaparece (otro cliente se la llevó), se quita y se dice.
 */
const SelectorHueco = ({
  slug,
  localId,
  profesionales,
  servicios,
  profesionalId,
  fecha,
  hora,
  onProfesional,
  onFecha,
  onHora,
}: Props) => {
  const { data: huecos, isPending, isFetching, error } = useHorarios(
    slug,
    localId,
    servicios,
    profesionalId,
    fecha
  );
  const [perdida, setPerdida] = useState<string | null>(null);

  /*
    Story 6.5: un 404 es «esto ya no se puede reservar aquí» (servicio
    retirado, profesional que ya no lo presta). Se refresca el catálogo, y la
    página quita de la selección lo que ya no está y lo explica.
  */
  const queryClient = useQueryClient();
  const yaNoSePuede = !!error && toApiError(error).status === 404;
  useEffect(() => {
    if (yaNoSePuede) {
      queryClient.invalidateQueries({ queryKey: publicoKeys.sedesDe(slug) });
    }
  }, [yaNoSePuede, queryClient, slug]);

  useEffect(() => {
    if (!hora || !huecos || isFetching) return;
    if (!huecos.includes(hora)) {
      setPerdida(hora);
      onHora(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [huecos, hora, isFetching]);

  const elegirProfesional = (id: number) => {
    setPerdida(null);
    onProfesional(id);
  };
  const elegirFecha = (valor: string) => {
    setPerdida(null);
    onFecha(valor);
  };
  const elegirHora = (valor: string) => {
    setPerdida(null);
    onHora(valor);
  };

  return (
    <Stack spacing={1}>
      <Box>
        <CustomFormLabel sx={{ mt: 0 }}>Profesional</CustomFormLabel>
        <CustomTextField
          select
          fullWidth
          value={profesionalId ?? ""}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            elegirProfesional(Number(e.target.value))
          }
        >
          {profesionales.length > 1 ? (
            <MenuItem value={CUALQUIER_PROFESIONAL}>Cualquier profesional</MenuItem>
          ) : null}
          {profesionales.map((profesional) => (
            <MenuItem key={profesional.id} value={profesional.id}>
              {profesional.nombre}
            </MenuItem>
          ))}
        </CustomTextField>
      </Box>

      <Box>
        <CustomFormLabel>Fecha</CustomFormLabel>
        <CustomTextField
          type="date"
          fullWidth
          value={fecha ?? ""}
          slotProps={{ htmlInput: { min: hoy() } }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            elegirFecha(e.target.value)
          }
        />
      </Box>

      <Box>
        <CustomFormLabel>Hora</CustomFormLabel>

        {perdida ? (
          <Alert severity="warning" sx={{ mb: 1 }}>
            La hora {perdida} ya no está libre. Elige otra.
          </Alert>
        ) : null}

        {profesionalId === null || !fecha ? (
          <Typography variant="body2" color="textSecondary">
            Elige profesional y fecha para ver las horas libres.
          </Typography>
        ) : yaNoSePuede ? (
          <Alert severity="warning">
            Esto ya no se puede reservar con quien elegiste. Elige otro
            profesional o revisa tu selección.
          </Alert>
        ) : isPending ? (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" width={72} height={32} />
            ))}
          </Stack>
        ) : !huecos?.length ? (
          <Alert severity="warning">
            No hay horas libres ese día. Prueba con otra fecha u otro
            profesional.
          </Alert>
        ) : (
          <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
            {huecos.map((libre) => (
              <Chip
                key={libre}
                label={libre}
                color={libre === hora ? "primary" : "default"}
                variant={libre === hora ? "filled" : "outlined"}
                onClick={() => elegirHora(libre)}
              />
            ))}
          </Stack>
        )}
      </Box>
    </Stack>
  );
};

export default SelectorHueco;
