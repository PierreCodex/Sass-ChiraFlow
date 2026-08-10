"use client";
import { useRef } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconPhotoPlus, IconX } from "@tabler/icons-react";

/**
 * Una imagen del campo: puede ser una ya guardada (solo `url`) o una recién
 * elegida por el usuario (`file` + url temporal para la vista previa).
 */
export interface ImagenSeleccionada {
  url: string;
  file?: File;
}

interface Props {
  valor: ImagenSeleccionada[];
  onChange: (imagenes: ImagenSeleccionada[]) => void;
  /** 1 = imagen única. Por encima, galería. */
  max?: number;
  textoBoton?: string;
  ayuda?: string;
  error?: string;
}

const CampoImagenes = ({
  valor,
  onChange,
  max = 1,
  textoBoton,
  ayuda,
  error,
}: Props) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const multiple = max > 1;
  const lleno = valor.length >= max;

  const alElegir = (event: React.ChangeEvent<HTMLInputElement>) => {
    const archivos = Array.from(event.target.files ?? []);
    if (!archivos.length) return;

    const nuevas = archivos.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    onChange(multiple ? [...valor, ...nuevas].slice(0, max) : nuevas.slice(0, 1));

    // Permite volver a elegir el mismo archivo si se quitó antes.
    event.target.value = "";
  };

  const quitar = (indice: number) => {
    const imagen = valor[indice];
    if (imagen.file) URL.revokeObjectURL(imagen.url);
    onChange(valor.filter((_, i) => i !== indice));
  };

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple={multiple}
        hidden
        onChange={alElegir}
      />

      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
        {valor.map((imagen, indice) => (
          <Box
            key={imagen.url}
            sx={{
              position: "relative",
              width: 88,
              height: 88,
              borderRadius: 1,
              overflow: "hidden",
              border: "1px solid",
              borderColor: "divider",
            }}
          >
            {/* Vista previa local: next/image no aplica a blob: URLs */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imagen.url}
              alt=""
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <IconButton
              size="small"
              onClick={() => quitar(indice)}
              sx={{
                position: "absolute",
                top: 2,
                right: 2,
                bgcolor: "background.paper",
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              <IconX size={14} />
            </IconButton>
          </Box>
        ))}

        {!lleno ? (
          <Button
            variant="outlined"
            color="inherit"
            onClick={() => inputRef.current?.click()}
            startIcon={<IconPhotoPlus size={18} />}
            sx={{ height: 88, minWidth: 88, borderStyle: "dashed" }}
          >
            {textoBoton ?? (multiple ? "Añadir" : "Elegir")}
          </Button>
        ) : null}
      </Stack>

      {ayuda ? (
        <Typography variant="caption" color="textSecondary" display="block" mt={1}>
          {ayuda}
        </Typography>
      ) : null}

      {error ? (
        <Typography variant="caption" color="error" display="block" mt={0.5}>
          {error}
        </Typography>
      ) : null}
    </Box>
  );
};

export default CampoImagenes;
