"use client";
import { useEffect, useState } from "react";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconPlus, IconTrash } from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { dialogoResponsive, formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import { formatMoneda } from "@/lib/format";
import { useNegocio } from "@/features/configuracion/hooks/useConfiguracion";

import { useEmitirComprobante } from "../hooks/useComprobantes";
import { comprobantesApi } from "../services/comprobantes.api";
import {
  ETIQUETA_DOCUMENTO,
  LARGO_DOCUMENTO,
  METODOS_PAGO_MANUAL,
  type ClienteComprobante,
  type Comprobante,
  type LineaComprobante,
  type TipoDocumentoCliente,
} from "../types";

/** Lo que se precarga: desde un pago verificado, o vacío para emitir a mano. */
export interface BorradorComprobante {
  reserva_codigo: string | null;
  metodo_pago: string | null;
  cliente: Partial<ClienteComprobante>;
  lineas: LineaComprobante[];
}

interface Props {
  borrador: BorradorComprobante | null;
  onCerrar: () => void;
  onEmitido: (comprobante: Comprobante) => void;
}

interface LineaEditable {
  descripcion: string;
  cantidad: string;
  precio_unitario: string;
}

const lineaVacia: LineaEditable = { descripcion: "", cantidad: "1", precio_unitario: "" };

/**
 * Emitir un comprobante al cliente. Los datos del negocio salen de su
 * configuración; el RUC se pide aquí porque `tenants` todavía no lo tiene.
 */
export default function DialogoEmitirComprobante({ borrador, onCerrar, onEmitido }: Props) {
  const { data: negocio } = useNegocio();
  const emitir = useEmitirComprobante();

  const [nombre, setNombre] = useState("");
  const [tipoDocumento, setTipoDocumento] = useState<TipoDocumentoCliente>("dni");
  const [documento, setDocumento] = useState("");
  const [email, setEmail] = useState("");
  const [telefono, setTelefono] = useState("");
  const [metodo, setMetodo] = useState("Efectivo");
  const [lineas, setLineas] = useState<LineaEditable[]>([lineaVacia]);
  const [ruc, setRuc] = useState("");
  const [notas, setNotas] = useState("");
  const [intentado, setIntentado] = useState(false);

  useEffect(() => {
    if (!borrador) return;
    setNombre(borrador.cliente.nombre ?? "");
    setTipoDocumento(borrador.cliente.tipo_documento ?? "dni");
    setDocumento(borrador.cliente.numero_documento ?? "");
    setEmail(borrador.cliente.email ?? "");
    setTelefono(borrador.cliente.telefono ?? "");
    setMetodo(borrador.metodo_pago ?? "Efectivo");
    setLineas(
      borrador.lineas.length
        ? borrador.lineas.map((linea) => ({
            descripcion: linea.descripcion,
            cantidad: String(linea.cantidad),
            precio_unitario: String(linea.precio_unitario),
          }))
        : [lineaVacia]
    );
    setRuc(comprobantesApi.rucRecordado() ?? "");
    setNotas("");
    setIntentado(false);
    emitir.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [borrador]);

  if (!borrador) return null;

  const lineasValidas: LineaComprobante[] = lineas
    .map((linea) => ({
      descripcion: linea.descripcion.trim(),
      cantidad: Number(linea.cantidad),
      // Vacío no es «gratis»: `Number("")` daría 0 y pasaría la validación.
      precio_unitario: linea.precio_unitario.trim() === "" ? NaN : Number(linea.precio_unitario),
    }))
    .filter((linea) => linea.descripcion);
  const totalVisible = lineasValidas
    .filter((linea) => linea.cantidad > 0 && Number.isFinite(linea.precio_unitario))
    .reduce((suma, linea) => suma + linea.cantidad * linea.precio_unitario, 0);

  const largo = LARGO_DOCUMENTO[tipoDocumento];
  const errores = {
    nombre: !nombre.trim() ? "Escribe el nombre del cliente." : null,
    documento:
      tipoDocumento === "ninguno"
        ? null
        : !documento.trim()
          ? `Escribe el ${ETIQUETA_DOCUMENTO[tipoDocumento]}.`
          : largo && !new RegExp(`^\\d{${largo}}$`).test(documento.trim())
            ? `El ${ETIQUETA_DOCUMENTO[tipoDocumento]} tiene ${largo} dígitos.`
            : null,
    ruc: ruc.trim() && !/^\d{11}$/.test(ruc.trim()) ? "El RUC tiene 11 dígitos." : null,
    lineas:
      lineasValidas.length === 0
        ? "Agrega al menos un concepto."
        : lineasValidas.some(
              (linea) =>
                !(linea.cantidad > 0) ||
                !Number.isFinite(linea.precio_unitario) ||
                linea.precio_unitario < 0
            )
          ? "Revisa las cantidades y los precios."
          : null,
  };
  const hayErrores = Object.values(errores).some(Boolean);
  const mostrar = (campo: keyof typeof errores) => (intentado ? errores[campo] : null);

  const cambiarLinea = (indice: number, cambios: Partial<LineaEditable>) =>
    setLineas((actuales) =>
      actuales.map((linea, i) => (i === indice ? { ...linea, ...cambios } : linea))
    );

  const enviar = () => {
    setIntentado(true);
    if (hayErrores) return;
    emitir.mutate(
      {
        reserva_codigo: borrador.reserva_codigo,
        metodo_pago: metodo || null,
        emisor: {
          nombre: negocio?.nombre ?? "Mi negocio",
          ruc: ruc.trim() || null,
          direccion: negocio?.direccion ?? null,
          telefono: negocio?.telefono ?? null,
          email: negocio?.email ?? null,
        },
        cliente: {
          nombre: nombre.trim(),
          tipo_documento: tipoDocumento,
          numero_documento: tipoDocumento === "ninguno" ? null : documento.trim(),
          email: email.trim() || null,
          telefono: telefono.trim() || null,
        },
        lineas: lineasValidas,
        notas: notas.trim() || null,
      },
      { onSuccess: onEmitido }
    );
  };

  const metodos = METODOS_PAGO_MANUAL.includes(metodo)
    ? METODOS_PAGO_MANUAL
    : [metodo, ...METODOS_PAGO_MANUAL];

  return (
    <Dialog
      open
      onClose={emitir.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="md"
      sx={dialogoResponsive}
    >
      <DialogTitle component="div">
        <Typography variant="h5" fontWeight={600}>
          Emitir comprobante
        </Typography>
        <Typography variant="body2" color="textSecondary">
          {borrador.reserva_codigo
            ? `Por el pago de la reserva ${borrador.reserva_codigo}`
            : "Para un cobro hecho en el local"}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Grid container spacing={2} sx={formularioCompacto}>
          <Grid size={12}>
            <Typography variant="subtitle1" fontWeight={600}>
              Cliente
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 4 }}>
            <CustomFormLabel htmlFor="tipo-documento">Documento</CustomFormLabel>
            <CustomTextField
              id="tipo-documento"
              select
              fullWidth
              value={tipoDocumento}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setTipoDocumento(e.target.value as TipoDocumentoCliente)
              }
            >
              {(Object.keys(ETIQUETA_DOCUMENTO) as TipoDocumentoCliente[]).map((tipo) => (
                <MenuItem key={tipo} value={tipo}>
                  {ETIQUETA_DOCUMENTO[tipo]}
                </MenuItem>
              ))}
            </CustomTextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 8 }}>
            <CustomFormLabel htmlFor="numero-documento">Número</CustomFormLabel>
            <CustomTextField
              id="numero-documento"
              fullWidth
              disabled={tipoDocumento === "ninguno"}
              value={tipoDocumento === "ninguno" ? "" : documento}
              inputProps={{ inputMode: tipoDocumento === "ce" ? "text" : "numeric" }}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDocumento(e.target.value)}
              error={!!mostrar("documento")}
              helperText={mostrar("documento")}
            />
          </Grid>
          <Grid size={12}>
            <CustomFormLabel htmlFor="nombre-cliente">
              {tipoDocumento === "ruc" ? "Razón social" : "Nombre completo"}
            </CustomFormLabel>
            <CustomTextField
              id="nombre-cliente"
              fullWidth
              value={nombre}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNombre(e.target.value)}
              error={!!mostrar("nombre")}
              helperText={mostrar("nombre")}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel htmlFor="email-cliente">Correo (opcional)</CustomFormLabel>
            <CustomTextField
              id="email-cliente"
              fullWidth
              type="email"
              value={email}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel htmlFor="telefono-cliente">Celular (opcional)</CustomFormLabel>
            <CustomTextField
              id="telefono-cliente"
              fullWidth
              value={telefono}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTelefono(e.target.value)}
            />
          </Grid>

          <Grid size={12}>
            <Typography variant="subtitle1" fontWeight={600} mt={1}>
              Conceptos
            </Typography>
          </Grid>
          {lineas.map((linea, indice) => (
            <Grid size={12} key={indice}>
              <Stack direction="row" spacing={1} alignItems="flex-start">
                <CustomTextField
                  fullWidth
                  size="small"
                  placeholder="Descripción"
                  aria-label="Descripción"
                  value={linea.descripcion}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    cambiarLinea(indice, { descripcion: e.target.value })
                  }
                />
                <CustomTextField
                  size="small"
                  type="number"
                  aria-label="Cantidad"
                  sx={{ width: 80, flexShrink: 0 }}
                  inputProps={{ min: 1, step: 1 }}
                  value={linea.cantidad}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    cambiarLinea(indice, { cantidad: e.target.value })
                  }
                />
                <CustomTextField
                  size="small"
                  type="number"
                  aria-label="Precio unitario"
                  placeholder="Precio"
                  sx={{ width: 110, flexShrink: 0 }}
                  inputProps={{ min: 0, step: 0.1 }}
                  value={linea.precio_unitario}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    cambiarLinea(indice, { precio_unitario: e.target.value })
                  }
                />
                <IconButton
                  aria-label="Quitar concepto"
                  disabled={lineas.length === 1}
                  onClick={() => setLineas((actuales) => actuales.filter((_, i) => i !== indice))}
                >
                  <IconTrash size={18} />
                </IconButton>
              </Stack>
            </Grid>
          ))}
          <Grid size={12}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Button
                size="small"
                startIcon={<IconPlus size={16} />}
                onClick={() => setLineas((actuales) => [...actuales, lineaVacia])}
              >
                Agregar concepto
              </Button>
              <Typography variant="h5" fontWeight={700}>
                {formatMoneda(totalVisible)}
              </Typography>
            </Stack>
            {mostrar("lineas") ? (
              <Typography variant="caption" color="error">
                {mostrar("lineas")}
              </Typography>
            ) : null}
          </Grid>

          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel htmlFor="metodo-pago">Forma de pago</CustomFormLabel>
            <CustomTextField
              id="metodo-pago"
              select
              fullWidth
              value={metodo}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMetodo(e.target.value)}
            >
              {metodos.map((item) => (
                <MenuItem key={item} value={item}>
                  {item}
                </MenuItem>
              ))}
            </CustomTextField>
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CustomFormLabel htmlFor="ruc-negocio">RUC de tu negocio (opcional)</CustomFormLabel>
            <CustomTextField
              id="ruc-negocio"
              fullWidth
              value={ruc}
              inputProps={{ inputMode: "numeric" }}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setRuc(e.target.value)}
              error={!!mostrar("ruc")}
              helperText={mostrar("ruc") ?? "Se recuerda para los siguientes."}
            />
          </Grid>
          <Grid size={12}>
            <CustomFormLabel htmlFor="notas-comprobante">Notas (opcional)</CustomFormLabel>
            <CustomTextField
              id="notas-comprobante"
              fullWidth
              multiline
              rows={2}
              value={notas}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNotas(e.target.value)}
            />
          </Grid>
        </Grid>

        <Box mt={2}>
          <Alert severity="info">
            Es una <strong>nota de venta</strong>, no una boleta ni una factura
            electrónica de SUNAT.
          </Alert>
          {emitir.error ? (
            <Alert severity="error" sx={{ mt: 1.5 }}>
              {toApiError(emitir.error).message}
            </Alert>
          ) : null}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2.5, gap: 1 }}>
        <Button color="inherit" onClick={onCerrar} disabled={emitir.isPending}>
          Cancelar
        </Button>
        <Button variant="contained" onClick={enviar} disabled={emitir.isPending}>
          {emitir.isPending ? "Emitiendo…" : "Emitir comprobante"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
