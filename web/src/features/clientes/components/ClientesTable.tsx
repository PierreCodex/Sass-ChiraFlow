"use client";
import { useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
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
import { useClientes } from "../hooks/useClientes";

const ClientesTable = () => {
  const [page, setPage] = useState(0); // MUI cuenta desde 0, Laravel desde 1
  const [perPage, setPerPage] = useState(10);

  const { data, isPending, isError, error } = useClientes({
    page: page + 1,
    per_page: perPage,
  });

  if (isPending) {
    return (
      <Stack spacing={1}>
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={48} />
        ))}
      </Stack>
    );
  }

  if (isError) {
    return <Alert severity="error">{toApiError(error).message}</Alert>;
  }

  if (data.data.length === 0) {
    return (
      <Box py={5} textAlign="center">
        <Typography color="textSecondary">
          Todavía no hay clientes registrados.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ overflowX: "auto" }}>
        <Table sx={{ minWidth: 650 }}>
          <TableHead>
            <TableRow>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Nombre
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Email
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="subtitle2" fontWeight={600}>
                  Teléfono
                </Typography>
              </TableCell>
              <TableCell align="right">
                <Typography variant="subtitle2" fontWeight={600}>
                  Estado
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.data.map((cliente) => (
              <TableRow key={cliente.id}>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>
                    {cliente.nombre}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography color="textSecondary" variant="body2">
                    {cliente.email}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography color="textSecondary" variant="body2">
                    {cliente.telefono ?? "—"}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Chip
                    size="small"
                    label={cliente.estado}
                    color={cliente.estado === "activo" ? "success" : "default"}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>

      <TablePagination
        component="div"
        count={data.meta.total}
        page={page}
        onPageChange={(_, nuevaPagina) => setPage(nuevaPagina)}
        rowsPerPage={perPage}
        rowsPerPageOptions={[10, 25, 50]}
        onRowsPerPageChange={(e) => {
          setPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Filas por página"
      />
    </Box>
  );
};

export default ClientesTable;
