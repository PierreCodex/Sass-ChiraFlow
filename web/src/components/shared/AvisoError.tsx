"use client";
import Link from "next/link";
import Alert from "@mui/material/Alert";
import AlertTitle from "@mui/material/AlertTitle";
import Button from "@mui/material/Button";

import { toApiError } from "@/lib/api/client";

/**
 * El error de una pantalla, contado según lo que se pueda hacer con él.
 *
 * Existe porque los tres casos no se parecen en nada salvo en que la petición
 * falló, y hasta ahora los tres salían igual: un Alert rojo con el `message`
 * crudo del backend.
 *
 * - **Sin permiso** (403 `sin_permiso`): no es un fallo y no se arregla
 *   reintentando. Se cuenta en gris y sin alarma, porque quien lo ve no ha
 *   hecho nada mal — su rol no llega ahí. Y se dice a quién pedírselo, que es
 *   la única acción que le queda.
 * - **Suscripción vencida** (403 `suscripcion_vencida`): sí tiene salida, y es
 *   un botón. El backend garantiza que este gana sobre el anterior en un
 *   negocio suspendido, precisamente porque es el que alguien puede resolver.
 * - **Lo demás**: el mensaje tal cual, salvo los 5xx — ver abajo.
 */
export default function AvisoError({ error }: { error: unknown }) {
  const { status, message, codigo } = toApiError(error);

  if (codigo === "suscripcion_vencida") {
    return (
      <Alert
        severity="warning"
        action={
          <Button
            component={Link}
            href="/mi-plan"
            color="inherit"
            size="small"
            variant="outlined"
          >
            Ver mi plan
          </Button>
        }
      >
        <AlertTitle>Tu suscripción venció</AlertTitle>
        Renueva para volver a usar el panel. Tus datos siguen aquí.
      </Alert>
    );
  }

  /*
    Cualquier 403 del panel es falta de permiso, traiga `codigo` o no.

    Casi todos los endpoints mandan `sin_permiso`, pero los candados de
    `/usuarios` y `/roles` son un guardia aparte —no una capacidad de la
    matriz— y responden 403 pelado. Sin este caso general, ese error caía en
    la rama de abajo y salía en rojo de alarma cuando en realidad es una
    respuesta normal: tu rol no llega ahí.

    El mensaje del backend manda cuando lo hay, porque suele ser más preciso
    que el genérico («Solo el administrador general puede hacer esto»); la
    pared de cobro va antes y tiene su propio aviso.
  */
  if (status === 403) {
    return (
      <Alert severity="info">
        <AlertTitle>No tienes acceso a esta sección</AlertTitle>
        {message ||
          "Tu rol no incluye este módulo. Si necesitas entrar, pídeselo a quien administra el negocio."}
      </Alert>
    );
  }

  /*
    Un 5xx no se le enseña al usuario tal cual. Ese texto lo escribió Laravel
    para quien depura —en desarrollo llega con la sentencia SQL dentro— y no
    dice nada que quien mira pueda usar. Los 4xx sí: son sobre lo que pidió.
  */
  const texto =
    status >= 500 || status === 0
      ? "No se pudo cargar esta información. Inténtalo de nuevo en un momento."
      : message;

  return <Alert severity="error">{texto}</Alert>;
}
