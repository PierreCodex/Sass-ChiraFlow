"use client";
import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import MenuItem from "@mui/material/MenuItem";
import Link from "next/link";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import BuscadorTabla from "@/components/shared/BuscadorTabla";
import { usePaginacion } from "@/hooks/usePaginacion";
import { formatFecha, iniciales } from "@/lib/format";
import { useNegocios } from "../hooks/useNegocios";
import { ESTADO_NEGOCIO } from "../constants";
import type { EstadoNegocio, NegocioResumen } from "../types";

const columnas: Columna<NegocioResumen>[] = [
  {
    id: "negocio",
    label: "Negocio",
    render: (negocio) => (
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Avatar
          variant="rounded"
          sx={{ bgcolor: "grey.200", color: "text.secondary", fontSize: 13, fontWeight: 700 }}
        >
          {iniciales(negocio.nombre)}
        </Avatar>
        <Stack spacing={0}>
          <Typography variant="subtitle2" fontWeight={600} noWrap>
            {negocio.nombre}
          </Typography>
          <Typography variant="caption" color="textSecondary" noWrap>
            {negocio.slug}
          </Typography>
        </Stack>
      </Stack>
    ),
  },
  {
    id: "plan",
    label: "Plan",
    render: (negocio) => (
      <Typography variant="body2">{negocio.plan ?? "—"}</Typography>
    ),
  },
  {
    id: "categoria",
    label: "Categoría",
    render: (negocio) => (
      <Typography variant="body2">{negocio.categoria ?? "—"}</Typography>
    ),
  },
  {
    id: "vence",
    label: "Vence",
    render: (negocio) => (
      <Typography variant="body2" color="textSecondary" noWrap>
        {negocio.suscripcion_vence_el ? formatFecha(negocio.suscripcion_vence_el) : "—"}
      </Typography>
    ),
  },
  {
    id: "estado",
    label: "Estado",
    align: "center",
    render: (negocio) => {
      const { label, color } = ESTADO_NEGOCIO[negocio.estado];
      return <Chip label={label} color={color} size="small" />;
    },
  },
  {
    id: "acciones",
    label: "Acciones",
    align: "center",
    render: (negocio) => (
      <Stack direction="row" spacing={1.5} justifyContent="center">
        <Link href={`/superadmin/negocios/${negocio.id}`}>
          <Typography variant="body2" color="primary.main" fontWeight={500}>
            Ver
          </Typography>
        </Link>
        <Link href={`/superadmin/negocios/${negocio.id}/editar`}>
          <Typography variant="body2" color="text.secondary" fontWeight={500}>
            Editar
          </Typography>
        </Link>
      </Stack>
    ),
  },
];

const NegociosTable = () => {
  const { page, perPage, search, setPage, setPerPage, buscar, params } =
    usePaginacion();
  const [estado, setEstado] = useState<EstadoNegocio | "">("");

  const { data, isPending, error } = useNegocios({
    ...params,
    estado: estado || undefined,
  });

  return (
    <>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="space-between"
        mb={2}
      >
        <BuscadorTabla
          valor={search}
          onChange={buscar}
          placeholder="Buscar por nombre o slug…"
        />
        <TextField
          select
          size="small"
          value={estado}
          onChange={(e) => {
            setEstado(e.target.value as EstadoNegocio | "");
            setPage(0);
          }}
          sx={{ minWidth: 160 }}
        >
          <MenuItem value="">Todos los estados</MenuItem>
          <MenuItem value="activa">Activa</MenuItem>
          <MenuItem value="prueba">Prueba</MenuItem>
          <MenuItem value="suspendida">Suspendida</MenuItem>
        </TextField>
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
        mensajeVacio="No se encontraron negocios."
        minWidth={800}
      />
    </>
  );
};

export default NegociosTable;
