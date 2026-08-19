import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Link from "next/link";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { IconClock } from "@tabler/icons-react";

import { formatMoneda } from "@/lib/format";
import type { AsignacionServicio, LineaCarrito, ProfesionalPublico } from "../types";
import { totalCarrito } from "../types";

interface Props {
  lineas: LineaCarrito[];
  asignaciones: AsignacionServicio[];
  profesionales: ProfesionalPublico[];
  onEliminar: (servicioId: number) => void;
}

/**
 * Panel lateral fijo con el resumen del carrito — visible en los 5 pasos del
 * wizard, como "Información de tus servicios" en la referencia. Con
 * "Eliminar" por línea: si el cliente cambia de opinión a mitad de la
 * reserva, no tiene que cancelar todo y volver a armar el carrito.
 */
const ResumenServicios = ({ lineas, asignaciones, profesionales, onEliminar }: Props) => {
  const theme = useTheme();

  return (
    <Card variant="outlined" sx={{ height: "100%" }}>
      <CardContent>
        <Typography variant="subtitle1" fontWeight={700} mb={2}>
          Información de tus servicios
        </Typography>

        <Stack spacing={2} divider={<Divider />}>
          {lineas.map((linea) => {
            const asignacion = asignaciones.find(
              (item) => item.id === linea.servicio.id
            );
            const profesional = profesionales.find(
              (item) => item.id === asignacion?.profesional_id
            );

            return (
              <Stack key={linea.servicio.id} spacing={0.5}>
                <Stack direction="row" justifyContent="space-between" spacing={2}>
                  <Typography variant="body2" fontWeight={600}>
                    {linea.servicio.nombre}
                    {linea.cantidad > 1 ? ` x${linea.cantidad}` : ""}
                  </Typography>
                  <Typography variant="body2" fontWeight={600} noWrap>
                    {formatMoneda(linea.servicio.precio * linea.cantidad)}
                  </Typography>
                </Stack>

                {profesional ? (
                  <Typography variant="caption" color="textSecondary">
                    {profesional.nombre}
                  </Typography>
                ) : null}

                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    <IconClock size={14} color={theme.palette.text.secondary} style={{ opacity: 0.7 }} />
                    <Typography variant="caption" color="textSecondary">
                      {linea.servicio.duracion_min * linea.cantidad} min
                    </Typography>
                  </Stack>

                  <Link
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      onEliminar(linea.servicio.id);
                    }}
                  >
                    <Typography variant="caption" color="error.main" fontWeight={600}>
                      Eliminar
                    </Typography>
                  </Link>
                </Stack>
              </Stack>
            );
          })}
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Stack direction="row" justifyContent="space-between">
          <Typography variant="subtitle1" fontWeight={700}>
            Total
          </Typography>
          <Typography variant="subtitle1" fontWeight={700}>
            {formatMoneda(totalCarrito(lineas))}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default ResumenServicios;
