import { crearHooksRecurso } from "@/lib/query/recurso-hooks";
import type { PlantillaWhatsapp, PlantillaWhatsappPayload } from "../types";
import { plantillasWhatsappApi } from "../services/whatsapp.api";

export const {
  keys: plantillasKeys,
  useLista: usePlantillas,
  useTodos: useTodasLasPlantillas,
  useCrear: useCrearPlantilla,
  useActualizar: useActualizarPlantilla,
  useEliminar: useEliminarPlantilla,
} = crearHooksRecurso<PlantillaWhatsapp, PlantillaWhatsappPayload>(
  "plantillas-whatsapp",
  plantillasWhatsappApi,
  { singular: "Plantilla", femenino: true }
);
