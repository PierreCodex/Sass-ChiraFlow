"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";

export type TipoAviso = "success" | "error" | "info" | "warning";

interface Aviso {
  id: number;
  mensaje: string;
  tipo: TipoAviso;
}

interface ValorAvisos {
  /** Muestra un aviso flotante. Por defecto, verde de "salió bien". */
  avisar: (mensaje: string, tipo?: TipoAviso) => void;
}

/**
 * Valor por defecto que no hace nada: si algún día un componente queda fuera
 * del provider, se queda sin aviso en vez de tumbar la pantalla.
 */
const AvisosContext = createContext<ValorAvisos>({ avisar: () => {} });

/** Cómo se entera el usuario de que su acción funcionó. */
export const useAvisos = () => useContext(AvisosContext);

let siguienteId = 0;

/**
 * Avisos flotantes ("toasts") de toda la app.
 *
 * Se montan una sola vez en `app/providers.tsx`, así que cualquier pantalla
 * —panel, administración o tienda— puede pedir uno sin montar nada.
 *
 * Los avisos se **encolan**: guardar tres cosas seguidas enseña los tres
 * mensajes uno detrás de otro, en vez de que el último pise a los anteriores.
 */
export const AvisosProvider = ({ children }: { children: ReactNode }) => {
  const [cola, setCola] = useState<Aviso[]>([]);

  const avisar = useCallback((mensaje: string, tipo: TipoAviso = "success") => {
    setCola((actual) => [...actual, { id: siguienteId++, mensaje, tipo }]);
  }, []);

  const actual = cola[0];

  // `avisar` es estable, así que el valor no cambia en cada render y no
  // reenvía a re-renderizar media app cada vez que aparece un aviso.
  const valor = useMemo(() => ({ avisar }), [avisar]);

  return (
    <AvisosContext.Provider value={valor}>
      {children}
      <Snackbar
        // `key` por aviso: sin ella, el segundo mensaje reutiliza el Snackbar
        // del primero y no reinicia la cuenta atrás.
        key={actual?.id}
        open={!!actual}
        autoHideDuration={4000}
        onClose={(_, motivo) => {
          // Al hacer clic fuera no se cierra: el aviso dura lo que dura.
          if (motivo === "clickaway") return;
          setCola((cola) => cola.slice(1));
        }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <Alert
          severity={actual?.tipo ?? "success"}
          variant="filled"
          onClose={() => setCola((cola) => cola.slice(1))}
          sx={{ width: "100%", alignItems: "center" }}
        >
          {actual?.mensaje}
        </Alert>
      </Snackbar>
    </AvisosContext.Provider>
  );
};
