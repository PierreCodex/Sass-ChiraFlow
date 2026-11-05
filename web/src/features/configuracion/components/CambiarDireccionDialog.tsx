"use client";
import { useEffect, useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import InputAdornment from "@mui/material/InputAdornment";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconCircleCheck, IconCircleX } from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import {
  dialogoResponsive,
  formularioCompacto,
} from "@/components/shared/estilos-formulario";
import { env } from "@/config/env";
import { useConRetardo } from "@/features/citas/hooks/useOpcionesCita";
import { toApiError } from "@/lib/api/client";

import { normalizarDireccion, TEXTO_MOTIVO, tieneFormatoValido } from "../direccion";
import { useCambiarDireccion, useDireccionDisponible } from "../hooks/useConfiguracion";

interface Props {
  abierto: boolean;
  slugActual: string;
  onCerrar: () => void;
}

/**
 * Cambiar la dirección pública del negocio (Story 6.1).
 *
 * Comprueba mientras se escribe si está libre, y avisa de lo que pasa con la
 * anterior: sigue llevando a la tienda y nadie más podrá usarla. Así cambiar
 * no rompe los enlaces que el negocio ya repartió por WhatsApp.
 */
const CambiarDireccionDialog = ({ abierto, slugActual, onCerrar }: Props) => {
  const cambiar = useCambiarDireccion();
  const [escrito, setEscrito] = useState(slugActual);
  const [errorServidor, setErrorServidor] = useState<string | null>(null);

  useEffect(() => {
    if (!abierto) return;
    setEscrito(slugActual);
    setErrorServidor(null);
    cambiar.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, slugActual]);

  const slug = normalizarDireccion(escrito);
  const retardado = useConRetardo(slug, 400);
  const esLaActual = slug === slugActual;
  const formatoOk = tieneFormatoValido(slug);
  const preguntar = abierto && formatoOk && !esLaActual && retardado === slug;
  const disponibilidad = useDireccionDisponible(retardado, preguntar);

  const comprobando = formatoOk && !esLaActual && (retardado !== slug || disponibilidad.isFetching);
  const libre = preguntar && !disponibilidad.isFetching && disponibilidad.data?.disponible === true;
  const motivo =
    slug && !formatoOk
      ? TEXTO_MOTIVO.formato
      : preguntar && disponibilidad.data?.disponible === false
        ? TEXTO_MOTIVO[disponibilidad.data.motivo ?? "ocupado"]
        : null;

  const guardar = (evento: React.FormEvent) => {
    evento.preventDefault();
    /*
      El diálogo va en un portal, pero los eventos de React suben por el árbol
      de COMPONENTES: sin esto, su submit llegaba también al formulario de la
      sección «Sitio público» que lo contiene, y la guardaba entera.
    */
    evento.stopPropagation();
    if (!libre) return;
    cambiar.mutate(slug, {
      onSuccess: () => onCerrar(),
      onError: (error) => {
        const apiError = toApiError(error);
        setErrorServidor(apiError.errors?.slug?.[0] ?? apiError.message);
      },
    });
  };

  const dominio = env.appDomain;

  return (
    <Dialog
      sx={dialogoResponsive}
      open={abierto}
      onClose={cambiar.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="sm"
    >
      <Box component="form" onSubmit={guardar} noValidate>
        <DialogTitle component="div">
          <Typography variant="h5" fontWeight={600}>
            Cambiar la dirección de tu tienda
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Es el enlace que compartes con tus clientes para que reserven.
          </Typography>
        </DialogTitle>

        <Divider />

        <DialogContent sx={formularioCompacto}>
          <CustomFormLabel htmlFor="direccion" sx={{ mt: 0 }}>
            Nueva dirección
          </CustomFormLabel>
          <CustomTextField
            id="direccion"
            value={escrito}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setEscrito(e.target.value);
              setErrorServidor(null);
            }}
            fullWidth
            autoFocus
            error={!!motivo || !!errorServidor}
            helperText={
              errorServidor ?? motivo ?? (esLaActual ? "Es tu dirección actual." : libre ? "Disponible" : " ")
            }
            FormHelperTextProps={libre && !errorServidor ? { sx: { color: "success.main" } } : undefined}
            slotProps={{
              input: {
                startAdornment: dominio ? undefined : (
                  <InputAdornment position="start">/reservar/</InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <Stack direction="row" spacing={1} alignItems="center">
                      {dominio ? <span>.{dominio}</span> : null}
                      {comprobando ? (
                        <CircularProgress size={16} />
                      ) : libre ? (
                        <Box sx={{ display: "flex", color: "success.main" }}>
                          <IconCircleCheck size={18} />
                        </Box>
                      ) : motivo ? (
                        <Box sx={{ display: "flex", color: "error.main" }}>
                          <IconCircleX size={18} />
                        </Box>
                      ) : null}
                    </Stack>
                  </InputAdornment>
                ),
              },
            }}
          />
          <Alert severity="info" sx={{ mt: 2 }}>
            <strong>Tu dirección anterior seguirá funcionando:</strong> quien
            entre por ella llegará a la nueva, y ningún otro negocio podrá
            usarla. Aun así, actualiza el enlace donde lo tengas publicado.
          </Alert>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button type="submit" variant="contained" disabled={!libre || cambiar.isPending}>
              {cambiar.isPending ? "Guardando…" : "Cambiar dirección"}
            </Button>
            <Button onClick={onCerrar} color="inherit" disabled={cambiar.isPending}>
              Cancelar
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default CambiarDireccionDialog;
