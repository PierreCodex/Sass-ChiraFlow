"use client";
import Link from "next/link";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { IconChevronDown, IconLock } from "@tabler/icons-react";

import { rutaDeSeccion } from "@/features/administracion/nav";
import {
  contarAccesos,
  etiquetaNivel,
  ETIQUETAS_MODULO,
  GRUPOS_MODULOS,
} from "@/features/roles/modulos";
import type { NivelPermiso, Rol } from "@/features/roles/types";

interface Props {
  rol: Rol | undefined;
  cargando: boolean;
}

/**
 * Qué puede hacer el rol que se acaba de elegir.
 *
 * Existe porque el desplegable de rol dice «Recepción» y nada más: quien
 * reparte accesos elige a ciegas y solo descubre lo que dio cuando alguien se
 * queja de que no puede entrar a algo.
 *
 * **Es de solo lectura, y eso no es una limitación de la pantalla sino del
 * modelo.** Aquí los permisos son del ROL, no de la persona: `roles.permisos`
 * es la única matriz que existe. Poner casillas editables aquí no configuraría
 * a este usuario — cambiaría lo que pueden hacer todos los que llevan ese
 * mismo rol, que es justo lo que nadie espera al estar dando de alta a
 * alguien. Por eso enseña y enlaza, en vez de dejar tocar.
 */
export default function PermisosDelRol({ rol, cargando }: Props) {
  if (cargando) {
    return <Skeleton variant="rounded" height={180} />;
  }

  if (!rol) {
    return (
      <Alert severity="info" variant="outlined">
        Elige un rol para ver qué podrá hacer esta persona.
      </Alert>
    );
  }

  const { gestiona, ve, total } = contarAccesos(rol.permisos);

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
          Solo verá lo suyo: sus citas y sus clientes, no los de sus
          compañeros.
        </Alert>
      ) : null}

      {GRUPOS_MODULOS.map((grupo) => {
        const conAcceso = grupo.modulos.filter((m) => rol.permisos[m] != null);

        return (
          <Accordion
            key={grupo.titulo}
            disableGutters
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              mb: 1,
              "&::before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<IconChevronDown size={18} />}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ width: "100%", pr: 1 }}
              >
                <Typography variant="body2" fontWeight={600}>
                  {grupo.titulo}
                </Typography>
                {/*
                  El resumen a la derecha ahorra abrir los cinco bloques para
                  descubrir que cuatro están vacíos.
                */}
                <Chip
                  size="small"
                  variant="outlined"
                  color={conAcceso.length ? "primary" : "default"}
                  label={
                    conAcceso.length
                      ? `${conAcceso.length} de ${grupo.modulos.length}`
                      : "Sin acceso"
                  }
                />
              </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0 }}>
              <Stack spacing={0.5}>
                {grupo.modulos.map((modulo) => (
                  <Fila
                    key={modulo}
                    nombre={ETIQUETAS_MODULO[modulo] ?? modulo}
                    nivel={rol.permisos[modulo]}
                  />
                ))}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}

function Fila({
  nombre,
  nivel,
}: {
  nombre: string;
  nivel: NivelPermiso | null | undefined;
}) {
  const sinAcceso = nivel == null;

  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        py: 0.75,
        px: 1,
        borderRadius: 1,
        bgcolor: (t) =>
          sinAcceso ? "transparent" : alpha(t.palette.primary.main, 0.06),
      }}
    >
      <Typography
        variant="body2"
        color={sinAcceso ? "text.disabled" : "text.primary"}
      >
        {nombre}
      </Typography>
      <Typography
        variant="caption"
        fontWeight={sinAcceso ? 400 : 600}
        color={sinAcceso ? "text.disabled" : "primary.main"}
      >
        {etiquetaNivel(nivel)}
      </Typography>
    </Stack>
  );
}
