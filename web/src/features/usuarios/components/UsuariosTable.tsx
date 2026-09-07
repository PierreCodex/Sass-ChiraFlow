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
import { IconMailForward, IconPencil, IconTrash } from "@tabler/icons-react";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import BuscadorTabla from "@/components/shared/BuscadorTabla";
import { usePaginacion } from "@/hooks/usePaginacion";
import { useUsuarioActual } from "@/features/auth/hooks/useAuth";
import { esAdminGeneral } from "@/features/roles/types";
import { rutaDeSeccion } from "@/features/administracion/nav";

import { useReenviarInvitacion, useUsuarios } from "../hooks/useUsuarios";
import { nombreCompleto, type Usuario } from "../types";

interface Props {
  onEditar: (usuario: Usuario) => void;
  onEliminar: (usuario: Usuario) => void;
}

const UsuariosTable = ({ onEditar, onEliminar }: Props) => {
  const { page, perPage, search, setPage, setPerPage, buscar, params } =
    usePaginacion();
  const { data, isPending, error } = useUsuarios(params);
  const { data: sesion } = useUsuarioActual();
  const reenviar = useReenviarInvitacion();

  /*
    Tu propia cuenta no se edita ni se borra desde aquí.

    Se compara por correo y no por id porque no son el mismo: el `id` de esta
    tabla es el de `usuarios` (la base del negocio) y el de la sesión es el del
    `users` central. El correo es la credencial y es único GLOBAL, así que
    identifica la fila sin ambigüedad.

    No es una barandilla inventada: el backend ya responde 422 a «No puedes
    quitarte el acceso a ti mismo». Esto solo evita ofrecer un botón que
    siempre falla, y manda a Mi perfil, que es donde esos datos SÍ se cambian.
  */
  const esTuCuenta = (usuario: Usuario) =>
    !!sesion && usuario.email === sesion.email;

  const columnas: Columna<Usuario>[] = [
    {
      id: "persona",
      label: "Persona",
      render: (usuario) => (
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 36, height: 36 }}>
            {usuario.nombre.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="subtitle2" fontWeight={600}>
              {nombreCompleto(usuario)}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {usuario.email}
            </Typography>
          </Box>
          {esTuCuenta(usuario) ? (
            <Chip size="small" label="Tú" color="primary" variant="outlined" />
          ) : null}
        </Stack>
      ),
    },
    {
      // El nombre lo pone el negocio: puede haber renombrado «Administrador»
      // a «Encargada», así que se pinta tal cual llega.
      id: "rol",
      label: "Rol",
      render: (usuario) => (
        <Typography variant="body2" color="textSecondary">
          {usuario.rol?.nombre ?? "-"}
        </Typography>
      ),
    },
    {
      /*
        La columna que explica el modelo nuevo: entrar al panel y prestar
        servicios son cosas distintas. Una recepcionista sale aquí con «Sin
        ficha», y eso no es una carencia que haya que corregir — es lo normal
        en su puesto.
      */
      id: "profesional",
      label: "Ficha de profesional",
      render: (usuario) =>
        usuario.profesional ? (
          <Button
            component={Link}
            href={rutaDeSeccion("equipo", "profesionales")}
            size="small"
            color="inherit"
            sx={{ color: "text.secondary", fontWeight: 400 }}
          >
            {usuario.profesional.nombre}
          </Button>
        ) : (
          <Typography variant="body2" color="textSecondary">
            Sin ficha
          </Typography>
        ),
    },
    {
      id: "estado",
      label: "Estado",
      render: (usuario) => (
        <Chip
          size="small"
          label={usuario.activo ? "Activo" : "Sin acceso"}
          color={usuario.activo ? "success" : "default"}
        />
      ),
    },
    {
      id: "acciones",
      label: "Acciones",
      align: "right",
      render: (usuario) =>
        esTuCuenta(usuario) ? (
          // Un enlace y no botones apagados: deshabilitados dirían «aquí no»
          // sin decir dónde sí.
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
            <Tooltip title="Reenviar invitación">
              <IconButton
                size="small"
                color="inherit"
                disabled={reenviar.isPending}
                onClick={() => reenviar.mutate(usuario.id)}
              >
                <IconMailForward size={18} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Editar">
              <IconButton
                size="small"
                color="primary"
                onClick={() => onEditar(usuario)}
              >
                <IconPencil size={18} />
              </IconButton>
            </Tooltip>
            {/* Al administrador general no se le quita el acceso: es quien
                lleva facturación y dejar al negocio sin él solo se arregla
                entrando a la base. El backend responde 422; aquí ni se
                ofrece. */}
            {esAdminGeneral(usuario.rol) ? null : (
              <Tooltip title="Quitar acceso">
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => onEliminar(usuario)}
                >
                  <IconTrash size={18} />
                </IconButton>
              </Tooltip>
            )}
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
          placeholder="Buscar por nombre, apellido o correo…"
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
        mensajeVacio="Todavía nadie más entra al panel."
        minWidth={900}
      />
    </>
  );
};

export default UsuariosTable;
