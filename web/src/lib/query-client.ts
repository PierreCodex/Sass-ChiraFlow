import { QueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Con SSR conviene un staleTime > 0 para no refetchear al hidratar.
        staleTime: 60 * 1000,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) => {
          // No reintentar errores del cliente (401, 403, 404, 422…)
          const status = (error as AxiosError)?.response?.status;
          if (status && status >= 400 && status < 500) return false;
          return failureCount < 2;
        },
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  // En el servidor: un cliente nuevo por request.
  if (typeof window === "undefined") return makeQueryClient();

  // En el navegador: singleton, para no perder la caché si React suspende.
  if (!browserQueryClient) browserQueryClient = makeQueryClient();
  return browserQueryClient;
}
