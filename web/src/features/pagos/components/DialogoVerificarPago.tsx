"use client";
import { useEffect, useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconCheck, IconRefresh, IconX } from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { dialogoResponsive } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import { formatFechaLarga, formatMoneda } from "@/lib/format";

import { useDecidirPago } from "../hooks/usePagos";
import {
  COLOR_ESTADO_PAGO,
  ETIQUETA_ESTADO_PAGO,
  type PagoReserva,
} from "../types";

interface Props {
  pago: PagoReserva | null;
  onCerrar: () => void;
}

type Accion = "pedir_otra" | "rechazar" | null;

/**
 * Revisar la captura y decidir en dos clics (Story 7.4): aprobar, pedir otra
 * captura (la cita sigue reservada) o rechazar y cancelar (definitivo).
 */
export default function DialogoVerificarPago({ pago, onCerrar }: Props) {
  const { aprobar, pedirOtra, rechazar } = useDecidirPago();
  const [accion, setAccion] = useState<Accion>(null);
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    setAccion(null);
    setMotivo("");
    aprobar.reset();
    pedirOtra.reset();
    rechazar.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pago?.codigo]);

  if (!pago) return null;

  const ocupado = aprobar.isPending || pedirOtra.isPending || rechazar.isPending;
  const error = aprobar.error ?? pedirOtra.error ?? rechazar.error;
  const decidible = pago.estado === "comprobante_subido";

  const confirmarAccion = () => {
    const datos = { codigo: pago.codigo, motivo: motivo.trim() };
    const alTerminar = { onSuccess: onCerrar };
    if (accion === "pedir_otra") pedirOtra.mutate(datos, alTerminar);
    if (accion === "rechazar") rechazar.mutate(datos, alTerminar);
  };

  return (
    <Dialog
      open
      onClose={ocupado ? undefined : onCerrar}
      fullWidth
      maxWidth="md"
      sx={dialogoResponsive}
    >
      <DialogTitle component="div">
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h5" fontWeight={600}>
              Pago de la reserva {pago.codigo}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {pago.cliente_nombre} · {pago.cliente_telefono}
            </Typography>
          </Box>
          <Chip
            label={ETIQUETA_ESTADO_PAGO[pago.estado]}
            color={COLOR_ESTADO_PAGO[pago.estado]}
            size="small"
          />
        </Stack>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 6 }}>
            {pago.comprobante_url ? (
              <Box
                component="a"
                href={pago.comprobante_url}
                target="_blank"
                rel="noreferrer"
                sx={{ display: "block" }}
              >
                <Box
                  component="img"
                  src={pago.comprobante_url}
                  alt="Captura del pago"
                  sx={{
                    width: "100%",
                    maxHeight: 460,
                    objectFit: "contain",
                    borderRadius: 2,
                    border: 1,
                    borderColor: "divider",
                    bgcolor: "grey.100",
                  }}
                />
              </Box>
            ) : (
              <Alert severity="warning">
                El cliente todavía no subió su captura.
              </Alert>
            )}
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <Stack spacing={2}>
              <Dato titulo="Monto a cobrar">
                <Typography variant="h4" fontWeight={700}>
                  {formatMoneda(pago.total)}
                </Typography>
              </Dato>
              <Dato titulo="Pagó con">{pago.metodo_nombre ?? "—"}</Dato>
              <Dato titulo="Número de operación">{pago.codigo_operacion ?? "—"}</Dato>
              <Dato titulo="Servicio">{pago.servicios}</Dato>
              <Dato titulo="Cita">
                {formatFechaLarga(pago.fecha)} · {pago.hora_inicio}
              </Dato>
              {pago.motivo ? <Dato titulo="Último motivo">{pago.motivo}</Dato> : null}

              {decidible ? (
                <Alert severity="info">
                  Revisa en tu app de {pago.metodo_nombre ?? "pagos"} que llegó{" "}
                  <strong>{formatMoneda(pago.total)}</strong> antes de aprobar.
                </Alert>
              ) : null}

              {accion ? (
                <Box>
                  <CustomFormLabel htmlFor="motivo" sx={{ mt: 0 }}>
                    {accion === "pedir_otra"
                      ? "¿Qué le falta a la captura?"
                      : "¿Por qué rechazas el pago?"}
                  </CustomFormLabel>
                  <CustomTextField
                    id="motivo"
                    fullWidth
                    autoFocus
                    multiline
                    rows={2}
                    value={motivo}
                    placeholder={
                      accion === "pedir_otra"
                        ? "No se ve el monto ni el número de operación"
                        : "No encontramos ningún pago con esos datos"
                    }
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setMotivo(e.target.value)
                    }
                    helperText="El cliente lo recibe tal cual."
                  />
                </Box>
              ) : null}

              {error ? <Alert severity="error">{toApiError(error).message}</Alert> : null}
            </Stack>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1, flexWrap: "wrap" }}>
        {!decidible ? (
          <Button onClick={onCerrar}>Cerrar</Button>
        ) : accion ? (
          <>
            <Button color="inherit" onClick={() => setAccion(null)} disabled={ocupado}>
              Volver
            </Button>
            <Button
              variant="contained"
              color={accion === "rechazar" ? "error" : "warning"}
              disabled={!motivo.trim() || ocupado}
              onClick={confirmarAccion}
            >
              {accion === "rechazar" ? "Rechazar y cancelar la cita" : "Pedir otra captura"}
            </Button>
          </>
        ) : (
          <>
            <Button
              color="error"
              startIcon={<IconX size={18} />}
              onClick={() => setAccion("rechazar")}
              disabled={ocupado}
            >
              Rechazar
            </Button>
            <Button
              color="warning"
              variant="outlined"
              startIcon={<IconRefresh size={18} />}
              onClick={() => setAccion("pedir_otra")}
              disabled={ocupado}
            >
              Pedir otra captura
            </Button>
            <Button
              variant="contained"
              color="success"
              startIcon={<IconCheck size={18} />}
              onClick={() => aprobar.mutate(pago.codigo, { onSuccess: onCerrar })}
              disabled={ocupado}
            >
              {aprobar.isPending ? "Aprobando…" : "Aprobar pago"}
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}

function Dato({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Box>
      <Typography variant="caption" color="textSecondary">
        {titulo}
      </Typography>
      <Typography component="div" variant="body1" fontWeight={500}>
        {children}
      </Typography>
    </Box>
  );
}
