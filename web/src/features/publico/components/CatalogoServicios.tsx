"use client";
import { useState } from "react";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { alpha } from "@mui/material/styles";
import { IconClock, IconMinus, IconPlus } from "@tabler/icons-react";

import { formatMoneda } from "@/lib/format";
import type { CategoriaPublica, ServicioPublico } from "../types";

interface TarjetaProps {
  servicio: ServicioPublico;
  cantidad: number;
  onAgregar: (servicio: ServicioPublico) => void;
  onCambiar: (servicioId: number, cantidad: number) => void;
}

/**
 * Tarjeta de servicio.
 *
 * Antes era una fila de lista y todas pesaban igual; en una tienda el
 * producto tiene que poder mirarse. Ahora la imagen manda, el precio es el
 * segundo foco y la tarjeta reacciona al ratón.
 */
const TarjetaServicio = ({
  servicio,
  cantidad,
  onAgregar,
  onCambiar,
}: TarjetaProps) => {
  const elegido = cantidad > 0;

  return (
    <Card
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        border: "2px solid",
        borderColor: elegido ? "primary.main" : "transparent",
        transition: "transform .18s, box-shadow .18s",
        "&:hover": { transform: "translateY(-4px)", boxShadow: 9 },
      }}
    >
      <Box sx={{ position: "relative" }}>
        {servicio.imagen_principal ? (
          <Box
            component="img"
            src={servicio.imagen_principal}
            alt=""
            sx={{ width: "100%", height: 150, objectFit: "cover", display: "block" }}
          />
        ) : (
          /*
           * Sin foto no se deja un hueco gris: se dibuja una franja en el
           * color del servicio con su inicial. La mayoría de negocios no sube
           * fotos el primer día y el catálogo debe verse acabado igual.
           */
          <Box
            sx={{
              height: 150,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "common.white",
              fontSize: 52,
              fontWeight: 700,
              backgroundImage: `linear-gradient(135deg, ${servicio.color}, ${alpha(servicio.color, 0.55)})`,
            }}
          >
            {servicio.nombre.trim()[0]?.toUpperCase()}
          </Box>
        )}

        {/* La duración va sobre la imagen: no compite con el precio. */}
        <Stack
          direction="row"
          spacing={0.5}
          alignItems="center"
          sx={{
            position: "absolute",
            bottom: 10,
            left: 10,
            px: 1,
            py: 0.25,
            borderRadius: 5,
            bgcolor: alpha("#000", 0.55),
            color: "common.white",
          }}
        >
          <IconClock size={13} />
          <Typography variant="caption" color="inherit" fontWeight={600}>
            {servicio.duracion_min} min
          </Typography>
        </Stack>

        {elegido ? (
          <Badge
            badgeContent={cantidad}
            color="primary"
            sx={{ position: "absolute", top: 16, right: 20 }}
          />
        ) : null}
      </Box>

      <Stack spacing={1} sx={{ p: 2, flex: 1 }}>
        <Typography variant="subtitle1" fontWeight={600} lineHeight={1.3}>
          {servicio.nombre}
        </Typography>

        {servicio.descripcion ? (
          <Typography
            variant="body2"
            color="textSecondary"
            sx={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              flex: 1,
            }}
          >
            {servicio.descripcion}
          </Typography>
        ) : (
          <Box flex={1} />
        )}

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={1}
          pt={0.5}
        >
          <Typography variant="h5" fontWeight={700} noWrap>
            {formatMoneda(servicio.precio)}
          </Typography>

          {elegido ? (
            <Stack direction="row" spacing={0.25} alignItems="center">
              <IconButton
                size="small"
                onClick={() => onCambiar(servicio.id, cantidad - 1)}
                aria-label={`Quitar uno de ${servicio.nombre}`}
              >
                <IconMinus size={16} />
              </IconButton>
              <Typography variant="subtitle2" fontWeight={700} minWidth={18} textAlign="center">
                {cantidad}
              </Typography>
              <IconButton
                size="small"
                onClick={() => onCambiar(servicio.id, cantidad + 1)}
                aria-label={`Agregar otro ${servicio.nombre}`}
              >
                <IconPlus size={16} />
              </IconButton>
            </Stack>
          ) : (
            <Button
              variant="contained"
              size="small"
              disableElevation
              onClick={() => onAgregar(servicio)}
            >
              Agregar
            </Button>
          )}
        </Stack>
      </Stack>
    </Card>
  );
};

interface Props {
  categorias: CategoriaPublica[];
  cantidadDe: (servicioId: number) => number;
  onAgregar: (servicio: ServicioPublico) => void;
  onCambiar: (servicioId: number, cantidad: number) => void;
}

/**
 * Catálogo con pestañas de categoría.
 *
 * Antes las categorías eran una lista de chips en la barra lateral y el
 * cliente tenía que scrollear entre todos los servicios. Con pestañas fijas
 * arriba se filtra en un clic, que es como funciona cualquier tienda.
 */
const CatalogoServicios = ({
  categorias,
  cantidadDe,
  onAgregar,
  onCambiar,
}: Props) => {
  const [activa, setActiva] = useState(0);

  // "Todos" solo aporta cuando hay más de una categoría.
  const pestanas =
    categorias.length > 1
      ? [
          {
            clave: "todos",
            nombre: "Todos",
            servicios: categorias.flatMap((categoria) => categoria.servicios),
          },
          ...categorias.map((categoria) => ({
            clave: String(categoria.id ?? "otros"),
            nombre: categoria.nombre,
            servicios: categoria.servicios,
          })),
        ]
      : categorias.map((categoria) => ({
          clave: String(categoria.id ?? "otros"),
          nombre: categoria.nombre,
          servicios: categoria.servicios,
        }));

  const visible = pestanas[activa] ?? pestanas[0];

  return (
    <Box>
      {pestanas.length > 1 ? (
        <Box
          sx={{
            position: "sticky",
            top: 0,
            zIndex: 2,
            bgcolor: "grey.100",
            borderBottom: "1px solid",
            borderColor: "divider",
            mb: 3,
          }}
        >
          <Tabs
            value={activa}
            onChange={(_, valor) => setActiva(valor)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ "& .MuiTab-root": { textTransform: "none", fontWeight: 600 } }}
          >
            {pestanas.map((pestana) => (
              <Tab
                key={pestana.clave}
                label={`${pestana.nombre} (${pestana.servicios.length})`}
              />
            ))}
          </Tabs>
        </Box>
      ) : null}

      <Grid container spacing={3}>
        {visible?.servicios.map((servicio) => (
          <Grid key={servicio.id} size={{ xs: 12, sm: 6 }}>
            <TarjetaServicio
              servicio={servicio}
              cantidad={cantidadDe(servicio.id)}
              onAgregar={onAgregar}
              onCambiar={onCambiar}
            />
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default CatalogoServicios;
