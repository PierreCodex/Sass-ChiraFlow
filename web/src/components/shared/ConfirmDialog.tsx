"use client";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Typography from "@mui/material/Typography";

import { dialogoResponsive } from "@/components/shared/estilos-formulario";

interface Props {
  abierto: boolean;
  titulo: string;
  mensaje: React.ReactNode;
  textoConfirmar?: string;
  /** Color del botón de confirmación. `error` para acciones destructivas. */
  color?: "primary" | "error";
  cargando?: boolean;
  error?: string | null;
  onConfirmar: () => void;
  onCancelar: () => void;
}

/** Confirmación para acciones irreversibles (eliminar, cancelar, cerrar caja). */
const ConfirmDialog = ({
  abierto,
  titulo,
  mensaje,
  textoConfirmar = "Confirmar",
  color = "error",
  cargando = false,
  error = null,
  onConfirmar,
  onCancelar,
}: Props) => (
  <Dialog
      sx={dialogoResponsive}
    open={abierto}
    onClose={cargando ? undefined : onCancelar}
    maxWidth="xs"
    fullWidth
  >
    <DialogTitle component="div">
      <Typography variant="h5" fontWeight={600}>
        {titulo}
      </Typography>
    </DialogTitle>

    <DialogContent>
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      <Typography variant="body2" color="textSecondary">
        {mensaje}
      </Typography>
    </DialogContent>

    <DialogActions sx={{ p: 3 }}>
      <Button onClick={onCancelar} color="inherit" disabled={cargando}>
        Cancelar
      </Button>
      <Button
        onClick={onConfirmar}
        variant="contained"
        color={color}
        disabled={cargando}
      >
        {cargando ? "Procesando…" : textoConfirmar}
      </Button>
    </DialogActions>
  </Dialog>
);

export default ConfirmDialog;
