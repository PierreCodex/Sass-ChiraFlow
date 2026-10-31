"use client";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

import ShellPlataforma from "@/features/plataforma/components/ShellPlataforma";

/*
  Panel de plataforma (prototipo de la Épica 8). Fuera de `(dashboard)` a
  propósito: no comparte layout, sesión ni tenancy con el panel de negocio.
  El login va sin el marco.
*/
export default function PlataformaLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/plataforma/login") return <>{children}</>;
  return <ShellPlataforma>{children}</ShellPlataforma>;
}
