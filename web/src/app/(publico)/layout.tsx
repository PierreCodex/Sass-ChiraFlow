import React from "react";
import type { Metadata } from "next";

/**
 * Layout de la tienda pública.
 *
 * No lleva nada del panel: ni sidebar, ni cabecera, ni el aviso de prueba.
 * El cliente que entra a reservar no es el dueño del negocio y no debe ver
 * ninguna pista de la administración.
 *
 * El tema y React Query ya vienen del layout raíz; aquí solo se anula la
 * plantilla de título, porque el nombre del SaaS no pinta nada en la tienda
 * de un negocio.
 */
export const metadata: Metadata = {
  title: { absolute: "Reservar cita" },
  description: "Reserva tu cita en línea",
};

export default function PublicoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
