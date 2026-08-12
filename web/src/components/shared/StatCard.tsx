"use client";
import React from "react";
import Avatar from "@mui/material/Avatar";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

export type ColorStat =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error";

export interface StatCardProps {
  titulo: string;
  valor: string | number;
  icono: React.ReactNode;
  color: ColorStat;
  /** Línea pequeña bajo el valor (contexto: "esperado", "contado"…). */
  detalle?: string;
}

/**
 * Tarjeta de cifra: icono en avatar + título + valor grande.
 * La usan el dashboard y el resumen de caja.
 */
const StatCard = ({ titulo, valor, icono, color, detalle }: StatCardProps) => (
  <Card elevation={9}>
    <CardContent sx={{ p: 3 }}>
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          sx={{
            bgcolor: `${color}.light`,
            color: `${color}.main`,
            width: 48,
            height: 48,
          }}
        >
          {icono}
        </Avatar>
        <Stack spacing={0.5} minWidth={0}>
          <Typography variant="subtitle2" color="textSecondary" noWrap>
            {titulo}
          </Typography>
          <Typography variant="h4" fontWeight={700} noWrap>
            {valor}
          </Typography>
          {detalle ? (
            <Typography variant="caption" color="textSecondary" noWrap>
              {detalle}
            </Typography>
          ) : null}
        </Stack>
      </Stack>
    </CardContent>
  </Card>
);

export default StatCard;
