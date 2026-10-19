"use client";
import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconPhotoUp, IconPlus, IconTrash } from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import MarcoSeccion from "@/features/configuracion/components/MarcoSeccion";
import SeccionCampos from "@/features/configuracion/components/SeccionCampos";

import { useConfigPagos, useGuardarConfigPagos } from "../hooks/usePagos";
import {
  BILLETERAS,
  metodosActivos,
  type ConfigPagos,
  type MetodoPago,
  type ModoCobro,
  type TipoBilletera,
} from "../types";

const MODOS: { valor: ModoCobro; titulo: string; detalle: string }[] = [
  {
    valor: "no_pedido",
    titulo: "No pedir pago",
    detalle: "La tienda no habla de pagos. Cobras en el local.",
  },
  {
    valor: "opcional",
    titulo: "Opcional",
    detalle: "El cliente elige: pagar ahora con QR o pagar en el local.",
  },
  {
    valor: "obligatorio",
    titulo: "Obligatorio",
    detalle: "Sin pago no hay reserva. Útil para servicios caros o con muchas ausencias.",
  },
];

const PLAZOS = [15, 30, 60, 120, 240];

/** 2 MB, el mismo límite que el resto de imágenes del panel. */
const TAMANO_MAXIMO_QR = 2 * 1024 * 1024;

/**
 * Administración → General → Cobros con QR.
 *
 * El dueño decide si pide el pago al reservar y con qué billeteras: cada una
 * con su QR, su número y su titular (prototipo de la Story 7.1 con varios
 * métodos).
 */
