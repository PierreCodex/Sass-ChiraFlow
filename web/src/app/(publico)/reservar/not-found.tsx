import Image from "next/image";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";

/**
 * «No encontramos esta tienda» (Story 6.1).
 *
 * La pinta `notFound()` desde el layout de `reservar/[slug]` cuando la
 * dirección no es una tienda abierta: no existe, está reservada, el negocio
 * está suspendido, borrado o con la tienda apagada. **El mismo texto para
 * todos los casos**: a un desconocido no se le dice si el negocio existe.
 *
 * Sin botón hacia el panel ni la web de tivu: quien llega aquí es cliente de
 * un negocio, y lo útil es pedirle a ese negocio su enlace.
 *
 * Basada en la `not-found.tsx` de la plantilla Modernize.
 */
export default function TiendaNoEncontrada() {
  return (
    <Box
      display="flex"
      flexDirection="column"
      minHeight="100vh"
      textAlign="center"
      justifyContent="center"
      sx={{ py: 6 }}
    >
      <Container maxWidth="sm">
        <Image
          src="/images/backgrounds/errorimg.svg"
          alt=""
          width={400}
          height={400}
          priority
          style={{ width: "100%", maxWidth: 360, height: "auto" }}
        />
        <Typography variant="h3" fontWeight={600} mt={3} mb={2}>
          No encontramos esta tienda
        </Typography>
        <Typography variant="body1" color="textSecondary">
          Revisa que la dirección esté bien escrita, o pídele al negocio su
          enlace de reservas.
        </Typography>
      </Container>
    </Box>
  );
}
