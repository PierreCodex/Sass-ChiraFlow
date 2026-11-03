import type { Metadata } from "next";
import { Fragment } from "react";

import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

import { env } from "@/config/env";
import Footer from "@/features/marketing/components/Footer";
import HpHeader from "@/features/marketing/components/header/HpHeader";
import { SECCIONES, VERSION, VIGENTE_DESDE } from "@/features/legal/terminos";

export const metadata: Metadata = {
  title: { absolute: `Términos y condiciones — ${env.appName}` },
};

/*
 * Lo que aún falta completar va entre corchetes: se resalta para que nadie
 * publique la página sin darse cuenta.
 */
function ConPendientes({ texto }: { texto: string }) {
  return (
    <>
      {texto.split(/(\[[^\]]+\])/).map((parte, i) =>
        parte.startsWith("[") ? (
          <Box
            key={i}
            component="mark"
            sx={{ bgcolor: "warning.light", color: "warning.dark", px: 0.5, borderRadius: 0.5 }}
          >
            {parte}
          </Box>
        ) : (
          <Fragment key={i}>{parte}</Fragment>
        )
      )}
    </>
  );
}

export default function TerminosPage() {
  return (
    <>
      <HpHeader />
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
        <Typography variant="h1" fontWeight={700} sx={{ fontSize: { xs: "32px", sm: "40px" } }}>
          Términos y condiciones
        </Typography>
        <Typography color="textSecondary" mt={1.5}>
          Versión {VERSION} · Vigente desde <ConPendientes texto={VIGENTE_DESDE} />
        </Typography>

        {/* Índice: el documento es largo y se consulta por partes. */}
        <Box component="nav" mt={4} p={3} bgcolor="primary.light" borderRadius={2}>
          <Typography fontWeight={600} mb={1}>
            Contenido
          </Typography>
          {SECCIONES.map((seccion) => (
            <Link
              key={seccion.id}
              href={`#${seccion.id}`}
              display="block"
              underline="hover"
              variant="body2"
              py={0.25}
            >
              {seccion.titulo}
            </Link>
          ))}
        </Box>

        {SECCIONES.map((seccion) => (
          <Box key={seccion.id} id={seccion.id} component="section" mt={5} sx={{ scrollMarginTop: 90 }}>
            <Typography variant="h4" fontWeight={700} mb={2}>
              {seccion.titulo}
            </Typography>
            {seccion.parrafos.map((parrafo, i) =>
              parrafo.startsWith("• ") ? (
                <Typography key={i} component="div" variant="body1" lineHeight={1.8} pl={3} mb={0.75}>
                  <Box component="span" color="primary.main" mr={1}>
                    •
                  </Box>
                  <ConPendientes texto={parrafo.slice(2)} />
                </Typography>
              ) : (
                <Typography key={i} variant="body1" lineHeight={1.8} mb={1.5}>
                  <ConPendientes texto={parrafo} />
                </Typography>
              )
            )}
          </Box>
        ))}

        <Divider sx={{ my: 6 }} />
      </Container>
      <Footer />
    </>
  );
}
