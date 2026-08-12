"use client";
import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconPencil } from "@tabler/icons-react";

import { toApiError } from "@/lib/api/client";
import { useTodosLosLocales } from "../hooks/useLocales";
import {
  useActualizarLocalProfesional,
  useProfesionalesDelLocal,
} from "../hooks/useRecursos";
import LocalProfesionalDialog from "./LocalProfesionalDialog";
import type { LocalProfesional } from "../types";

/** Iniciales para el avatar cuando no hay foto. */
function iniciales(nombre: string) {
  return nombre
    .split(" ")
    .filter((parte) => parte.length > 2)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();
}

const ProfesionalesPorLocal = () => {
  const { data: locales, isPending: cargandoLocales } = useTodosLosLocales();
  const [localId, setLocalId] = useState<number | undefined>();
  const [editando, setEditando] = useState<LocalProfesional | null>(null);

  // Al primer render se selecciona el principal, o el primero de la lista.
  useEffect(() => {
    if (localId || !locales?.length) return;
    setLocalId((locales.find((local) => local.es_principal) ?? locales[0]).id);
  }, [locales, localId]);

  const { data: profesionales, isPending, error } =
    useProfesionalesDelLocal(localId);
  const actualizar = useActualizarLocalProfesional(localId);

  /** El interruptor guarda al momento, conservando el resto de la fila. */
  const alternarHabilitado = (fila: LocalProfesional) => {
    actualizar.mutate({
      profesionalId: fila.id,
      payload: {
        habilitado: !fila.habilitado,
        nombre_publico: fila.nombre_publico,
        perfil: fila.perfil,
        horario_apertura: fila.horario_apertura,
        horario_cierre: fila.horario_cierre,
      },
    });
  };

  if (cargandoLocales) return <Skeleton variant="rounded" height={280} />;

  if (!locales?.length) {
    return <Alert severity="info">Todavía no hay locales.</Alert>;
  }

  return (
    <>
      <Typography variant="body2" color="textSecondary" mb={2}>
        Quién atiende en cada sede, con qué nombre aparece en la página pública
        y en qué horario.
      </Typography>

      {locales.length > 1 ? (
        <Stack direction="row" spacing={1} mb={3} flexWrap="wrap" useFlexGap>
          {locales.map((local) => (
            <Chip
              key={local.id}
              label={local.nombre}
              onClick={() => setLocalId(local.id)}
              color={local.id === localId ? "primary" : "default"}
              variant={local.id === localId ? "filled" : "outlined"}
            />
          ))}
        </Stack>
      ) : null}

      {error ? (
        <Alert severity="error">{toApiError(error).message}</Alert>
      ) : isPending || !profesionales ? (
        <Stack spacing={1}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rectangular" height={56} />
          ))}
        </Stack>
      ) : profesionales.length === 0 ? (
        <Box py={5} textAlign="center">
          <Typography color="textSecondary">
            Aún no hay profesionales registrados.
          </Typography>
        </Box>
      ) : (
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                {["Profesional", "Nombre público", "Horario", "Habilitado", ""].map(
                  (titulo, i) => (
                    <TableCell
                      key={titulo || i}
                      align={i >= 3 ? "center" : "left"}
                    >
                      <Typography variant="subtitle2" fontWeight={600}>
                        {titulo}
                      </Typography>
                    </TableCell>
                  )
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {profesionales.map((fila) => (
                <TableRow key={fila.id}>
                  <TableCell>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Avatar
                        src={fila.foto_url ?? undefined}
                        sx={{ width: 36, height: 36, fontSize: 14 }}
                      >
                        {iniciales(fila.nombre)}
                      </Avatar>
                      <Typography variant="subtitle2" fontWeight={600}>
                        {fila.nombre}
                      </Typography>
                    </Stack>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {fila.nombre_publico || "—"}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="textSecondary">
                      {fila.horario_apertura && fila.horario_cierre
                        ? `${fila.horario_apertura} – ${fila.horario_cierre}`
                        : "—"}
                    </Typography>
                  </TableCell>
                  <TableCell align="center">
                    <Switch
                      checked={fila.habilitado}
                      onChange={() => alternarHabilitado(fila)}
                      disabled={actualizar.isPending}
                    />
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Editar en este local">
                      <IconButton size="small" onClick={() => setEditando(fila)}>
                        <IconPencil size={18} />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      <LocalProfesionalDialog
        localId={localId}
        nombreLocal={locales.find((local) => local.id === localId)?.nombre ?? ""}
        profesional={editando}
        onCerrar={() => setEditando(null)}
      />
    </>
  );
};

export default ProfesionalesPorLocal;
