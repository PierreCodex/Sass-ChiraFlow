"use client";
import Box from "@mui/material/Box";
import GlobalStyles from "@mui/material/GlobalStyles";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import { formatMoneda } from "@/lib/format";
import { env } from "@/config/env";

import {
  ETIQUETA_DOCUMENTO,
  numeroComprobante,
  type Comprobante,
} from "../types";

export const ID_HOJA = "comprobante-imprimible";

/**
 * Al imprimir solo sale la hoja: el resto de la página (sidebar, diálogo,
 * botones) se esconde con `visibility`, que a diferencia de `display` deja
 * ver a los hijos de lo que se oculta. Así funciona aunque el diálogo viva en
 * un portal. «Guardar como PDF» del navegador hace el resto.
 */
const estilosImpresion = (
  <GlobalStyles
    styles={{
      "@media print": {
        "body *": { visibility: "hidden" },
        [`#${ID_HOJA}, #${ID_HOJA} *`]: { visibility: "visible" },
        [`#${ID_HOJA}`]: {
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          boxShadow: "none !important",
          border: "none !important",
        },
        "@page": { margin: "12mm" },
      },
    }}
  />
);

/**
 * La hoja del comprobante, tal como la recibe el cliente.
 *
 * Colores fijos y fondo blanco a propósito: es papel, y en modo oscuro
 * imprimiría una hoja negra.
 */
