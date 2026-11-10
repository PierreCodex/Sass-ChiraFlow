"use client";
import { useEffect, useRef, useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconBrandWhatsapp } from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import DashboardCard from "@/components/shared/DashboardCard";
import { formularioCompacto } from "@/components/shared/estilos-formulario";
import { useAvisos } from "@/context/avisos";
import { useUsuarioActual } from "@/features/auth/hooks/useAuth";
import { normalizarTelefono, PREFIJO_TELEFONO, soloDigitos } from "@/features/auth/types";
import { toApiError } from "@/lib/api/client";
import { formatFechaDeMomento, formatHora } from "@/lib/format";

import { useGuardarWhatsapp, useQuitarWhatsapp, useWhatsappEquipo } from "../hooks/useWhatsapp";

/** `+51911111111` → `+51 911 111 111` */
const legible = (telefono: string) =>
  telefono.replace(/^(\+51)(\d{3})(\d{3})(\d{3})$/, "$1 $2 $3 $4");

const sinPrefijo = (telefono: string | null | undefined) =>
  telefono?.startsWith(PREFIJO_TELEFONO) ? telefono.slice(PREFIJO_TELEFONO.length) : "";

/**
 * Mi perfil → Avisos por WhatsApp (Story 4.8b, AD-22).
 *
 * El número no recibe nada hasta que la persona escribe el código DESDE ese
 * WhatsApp al número del equipo de tivu: así queda probado que es suyo y que
 * quiere los avisos. El correo sigue llegando siempre.
 */
