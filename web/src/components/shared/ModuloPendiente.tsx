"use client";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconTool } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import DashboardCard from "@/components/shared/DashboardCard";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";

interface Props {
  titulo: string;
  descripcion: string;
  /** Ruta de la API de Laravel que consumirá este módulo. */
  endpoint?: string;
}

/**
 * Andamio de un módulo todavía sin construir: deja la ruta navegable y el
 * breadcrumb correcto. Al implementarlo, reemplaza esta página por la
 * composición real (ver app/(dashboard)/clientes/page.tsx como referencia).
 */
const ModuloPendiente = ({ titulo, descripcion, endpoint }: Props) => (
  <PageContainer title={titulo} description={descripcion}>
    <Breadcrumb title={titulo} items={[{ to: "/", title: "Inicio" }, { title: titulo }]} />
    <DashboardCard>
      <Box py={6} textAlign="center">
        <Stack spacing={2} alignItems="center">
          <IconTool size={40} opacity={0.35} />
          <Typography variant="h5">{titulo}</Typography>
          <Typography color="textSecondary" maxWidth={460}>
            {descripcion}
          </Typography>
          {endpoint ? (
            <Typography variant="body2" color="textSecondary">
              API prevista: <code>{endpoint}</code>
            </Typography>
          ) : null}
        </Stack>
      </Box>
    </DashboardCard>
  </PageContainer>
);

export default ModuloPendiente;
