import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import { IconTool } from "@tabler/icons-react";

interface Props {
  titulo: string;
}

/**
 * Placeholder para rutas que ya navegan pero todavía no tienen pantalla
 * propia. El `README.md` menciona un `ModuloPendiente.tsx` que en realidad
 * nunca se creó — este componente es ese, con nombre más claro.
 */
const EnConstruccion = ({ titulo }: Props) => (
  <Paper
    variant="outlined"
    sx={{
      p: 6,
      textAlign: "center",
      borderStyle: "dashed",
    }}
  >
    <Stack spacing={1.5} alignItems="center">
      <IconTool size={32} strokeWidth={1.5} />
      <Typography variant="h6" fontWeight={600}>
        {titulo}
      </Typography>
      <Typography variant="body2" color="textSecondary">
        Esta pantalla todavía no está construida. La ruta y el menú ya
        funcionan; falta el contenido.
      </Typography>
    </Stack>
  </Paper>
);

export default EnConstruccion;
