"use client";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { IconArrowRight } from "@tabler/icons-react";

import { toApiError } from "@/lib/api/client";
import { formatMoneda } from "@/lib/format";
import { useTodosLosServicios } from "@/features/servicios/hooks/useServicios";

/**
 * Vista de solo lectura del catálogo, tal cual la app actual: nombre,
 * duración y precio, con un enlace a Servicios para gestionarlos.
 */
const ServiciosDelNegocio = () => {
  const { data: servicios, isPending, error } = useTodosLosServicios();

  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        spacing={2}
      >
        <Typography variant="body2" color="textSecondary">
          Catálogo del negocio. Los servicios se crean y editan en su propio
          módulo.
        </Typography>
        <Button
          component={Link}
          href="/servicios"
          variant="outlined"
          endIcon={<IconArrowRight size={18} />}
          sx={{ whiteSpace: "nowrap" }}
        >
          Gestionar servicios
        </Button>
      </Stack>

      {error ? (
        <Alert severity="error">{toApiError(error).message}</Alert>
      ) : isPending || !servicios ? (
        <Stack spacing={1}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={48} />
          ))}
        </Stack>
      ) : servicios.length === 0 ? (
        <Box py={5} textAlign="center">
          <Typography color="textSecondary">
            Aún no hay servicios registrados.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 520 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Nombre
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    Duración
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" fontWeight={600}>
                    Precio
                  </Typography>
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {servicios.map((servicio) => (
                <TableRow key={servicio.id}>
                  <TableCell>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 10,
                          height: 10,
                          borderRadius: "50%",
                          bgcolor: servicio.color,
                          flexShrink: 0,
                        }}
                      />
                      <Typography variant="subtitle2" fontWeight={600}>
                        {servicio.nombre}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {servicio.duracion_min} min
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Typography variant="subtitle2" fontWeight={600} noWrap>
                      {formatMoneda(servicio.precio)}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}
    </>
  );
};

export default ServiciosDelNegocio;
