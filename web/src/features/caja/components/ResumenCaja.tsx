"use client";
import Grid from "@mui/material/Grid";
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconCashBanknote,
  IconWallet,
} from "@tabler/icons-react";

import StatCard, { type StatCardProps } from "@/components/shared/StatCard";
import { formatMoneda } from "@/lib/format";
import { saldoEsperado, type CajaSesion } from "../types";

interface Props {
  sesion: CajaSesion;
}

/**
 * Las cuatro cifras del día. La última cambia de significado según el estado:
 * mientras la caja está abierta muestra lo que *debería* haber en el cajón;
 * una vez cerrada, lo que realmente se contó.
 */
const ResumenCaja = ({ sesion }: Props) => {
  const esperado = saldoEsperado(sesion);
  const cerrada = sesion.monto_final !== null;

  const tarjetas: StatCardProps[] = [
    {
      titulo: "Saldo inicial",
      valor: formatMoneda(sesion.monto_inicial),
      icono: <IconWallet size={24} />,
      color: "primary",
      detalle: `Apertura de ${sesion.abierta_por}`,
    },
    {
      titulo: "Ingresos",
      valor: formatMoneda(sesion.ingresos),
      icono: <IconArrowUpRight size={24} />,
      color: "success",
    },
    {
      titulo: "Egresos",
      valor: formatMoneda(sesion.egresos),
      icono: <IconArrowDownLeft size={24} />,
      color: "error",
    },
    cerrada
      ? {
          titulo: "Monto contado",
          valor: formatMoneda(sesion.monto_final!),
          icono: <IconCashBanknote size={24} />,
          color: "secondary",
          detalle: `Esperado ${formatMoneda(esperado)}`,
        }
      : {
          titulo: "Saldo esperado",
          valor: formatMoneda(esperado),
          icono: <IconCashBanknote size={24} />,
          color: "secondary",
          detalle: "Inicial + ingresos − egresos",
        },
  ];

  return (
    <Grid container spacing={3}>
      {tarjetas.map((tarjeta) => (
        <Grid key={tarjeta.titulo} size={{ xs: 12, sm: 6, lg: 3 }}>
          <StatCard {...tarjeta} />
        </Grid>
      ))}
    </Grid>
  );
};

export default ResumenCaja;
