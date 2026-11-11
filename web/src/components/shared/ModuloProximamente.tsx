"use client";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { IconClockHour4 } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import EncabezadoPagina from "@/components/shared/EncabezadoPagina";

interface Props {
  titulo: string;
  /** Qué hará la sección cuando llegue, en una frase. */
  descripcion: string;
  /** Una línea extra, p. ej. qué hacer mientras tanto. */
  nota?: ReactNode;
}

/**
 * Una sección del panel que todavía no tiene backend (ver
 * `moduloEnConstruccion` en `lib/api/mocks.ts`). En producción se ve esto en
 * vez de los datos ficticios: un negocio real no debe ver citas, cajas ni
 * tickets que no son suyos.
 */
const ModuloProximamente = ({ titulo, descripcion, nota }: Props) => (
  <PageContainer title={titulo} description="Próximamente">
    <EncabezadoPagina titulo={titulo} />

    <Card elevation={9}>
      <CardContent sx={{ py: 8, px: 3, textAlign: "center" }}>
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            // `primary.light` no se invierte en modo oscuro (ver CLAUDE.md).
            bgcolor: "grey.100",
            color: "primary.main",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            mb: 2,
          }}
        >
          <IconClockHour4 size={32} />
        </Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Esta sección llega pronto
        </Typography>
        <Typography color="textSecondary" sx={{ maxWidth: 520, mx: "auto" }}>
          {descripcion}
        </Typography>
        {nota ? (
          <Typography variant="body2" color="textSecondary" sx={{ mt: 2, maxWidth: 520, mx: "auto" }}>
            {nota}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  </PageContainer>
);

export default ModuloProximamente;