const AvisosWhatsapp = () => {
  const { data: usuario } = useUsuarioActual();
  const { data: registro, isLoading, isError } = useWhatsappEquipo();
  const guardar = useGuardarWhatsapp();
  const quitar = useQuitarWhatsapp();
  const { avisar } = useAvisos();

  const [editando, setEditando] = useState(false);
  const [digitos, setDigitos] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [confirmarQuitar, setConfirmarQuitar] = useState(false);

  // Pasó a activo mientras miraba (lo activó desde el celular): se celebra.
  const estadoAnterior = useRef(registro?.estado);
  useEffect(() => {
    if (estadoAnterior.current === "pendiente" && registro?.estado === "activo") {
      avisar("¡Listo! Tu WhatsApp ya recibe los avisos.");
    }
    estadoAnterior.current = registro?.estado;
  }, [registro?.estado, avisar]);

  // Sin número todavía: se propone el teléfono de su ficha, que casi siempre
  // es su WhatsApp. Solo una vez, para no pisar lo que escriba.
  const propuesto = useRef(false);
  useEffect(() => {
    if (propuesto.current || isLoading || registro || !usuario?.telefono) return;
    propuesto.current = true;
    setDigitos(sinPrefijo(usuario.telefono));
  }, [isLoading, registro, usuario?.telefono]);

  const abrirFormulario = () => {
    setDigitos(sinPrefijo(registro?.telefono ?? usuario?.telefono));
    setError(null);
    setEditando(true);
  };

  const enviar = (telefono: string) => {
    setError(null);
    guardar.mutate(telefono, {
      onSuccess: () => setEditando(false),
      onError: (e) => {
        const apiError = toApiError(e);
        setError(apiError.errors?.telefono?.[0] ?? apiError.message);
      },
    });
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (digitos.length !== 9) {
      setError("El número debe tener 9 dígitos.");
      return;
    }
    enviar(normalizarTelefono(digitos));
  };

  const vencido =
    registro?.estado === "pendiente" &&
    !!registro.codigo_vence_at &&
    new Date(registro.codigo_vence_at).getTime() < Date.now();

  const contenido = () => {
    if (isLoading) return <Skeleton variant="rounded" height={96} />;

    if (isError) {
      return <Alert severity="error">No pudimos cargar tus avisos por WhatsApp. Vuelve a intentarlo en un rato.</Alert>;
    }

    if (editando || !registro) {
      return (
        <Box component="form" onSubmit={onSubmit} noValidate sx={formularioCompacto}>
          <Typography variant="body2" color="textSecondary" mb={2}>
            Te escribiremos cuando entre una reserva o haya un comprobante por verificar. El correo sigue
            llegando igual.
          </Typography>

          <CustomFormLabel htmlFor="whatsapp" sx={{ mt: 0 }}>
            Tu número de WhatsApp
          </CustomFormLabel>
          <CustomTextField
            id="whatsapp"
            type="tel"
            value={digitos}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDigitos(soloDigitos(e.target.value).slice(0, 9))}
            disabled={guardar.isPending}
            fullWidth
            placeholder="987654321"
            error={!!error}
            helperText={error ?? "Puede ser distinto del teléfono de tu ficha."}
            slotProps={{
              input: { startAdornment: <InputAdornment position="start">{PREFIJO_TELEFONO}</InputAdornment> },
            }}
          />

          <Stack direction="row" spacing={1.5} mt={3}>
            <Button type="submit" variant="contained" disabled={guardar.isPending}>
              {guardar.isPending ? "Guardando…" : "Continuar"}
            </Button>
            {registro ? (
              <Button variant="text" color="inherit" onClick={() => setEditando(false)} disabled={guardar.isPending}>
                Cancelar
              </Button>
            ) : null}
          </Stack>
        </Box>
      );
    }

    const acciones = (
      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
        <Button variant="outlined" onClick={abrirFormulario}>
          Cambiar número
        </Button>
        <Button variant="text" color="error" onClick={() => setConfirmarQuitar(true)}>
          Quitar
        </Button>
      </Stack>
    );

    if (registro.estado === "activo") {
      return (
        <Stack spacing={2}>
          <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
            <Typography variant="h6">{legible(registro.telefono)}</Typography>
            <Chip label="Activo" color="success" size="small" />
          </Stack>
          <Typography variant="body2" color="textSecondary">
            Recibes aquí los avisos de tu negocio
            {registro.activado_at ? ` desde el ${formatFechaDeMomento(registro.activado_at)}` : ""}. Para dejar de
            recibirlos también puedes responder <b>BAJA</b> en el chat.
          </Typography>
          {acciones}
        </Stack>
      );
    }

    // Pendiente: falta que escriba el código desde su WhatsApp.
    return (
      <Stack spacing={2}>
        <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap>
          <Typography variant="h6">{legible(registro.telefono)}</Typography>
          <Chip label="Falta activarlo" color="warning" size="small" />
        </Stack>

        {vencido ? (
          <Alert
            severity="warning"
            action={
              <Button color="inherit" size="small" onClick={() => enviar(registro.telefono)} disabled={guardar.isPending}>
                Pedir otro
              </Button>
            }
          >
            El código venció. Pide otro para activar tu número.
          </Alert>
        ) : !registro.numero_plataforma ? (
          <Alert severity="info">
            Los avisos por WhatsApp aún no están disponibles. Guardamos tu número y te avisaremos por correo
            cuando puedas activarlo.
          </Alert>
        ) : (
          <>
            <Typography variant="body2" color="textSecondary">
              Envía este mensaje <b>desde ese WhatsApp</b> al número de avisos de tivu,{" "}
              <b>{legible(registro.numero_plataforma)}</b>. Así sabemos que el número es tuyo.
            </Typography>

            <Box
              sx={{
                py: 2,
                px: 3,
                borderRadius: 2,
                bgcolor: "grey.100",
                textAlign: "center",
              }}
            >
              <Typography variant="h4" component="p" sx={{ letterSpacing: 2, fontVariantNumeric: "tabular-nums" }}>
                ACTIVAR {registro.codigo}
              </Typography>
              {registro.codigo_vence_at ? (
                <Typography variant="caption" color="textSecondary">
                  Vence el {formatFechaDeMomento(registro.codigo_vence_at)} a las {formatHora(registro.codigo_vence_at)}
                </Typography>
              ) : null}
            </Box>

            {registro.enlace ? (
              <Button
                variant="contained"
                color="success"
                href={registro.enlace}
                target="_blank"
                rel="noopener noreferrer"
                startIcon={<IconBrandWhatsapp size={20} />}
                sx={{ alignSelf: { xs: "stretch", sm: "flex-start" } }}
              >
                Abrir WhatsApp
              </Button>
            ) : null}

            <Typography variant="caption" color="textSecondary">
              Cuando lo envíes, esta tarjeta cambiará sola a «Activo».
            </Typography>
          </>
        )}

        {acciones}
      </Stack>
    );
  };

  return (
    <DashboardCard title="Avisos por WhatsApp" subtitle="Solo para ti: cada persona del equipo activa el suyo">
      <>
        {contenido()}

        <ConfirmDialog
          abierto={confirmarQuitar}
          titulo="¿Quitar tu WhatsApp?"
          mensaje="Dejarás de recibir avisos por WhatsApp. Los avisos por correo siguen llegando."
          textoConfirmar="Quitar"
          color="error"
          cargando={quitar.isPending}
          error={quitar.error ? toApiError(quitar.error).message : null}
          onConfirmar={() => quitar.mutate(undefined, { onSuccess: () => setConfirmarQuitar(false) })}
          onCancelar={() => setConfirmarQuitar(false)}
        />
      </>
    </DashboardCard>
  );
};

export default AvisosWhatsapp;
