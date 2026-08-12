"use client";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import DashboardCard from "@/components/shared/DashboardCard";
import { formatMoneda } from "@/lib/format";
import type { FilaAgrupada } from "../types";

interface Props {
  titulo: string;
  filas: FilaAgrupada[];
  vacio: string;
}

/**
 * Desglose por servicio o por profesional.
 *
 * La app actual muestra "12 · $840" a secas. Añado una barra proporcional al
 * mayor de la lista: con diez filas de números sueltos no se ve quién manda,
 * y la barra responde esa pregunta sin leer una sola cifra.
 */
const DesgloseLista = ({ titulo, filas, vacio }: Props) => {
  const ordenadas = [...filas].sort((a, b) => b.total - a.total);
  const maximo = Math.max(1, ...ordenadas.map((fila) => fila.total));

  return (
    <DashboardCard title={titulo} subtitle="Solo citas completadas">
      {ordenadas.length === 0 ? (
        <Box py={5} textAlign="center">
          <Typography color="textSecondary">{vacio}</Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {ordenadas.map((fila) => (
            <Box key={fila.id}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="baseline"
                spacing={2}
                mb={0.5}
              >
                <Typography variant="subtitle2" fontWeight={600} noWrap>
                  {fila.nombre}
                </Typography>
                <Typography variant="body2" color="textSecondary" noWrap>
                  {fila.total} · {formatMoneda(fila.monto_total)}
                </Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(fila.total / maximo) * 100}
                sx={{ height: 6, borderRadius: 3 }}
              />
            </Box>
          ))}
        </Stack>
      )}
    </DashboardCard>
  );
};

export default DesgloseLista;
