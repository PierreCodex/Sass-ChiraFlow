import React from "react";
import type { Metadata } from "next";
import { env } from "@/config/env";

/**
 * Layout de las páginas públicas de marketing del SaaS (`/inicio`).
 *
 * Distinto de `app/(publico)/`, que es la tienda pública de CADA NEGOCIO
 * (`/reservar/{slug}`) y a propósito no menciona el nombre del SaaS. Aquí es
 * al revés: es la página que vende el SaaS mismo a nuevos negocios.
 *
 * Sin sidebar ni header del panel — trae su propia barra y pie de página.
 */
export const metadata: Metadata = {
  title: { absolute: `${env.appName} — Agenda online para tu negocio` },
  description:
    "Reservas 24/7, recordatorios automáticos, pagos y control de caja para peluquerías, barberías, spas y clínicas.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