export default function SeccionCobros() {
  const { data, isPending, error } = useConfigPagos();
  const guardar = useGuardarConfigPagos();
  const [config, setConfig] = useState<ConfigPagos | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    if (data) setConfig(data);
  }, [data]);

  const isDirty = useMemo(
    () => !!data && !!config && JSON.stringify(data) !== JSON.stringify(config),
    [data, config]
  );

  const cambiar = (cambios: Partial<ConfigPagos>) => {
    setAviso(null);
    setConfig((actual) => (actual ? { ...actual, ...cambios } : actual));
  };

  const cambiarMetodo = (id: number, cambios: Partial<MetodoPago>) =>
    cambiar({
      metodos: config!.metodos.map((metodo) =>
        metodo.id === id ? { ...metodo, ...cambios } : metodo
      ),
    });

  const agregarMetodo = () => {
    const usados = new Set(config!.metodos.map((metodo) => metodo.tipo));
    const tipo =
      (Object.keys(BILLETERAS) as TipoBilletera[]).find(
        (clave) => clave !== "otro" && !usados.has(clave)
      ) ?? "otro";
    const id = Math.max(0, ...config!.metodos.map((metodo) => metodo.id)) + 1;
    cambiar({
      metodos: [
        ...config!.metodos,
        {
          id,
          tipo,
          nombre: BILLETERAS[tipo].nombre,
          qr_url: null,
          numero: null,
          titular: null,
          activo: true,
        },
      ],
    });
  };

  const subirQr = (id: number, archivo: File | undefined) => {
    if (!archivo) return;
    if (!archivo.type.startsWith("image/") || archivo.size > TAMANO_MAXIMO_QR) {
      setAviso("El QR tiene que ser una imagen PNG, JPG o WebP de hasta 2 MB.");
      return;
    }
    const lector = new FileReader();
    lector.onload = () => cambiarMetodo(id, { qr_url: String(lector.result) });
    lector.readAsDataURL(archivo);
  };

  const onSubmit = (evento?: FormEvent) => {
    evento?.preventDefault();
    if (!config) return;
    // Story 7.1: sin un QR no se puede pedir el pago, y se explica por qué.
    if (config.modo !== "no_pedido" && metodosActivos(config).length === 0) {
      setAviso(
        "Para pedir el pago necesitas al menos un método activo con su QR subido."
      );
      return;
    }
    guardar.mutate(config);
  };

  return (
    <MarcoSeccion
      cargando={isPending || !config}
      error={error}
      errorAlGuardar={guardar.error}
      isDirty={isDirty}
      guardando={guardar.isPending}
      onSubmit={onSubmit}
      onDescartar={() => {
        setAviso(null);
        setConfig(data ?? null);
      }}
    >
      {config ? (
        <>
          <Alert severity="info" sx={{ mb: 3 }}>
            <strong>Prototipo.</strong> Los cambios se guardan solo en este
            navegador: el backend todavía no tiene cobros con QR.
          </Alert>

          {aviso ? (
            <Alert severity="warning" sx={{ mb: 3 }}>
              {aviso}
            </Alert>
          ) : null}

          <SeccionCampos
            titulo="¿Pides el pago al reservar?"
            descripcion="Se aplica a todas tus sedes en cuanto guardas."
          >
            <RadioGroup
              value={config.modo}
              onChange={(e) => cambiar({ modo: e.target.value as ModoCobro })}
            >
              {MODOS.map((modo) => (
                <FormControlLabel
                  key={modo.valor}
                  value={modo.valor}
                  control={<Radio />}
                  sx={{ alignItems: "flex-start", mb: 1, "& .MuiRadio-root": { pt: 0.5 } }}
                  label={
                    <Box>
                      <Typography fontWeight={600}>{modo.titulo}</Typography>
                      <Typography variant="body2" color="textSecondary">
                        {modo.detalle}
                      </Typography>
                    </Box>
                  }
                />
              ))}
            </RadioGroup>
          </SeccionCampos>

          <SeccionCampos
            titulo="Plazo e instrucciones"
            descripcion="El cliente ve la hora exacta hasta la que puede pagar."
          >
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <CustomFormLabel htmlFor="plazo_min">Plazo para pagar</CustomFormLabel>
                <CustomTextField
                  id="plazo_min"
                  select
                  fullWidth
                  value={config.plazo_min}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    cambiar({ plazo_min: Number(e.target.value) })
                  }
                >
                  {PLAZOS.map((minutos) => (
                    <MenuItem key={minutos} value={minutos}>
                      {minutos < 60 ? `${minutos} minutos` : `${minutos / 60} h`}
                    </MenuItem>
                  ))}
                </CustomTextField>
              </Grid>
              <Grid size={{ xs: 12, sm: 8 }}>
                <CustomFormLabel htmlFor="instrucciones">
                  Instrucciones para el cliente
                </CustomFormLabel>
                <CustomTextField
                  id="instrucciones"
                  fullWidth
                  multiline
                  rows={2}
                  value={config.instrucciones ?? ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    cambiar({ instrucciones: e.target.value || null })
                  }
                />
              </Grid>
            </Grid>
          </SeccionCampos>

          <SeccionCampos
            titulo="Métodos de pago"
            descripcion="Cada billetera con su QR. El cliente elige con cuál paga."
            sinSeparador
          >
            <Stack spacing={2}>
              {config.metodos.map((metodo) => (
                <TarjetaMetodo
                  key={metodo.id}
                  metodo={metodo}
                  onCambiar={(cambios) => cambiarMetodo(metodo.id, cambios)}
                  onSubirQr={(archivo) => subirQr(metodo.id, archivo)}
                  onQuitar={() =>
                    cambiar({
                      metodos: config.metodos.filter((item) => item.id !== metodo.id),
                    })
                  }
                />
              ))}

              <Button
                variant="outlined"
                startIcon={<IconPlus size={18} />}
                onClick={agregarMetodo}
                sx={{ alignSelf: "flex-start" }}
              >
                Agregar método
              </Button>
            </Stack>
          </SeccionCampos>
        </>
      ) : null}
    </MarcoSeccion>
  );
}

