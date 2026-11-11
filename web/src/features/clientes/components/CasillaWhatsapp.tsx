"use client";
import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import Typography from "@mui/material/Typography";

import CustomCheckbox from "@/components/forms/theme-elements/CustomCheckbox";

interface Props {
  marcada: boolean;
  onCambiar: (marcada: boolean) => void;
  disabled?: boolean;
}

/**
 * «Recibir avisos por WhatsApp» (Story 4.8c, Ley 29733). Es del CLIENTE, no
 * de la cita: la usan la ficha del cliente y el alta de cita. Nace desmarcada
 * y solo se marca si el cliente lo aceptó de palabra.
 */
const CasillaWhatsapp = ({ marcada, onCambiar, disabled }: Props) => (
  <Box>
    <FormControlLabel
      sx={{ alignItems: "flex-start", mr: 0 }}
      control={
        <CustomCheckbox
          checked={marcada}
          onChange={(e) => onCambiar(e.target.checked)}
          disabled={disabled}
          // Sin esto se anuncia como «Checkbox demo», el de la plantilla.
          inputProps={{ "aria-label": "Recibir avisos de sus citas por WhatsApp" }}
          sx={{ mt: -0.5 }}
        />
      }
      label={
        <Box>
          <Typography variant="body2" fontWeight={600}>
            Recibir avisos de sus citas por WhatsApp
          </Typography>
          <Typography variant="caption" color="textSecondary" component="p">
            Márcala solo si el cliente lo aceptó. Le escribimos desde el número
            de tivu cuando la cita está confirmada, y puede darse de baja
            respondiendo BAJA. El correo le llega igual.
          </Typography>
        </Box>
      }
    />
  </Box>
);

export default CasillaWhatsapp;
