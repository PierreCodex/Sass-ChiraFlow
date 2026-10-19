"use client";
import { useEffect, useMemo, useRef, useState } from "react";

import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import {
  IconCheck,
  IconCopy,
  IconDownload,
  IconPhotoUp,
  IconUpload,
} from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { toApiError } from "@/lib/api/client";
import { formatMoneda } from "@/lib/format";

import {
  useConfigPagosPublica,
  usePagoDeReserva,
  useSubirComprobante,
} from "../hooks/usePagos";
import { BILLETERAS, metodosActivos, type MetodoPago } from "../types";

interface Props {
  slug: string;
  codigo: string;
  total: number;
}

/** 5 MB: una captura de pantalla de móvil pesa bastante menos. */
const TAMANO_MAXIMO = 5 * 1024 * 1024;

/**
 * El paso de pago que ve el cliente después de reservar con «Pagar ahora».
 *
 * Elige con qué paga (Yape, Plin, BIM…), ve el QR de ese método con el monto
 * y la hora límite, lo puede descargar, y sube su captura. Sin cuenta: le
 * basta el código de su reserva (Stories 7.2 y 7.3).
 */
const PasoPago = ({ slug, codigo, total }: Props) => {
  const { data: config, isPending: cargandoConfig } = useConfigPagosPublica(slug);
  const { data: pago, isPending: cargandoPago } = usePagoDeReserva(slug, codigo);
  const subir = useSubirComprobante(slug, codigo);

  const metodos = useMemo(() => metodosActivos(config), [config]);
  const [metodoId, setMetodoId] = useState<number | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<string | null>(null);
  const [codigoOperacion, setCodigoOperacion] = useState("");
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [copiado, setCopiado] = useState<string | null>(null);
  const entradaArchivo = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (metodoId === null && metodos.length) setMetodoId(metodos[0].id);
  }, [metodos, metodoId]);

  useEffect(() => {
    if (!archivo) {
      setVistaPrevia(null);
      return;
    }
    const url = URL.createObjectURL(archivo);
    setVistaPrevia(url);
    return () => URL.revokeObjectURL(url);
  }, [archivo]);

  const metodo = metodos.find((item) => item.id === metodoId) ?? null;

  const copiar = async (texto: string, clave: string) => {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(clave);
      setTimeout(() => setCopiado(null), 1500);
    } catch {
      // Sin permiso de portapapeles: el dato sigue a la vista.
    }
  };

  const elegirArchivo = (lista: FileList | null) => {
    const elegido = lista?.[0] ?? null;
    setErrorArchivo(null);
    if (!elegido) return;
    if (!elegido.type.startsWith("image/")) {
      setErrorArchivo("Sube una imagen: la captura de tu pago.");
      return;
    }
    if (elegido.size > TAMANO_MAXIMO) {
      setErrorArchivo("La imagen pesa más de 5 MB. Prueba con una captura de pantalla.");
      return;
    }
    setArchivo(elegido);
  };

  const enviar = () => {
    if (!metodo || !archivo) return;
    subir.mutate(
      {
        metodo_id: metodo.id,
        comprobante: archivo,
        codigo_operacion: codigoOperacion.trim() || null,
      },
      {
        onSuccess: () => {
          setArchivo(null);
          setCodigoOperacion("");
        },
      }
    );
  };

  if (cargandoConfig || cargandoPago) {
    return <Skeleton variant="rounded" height={420} />;
  }

  if (!pago || !metodos.length) {
    return (
      <Alert severity="warning" sx={{ textAlign: "left" }}>
        No encontramos los datos de pago de esta reserva. Escríbele al negocio
        con tu código <strong>{codigo}</strong>.
      </Alert>
    );
  }

  const horaLimite = new Date(pago.vence_a).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });

  // ── Estados finales: ya no se pide nada al cliente ─────────────────────
  if (pago.estado === "comprobante_subido") {
    return (
      <Alert severity="success" sx={{ textAlign: "left" }}>
        <AlertTitle>Recibimos tu captura</AlertTitle>
        La estamos revisando. <strong>Tu horario sigue reservado</strong>; te
        avisamos a {pago.cliente_email} cuando el pago quede verificado.
        {pago.metodo_nombre ? ` Pagaste con ${pago.metodo_nombre}.` : ""}
      </Alert>
    );
  }
  if (pago.estado === "verificado") {
    return (
      <Alert severity="success" sx={{ textAlign: "left" }}>
        <AlertTitle>Pago verificado</AlertTitle>
        Tu cita está confirmada. ¡Te esperamos!
      </Alert>
    );
  }
  if (pago.estado === "rechazado") {
    return (
      <Alert severity="error" sx={{ textAlign: "left" }}>
        <AlertTitle>No pudimos verificar tu pago</AlertTitle>
        {pago.motivo ? `Motivo: ${pago.motivo}. ` : ""}Tu reserva se canceló.
        Si crees que es un error, escríbele al negocio con tu código{" "}
        <strong>{codigo}</strong>.
      </Alert>
    );
  }

  // ── Pendiente: QR, monto, plazo y subida de la captura ─────────────────
  return (
    <Stack spacing={3} sx={{ textAlign: "left" }}>
      {pago.motivo ? (
        <Alert severity="warning">
          <AlertTitle>Necesitamos otra captura</AlertTitle>
          {pago.motivo}. Tu horario sigue reservado.
        </Alert>
      ) : null}

      <Box
        sx={{
          p: 2.5,
          borderRadius: 2,
          bgcolor: "primary.light",
          textAlign: "center",
        }}
      >
        <Typography variant="body2" color="textSecondary">
          Paga exactamente
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center" alignItems="center">
          <Typography variant="h3" fontWeight={700} color="primary.main">
            {formatMoneda(total)}
          </Typography>
          <Tooltip title={copiado === "monto" ? "¡Copiado!" : "Copiar monto"}>
            <IconButton size="small" onClick={() => copiar(total.toFixed(2), "monto")}>
              {copiado === "monto" ? <IconCheck size={18} /> : <IconCopy size={18} />}
            </IconButton>
          </Tooltip>
        </Stack>
        <Typography variant="body2" mt={0.5}>
          Tienes hasta las <strong>{horaLimite}</strong> para pagar y subir tu captura.
        </Typography>
      </Box>

      <Box>
        <Typography variant="subtitle1" fontWeight={600} mb={1}>
          Elige con qué pagas
        </Typography>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {metodos.map((item) => (
            <ChipMetodo
              key={item.id}
              metodo={item}
              elegido={item.id === metodoId}
              onClick={() => setMetodoId(item.id)}
            />
          ))}
        </Stack>
      </Box>

      {metodo ? (
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={3}
          alignItems={{ xs: "center", sm: "flex-start" }}
        >
          <Stack alignItems="center" spacing={1} flexShrink={0}>
            <Box
              component="img"
              src={metodo.qr_url!}
              alt={`QR de ${metodo.nombre}`}
              sx={{
                width: 200,
                height: 200,
                objectFit: "contain",
                p: 1.5,
                bgcolor: "#fff",
                borderRadius: 2,
                border: "3px solid",
                borderColor: BILLETERAS[metodo.tipo].color,
              }}
            />
            <Button
              component="a"
              href={metodo.qr_url!}
              download={`qr-${metodo.tipo}-${slug}`}
              size="small"
              variant="outlined"
              startIcon={<IconDownload size={16} />}
            >
              Descargar QR
            </Button>
          </Stack>

          <Stack spacing={1.5} flex={1} minWidth={0}>
            <Typography variant="body2" color="textSecondary">
              {config?.instrucciones ??
                `Escanea el QR con ${metodo.nombre}, paga el monto exacto y sube la captura.`}
            </Typography>
            {metodo.numero ? (
              <Box>
                <Typography variant="caption" color="textSecondary">
                  O paga al número
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="h6" fontWeight={600}>
                    {metodo.numero}
                  </Typography>
                  <Tooltip title={copiado === "numero" ? "¡Copiado!" : "Copiar número"}>
                    <IconButton
                      size="small"
                      onClick={() => copiar(metodo.numero!.replace(/\s/g, ""), "numero")}
                    >
                      {copiado === "numero" ? (
                        <IconCheck size={16} />
                      ) : (
                        <IconCopy size={16} />
                      )}
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            ) : null}
            {metodo.titular ? (
              <Typography variant="body2">
                A nombre de <strong>{metodo.titular}</strong>
              </Typography>
            ) : null}
          </Stack>
        </Stack>
      ) : null}

      <Box>
        <Typography variant="subtitle1" fontWeight={600} mb={1}>
          Sube la captura de tu pago
        </Typography>

        <input
          ref={entradaArchivo}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          hidden
          onChange={(e) => elegirArchivo(e.target.files)}
        />

        {vistaPrevia ? (
          <Stack direction="row" spacing={2} alignItems="center">
            <Box
              component="img"
              src={vistaPrevia}
              alt="Tu captura"
              sx={{
                width: 96,
                height: 128,
                objectFit: "cover",
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
              }}
            />
            <Button size="small" onClick={() => entradaArchivo.current?.click()}>
              Cambiar imagen
            </Button>
          </Stack>
        ) : (
          <Button
            fullWidth
            variant="outlined"
            startIcon={<IconPhotoUp size={18} />}
            onClick={() => entradaArchivo.current?.click()}
            sx={{ py: 2, borderStyle: "dashed" }}
          >
            Elegir captura
          </Button>
        )}
        {errorArchivo ? (
          <Typography variant="caption" color="error" display="block" mt={1}>
            {errorArchivo}
          </Typography>
        ) : null}

        <CustomFormLabel htmlFor="codigo_operacion">
          Número de operación (opcional)
        </CustomFormLabel>
        <CustomTextField
          id="codigo_operacion"
          fullWidth
          size="small"
          placeholder="Ej. 26101992"
          value={codigoOperacion}
          inputProps={{ maxLength: 30 }}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            setCodigoOperacion(e.target.value)
          }
          helperText="Ayuda a verificar tu pago más rápido."
        />
      </Box>

      {subir.isError ? (
        <Alert severity="error">{toApiError(subir.error).message}</Alert>
      ) : null}

      <Button
        variant="contained"
        size="large"
        startIcon={<IconUpload size={18} />}
        disabled={!archivo || !metodo || subir.isPending}
        onClick={enviar}
      >
        {subir.isPending ? "Enviando…" : "Enviar comprobante"}
      </Button>
    </Stack>
  );
};

function ChipMetodo({
  metodo,
  elegido,
  onClick,
}: {
  metodo: MetodoPago;
  elegido: boolean;
  onClick: () => void;
}) {
  const color = BILLETERAS[metodo.tipo].color;
  return (
    <Chip
      label={metodo.nombre}
      onClick={onClick}
      variant={elegido ? "filled" : "outlined"}
      sx={{
        fontWeight: 600,
        px: 1,
        borderColor: color,
        color: elegido ? "#fff" : color,
        bgcolor: elegido ? color : "transparent",
        "&:hover": { bgcolor: elegido ? color : `${color}14` },
      }}
    />
  );
}

export default PasoPago;
