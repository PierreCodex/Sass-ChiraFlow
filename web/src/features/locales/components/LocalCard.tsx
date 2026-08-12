"use client";
import Link from "next/link";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
  IconClock,
  IconMail,
  IconMapPin,
  IconPencil,
  IconPhone,
  IconTrash,
} from "@tabler/icons-react";

import type { Local } from "../types";

interface Props {
  local: Local;
  onEditar: (local: Local) => void;
  onEliminar: (local: Local) => void;
}

interface DatoProps {
  icono: React.ReactNode;
  children: React.ReactNode;
}

const Dato = ({ icono, children }: DatoProps) => (
  <Stack direction="row" spacing={1} alignItems="center">
    <Box sx={{ color: "text.secondary", display: "flex" }}>{icono}</Box>
    <Typography variant="body2" color="textSecondary" noWrap>
      {children}
    </Typography>
  </Stack>
);

const LocalCard = ({ local, onEditar, onEliminar }: Props) => (
  <Card elevation={9} sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
    {/* Banner, o una franja con el color del local si aún no tiene imagen. */}
    <Box
      sx={{
        height: 110,
        bgcolor: `${local.color}22`,
        borderTop: `4px solid ${local.color}`,
        position: "relative",
        overflow: "hidden",
      }}
    >
      {local.banner_url ? (
        // Vista previa local: next/image no aplica a blob: URLs
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={local.banner_url}
          alt=""
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : null}

      {local.logo_url ? (
        <Avatar
          src={local.logo_url}
          sx={{
            position: "absolute",
            bottom: 8,
            left: 16,
            width: 44,
            height: 44,
            border: "2px solid",
            borderColor: "background.paper",
          }}
        />
      ) : null}
    </Box>

    <CardContent sx={{ p: 3, flexGrow: 1, display: "flex", flexDirection: "column" }}>
      <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
        <Typography variant="h5" fontWeight={600}>
          {local.nombre}
        </Typography>
        {local.es_principal ? (
          <Chip size="small" color="primary" label="Principal" />
        ) : null}
      </Stack>

      {local.descripcion_publica ? (
        <Typography variant="body2" color="textSecondary" mb={2}>
          {local.descripcion_publica}
        </Typography>
      ) : null}

      <Stack spacing={1} mb={2}>
        {local.direccion ? (
          <Dato icono={<IconMapPin size={16} />}>{local.direccion}</Dato>
        ) : null}
        {local.telefono ? (
          <Dato icono={<IconPhone size={16} />}>{local.telefono}</Dato>
        ) : null}
        {local.email ? (
          <Dato icono={<IconMail size={16} />}>{local.email}</Dato>
        ) : null}
        {local.horario_desde && local.horario_hasta ? (
          <Dato icono={<IconClock size={16} />}>
            {local.horario_desde} – {local.horario_hasta}
          </Dato>
        ) : null}
      </Stack>

      <Box flexGrow={1} />
      <Divider sx={{ mb: 1.5 }} />

      {/* El local principal se administra desde Configuración del negocio. */}
      {local.es_principal ? (
        <Button
          component={Link}
          href="/configuracion"
          size="small"
          startIcon={<IconPencil size={16} />}
        >
          Editar en Configuración
        </Button>
      ) : (
        <Stack direction="row" spacing={1}>
          <Button
            size="small"
            startIcon={<IconPencil size={16} />}
            onClick={() => onEditar(local)}
          >
            Editar
          </Button>
          <Button
            size="small"
            color="error"
            startIcon={<IconTrash size={16} />}
            onClick={() => onEliminar(local)}
          >
            Eliminar
          </Button>
        </Stack>
      )}
    </CardContent>
  </Card>
);

export default LocalCard;
