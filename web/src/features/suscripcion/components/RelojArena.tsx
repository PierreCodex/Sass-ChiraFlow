"use client";
import Box from "@mui/material/Box";

export type NivelArena = "alto" | "medio" | "bajo" | "vacio";

interface Props {
  nivel: NivelArena;
  size?: number;
}

/**
 * Reloj de arena dibujado a mano, con la arena cayendo de verdad.
 *
 * Se hizo propio en vez de usar un GIF (Icons8) o un render 3D por cuatro
 * razones concretas:
 *
 * - **Hereda el color** con `currentColor`, así que sigue la escala de
 *   urgencia del banner (azul → ámbar → rojo). Un GIF tiene los colores
 *   quemados.
 * - Pesa **menos de 1 KB** frente a los 37 KB y 25 fotogramas del GIF, en un
 *   componente que sale en las 17 pantallas del panel.
 * - Respeta `prefers-reduced-motion`.
 * - Nítido a cualquier tamaño y sin atribución de terceros.
 *
 * El nivel de arena es el mismo dato que el color: cuanto menos queda, más
 * vacío está el bulbo de arriba.
 */

/** Cuánta arena queda arriba y cuánta se ha acumulado abajo, por nivel. */
const PROPORCION: Record<NivelArena, { arriba: number; abajo: number }> = {
  alto: { arriba: 1, abajo: 0.15 },
  medio: { arriba: 0.6, abajo: 0.55 },
  bajo: { arriba: 0.22, abajo: 0.85 },
  vacio: { arriba: 0, abajo: 1 },
};

/**
 * Escala vertical alrededor de un punto, compuesta a mano.
 *
 * No se usa `transform-origin` de CSS: sobre un `<path>` el navegador ignora
 * el origen en píxeles y escala respecto a (0,0), con lo que la arena se iba
 * al borde del lienzo. Escalar respecto a `origenY` es
 * `y' = y·k + origenY·(1-k)`, o sea una traslación seguida de la escala.
 */
function escalarDesde(origenY: number, k: number) {
  return `translate(0 ${(origenY * (1 - k)).toFixed(3)}) scale(1 ${k})`;
}

const RelojArena = ({ nivel, size = 22 }: Props) => {
  const { arriba, abajo } = PROPORCION[nivel];
  const cayendo = nivel !== "vacio";

  return (
    <Box
      component="svg"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      aria-hidden="true"
      sx={{
        color: "inherit",
        // El chorro son guiones cortos desplazándose: a este tamaño se leen
        // como granos cayendo.
        "& .chorro": {
          animation: "caerArena 0.6s linear infinite",
        },
        "@keyframes caerArena": {
          from: { strokeDashoffset: 0 },
          to: { strokeDashoffset: -3 },
        },
        "@media (prefers-reduced-motion: reduce)": {
          "& .chorro": { animation: "none" },
        },
      }}
    >
      {/* Tapas */}
      <path
        d="M5.5 2.75h13M5.5 21.25h13"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Cristal: dos curvas que se estrechan en el cuello */}
      <path
        d="M7 2.75c0 4.6 5 6.8 5 9.25 0 2.45-5 4.65-5 9.25"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M17 2.75c0 4.6-5 6.8-5 9.25 0 2.45 5 4.65 5 9.25"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />

      {/* Arena de arriba: se encoge hacia el cuello, que es por donde cae */}
      {arriba > 0 ? (
        <path
          d="M8.2 5.2h7.6C15.1 8.4 12 10.2 12 11.9 12 10.2 8.9 8.4 8.2 5.2Z"
          fill="currentColor"
          opacity="0.85"
          transform={escalarDesde(11.9, arriba)}
        />
      ) : null}

      {/* El chorro */}
      {cayendo ? (
        <path
          className="chorro"
          d="M12 12.4v6.4"
          stroke="currentColor"
          strokeWidth="1.3"
          strokeLinecap="round"
          strokeDasharray="1 2"
          opacity="0.85"
        />
      ) : null}

      {/* Montón de abajo: crece desde la base */}
      <path
        d="M8.2 19.6h7.6C15.1 16.4 12 14.6 12 12.9 12 14.6 8.9 16.4 8.2 19.6Z"
        fill="currentColor"
        opacity="0.85"
        transform={escalarDesde(19.6, abajo)}
      />
    </Box>
  );
};

export default RelojArena;
