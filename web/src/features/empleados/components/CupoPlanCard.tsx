"use client";
import Link from "next/link";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { useResumenPlanEmpleados } from "../hooks/useEmpleados";

interface Props {
  /** Botón de la derecha, para no duplicar el estado del diálogo aquí. */
  accion?: React.ReactNode;
}

/**
 * "Profesionales activos en tu plan · 3 de 5".
 * Solo los empleados con rol profesional consumen cupo.
 */
const CupoPlanCard = ({ accion }: Props) => {
  const { data, isPending } = useResumenPlanEmpleados();

  const usados = data?.profesionales_activos ?? 0;
  const limite = data?.limite_profesionales ?? 0;
  const lleno = !!data && usados >= limite;
  const porcentaje = limite > 0 ? Math.min(100, (usados / limite) * 100) : 0;

  return (
    <Card elevation={9} sx={{ mb: 3 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <Box flexGrow={1}>
            <Typography variant="subtitle2" color="textSecondary">
              Profesionales activos en tu plan
            </Typography>

            {isPending ? (
              <Skeleton variant="text" width={90} height={40} />
            ) : (
              <Stack direction="row" spacing={1.5} alignItems="center" mt={0.5}>
                <Typography variant="h4" fontWeight={700}>
                  {usados} de {limite}
                </Typography>
                {lleno ? (
                  <Chip size="small" color="warning" label="Límite alcanzado" />
                ) : null}
              </Stack>
            )}

            <LinearProgress
              variant={isPending ? "indeterminate" : "determinate"}
              value={porcentaje}
              color={lleno ? "warning" : "primary"}
              sx={{ mt: 1.5, maxWidth: 320, height: 6, borderRadius: 3 }}
            />

            {lleno ? (
              <Typography variant="body2" color="textSecondary" mt={1}>
                Para añadir más profesionales,{" "}
                <Box component={Link} href="/mi-plan" sx={{ color: "primary.main" }}>
                  mejora tu plan
                </Box>
                .
              </Typography>
            ) : null}
          </Box>

          {accion ? <Box>{accion}</Box> : null}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default CupoPlanCard;
