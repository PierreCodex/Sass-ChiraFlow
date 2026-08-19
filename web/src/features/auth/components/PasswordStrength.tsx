"use client";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import { IconCheck, IconCircle } from "@tabler/icons-react";

interface Props {
  password: string;
}

const REQUISITOS = [
  { key: "length", label: "Mínimo 8 caracteres", test: (v: string) => v.length >= 8 },
  { key: "mayus", label: "Una mayúscula", test: (v: string) => /[A-Z]/.test(v) },
  { key: "minus", label: "Una minúscula", test: (v: string) => /[a-z]/.test(v) },
  { key: "number", label: "Un número", test: (v: string) => /[0-9]/.test(v) },
  { key: "symbol", label: "Un símbolo", test: (v: string) => /[^A-Za-z0-9]/.test(v) },
] as const;

/**
 * Mismo medidor de fortaleza que el `<script>` de `public/home.blade.php`:
 * 5 requisitos, 3 niveles (≤2 no segura / ≤4 regular / 5 segura), misma
 * escala de colores rojo→amarillo→verde.
 */
const PasswordStrength = ({ password }: Props) => {
  const theme = useTheme();
  const resultados = REQUISITOS.map((r) => ({ ...r, ok: r.test(password) }));
  const pasados = resultados.filter((r) => r.ok).length;

  const color = pasados <= 2 ? "error" : pasados <= 4 ? "warning" : "success";
  const texto =
    pasados <= 2 ? "Seguridad: no segura" : pasados <= 4 ? "Seguridad: regular" : "Seguridad: segura";

  return (
    <Box mt={1}>
      <Stack direction="row" justifyContent="space-between" mb={0.5}>
        <Typography variant="caption" color={`${color}.main`} fontWeight={500}>
          {texto}
        </Typography>
      </Stack>
      <LinearProgress
        variant="determinate"
        value={(pasados / REQUISITOS.length) * 100}
        color={color}
        sx={{ height: 6, borderRadius: 3 }}
      />
      <Stack mt={1} spacing={0.5}>
        {resultados.map((r) => (
          <Stack key={r.key} direction="row" spacing={0.75} alignItems="center">
            {r.ok ? (
              <IconCheck size={14} color={theme.palette.success.main} />
            ) : (
              <IconCircle size={14} color={theme.palette.text.disabled} />
            )}
            <Typography
              variant="caption"
              color={r.ok ? "success.main" : "text.secondary"}
            >
              {r.label}
            </Typography>
          </Stack>
        ))}
      </Stack>
    </Box>
  );
};

export default PasswordStrength;
