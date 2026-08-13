"use client";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconCheck } from "@tabler/icons-react";

import { formatMoneda } from "@/lib/format";
import { etiquetaFeature } from "../constants";
import { precioAplicado, type Plan } from "../types";

interface Props {
  plan: Plan;
  extraProfesionales: number;
  extraWhatsapp: number;
  elegiblePromo: boolean;
  enviando: boolean;
  onSolicitar: () => void;
}

/** Desglose y total. Es la única cifra que el usuario mira antes de decidir. */
const ResumenPlan = ({
  plan,
  extraProfesionales,
  extraWhatsapp,
  elegiblePromo,
  enviando,
  onSolicitar,
}: Props) => {
  const { conPromo, precio } = precioAplicado(plan, elegiblePromo);

  const totalProfesionales = extraProfesionales * plan.precio_profesional_extra;
  const totalWhatsapp = extraWhatsapp * plan.precio_whatsapp_extra;
  const total = precio + totalProfesionales + totalWhatsapp;

  return (
    <Card elevation={9} sx={{ position: "sticky", top: 88 }}>
      <CardContent sx={{ p: 3 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Typography variant="h5" fontWeight={600}>
            {plan.nombre}
          </Typography>
          <Box textAlign="right">
            <Typography variant="h5" fontWeight={700} noWrap>
              {formatMoneda(precio)}
            </Typography>
            <Typography variant="caption" color="textSecondary">
              /mes
            </Typography>
          </Box>
        </Stack>

        {conPromo ? (
          <Chip
            size="small"
            color="success"
            variant="outlined"
            label={`Precio de lanzamiento por ${plan.promo_duracion_meses} meses`}
            sx={{ mt: 1 }}
          />
        ) : null}

        <Typography variant="subtitle2" color="textSecondary" mt={3} mb={1}>
          Además incluye
        </Typography>
        <Stack spacing={0.5} sx={{ maxHeight: 220, overflowY: "auto" }}>
          {plan.features.map((feature) => (
            <Stack key={feature} direction="row" spacing={1} alignItems="center">
              <Box component="span" sx={{ display: "flex", color: "success.main" }}>
                <IconCheck size={15} />
              </Box>
              <Typography variant="body2">{etiquetaFeature(feature)}</Typography>
            </Stack>
          ))}
        </Stack>

        {extraProfesionales > 0 || extraWhatsapp > 0 ? (
          <>
            <Typography variant="subtitle2" color="textSecondary" mt={3} mb={1}>
              Extras añadidos
            </Typography>
            <Stack spacing={1}>
              {extraProfesionales > 0 ? (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">
                    {extraProfesionales} profesional
                    {extraProfesionales === 1 ? "" : "es"} extra
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatMoneda(totalProfesionales)}
                  </Typography>
                </Stack>
              ) : null}
              {extraWhatsapp > 0 ? (
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="body2" color="textSecondary">
                    {extraWhatsapp} paquete{extraWhatsapp === 1 ? "" : "s"} de
                    WhatsApp
                  </Typography>
                  <Typography variant="body2" fontWeight={600}>
                    {formatMoneda(totalWhatsapp)}
                  </Typography>
                </Stack>
              ) : null}
            </Stack>
          </>
        ) : null}

        <Divider sx={{ my: 3 }} />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Typography variant="subtitle1" fontWeight={600}>
            Total mensual
          </Typography>
          <Typography variant="h4" fontWeight={700} noWrap>
            {formatMoneda(total)}
          </Typography>
        </Stack>

        <Button
          fullWidth
          variant="contained"
          size="large"
          sx={{ mt: 3 }}
          disabled={enviando}
          onClick={onSolicitar}
        >
          {enviando ? "Enviando…" : "Solicitar este plan"}
        </Button>

        {/*
          El Blade pone "Pagar S/ X", pero el backend no cobra nada: abre un
          ticket de soporte. Se etiqueta por lo que hace de verdad.
        */}
        <Typography
          variant="caption"
          color="textSecondary"
          display="block"
          textAlign="center"
          mt={1.5}
        >
          No se cobra nada ahora. Nuestro equipo te contacta para activarlo.
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ResumenPlan;
