"use client";
import { useEffect, useState } from "react";
import type { AxiosError } from "axios";

import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { toApiError } from "@/lib/api/client";

import { useReenviarVerificacion } from "../hooks/useAuth";

interface Props {
  /**
   * Cuando se sabe a qué correo se envió (recién registrado), el botón va
   * solo. Si no —el enlace venció y la página no sabe de quién es— hay que
   * pedirlo con un input.
   */
  email?: string;
  textoBoton?: string;
}

/** El 429 trae los segundos que faltan; el 200 trae el cooldown completo. */
function segundosDeEspera(error: unknown): number | null {
  const respuesta = (error as AxiosError<{ retry_after?: number }>).response;
  if (respuesta?.status !== 429) return null;
  return respuesta.data?.retry_after ?? null;
}

/**
 * Botón de reenvío del correo de verificación con su cuenta atrás.
 *
 * La espera **la manda el backend** en `retry_after` (tanto en el 200 como en
 * el 429), nunca un número escrito aquí: el cooldown es por correo, así que
 * otra pestaña —u otro dispositivo— puede haber consumido parte del tiempo.
 *
 * El endpoint responde 200 exista o no el email, a propósito: el mensaje de
 * éxito no confirma que la cuenta esté registrada.
 */
const ReenviarVerificacion = ({
  email,
  textoBoton = "Reenviar el enlace",
}: Props) => {
  const [correo, setCorreo] = useState(email ?? "");
  const [segundos, setSegundos] = useState(0);
  const reenvio = useReenviarVerificacion();

  useEffect(() => {
    if (segundos <= 0) return;

    const id = setInterval(() => setSegundos((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [segundos]);

  const enviar = () => {
    if (!correo.trim() || segundos > 0) return;

    reenvio.mutate(correo.trim(), {
      onSuccess: (data) => setSegundos(data.retry_after),
      onError: (error) => {
        const espera = segundosDeEspera(error);
        if (espera !== null) setSegundos(espera);
      },
    });
  };

  const error = reenvio.isError ? toApiError(reenvio.error) : null;
  const enEspera = segundos > 0;

  return (
    <Stack spacing={2} width="100%">
      {reenvio.isSuccess ? (
        <Alert severity="success">{reenvio.data.message}</Alert>
      ) : null}

      {error ? (
        <Alert severity={error.status === 429 ? "info" : "error"}>
          {error.message}
        </Alert>
      ) : null}

      {email ? null : (
        <Box>
          <CustomFormLabel htmlFor="email-reenvio" sx={{ mt: 0 }}>
            Tu email
          </CustomFormLabel>
          <CustomTextField
            id="email-reenvio"
            type="email"
            fullWidth
            value={correo}
            placeholder="Ingresa tu email"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setCorreo(e.target.value)
            }
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e.key === "Enter") enviar();
            }}
          />
        </Box>
      )}

      <Button
        variant="outlined"
        fullWidth
        disabled={reenvio.isPending || enEspera || !correo.trim()}
        onClick={enviar}
      >
        {reenvio.isPending
          ? "Enviando…"
          : enEspera
            ? `Puedes pedir otro en ${segundos}s`
            : textoBoton}
      </Button>
    </Stack>
  );
};

export default ReenviarVerificacion;