function TarjetaMetodo({
  metodo,
  onCambiar,
  onSubirQr,
  onQuitar,
}: {
  metodo: MetodoPago;
  onCambiar: (cambios: Partial<MetodoPago>) => void;
  onSubirQr: (archivo: File | undefined) => void;
  onQuitar: () => void;
}) {
  const color = BILLETERAS[metodo.tipo].color;
  const idQr = `qr-metodo-${metodo.id}`;

  return (
    <Card
      variant="outlined"
      sx={{ borderLeft: `4px solid ${color}`, opacity: metodo.activo ? 1 : 0.6 }}
    >
      <CardContent>
        <Stack direction={{ xs: "column", md: "row" }} spacing={3}>
          <Stack alignItems="center" spacing={1} flexShrink={0}>
            {metodo.qr_url ? (
              <Box
                component="img"
                src={metodo.qr_url}
                alt={`QR de ${metodo.nombre}`}
                sx={{
                  width: 120,
                  height: 120,
                  objectFit: "contain",
                  bgcolor: "#fff",
                  borderRadius: 1,
                  border: 1,
                  borderColor: "divider",
                  p: 0.5,
                }}
              />
            ) : (
              <Box
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: 1,
                  border: "2px dashed",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "text.secondary",
                  textAlign: "center",
                  fontSize: 12,
                  px: 1,
                }}
              >
                Sin QR
              </Box>
            )}
            <Button
              component="label"
              htmlFor={idQr}
              size="small"
              startIcon={<IconPhotoUp size={16} />}
            >
              {metodo.qr_url ? "Cambiar QR" : "Subir QR"}
              <input
                id={idQr}
                type="file"
                hidden
                accept="image/png,image/jpeg,image/webp"
                onChange={(e) => {
                  onSubirQr(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </Button>
          </Stack>

          <Grid container spacing={2} flex={1}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor={`tipo-${metodo.id}`} sx={{ mt: 0 }}>
                Billetera
              </CustomFormLabel>
              <CustomTextField
                id={`tipo-${metodo.id}`}
                select
                fullWidth
                value={metodo.tipo}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  const tipo = e.target.value as TipoBilletera;
                  onCambiar({
                    tipo,
                    nombre: tipo === "otro" ? metodo.nombre : BILLETERAS[tipo].nombre,
                  });
                }}
              >
                {(Object.keys(BILLETERAS) as TipoBilletera[]).map((tipo) => (
                  <MenuItem key={tipo} value={tipo}>
                    {tipo === "otro" ? "Otro (banco, transferencia…)" : BILLETERAS[tipo].nombre}
                  </MenuItem>
                ))}
              </CustomTextField>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor={`nombre-${metodo.id}`} sx={{ mt: 0 }}>
                Nombre que ve el cliente
              </CustomFormLabel>
              <CustomTextField
                id={`nombre-${metodo.id}`}
                fullWidth
                value={metodo.nombre}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onCambiar({ nombre: e.target.value })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor={`numero-${metodo.id}`}>
                Número o cuenta (opcional)
              </CustomFormLabel>
              <CustomTextField
                id={`numero-${metodo.id}`}
                fullWidth
                value={metodo.numero ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onCambiar({ numero: e.target.value || null })
                }
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <CustomFormLabel htmlFor={`titular-${metodo.id}`}>
                Titular (opcional)
              </CustomFormLabel>
              <CustomTextField
                id={`titular-${metodo.id}`}
                fullWidth
                value={metodo.titular ?? ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onCambiar({ titular: e.target.value || null })
                }
              />
            </Grid>
          </Grid>

          <Stack
            direction={{ xs: "row", md: "column" }}
            alignItems="center"
            justifyContent="space-between"
          >
            <FormControlLabel
              control={
                <Switch
                  checked={metodo.activo}
                  onChange={(e) => onCambiar({ activo: e.target.checked })}
                />
              }
              label="Activo"
              labelPlacement="bottom"
              sx={{ m: 0 }}
            />
            <Tooltip title="Quitar método">
              <IconButton color="error" onClick={onQuitar}>
                <IconTrash size={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
