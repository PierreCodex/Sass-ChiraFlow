"use client";
import React from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";

import { toApiError } from "@/lib/api/client";
import type { Paginated } from "@/lib/api/types";

export interface Columna<T> {
  /** Identificador único de la columna. */
  id: string;
  label: string;
  align?: "left" | "right" | "center";
  /** Contenido de la celda. */
  render: (fila: T) => React.ReactNode;
}

interface Props<T> {
  columnas: Columna<T>[];
  datos: Paginated<T> | undefined;
  cargando: boolean;
  error: unknown;
  /** Página actual en base 0 (como la espera MUI). */
  page: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange: (perPage: number) => void;
  mensajeVacio?: string;
  minWidth?: number;
}

/**
 * Tabla paginada estándar: resuelve carga, error, estado vacío y paginación
 * contra la forma `->paginate()` de Laravel. Cada módulo solo declara columnas.
 */
export default function DataTable<T extends { id: number }>({
  columnas,
  datos,
  cargando,
  error,
  page,
  perPage,
  onPageChange,
  onPerPageChange,
  mensajeVacio = "No hay registros todavía.",
  minWidth = 650,
}: Props<T>) {
  if (cargando) {
    return (
      <Stack spacing={1}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={48} />
        ))}
      </Stack>
    );
  }

  if (error) {
    return <Alert severity="error">{toApiError(error).message}</Alert>;
  }

  if (!datos || datos.data.length === 0) {
    return (
      <Box py={5} textAlign="center">
        <Typography color="textSecondary">{mensajeVacio}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth }}>
          <TableHead>
            <TableRow>
              {columnas.map((columna) => (
                <TableCell key={columna.id} align={columna.align ?? "left"}>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {columna.label}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {datos.data.map((fila) => (
              <TableRow key={fila.id}>
                {columnas.map((columna) => (
                  <TableCell key={columna.id} align={columna.align ?? "left"}>
                    {columna.render(fila)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <TablePagination
        component="div"
        count={datos.meta.total}
        page={page}
        onPageChange={(_, nuevaPagina) => onPageChange(nuevaPagina)}
        rowsPerPage={perPage}
        rowsPerPageOptions={[10, 25, 50]}
        onRowsPerPageChange={(e) => {
          onPerPageChange(parseInt(e.target.value, 10));
          onPageChange(0);
        }}
        labelRowsPerPage="Filas por página"
        labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
      />
    </Box>
  );
}
