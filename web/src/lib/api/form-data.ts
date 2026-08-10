/**
 * Convierte un payload plano a FormData, que es lo que hay que enviar cuando
 * el formulario incluye archivos.
 *
 * Reglas pensadas para Laravel:
 *  - `null` viaja como cadena vacía (Laravel lo convierte a null con
 *    `convert_empty_strings_to_null`, activo por defecto).
 *  - Los booleanos viajan como "1"/"0", que es lo que entiende `boolean`.
 *  - Los arrays van indexados (`campo[0]`, `campo[1]`), no `campo[]`, para que
 *    también funcionen los arrays de objetos: `horario[0][dia]`.
 *  - Los objetos anidados usan notación de corchetes.
 *  - `undefined` se omite: sirve para no pisar campos en una edición parcial.
 */
export function aFormData(payload: Record<string, any>): FormData {
  const formData = new FormData();

  const agregar = (clave: string, valor: any) => {
    if (valor === undefined) return;

    if (valor === null) {
      formData.append(clave, "");
      return;
    }

    if (typeof valor === "boolean") {
      formData.append(clave, valor ? "1" : "0");
      return;
    }

    if (valor instanceof File || valor instanceof Blob) {
      formData.append(clave, valor);
      return;
    }

    if (Array.isArray(valor)) {
      valor.forEach((item, indice) => agregar(`${clave}[${indice}]`, item));
      return;
    }

    if (typeof valor === "object") {
      Object.entries(valor).forEach(([subClave, subValor]) =>
        agregar(`${clave}[${subClave}]`, subValor)
      );
      return;
    }

    formData.append(clave, String(valor));
  };

  Object.entries(payload).forEach(([clave, valor]) => agregar(clave, valor));

  return formData;
}
