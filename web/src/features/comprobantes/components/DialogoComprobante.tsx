"use client";
import { useEffect, useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import { IconBan, IconBrandWhatsapp, IconPrinter } from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { dialogoResponsive } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import { formatMoneda } from "@/lib/format";

import { useAnularComprobante } from "../hooks/useComprobantes";
import { numeroComprobante, type Comprobante } from "../types";
import HojaComprobante from "./HojaComprobante";

interface Props {
  comprobante: Comprobante | null;
  onCerrar: () => void;
}

/**
 * Ver un comprobante, imprimirlo (o guardarlo en PDF desde el diálogo de
 * impresión) y, si hace falta, anularlo con motivo.
 */
export default function DialogoComprobante({ comprobante, onCerrar }: Props) {
  const anular = useAnularComprobante();
  const [anulando, setAnulando] = useState(false);
  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    setAnulando(false);
    setMotivo("");
    anular.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [comprobante?.id]);

  if (!comprobante) return null;

  // Lo que se manda por WhatsApp es solo un aviso: el PDF se adjunta a mano
  // hasta que el backend lo envíe por correo.
  const telefono = comprobante.cliente.telefono?.replace(/\D/g, "") ?? "";
  const mensaje = encodeURIComponent(
    `Hola ${comprobante.cliente.nombre}, te enviamos tu comprobante ${numeroComprobante(
      comprobante
    )} por ${formatMoneda(comprobante.total)}. ¡Gracias por tu visita!`
  );
  const enlaceWhatsapp = telefono
    ? `https://wa.me/${telefono.length === 9 ? `51${telefono}` : telefono}?text=${mensaje}`
    : null;

  return (
    <Dialog
      open
      onClose={anular.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="md"
      sx={dialogoResponsive}
    >
      <DialogContent dividers sx={{ bgcolor: "grey.100" }}>
        <HojaComprobante comprobante={comprobante} />

        {anulando ? (
          <Box mt={2}>
            <CustomFormLabel htmlFor="motivo-anulacion" sx={{ mt: 0 }}>
              ¿Por qué anulas este comprobante?
            </CustomFormLabel>
            <CustomTextField
              id="motivo-anulacion"
              fullWidth
              autoFocus
              value={motivo}
              placeholder="Se emitió con el nombre equivocado"
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMotivo(e.target.value)}
              helperText="El número no se reutiliza: queda marcado como anulado."
            />
          </Box>
        ) : null}

        {anular.error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {toApiError(anular.error).message}
          </Alert>
        ) : null}
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1, flexWrap: "wrap" }}>
        {anulando ? (
          <>
            <Button color="inherit" onClick={() => setAnulando(false)} disabled={anular.isPending}>
              Volver
            </Button>
            <Button
              variant="contained"
              color="error"
              disabled={!motivo.trim() || anular.isPending}
              onClick={() =>
                anular.mutate(
                  { id: comprobante.id, motivo: motivo.trim() },
                  { onSuccess: () => setAnulando(false) }
                )
              }
            >
              {anular.isPending ? "Anulando…" : "Anular comprobante"}
            </Button>
          </>
        ) : (
          <>
            {comprobante.estado === "emitido" ? (
              <Button
                color="error"
                startIcon={<IconBan size={18} />}
                onClick={() => setAnulando(true)}
                sx={{ mr: "auto" }}
              >
                Anular
              </Button>
            ) : null}
            <Button onClick={onCerrar}>Cerrar</Button>
            {enlaceWhatsapp ? (
              <Button
                variant="outlined"
                color="success"
                startIcon={<IconBrandWhatsapp size={18} />}
                href={enlaceWhatsapp}
                target="_blank"
                rel="noreferrer"
              >
                Avisar por WhatsApp
              </Button>
            ) : null}
            <Button
              variant="contained"
              startIcon={<IconPrinter size={18} />}
              onClick={() => window.print()}
            >
              Imprimir / PDF
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
