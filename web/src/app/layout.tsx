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
        <NextTopLoader color="#5D87FF" />
        <CustomizerContextProvider>
          <Providers>{children}</Providers>
        </CustomizerContextProvider>
      </body>
    </html>
  );
}
