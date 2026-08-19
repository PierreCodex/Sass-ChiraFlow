"use client";
import { useState } from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { toApiError } from "@/lib/api/client";
import { formatFecha } from "@/lib/format";
import { useAnuncios, useCrearAnuncio, useEliminarAnuncio } from "../hooks/useAnuncios";

/** Espejo de `superadmin/anuncios/index.blade.php`: form arriba, lista abajo. */
const AnunciosPanel = () => {
  const { data, isPending, isError, error } = useAnuncios({ per_page: 50 });
  const crear = useCrearAnuncio();
  const eliminar = useEliminarAnuncio();

  const [titulo, setTitulo] = useState("");
  const [cuerpo, setCuerpo] = useState("");

  function publicar() {
    if (!titulo.trim() || !cuerpo.trim()) return;
    crear.mutate(
      { titulo, cuerpo },
      {
        onSuccess: () => {
          setTitulo("");
          setCuerpo("");
        },
      }
    );
  }

  return (
    <Stack spacing={3}>
      <Card elevation={9}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h6" fontWeight={600} mb={2}>
            Nuevo anuncio
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Título"
              size="small"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              fullWidth
            />
            <TextField
              label="Cuerpo"
              size="small"
              value={cuerpo}
              onChange={(e) => setCuerpo(e.target.value)}
              fullWidth
              multiline
              rows={4}
            />
            {crear.isError ? (
              <Alert severity="error">{toApiError(crear.error).message}</Alert>
            ) : null}
            <Button
              variant="contained"
              onClick={publicar}
              disabled={!titulo.trim() || !cuerpo.trim() || crear.isPending}
              sx={{ alignSelf: "flex-start" }}
            >
              Publicar
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {isPending ? (
        <Skeleton variant="rounded" height={100} />
      ) : isError ? (
        <Alert severity="error">{toApiError(error).message}</Alert>
      ) : (
        <Stack spacing={2}>
          {data.data.map((anuncio) => (
            <Card key={anuncio.id} elevation={9}>
              <CardContent sx={{ p: 3 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                  <Stack spacing={0.5} minWidth={0}>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {anuncio.titulo}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {anuncio.cuerpo}
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Por {anuncio.autor} · {formatFecha(anuncio.creado_en)}
                    </Typography>
                  </Stack>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => eliminar.mutate(anuncio.id)}
                    disabled={eliminar.isPending}
                  >
                    Eliminar
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          ))}
          {data.data.length === 0 ? (
            <Typography variant="body2" color="textSecondary">
              Todavía no hay anuncios publicados.
            </Typography>
          ) : null}
        </Stack>
      )}
    </Stack>
  );
};

export default AnunciosPanel;
