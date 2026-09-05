"use client";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconLock } from "@tabler/icons-react";

import { rutaDeSeccion } from "@/features/administracion/nav";
import MatrizPermisos from "@/features/roles/components/MatrizPermisos";
import { contarAccesos } from "@/features/roles/modulos";
import type { Rol } from "@/features/roles/types";

interface Props {
  rol: Rol | undefined;
  cargando: boolean;
}

/**
 * Qué puede hacer el rol que se acaba de elegir, con el mismo checklist que la
 * pantalla de Roles pero **sin poder tocarlo**.
 *
 * Existe porque el desplegable dice «Recepción» y nada más: quien reparte
 * accesos elige a ciegas y solo descubre lo que dio cuando alguien se queja de
 * que no puede entrar a algo.
 *
 * Reutiliza `MatrizPermisos` a propósito, en vez de pintar su propia lista: si
 * fueran dos componentes, el día que la matriz cambie —un módulo nuevo, otro
 * nivel— habría que acordarse de tocar los dos, y la vista previa acabaría
 * enseñando algo distinto de lo que la pantalla de Roles guarda.
 *
 * **Las casillas están apagadas, y eso no es una limitación de la pantalla
 * sino del modelo**: aquí los permisos son del ROL, no de la persona.
 * Dejarlas tocar no configuraría a este usuario — cambiaría lo que pueden
 * hacer todos los que llevan ese mismo rol, que es justo lo que nadie espera
 * estando en el alta de alguien. Por eso enseña y enlaza a Roles.
 */
export default function PermisosDelRol({ rol, cargando }: Props) {
  if (cargando) {
    return <Skeleton variant="rounded" height={200} />;
  }

  if (!rol) {
    return (
      <Alert severity="info" variant="outlined">
        Elige un rol para ver qué podrá hacer esta persona.
      </Alert>
    );
  }

  const { gestiona, ve, total } = contarAccesos(rol.permisos);

  /*
    Los módulos salen de las claves de su propia matriz: el backend garantiza
    que `permisos` trae SIEMPRE los 14, con `null` donde no hay acceso. Así
    esta vista no necesita pedir la lista aparte solo para pintar un resumen.
  */
  const modulos = Object.keys(rol.permisos);

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
        gap={1}
        mb={1.5}
      >
        <Typography variant="body2" color="text.secondary">
          Con el rol <strong>{rol.nombre}</strong> podrá gestionar{" "}
          <strong>{gestiona}</strong> de {total} módulos
          {ve > 0 ? <> y ver otros {ve}</> : null}.
        </Typography>

        {/*
          El enlace y no un botón: cambiar esto no es parte de dar de alta a
          alguien, y llevarlo a Roles deja claro de quién son estos permisos.
        */}
        <Typography
          component={Link}
          href={rutaDeSeccion("equipo", "roles")}
          variant="body2"
          sx={{ color: "primary.main", textDecoration: "none", flexShrink: 0 }}
        >
          Editar el rol
        </Typography>
      </Stack>

      {/*
        `solo_propios` va arriba y aparte: no es un permiso —no dice QUÉ puede
        hacer sino SOBRE QUIÉN— y se pierde si se cuela como una fila más.
      */}
      {rol.solo_propios ? (
        <Alert
          severity="info"
          variant="outlined"
          icon={<IconLock size={18} />}
          sx={{ mb: 1.5 }}
        >
          Solo verá lo suyo: sus citas y sus clientes, no los de sus compañeros.
        </Alert>
      ) : null}

      <MatrizPermisos
        permisos={rol.permisos}
        modulos={modulos}
        onChange={() => {}}
        soloLectura
      />
    </Box>
  );
}
