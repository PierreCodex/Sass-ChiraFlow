"use client";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
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
import { useEmpleados } from "../hooks/useEmpleados";
import type { Empleado } from "../types";

interface Props {
  onEditar: (empleado: Empleado) => void;
  onEliminar: (empleado: Empleado) => void;
}

const EmpleadosTable = ({ onEditar, onEliminar }: Props) => {
  const { page, perPage, search, setPage, setPerPage, buscar, params } =
    usePaginacion();
  const { data, isPending, error } = useEmpleados(params);
  const { data: usuario } = useUsuarioActual();

  /*
    Tu propia ficha no se edita ni se borra desde aquí.

    Se compara por email y no por id porque no son el mismo: el `id` del
    empleado es el de `profesionales` (la base del negocio) y el de la sesión
    es el del `users` central. El email es la credencial y es único GLOBAL, así
    que identifica la fila sin ambigüedad.

    No es una barandilla inventada: el backend ya responde 422 a «No puedes
    darte de baja a ti mismo». Esto solo evita ofrecer un botón que siempre
    falla, y manda a Mi perfil, que es donde esos datos SÍ se cambian.
  */
  const esTuFicha = (empleado: Empleado) =>
    !!usuario && empleado.email === usuario.email;

  const columnas: Columna<Empleado>[] = [
    {
      id: "profesional",
      label: "Profesional",
      render: (empleado) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar
            src={empleado.foto_url ?? undefined}
            alt={empleado.nombre}
            sx={{ width: 40, height: 40 }}
          >
            {empleado.nombre.charAt(0)}
          </Avatar>
          <Typography variant="subtitle2" fontWeight={600}>
            {empleado.nombre}
          </Typography>
          {esTuFicha(empleado) ? (
            <Chip size="small" label="Tú" color="primary" variant="outlined" />
          ) : null}
        </Stack>
      ),
    },
    {
      id: "email",
      label: "Correo",
      render: (empleado) => (
        <Typography variant="body2" color="textSecondary">
          {empleado.email}
        </Typography>
      ),
    },
    {
      // El nombre lo pone el negocio: puede haber renombrado «Administrador»
      // a «Encargada», así que se pinta tal cual llega.
      id: "rol",
      label: "Rol",
      render: (empleado) => (
        <Typography variant="body2" color="textSecondary">
          {empleado.rol?.nombre ?? "-"}
        </Typography>
      ),
    },
    {
      id: "cargo",
      label: "Cargo",
      render: (empleado) => (
        <Typography variant="body2" color="textSecondary">
          {empleado.cargo || "-"}
        </Typography>
      ),
    },
    {
      id: "estado",
      label: "Estado",
      render: (empleado) => (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Chip
            size="small"
            label={empleado.activo ? "Activo" : "Inactivo"}
            color={empleado.activo ? "success" : "default"}
          />
          {/* Quien no atiende entra al panel pero no ocupa plaza del plan:
              explica por qué el contador dice menos que las filas. */}
          {empleado.activo && !empleado.atiende ? (
            <Chip size="small" variant="outlined" label="Sin agenda" />
          ) : null}
        </Stack>
      ),
    },
    {
      id: "acciones",
      label: "Acciones",
      align: "right",
      render: (empleado) =>
        esTuFicha(empleado) ? (
          // Un enlace y no dos botones apagados: deshabilitados dirían «aquí
          // no» sin decir dónde sí, y el nombre y la contraseña sí se cambian.
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
                onClick={() => onEditar(empleado)}
              >
                <IconPencil size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Eliminar">
              <IconButton
                size="small"
                color="error"
                onClick={() => onEliminar(empleado)}
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
          placeholder="Buscar por nombre, correo o cargo…"
        />
      </Stack>

      <DataTable
        columnas={columnas}
        datos={data}
        cargando={isPending}
        error={error}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        mensajeVacio="No se encontraron empleados."
        minWidth={900}
      />
    </>
  );
};

export default EmpleadosTable;
