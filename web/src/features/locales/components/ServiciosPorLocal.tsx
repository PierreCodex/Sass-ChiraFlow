"use client";
import { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";

import BuscadorTabla from "@/components/shared/BuscadorTabla";
import DataTable, { type Columna } from "@/components/shared/DataTable";
import { usePermisos } from "@/features/capacidades/hooks/useCapacidades";
import { useConRetardo } from "@/features/citas/hooks/useOpcionesCita";
import { useTodosLosLocales } from "../hooks/useLocales";
import {
  useActualizarLocalServicio,
  useServiciosDelLocal,
  type LocalServicio,
} from "../servicios-por-sede";

/**
 * Qué servicios ofrece cada sede (Story 2.1, FR-21).
 *
 * El catálogo es del negocio y aquí cada sede elige cuáles da. Mismo aspecto
 * que «Quién atiende en cada sede»: las sedes arriba y una tabla con un
 * interruptor que guarda al momento.
 */
const ServiciosPorLocal = () => {
  const { data: locales, isPending: cargandoLocales } = useTodosLosLocales();
  const [localId, setLocalId] = useState<number | undefined>();
  const [buscar, setBuscar] = useState("");
  const [pagina, setPagina] = useState(0);
  const [porPagina, setPorPagina] = useState(10);
  const search = useConRetardo(buscar);
  const { puedeGestionar } = usePermisos("locales");

  // Al primer render, la principal o la primera de la lista.
  useEffect(() => {
    if (localId || !locales?.length) return;
    setLocalId((locales.find((local) => local.es_principal) ?? locales[0]).id);
  }, [locales, localId]);

  // Buscar o cambiar de sede vuelve a la primera página.
  useEffect(() => setPagina(0), [search, localId]);

  const { data, isPending, error } = useServiciosDelLocal(localId, {
    page: pagina + 1,
    per_page: porPagina,
    search: search || undefined,
  });
  const actualizar = useActualizarLocalServicio(localId);

  if (cargandoLocales) return <Skeleton variant="rounded" height={280} />;

  if (!locales?.length) {
    return (
      <Alert severity="info">
        Todavía no hay sedes. Mientras el negocio tenga una sola ubicación, ofrece todo su catálogo.
      </Alert>
    );
  }

  const columnas: Columna<LocalServicio>[] = [
    {
      id: "nombre",
      label: "Servicio",
      render: (fila) => (
        <Stack spacing={1}>
          <Typography variant="subtitle2" fontWeight={600}>
            {fila.nombre}
          </Typography>
          {fila.sin_quien_lo_preste ? (
            <Tooltip
              title="No se puede reservar aquí: nadie que lo preste atiende en esta sede. Asigna un profesional activo que preste el servicio y atienda, y habilítalo en esta sede."
              arrow
            >
              <Chip label="No reservable aquí" color="warning" size="small" variant="outlined" tabIndex={0} />
            </Tooltip>
          ) : null}
        </Stack>
      ),
    },
    {
      id: "categoria",
      label: "Categoría",
      render: (fila) => (
        <Typography variant="body2" color="textSecondary">
          {fila.categoria?.nombre ?? "—"}
        </Typography>
      ),
    },
    {
      id: "habilitado",
      label: "Se ofrece aquí",
      align: "center",
      render: (fila) => (
        <Switch
          checked={fila.habilitado}
          // Quien solo ve la sección lo lee, pero no lo cambia (403 si lo intentara).
          disabled={!puedeGestionar || actualizar.isPending}
          onChange={() =>
            actualizar.mutate({ servicioId: fila.id, habilitado: !fila.habilitado })
          }
          slotProps={{ input: { "aria-label": `Ofrecer ${fila.nombre} en esta sede` } }}
        />
      ),
    },
  ];

  return (
    <>
      {/* La explicación ya va en la cabecera de la sección (nav.ts). */}
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

      <Box mb={2} maxWidth={360}>
        <BuscadorTabla valor={buscar} onChange={setBuscar} placeholder="Buscar servicio" />
      </Box>

      <DataTable
        columnas={columnas}
        datos={data}
        cargando={isPending}
        error={error}
        page={pagina}
        perPage={porPagina}
        onPageChange={setPagina}
        onPerPageChange={(n) => {
          setPorPagina(n);
          setPagina(0);
        }}
        mensajeVacio={search ? "Ningún servicio con ese nombre." : "Aún no hay servicios en el catálogo."}
        minWidth={520}
      />
    </>
  );
};

export default ServiciosPorLocal;
