"use client";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconPencil, IconTrash } from "@tabler/icons-react";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import BuscadorTabla from "@/components/shared/BuscadorTabla";
import { usePaginacion } from "@/hooks/usePaginacion";
import { useUsuarioActual } from "@/features/auth/hooks/useAuth";
import { useProfesionales } from "../hooks/useProfesionales";
import type { Profesional } from "../types";

interface Props {
  onEditar: (profesional: Profesional) => void;
  onEliminar: (profesional: Profesional) => void;
}

const ProfesionalesTable = ({ onEditar, onEliminar }: Props) => {
  const { page, perPage, search, setPage, setPerPage, buscar, params } =
    usePaginacion();
  const { data, isPending, error } = useProfesionales(params);
  const { data: sesion } = useUsuarioActual();

  /*
    Tu propia ficha no se edita ni se borra desde aquí.

    Se compara por el correo de su CUENTA, no por id: el `id` de la ficha es el
    de `profesionales` (la base del negocio) y el de la sesión es el del
    `users` central. Y una ficha puede no tener cuenta —el barbero que no entra
    al sistema—, en cuyo caso nunca eres tú: si no tiene correo, no puede ser
    quien ha iniciado sesión.
  */
  const esTuFicha = (profesional: Profesional) =>
    !!sesion && !!profesional.usuario && profesional.usuario.email === sesion.email;

  const columnas: Columna<Profesional>[] = [
    {
      id: "profesional",
      label: "Profesional",
      render: (profesional) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={profesional.foto_url ?? undefined}
            alt={profesional.nombre}
            sx={{ width: 40, height: 40 }}
          >
            {profesional.nombre.charAt(0)}
          </Avatar>
          <Typography variant="subtitle2" fontWeight={600}>
            {profesional.nombre}
          </Typography>
          {esTuFicha(profesional) ? (
            <Chip size="small" label="Tú" color="primary" variant="outlined" />
          ) : null}
        </Stack>
      ),
    },
    {
      /*
        El correo sale de su cuenta del panel, y muchos no la tienen. «Sin
        cuenta» no es un dato que falte: es lo normal en quien presta servicios
        y nunca abre el sistema, y antes era imposible de registrar porque el
        correo era obligatorio.
      */
      id: "cuenta",
      label: "Acceso al panel",
      render: (profesional) =>
        profesional.usuario ? (
          <Box>
            <Typography variant="body2" color="textSecondary">
              {profesional.usuario.email}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              {profesional.usuario.rol?.nombre ?? "—"}
            </Typography>
          </Box>
        ) : (
          <Typography variant="body2" color="textSecondary">
            Sin cuenta
          </Typography>
        ),
    },
    {
      id: "cargo",
      label: "Cargo",
      render: (profesional) => (
        <Typography variant="body2" color="textSecondary">
          {profesional.cargo || "-"}
        </Typography>
      ),
    },
    {
      id: "estado",
      label: "Estado",
      render: (profesional) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Chip
            size="small"
            label={profesional.activo ? "De alta" : "De baja"}
            color={profesional.activo ? "success" : "default"}
          />
          {/* Sigue teniendo agenda: solo que no se le puede reservar por
              internet. Ocupa plaza igual, así que esto NO explica el contador
              del cupo — explica por qué no sale en la tienda. */}
          {profesional.activo && !profesional.atiende ? (
            <Chip size="small" variant="outlined" label="No reservable" />
          ) : null}
        </Stack>
      ),
    },
    {
      id: "acciones",
      label: "Acciones",
      align: "right",
      render: (profesional) =>
        esTuFicha(profesional) ? (
          // Un enlace y no dos botones apagados: deshabilitados dirían «aquí
          // no» sin decir dónde sí, y el nombre y la foto sí se cambian.
          //
          // Sin `Tooltip`: el suyo viaja como `aria-label` y le pisa el nombre
          // accesible al enlace, que pasaría a anunciarse como la frase entera
          // en vez de «Mi perfil».
          <Stack direction="row" justifyContent="flex-end">
            <Button
              component={Link}
              href="/configuracion/perfil"
              size="small"
              color="inherit"
              sx={{ color: "text.secondary", fontWeight: 400 }}
            >
              Mi perfil
            </Button>
          </Stack>
        ) : (
          <Stack direction="row" spacing={0.5} justifyContent="flex-end">
            <Tooltip title="Editar">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEditar(profesional)}
              >
                <IconPencil size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Dar de baja">
              <IconButton
                size="small"
                color="error"
                onClick={() => onEliminar(profesional)}
              >
                <IconTrash size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
    },
  ];

  return (
    <>
      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <BuscadorTabla
          valor={search}
          onChange={buscar}
          placeholder="Buscar por nombre, cargo o correo…"
        />
      </Stack>

      <DataTable
        moduloEscritura="empleados"
        columnas={columnas}
        datos={data}
        cargando={isPending}
        error={error}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        mensajeVacio="Todavía no has dado de alta a nadie."
        minWidth={900}
      />
    </>
  );
};

export default ProfesionalesTable;
