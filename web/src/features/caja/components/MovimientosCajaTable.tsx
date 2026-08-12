"use client";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { formatHora, formatMoneda } from "@/lib/format";
import type { MovimientoCaja } from "../types";

interface Props {
  movimientos: MovimientoCaja[];
}

/**
 * Movimientos del día, sin paginar: son los de una sola jornada y en la app
 * actual también se listan completos.
 */
const MovimientosCajaTable = ({ movimientos }: Props) => {
  if (movimientos.length === 0) {
    return (
      <Box py={5} textAlign="center">
        <Typography color="textSecondary">
          No hay movimientos registrados hoy.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ overflowX: "auto" }}>
      <Table sx={{ minWidth: 640 }}>
        <TableHead>
          <TableRow>
            {["Hora", "Tipo", "Concepto", "Registrado por", "Monto"].map(
              (titulo, i) => (
                <TableCell key={titulo} align={i === 4 ? "right" : "left"}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {titulo}
                  </Typography>
                </TableCell>
              )
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {movimientos.map((movimiento) => {
            const esIngreso = movimiento.tipo === "ingreso";

            return (
              <TableRow key={movimiento.id}>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {formatHora(movimiento.creado_en)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    color={esIngreso ? "success" : "error"}
                    label={esIngreso ? "Ingreso" : "Egreso"}
                  />
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={500}>
                    {movimiento.concepto}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="textSecondary">
                    {movimiento.usuario}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="subtitle2"
                    fontWeight={600}
                    color={esIngreso ? "success.main" : "error.main"}
                    noWrap
                  >
                    {esIngreso ? "+" : "−"} {formatMoneda(movimiento.monto)}
                  </Typography>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

export default MovimientosCajaTable;
