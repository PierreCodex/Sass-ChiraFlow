import { usarMocksPara } from "@/lib/api/mocks";
import { api } from "@/lib/api/client";
import { delay } from "@/lib/mock-utils";
import { crearRecurso } from "@/lib/api/recurso";
import { rolesMock } from "@/features/roles/mocks";
import { usuariosMock } from "../mocks";
import type { Usuario, UsuarioPayload } from "../types";

/**
 * Cuentas del panel.
 *
 * **Todo `/usuarios` es del dueño**: el backend responde 403 a cualquier otro,
 * incluido el administrador. El motivo es el mismo que en roles — quien puede
 * crear cuentas y repartir roles puede fabricarse un segundo dueño. La
 * pantalla esconde la sección a quien no lo es, pero eso es cortesía, no
 * autorización: la puerta la cierra el 403.
 *
 * JSON y no multipart: aquí no hay foto. La de la persona vive en su ficha de
 * profesional, que es donde se usa (agenda y tienda pública).
 */
const recurso = crearRecurso<Usuario, UsuarioPayload>({
  path: "usuarios",
  mocks: usuariosMock,
  camposBusqueda: ["nombre", "apellido", "email"],
  valoresPorDefecto: { activo: true, profesional: null },
  // El payload manda `rol_id` y la entidad devuelve el rol resuelto. Con el
  // backend real lo hace el Resource.
  alGuardarMock: (payload: UsuarioPayload) => {
    const rol = rolesMock.find((r) => r.id === payload.rol_id);
    return rol
      ? { rol: { id: rol.id, nombre: rol.nombre, clave: rol.clave } }
      : {};
  },
});

export const usuariosApi = {
  ...recurso,

  /**
   * Reenvía la invitación para crear la contraseña.
   *
   * No es un extra: el alta depende de que un correo llegue, y los correos se
   * pierden —caducan los 7 días, caen en spam, el empleado los borra—. Sin
   * este botón la única salida sería borrar la cuenta y volverla a crear.
   */
  reenviarInvitacion: async (id: number): Promise<{ message: string }> => {
    if (usarMocksPara("usuarios")) {
      await delay();
      return { message: "Invitación reenviada." };
    }
    const { data } = await api.post<{ message: string }>(
      `/usuarios/${id}/invitacion`
    );
    return data;
  },
};
