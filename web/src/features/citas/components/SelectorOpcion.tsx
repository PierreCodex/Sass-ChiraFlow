"use client";

import { useState } from "react";
import Autocomplete from "@mui/material/Autocomplete";

import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import { useConRetardo, useOpcionesCita } from "../hooks/useOpcionesCita";
import type { ColeccionOpciones, OpcionesPorColeccion } from "../opciones";

interface Props<C extends ColeccionOpciones> {
  coleccion: C;
  /** El id elegido, o null/0 si no hay. */
  valor: number | null | undefined;
  onChange: (opcion: OpcionesPorColeccion[C] | null) => void;
  /** Lo que se lee en el desplegable. Por defecto, el nombre. */
  etiqueta?: (opcion: OpcionesPorColeccion[C]) => string;
  /**
   * Lo que ya se sabe de lo elegido —p. ej. el profesional de la cita que se
   * edita—, para enseñarlo mientras llega del servidor.
   */
  conocida?: { id: number; nombre: string } | null;
  id?: string;
  placeholder?: string;
  error?: boolean;
  helperText?: string;
  size?: "small" | "medium";
}

/**
 * Un selector que busca en el servidor (Story 1.10).
 *
 * Antes cada select del formulario de citas traía la colección entera, hasta
 * 200 filas, y lo que pasaba de ahí desaparecía sin aviso. Este pide 20 y
 * vuelve a preguntar mientras se escribe, con un pequeño retardo. Lo ya
 * elegido se pide por id aparte, así que se ve aunque no esté entre los 20.
 */
function SelectorOpcion<C extends ColeccionOpciones>({
  coleccion,
  valor,
  onChange,
  etiqueta = (opcion) => opcion.nombre,
  conocida,
  id,
  placeholder,
  error,
  helperText,
  size,
}: Props<C>) {
  const [escrito, setEscrito] = useState("");
  const busqueda = useConRetardo(escrito);

  const { data: encontradas = [], isFetching } = useOpcionesCita(coleccion, { search: busqueda });
  const { data: porId = [] } = useOpcionesCita(coleccion, { ids: valor ? [valor] : [] });

  /*
    Lo elegido puede no volver del servidor: p. ej. el servicio de una cita
    vieja que hoy está inactivo, y que por eso ya no se ofrece. Entonces se
    enseña con lo que ya se sabía, para no dejar el campo en blanco.
  */
  const deConocida =
    conocida && valor === conocida.id ? (conocida as unknown as OpcionesPorColeccion[C]) : null;
  const elegida =
    (valor && (encontradas.find((o) => o.id === valor) ?? porId.find((o) => o.id === valor))) ||
    deConocida;

  // Lo elegido siempre está entre las opciones, o el Autocomplete lo descarta.
  const opciones = elegida && !encontradas.some((o) => o.id === elegida.id)
    ? [elegida, ...encontradas]
    : encontradas;

  return (
    <Autocomplete
      id={id}
      size={size}
      options={opciones}
      value={elegida}
      loading={isFetching}
      // El filtrado lo hace el servidor; aquí no se vuelve a filtrar.
      filterOptions={(x) => x}
      isOptionEqualToValue={(a, b) => a.id === b.id}
      getOptionLabel={(opcion) => (opcion === deConocida ? opcion.nombre : etiqueta(opcion))}
      // La clave es el id y no la etiqueta: dos opciones pueden llamarse igual.
      renderOption={(props, opcion) => {
        const { key: _key, ...resto } = props as typeof props & { key: string };
        return (
          <li key={opcion.id} {...resto}>
            {opcion === deConocida ? opcion.nombre : etiqueta(opcion)}
          </li>
        );
      }}
      noOptionsText={busqueda ? "Nada con ese nombre" : "Sin opciones"}
      loadingText="Buscando…"
      onInputChange={(_, texto, motivo) => {
        // Solo lo que escribe la persona dispara una búsqueda; al elegir, el
        // texto pasa a ser la etiqueta y no hay que buscarla.
        if (motivo === "input") setEscrito(texto);
        if (motivo === "clear" || motivo === "reset") setEscrito("");
      }}
      onChange={(_, opcion) => onChange(opcion)}
      renderInput={(params) => (
        <CustomTextField
          {...params}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
        />
      )}
    />
  );
}

export default SelectorOpcion;
