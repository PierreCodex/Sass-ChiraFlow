/**
 * Rótulos de las zonas horarias.
 *
 * El backend manda las 419 zonas IANA **sin etiquetas ni agrupación**, y hace
 * bien: los rótulos los pone el frontend (convención del repo) y el desfase lo
 * sabe el navegador. Escribir aquí una tabla de 419 nombres sería inventar
 * datos que se quedan viejos cada vez que un país cambia de horario.
 *
 * El desfase se calcula con `Intl` y **no se cachea entre días**: cambia con el
 * horario de verano, así que se recalcula al abrir la pantalla.
 */

/** `America/Lima` → `Lima`, `America/Argentina/Salta` → `Argentina/Salta`. */
export function nombreDeZona(zona: string): string {
  const [, ...resto] = zona.split("/");
  return resto.length ? resto.join("/").replace(/_/g, " ") : zona;
}

/** `America/Lima` → `América`. `UTC` no tiene región. */
export function regionDeZona(zona: string): string {
  const region = zona.split("/")[0];
  return REGIONES[region] ?? region;
}

const REGIONES: Record<string, string> = {
  Africa: "África",
  America: "América",
  Antarctica: "Antártida",
  Arctic: "Ártico",
  Asia: "Asia",
  Atlantic: "Atlántico",
  Australia: "Australia",
  Europe: "Europa",
  Indian: "Índico",
  Pacific: "Pacífico",
  UTC: "UTC",
};

/**
 * `America/Lima` → `GMT-5`.
 *
 * Devuelve cadena vacía si el navegador no conoce la zona, en vez de reventar:
 * la lista viene del servidor y no tiene por qué coincidir con la base de
 * datos de zonas del navegador de quien mira.
 */
export function desfaseDeZona(zona: string): string {
  try {
    const partes = new Intl.DateTimeFormat("es", {
      timeZone: zona,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());

    return partes.find((p) => p.type === "timeZoneName")?.value ?? "";
  } catch {
    return "";
  }
}

export interface OpcionZona {
  /** El identificador IANA, que es lo que se guarda. */
  valor: string;
  etiqueta: string;
  region: string;
  desfase: string;
}

/** La lista del servidor, lista para el desplegable. */
export function opcionesDeZonas(zonas: string[]): OpcionZona[] {
  return zonas.map((zona) => ({
    valor: zona,
    etiqueta: nombreDeZona(zona),
    region: regionDeZona(zona),
    desfase: desfaseDeZona(zona),
  }));
}
