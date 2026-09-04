"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { IconPlus, IconUsersGroup } from "@tabler/icons-react";

/**
 * Lo primero que ve un negocio recién registrado.
 *
 * Y es un caso normal, no un error: la ficha del dueño se crea en el
 * provisioning **solo si en el registro respondió que trabaja solo**, así que
 * un negocio que dijo «3-5» entra aquí y no encuentra a nadie. Por eso no dice
 * «no hay resultados» —que suena a fallo o a filtro mal puesto— sino qué es
 * esta pantalla y qué se hace en ella.
 *
 * Aprovecha para explicar de una vez la distinción que el módulo entero
 * sostiene, porque es justo donde se entiende: aquí va quien atiende, tenga o
 * no cuenta; quien solo usa el panel va en Usuarios.
 */
export default function SinProfesionales({
  onAgregar,
}: {
  onAgregar: () => void;
}) {
  return (
    <Card elevation={9}>
      <CardContent sx={{ p: { xs: 3, sm: 6 }, textAlign: "center" }}>
        <Stack alignItems="center" spacing={2}>
          <Box
            sx={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              display: "grid",
              placeItems: "center",
              color: "primary.main",
              bgcolor: (t) => alpha(t.palette.primary.main, 0.1),
            }}
          >
            <IconUsersGroup size={34} stroke={1.5} />
          </Box>

          <Typography variant="h5" fontWeight={600}>
            Todavía no has dado de alta a nadie
          </Typography>

          <Typography color="textSecondary" sx={{ maxWidth: 460 }}>
            Aquí va quien presta los servicios: cada persona con la que tus
            clientes pueden reservar. Necesitas al menos una para poder agendar
            citas.
          </Typography>

          <Button
            variant="contained"
            size="large"
            startIcon={<IconPlus size={18} />}
            onClick={onAgregar}
          >
            Agregar al primero
          </Button>

          <Typography
            variant="body2"
            color="textSecondary"
            sx={{ maxWidth: 460, pt: 1 }}
          >
            No hace falta que use el sistema: puedes registrar a alguien sin
            darle cuenta, y dársela después si algún día la necesita. Quien solo
            entra al panel —recepción, administración— va en Usuarios.
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