export default function HojaComprobante({ comprobante }: { comprobante: Comprobante }) {
  const { emisor, cliente } = comprobante;
  const emitido = new Date(comprobante.emitido_en);
  const anulado = comprobante.estado === "anulado";

  return (
    <>
      {estilosImpresion}
      <Box
        id={ID_HOJA}
        sx={{
          position: "relative",
          bgcolor: "#fff",
          color: "#1f2937",
          border: "1px solid #e5e7eb",
          borderRadius: 2,
          p: { xs: 2.5, sm: 4 },
          fontSize: 14,
          overflow: "hidden",
        }}
      >
        {anulado ? (
          <Typography
            aria-hidden
            sx={{
              position: "absolute",
              top: "40%",
              left: "50%",
              transform: "translate(-50%, -50%) rotate(-20deg)",
              fontSize: 72,
              fontWeight: 800,
              color: "rgba(220, 38, 38, 0.15)",
              pointerEvents: "none",
              whiteSpace: "nowrap",
            }}
          >
            ANULADO
          </Typography>
        ) : null}

        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          spacing={2}
          alignItems={{ sm: "flex-start" }}
        >
          <Box minWidth={0}>
            <Typography sx={{ fontSize: 20, fontWeight: 700, color: "#111827" }}>
              {emisor.nombre}
            </Typography>
            {emisor.direccion ? <Linea>{emisor.direccion}</Linea> : null}
            {[emisor.telefono, emisor.email].filter(Boolean).length ? (
              <Linea>{[emisor.telefono, emisor.email].filter(Boolean).join(" · ")}</Linea>
            ) : null}
          </Box>

          <Box
            sx={{
              border: "2px solid #111827",
              borderRadius: 1.5,
              px: 2.5,
              py: 1.5,
              textAlign: "center",
              flexShrink: 0,
            }}
          >
            {emisor.ruc ? (
              <Typography sx={{ fontWeight: 700, fontSize: 14 }}>RUC {emisor.ruc}</Typography>
            ) : null}
            <Typography sx={{ fontWeight: 700, fontSize: 15, letterSpacing: 0.5 }}>
              NOTA DE VENTA
            </Typography>
            <Typography sx={{ fontWeight: 700, fontSize: 15 }}>
              {numeroComprobante(comprobante)}
            </Typography>
          </Box>
        </Stack>

        <Box
          sx={{
            mt: 3,
            p: 2,
            bgcolor: "#f9fafb",
            borderRadius: 1.5,
            display: "grid",
            gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
            gap: 1.5,
          }}
        >
          <Campo titulo="Cliente">{cliente.nombre}</Campo>
          <Campo titulo={ETIQUETA_DOCUMENTO[cliente.tipo_documento]}>
            {cliente.tipo_documento === "ninguno" ? "—" : cliente.numero_documento}
          </Campo>
          <Campo titulo="Fecha de emisión">
            {emitido.toLocaleDateString(env.locale, {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}{" "}
            {emitido.toLocaleTimeString(env.locale, {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </Campo>
          <Campo titulo="Forma de pago">{comprobante.metodo_pago ?? "—"}</Campo>
          {comprobante.reserva_codigo ? (
            <Campo titulo="Reserva">{comprobante.reserva_codigo}</Campo>
          ) : null}
        </Box>

        <Box component="table" sx={{ width: "100%", borderCollapse: "collapse", mt: 3 }}>
          <thead>
            <Box component="tr" sx={{ "& th": { borderBottom: "2px solid #111827", py: 1, fontSize: 12, textTransform: "uppercase", letterSpacing: 0.5 } }}>
              <Box component="th" sx={{ textAlign: "left" }}>Descripción</Box>
              <Box component="th" sx={{ textAlign: "right", width: 56 }}>Cant.</Box>
              <Box component="th" sx={{ textAlign: "right", width: 100 }}>P. unit.</Box>
              <Box component="th" sx={{ textAlign: "right", width: 100 }}>Importe</Box>
            </Box>
          </thead>
          <tbody>
            {comprobante.lineas.map((linea, indice) => (
              <Box
                component="tr"
                key={indice}
                sx={{ "& td": { borderBottom: "1px solid #e5e7eb", py: 1.25, verticalAlign: "top" } }}
              >
                <td>{linea.descripcion}</td>
                <Box component="td" sx={{ textAlign: "right" }}>{linea.cantidad}</Box>
                <Box component="td" sx={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  {formatMoneda(linea.precio_unitario)}
                </Box>
                <Box component="td" sx={{ textAlign: "right", whiteSpace: "nowrap" }}>
                  {formatMoneda(linea.cantidad * linea.precio_unitario)}
                </Box>
              </Box>
            ))}
          </tbody>
        </Box>

        <Stack direction="row" justifyContent="flex-end" mt={2}>
          <Stack direction="row" spacing={3} alignItems="baseline">
            <Typography sx={{ fontWeight: 600 }}>TOTAL</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>
              {formatMoneda(comprobante.total)}
            </Typography>
          </Stack>
        </Stack>

        {comprobante.notas ? (
          <Box mt={2}>
            <Typography sx={{ fontSize: 12, color: "#6b7280" }}>Notas</Typography>
            <Typography sx={{ fontSize: 14 }}>{comprobante.notas}</Typography>
          </Box>
        ) : null}

        {anulado && comprobante.motivo_anulacion ? (
          <Typography sx={{ mt: 2, fontSize: 13, color: "#dc2626" }}>
            Anulado: {comprobante.motivo_anulacion}
          </Typography>
        ) : null}

        <Typography
          sx={{ mt: 4, pt: 2, borderTop: "1px dashed #d1d5db", fontSize: 11, color: "#6b7280", textAlign: "center" }}
        >
          Documento interno, no tributario. No reemplaza a una boleta ni a una
          factura electrónica. ¡Gracias por tu preferencia!
        </Typography>
      </Box>
    </>
  );
}

function Linea({ children }: { children: React.ReactNode }) {
  return <Typography sx={{ fontSize: 13, color: "#4b5563" }}>{children}</Typography>;
}

function Campo({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <Box minWidth={0}>
      <Typography sx={{ fontSize: 11, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>
        {titulo}
      </Typography>
      <Typography sx={{ fontSize: 14, fontWeight: 600, overflowWrap: "anywhere" }}>
        {children}
      </Typography>
    </Box>
  );
}
