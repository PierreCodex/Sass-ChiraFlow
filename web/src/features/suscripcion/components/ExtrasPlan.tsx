"use client";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconBrandWhatsapp, IconMinus, IconPlus, IconUserPlus } from "@tabler/icons-react";

import { formatMoneda } from "@/lib/format";
import { MAX_EXTRAS } from "../constants";
import type { Plan } from "../types";

interface ContadorProps {
  icono: React.ReactNode;
  titulo: string;
  descripcion: string;
  valor: number;
  onChange: (valor: number) => void;
  resultado: string;
  /** Singular y plural del sustantivo del contador. */
  sufijo: [string, string];
}

const Contador = ({
  icono,
  titulo,
  descripcion,
  valor,
  onChange,
  resultado,
  sufijo,
}: ContadorProps) => (
  <Card elevation={0} sx={{ border: "1px solid", borderColor: "divider" }}>
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="flex-start" mb={2}>
        <Avatar sx={{ bgcolor: "grey.100", color: "text.secondary" }}>
          {icono}
        </Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {titulo}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {descripcion}
          </Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={2} alignItems="center" justifyContent="center" mb={2}>
        <IconButton
          onClick={() => onChange(Math.max(0, valor - 1))}
          disabled={valor === 0}
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}
        >
          <IconMinus size={18} />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={600} minWidth={90} textAlign="center">
          {valor} {valor === 1 ? sufijo[0] : sufijo[1]}
        </Typography>
        <IconButton
          onClick={() => onChange(Math.min(MAX_EXTRAS, valor + 1))}
          disabled={valor >= MAX_EXTRAS}
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}
        >
          <IconPlus size={18} />
        </IconButton>
      </Stack>

      <Alert severity="info" variant="outlined" icon={false} sx={{ py: 0.5 }}>
        <Typography variant="body2" textAlign="center">
          {resultado}
        </Typography>
      </Alert>
    </CardContent>
  </Card>
);

interface Props {
  plan: Plan;
  extraProfesionales: number;
  extraWhatsapp: number;
  onProfesionales: (valor: number) => void;
  onWhatsapp: (valor: number) => void;
}

const ExtrasPlan = ({
  plan,
  extraProfesionales,
  extraWhatsapp,
  onProfesionales,
  onWhatsapp,
}: Props) => (
  <Box>
    <Typography variant="subtitle1" fontWeight={600} mb={2}>
      Puedes ampliar tu plan con estos adicionales
    </Typography>

    <Stack spacing={2}>
      <Contador
        icono={<IconUserPlus size={20} />}
        titulo={`Tu plan incluye ${plan.max_profesionales} profesionales`}
        descripcion={`Agrega profesionales extra por ${formatMoneda(plan.precio_profesional_extra)} cada uno.`}
        valor={extraProfesionales}
        onChange={onProfesionales}
        sufijo={["extra", "extras"]}
        resultado={`Tu plan ahora cuenta con ${plan.max_profesionales + extraProfesionales} profesionales`}
      />

      <Contador
        icono={<IconBrandWhatsapp size={20} />}
        titulo="Recordatorios de WhatsApp"
        descripcion={`Envía recordatorios automáticos de tus citas por WhatsApp. Agrega paquetes de ${plan.mensajes_whatsapp_extra} mensajes por ${formatMoneda(plan.precio_whatsapp_extra)}.`}
        valor={extraWhatsapp}
        onChange={onWhatsapp}
        sufijo={["paquete", "paquetes"]}
        resultado={`Tu plan ahora cuenta con ${plan.max_whatsapp_mes + extraWhatsapp * plan.mensajes_whatsapp_extra} mensajes al mes`}
      />
    </Stack>
  </Box>
);

export default ExtrasPlan;
