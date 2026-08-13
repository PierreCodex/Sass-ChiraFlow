/** Claves de `PlantillaWhatsapp::eventos()`. */
export type EventoWhatsapp =
  | "confirmacion"
  | "recordatorio"
  | "cancelacion"
  | "finalizado"
  | "bienvenida"
  | "pago_linea"
  | "redes_sociales"
  | "cumpleanos"
  | "personalizado";

export interface PlantillaWhatsapp {
  id: number;
  nombre: string;
  evento: EventoWhatsapp;
  contenido: string;
  activo: boolean;
}

export interface PlantillaWhatsappPayload {
  nombre: string;
  evento: EventoWhatsapp;
  contenido: string;
  activo: boolean;
}

/** Variable insertable en el contenido: `{{cliente}}`. */
export interface VariableWhatsapp {
  key: string;
  label: string;
}

export interface GrupoVariables {
  titulo: string;
  variables: VariableWhatsapp[];
}

/** Plantilla de ejemplo lista para copiar. */
export interface PlantillaPredisenada {
  key: EventoWhatsapp;
  nombre: string;
  contenido: string;
}

export interface PruebaWhatsappPayload {
  telefono: string;
  contenido: string;
}
