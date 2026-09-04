import { useMutation } from "@tanstack/react-query";
import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import { useAvisos } from "@/context/avisos";
import type { Usuario, UsuarioPayload } from "../types";
import { usuariosApi } from "../services/usuarios.api";

export const {
  keys: usuariosKeys,
  useLista: useUsuarios,
  useTodos: useTodosLosUsuarios,
  useDetalle: useUsuario,
  useCrear: useCrearUsuario,
  useActualizar: useActualizarUsuario,
  useEliminar: useEliminarUsuario,
} = crearHooksRecurso<Usuario, UsuarioPayload>("usuarios", usuariosApi, {
  singular: "Usuario",
});

/**
 * Reenviar la invitación.
 *
 * No invalida nada —no cambia ningún dato de la lista— pero sí avisa: sin el
 * aviso, el botón parecería no haber hecho nada, que es lo peor que puede
 * hacer un botón cuyo efecto ocurre en el buzón de otra persona.
 */
export function useReenviarInvitacion() {
  const { avisar } = useAvisos();

  return useMutation({
    mutationFn: (id: number) => usuariosApi.reenviarInvitacion(id),
    onSuccess: (respuesta) => avisar(respuesta.message),
  });
}
