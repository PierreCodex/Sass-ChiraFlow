"use client";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import { IconArrowDownRight, IconArrowUpRight, IconMinus } from "@tabler/icons-react";

import { formatMoneda } from "@/lib/format";
import { variacion, type MetricasPeriodo } from "../types";

interface TarjetaProps {
  titulo: string;
  actual: number;
  anterior: number;
  formato: (valor: number) => string;
  /** true cuando subir es malo (inasistencias): invierte el color. */
  menosEsMejor?: boolean;
  nota?: string;
}

/**
 * Cifra grande + valor del período anterior + variación.
 *
 * La flecha acompaña siempre al porcentaje: el signo no puede quedar
 * codificado solo en el color.
 */
const TarjetaMetrica = ({
  titulo,
  actual,
  anterior,
  formato,
  menosEsMejor = false,
  nota,
}: TarjetaProps) => {
  const cambio = variacion(actual, anterior);
  const sube = cambio > 0;
  const plano = Math.abs(cambio) < 0.05;

  const color = plano
    ? "text.secondary"
    : sube === !menosEsMejor
      ? "success.main"
      : "error.main";

  const Icono = plano ? IconMinus : sube ? IconArrowUpRight : IconArrowDownRight;

  return (
    <Card elevation={9} sx={{ height: "100%" }}>
      <CardContent sx={{ p: 3 }}>
        <Typography variant="subtitle2" color="textSecondary" noWrap>
          {titulo}
        </Typography>
        <Typography variant="h3" fontWeight={700} mt={0.5} noWrap>
          {formato(actual)}
        </Typography>
        <Typography variant="caption" color="textSecondary" display="block" mt={0.5}>
          Anterior: {formato(anterior)}
        </Typography>
        <Stack direction="row" spacing={0.5} alignItems="center" mt={1} color={color}>
          <Icono size={16} />
          <Typography variant="subtitle2" fontWeight={600} color="inherit">
            {plano ? "Sin cambios" : `${Math.abs(cambio).toFixed(1)}%`}
          </Typography>
        </Stack>
        {nota ? (
          <Typography variant="caption" color="textSecondary" display="block" mt={1}>
            {nota}
          </Typography>
        ) : null}
      </CardContent>
    </Card>
  );
};

interface Props {
  actual: MetricasPeriodo;
  anterior: MetricasPeriodo;
}

const porcentaje = (valor: number) => `${valor.toFixed(2)}%`;
const entero = (valor: number) => String(valor);

const MetricasReporte = ({ actual, anterior }: Props) => (
  <Grid container spacing={3}>
    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <TarjetaMetrica
        titulo="Reservas totales"
        actual={actual.citas}
        anterior={anterior.citas}
        formato={entero}
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <TarjetaMetrica
        titulo="Ocupación"
        actual={actual.ocupacion}
        anterior={anterior.ocupacion}
        formato={porcentaje}
        nota="Minutos reservados sobre los disponibles"
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <TarjetaMetrica
        titulo="Tasa de inasistencias"
        actual={actual.inasistencias}
        anterior={anterior.inasistencias}
        formato={porcentaje}
        menosEsMejor
        nota="Canceladas sobre el total"
      />
    </Grid>
    <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
      <TarjetaMetrica
        titulo="Ingresos"
        actual={actual.ingresos}
        anterior={anterior.ingresos}
        formato={formatMoneda}
        nota="Solo citas completadas"
      />
    </Grid>
  </Grid>
);

export default MetricasReporte;
