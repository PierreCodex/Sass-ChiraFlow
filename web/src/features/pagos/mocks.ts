import type { ConfigPagos, PagoReserva } from "./types";

/**
 * Mocks del cobro con QR, **guardados en `localStorage`**.
 *
 * A diferencia del resto de mocks (que viven en memoria), estos se persisten
 * porque el prototipo cruza dos pantallas: el cliente sube su captura en la
 * tienda y la encargada la revisa en el panel. En memoria, recargar una de las
 * dos borraría lo que hizo la otra.
 */

const CLAVE_CONFIG = "mock:pagos:config";
const CLAVE_PAGOS = "mock:pagos:reservas";

export const configPagosInicial: ConfigPagos = {
  modo: "opcional",
  instrucciones:
    "Escanea el QR con tu app, paga el monto exacto y sube la captura. Tu horario queda apartado mientras lo revisamos.",
  plazo_min: 60,
  metodos: [
    { id: 1, tipo: "yape", nombre: "Yape", qr_url: "/images/pagos-demo/qr-yape.svg", numero: "976 645 666", titular: "Clínica El Rosal S.A.C.", activo: true },
    { id: 2, tipo: "plin", nombre: "Plin", qr_url: "/images/pagos-demo/qr-plin.svg", numero: "976 645 666", titular: "Clínica El Rosal S.A.C.", activo: true },
    { id: 3, tipo: "bim", nombre: "BIM", qr_url: "/images/pagos-demo/qr-bim.svg", numero: "976 645 666", titular: "Clínica El Rosal S.A.C.", activo: true },
    { id: 4, tipo: "lemon", nombre: "Lemon", qr_url: "/images/pagos-demo/qr-lemon.svg", numero: null, titular: "Clínica El Rosal S.A.C.", activo: true },
    { id: 5, tipo: "prex", nombre: "Prex", qr_url: "/images/pagos-demo/qr-prex.svg", numero: null, titular: "Clínica El Rosal S.A.C.", activo: true },
  ],
};

function leer<T>(clave: string, porDefecto: T): T {
  if (typeof window === "undefined") return porDefecto;
  try {
    const crudo = window.localStorage.getItem(clave);
    return crudo ? (JSON.parse(crudo) as T) : porDefecto;
  } catch {
    return porDefecto;
  }
}

function escribir(clave: string, valor: unknown) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Sin espacio (una captura muy grande) o almacenamiento bloqueado: el
    // prototipo sigue funcionando, solo no recuerda el cambio.
  }
}

export const almacenPagos = {
  config: () => leer<ConfigPagos>(CLAVE_CONFIG, configPagosInicial),
  guardarConfig: (config: ConfigPagos) => escribir(CLAVE_CONFIG, config),
  pagos: () => leer<PagoReserva[]>(CLAVE_PAGOS, []),
  guardarPagos: (pagos: PagoReserva[]) => escribir(CLAVE_PAGOS, pagos),
};
