"use client";
import { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconCopy, IconPencil, IconPlus, IconTrash } from "@tabler/icons-react";

import AvisoError from "@/components/shared/AvisoError";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DashboardCard from "@/components/shared/DashboardCard";
import { toApiError } from "@/lib/api/client";

import RolFormDialog from "./RolFormDialog";
import { useEliminarRol, useRolesConModulos } from "../hooks/useRoles";
import { contarAccesos } from "../modulos";
import type { Rol } from "../types";

/**
 * Los roles del negocio: los tres de sistema más los que cree.
 *
 * Sin encabezado propio: vive dentro de la vista de Administración, que ya
 * pone el título y la descripción desde `nav.ts`.
 *
 * **Las barandillas llegan resueltas.** `editable`, `borrable` y `duplicable`
 * los manda el backend y aquí no se deducen de `sistema` ni de `clave`: si
 * esta pantalla reimplementara esa matriz acabaría divergiendo de la que
 * manda. Sirven para apagar botones; el 422 salta igual si se fuerza.
 */
export default function PantallaRoles() {
  const { data, isPending, error } = useRolesConModulos();
  const eliminar = useEliminarRol();

  const [formAbierto, setFormAbierto] = useState(false);
  const [editando, setEditando] = useState<Rol | null>(null);
  const [duplicando, setDuplicando] = useState(false);
  const [aEliminar, setAEliminar] = useState<Rol | null>(null);

  const abrir = (rol: Rol | null, duplica = false) => {
    setEditando(rol);
    setDuplicando(duplica);
    setFormAbierto(true);
  };

  if (isPending) return <Skeleton variant="rounded" height={360} />;
  if (error) return <AvisoError error={error} />;

  const { roles, modulos } = data;

  return (
    <>
      <Stack direction="row" justifyContent="flex-end" mb={3}>
        <Button
          variant="contained"
          startIcon={<IconPlus size={18} />}
          onClick={() => abrir(null)}
        >
          Nuevo rol
        </Button>
      </Stack>

      <DashboardCard>
        <Box sx={{ overflowX: "auto" }}>
          <Table sx={{ minWidth: 720 }}>
            <TableHead>
              <TableRow>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>Rol</Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="subtitle2" fontWeight={600}>Alcance</Typography>
                </TableCell>
                <TableCell align="center">
                  <Typography variant="subtitle2" fontWeight={600}>Personas</Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="subtitle2" fontWeight={600}>Acciones</Typography>
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {roles.map((rol) => {
                const { gestiona, ve, total } = contarAccesos(rol.permisos);

                return (
                  <TableRow key={rol.id}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="subtitle2" fontWeight={600}>
                          {rol.nombre}
                        </Typography>
                        {rol.sistema ? (
                          <Chip size="small" variant="outlined" label="Del sistema" />
                        ) : null}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        Gestiona {gestiona} de {total} módulos
                        {ve > 0 ? `, ve otros ${ve}` : ""}
                      </Typography>
                    </TableCell>

                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {rol.solo_propios ? "Solo lo suyo" : "Todo el negocio"}
                      </Typography>
                    </TableCell>

                    <TableCell align="center">
                      <Typography variant="body2" color="text.secondary">
                        {rol.usuarios_count ?? 0}
                      </Typography>
                    </TableCell>

                    <TableCell align="right">
                      <Stack direction="row" spacing={0.5} justifyContent="flex-end">
                        {/*
                          Al rol no editable se le deja ver la matriz: es la
                          única forma de saber qué da el administrador general
                          sin mirar la base de datos.
                        */}
                        <Tooltip title={rol.editable ? "Editar" : "Ver permisos"}>
                          <IconButton
                            size="small"
                            color={rol.editable ? "primary" : "inherit"}
                            onClick={() => abrir(rol)}
                          >
                            <IconPencil size={18} />
                          </IconButton>
                        </Tooltip>

                        <Tooltip
                          title={
                            rol.duplicable
                              ? "Duplicar"
                              : "Este rol no se duplica"
                          }
                        >
                          {/* El span deja que el tooltip funcione sobre un
                              botón apagado: MUI no dispara eventos en ellos. */}
                          <span>
                            <IconButton
                              size="small"
                              disabled={!rol.duplicable}
                              onClick={() => abrir(rol, true)}
                            >
                              <IconCopy size={18} />
                            </IconButton>
                          </span>
                        </Tooltip>

                        <Tooltip
                          title={
                            rol.borrable
                              ? "Eliminar"
                              : rol.sistema
                                ? "Los roles del sistema no se borran"
                                : "Este rol está en uso"
                          }
                        >
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={!rol.borrable}
                              onClick={() => setAEliminar(rol)}
                            >
                              <IconTrash size={18} />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </DashboardCard>

      <RolFormDialog
        abierto={formAbierto}
        rol={editando}
        duplicando={duplicando}
        modulos={modulos}
        onCerrar={() => setFormAbierto(false)}
      />

      <ConfirmDialog
        abierto={!!aEliminar}
        titulo="Eliminar rol"
        mensaje={
          <>
            Se eliminará <strong>{aEliminar?.nombre}</strong>. Nadie lo tiene
            asignado, así que no deja a ninguna persona sin acceso.
          </>
        }
        textoConfirmar="Eliminar"
        cargando={eliminar.isPending}
        error={eliminar.isError ? toApiError(eliminar.error).message : null}
        onConfirmar={() =>
          aEliminar &&
          eliminar.mutate(aEliminar.id, { onSuccess: () => setAEliminar(null) })
        }
        onCancelar={() => setAEliminar(null)}
      />
    </>
  );
}
