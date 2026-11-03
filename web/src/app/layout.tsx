import React from "react";
import type { Metadata } from "next";
import NextTopLoader from "nextjs-toploader";

import Providers from "./providers";
import { CustomizerContextProvider } from "@/context/customizerContext";
import { env } from "@/config/env";
import "./global.css";

export const metadata: Metadata = {
  title: {
    default: env.appName,
    template: `%s | ${env.appName}`,
  },
  description: "Panel de administración",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        {/* Fuera del tema de MUI: el violeta de tivu va a mano. */}
        <NextTopLoader color="#4A2CF5" />
        <CustomizerContextProvider>
          <Providers>{children}</Providers>
        </CustomizerContextProvider>
      </body>
    </html>
  );
}
