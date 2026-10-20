"use client";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconMailCheck, IconShieldLock } from "@tabler/icons-react";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { toApiError } from "@/lib/api/client";
import { accesoPlataformaApi } from "@/features/plataforma/services/acceso.api";
import { sesionPlataforma } from "@/features/plataforma/sesion";

/**
 * Entrada al panel de plataforma (Story 8.4): correo y contraseña, y después
 * el código de 6 dígitos que Laravel manda al correo. El código sirve una sola
 * vez y caduca a los pocos minutos.
 */
export default function LoginPlataformaPage() {
  const router = useRouter();
  const [paso, setPaso] = useState<"credenciales" | "codigo">("credenciales");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [codigo, setCodigo] = useState("");
  const [minutos, setMinutos] = useState(10);
  const [error, setError] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const pedirCodigo = async (correo = email, clave = password) => {
    setCargando(true);
    setError(null);
    try {
      const respuesta = await accesoPlataformaApi.pedirCodigo(correo, clave);
      setMinutos(respuesta.minutos);
      setPaso("codigo");
      setCodigo("");
      setAviso(`Te enviamos un código a ${correo}. Vence en ${respuesta.minutos} minutos.`);
    } catch (e) {
      setError(mensaje(e));
    } finally {
      setCargando(false);
    }
  };

  const enviar = async (evento: FormEvent<HTMLFormElement>) => {
    evento.preventDefault();
    if (cargando) return;
    if (paso === "credenciales") {
      // El autocompletado puede rellenar los inputs sin emitir onChange.
      const datos = new FormData(evento.currentTarget);
      const correo = String(datos.get("email") ?? "").trim();
      const clave = String(datos.get("password") ?? "");
      if (!correo || !clave) {
        setError("Ingresa tu correo y contraseña.");
        return;
      }
      setEmail(correo);
      setPassword(clave);
      await pedirCodigo(correo, clave);
      return;
    }

    setCargando(true);
    setError(null);
    try {
      const admin = await accesoPlataformaApi.verificar(email.trim(), codigo);
      sesionPlataforma.abrir(admin);
      router.replace("/plataforma");
    } catch (e) {
      setError(mensaje(e));
      setCargando(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
        bgcolor: "grey.100",
      }}
    >
      <Card sx={{ width: "100%", maxWidth: 420 }} elevation={9}>
        <CardContent sx={{ p: 4 }}>
          <Stack alignItems="center" spacing={1} mb={3}>
            <Avatar sx={{ bgcolor: "primary.main", width: 52, height: 52 }}>
              {paso === "codigo" ? <IconMailCheck size={28} /> : <IconShieldLock size={28} />}
            </Avatar>
            <Typography variant="h4" fontWeight={700}>
              Panel de plataforma
            </Typography>
            <Typography variant="body2" color="textSecondary" textAlign="center">
              Solo para el equipo de ChiraFlow. No es el panel de los negocios.
            </Typography>
          </Stack>

          {aviso && paso === "codigo" ? (
            <Alert severity="success" sx={{ mb: 2 }}>
              {aviso}
            </Alert>
          ) : null}
          {error ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          ) : null}

          <Box component="form" onSubmit={enviar} noValidate>
            {paso === "credenciales" ? (
              <>
                <CustomFormLabel htmlFor="email" sx={{ mt: 0 }}>
                  Correo
                </CustomFormLabel>
                <CustomTextField
                  key="email"
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  fullWidth
                  autoFocus
                  defaultValue={email}
                />
                <CustomFormLabel htmlFor="password">Contraseña</CustomFormLabel>
                <CustomTextField
                  key="password"
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  fullWidth
                  defaultValue={password}
                />
              </>
            ) : (
              <>
                <CustomFormLabel htmlFor="codigo" sx={{ mt: 0 }}>
                  Código de 6 dígitos
                </CustomFormLabel>
                <CustomTextField
                  key="codigo"
                  id="codigo"
                  fullWidth
                  autoFocus
                  inputProps={{
                    inputMode: "numeric",
                    maxLength: 6,
                    style: { fontSize: 24, letterSpacing: 8, textAlign: "center" },
                  }}
                  value={codigo}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setCodigo(e.target.value.replace(/\D/g, ""))
                  }
                  helperText={`Sirve una sola vez y vence en ${minutos} minutos.`}
                />
              </>
            )}

            <Button
              type="submit"
              variant="contained"
              size="large"
              fullWidth
              sx={{ mt: 3 }}
              disabled={
                cargando ||
                (paso === "codigo" && codigo.length !== 6)
              }
            >
              {cargando
                ? "Un momento…"
                : paso === "credenciales"
                  ? "Enviarme el código"
                  : "Entrar"}
            </Button>

            {paso === "codigo" ? (
              <Stack direction="row" justifyContent="space-between" mt={1}>
                <Button
                  onClick={() => {
                    setPaso("credenciales");
                    setError(null);
                  }}
                  disabled={cargando}
                >
                  Volver
                </Button>
                <Button onClick={() => pedirCodigo()} disabled={cargando}>
                  Enviar otro código
                </Button>
              </Stack>
            ) : null}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}

/** El primer error de validación, o el mensaje general. */
function mensaje(error: unknown) {
  const apiError = toApiError(error);
  const primero = apiError.errors ? Object.values(apiError.errors).flat()[0] : null;
  return primero ?? apiError.message;
}
