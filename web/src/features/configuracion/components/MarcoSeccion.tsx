"use client";
import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import Skeleton from "@mui/material/Skeleton";

import AvisoError from "@/components/shared/AvisoError";
import BlankCard from "@/components/shared/BlankCard";
import { formularioCompacto } from "@/components/shared/estilos-formulario";

import BarraGuardado from "./BarraGuardado";

interface Props {
  cargando: boolean;
  error: unknown;
  errorAlGuardar: unknown;
  isDirty: boolean;
  guardando: boolean;
  onSubmit: () => void;
  onDescartar: () => void;
  children: ReactNode;
}

/**
 * El envoltorio común de las cuatro secciones de Configuración: la tarjeta, la
 * carga, el error y la barra de guardado.
 *
 * El `<form>` envuelve a la tarjeta y no al revés, y eso hay que respetarlo:
 * la barra es `position: sticky` y `Card` de MUI lleva `overflow: hidden`, que
 * la convierte en su contenedor de scroll y deja la barra colgada por debajo
 * de la pantalla. Está anotado en el CLAUDE.md y costó encontrarlo.
 */
export default function MarcoSeccion({
  cargando,
  error,
  errorAlGuardar,
  isDirty,
  guardando,
  onSubmit,
  onDescartar,
  children,
}: Props) {
  if (cargando) return <Skeleton variant="rounded" height={420} />;
  if (error) return <AvisoError error={error} />;

  return (
    <Box component="form" onSubmit={onSubmit} noValidate>
      <BlankCard>
        <CardContent sx={{ ...formularioCompacto, p: 3 }}>
          {/*
            Los 422 se pintan bajo su campo; aquí solo cae lo que no tiene
            campo —un 403 de permiso, un fallo de red— y `AvisoError` decide
            cómo se cuenta cada uno.
          */}
          {errorAlGuardar ? (
            <Box mb={3}>
              <AvisoError error={errorAlGuardar} />
            </Box>
          ) : null}

          {children}
        </CardContent>
      </BlankCard>

      <BarraGuardado
        visible={isDirty}
        guardando={guardando}
        onDescartar={onDescartar}
      />
    </Box>
  );
}
