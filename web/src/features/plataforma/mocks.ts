import type {
  AccionPlataforma,
  NegocioPlataforma,
  PagoSuscripcion,
  PlanPlataforma,
} from "./types";

/**
 * Datos de prueba del panel de plataforma, **guardados en `localStorage`** para
 * que un cambio de plan o una suspensión sobrevivan a recargar la página.
 *
 * Los planes son copia literal de `Backend-Sass/database/seeders/PlanSeeder.php`;
 * los negocios son inventados.
 */

const BASICO = [
  "agenda", "agenda_online", "gestion_clientes", "recordatorios",
  "notificaciones_alertas", "dashboard_stats", "caja", "inventario",
  "whatsapp", "sitio_publico", "subdominio",
];
const PREMIUM = [
  ...BASICO,
  "multi_sede", "encuesta_satisfaccion", "ficha_personal", "giftcard",
  "presupuestos", "historial_producto", "soporte_prioritario",
];
const PRO = [
  ...PREMIUM,
  "dominio_personalizado", "reportes_avanzados", "exportaciones",
  "backups", "api", "soporte_telefonico", "asesoria_personalizada",
];

export const planesIniciales: PlanPlataforma[] = [
  {
    id: 1, slug: "prueba", nombre: "Prueba",
    descripcion: "Período de prueba de 7 días con todas las funciones de Premium",
    precio_mensual: 0, precio_anual: null, precio_promo: null, promo_duracion_meses: 0,
    promo_activa: false, max_profesionales: 5, max_sucursales: 999, max_whatsapp_mes: 100,
    destacado: false, features: PREMIUM, activo: false,
  },
  {
    id: 2, slug: "basico", nombre: "Básico",
    descripcion: "Toma el control de tu negocio",
    precio_mensual: 99, precio_anual: 990, precio_promo: 9, promo_duracion_meses: 3,
    promo_activa: true, max_profesionales: 2, max_sucursales: 1, max_whatsapp_mes: 0,
    destacado: false, features: BASICO, activo: true,
  },
  {
    id: 3, slug: "premium", nombre: "Premium",
    descripcion: "Más seguimiento, mejor atención, mayor control, personalización de tu sitio",
    precio_mensual: 149, precio_anual: 1490, precio_promo: 9, promo_duracion_meses: 3,
    promo_activa: true, max_profesionales: 5, max_sucursales: 999, max_whatsapp_mes: 100,
    destacado: true, features: PREMIUM, activo: true,
  },
  {
    id: 4, slug: "pro", nombre: "Pro",
    descripcion: "Integraciones y herramientas avanzadas para negocios en crecimiento",
    precio_mensual: 449, precio_anual: 4490, precio_promo: null, promo_duracion_meses: 0,
    promo_activa: false, max_profesionales: 15, max_sucursales: 999, max_whatsapp_mes: 500,
    destacado: false, features: PRO, activo: true,
  },
];

/** Fecha YYYY-MM-DD desplazada `dias` desde hoy. */
function dia(dias: number) {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + dias);
  return fecha.toISOString().slice(0, 10);
}

function negocio(
  id: string,
  nombre: string,
  categoria: string,
  ciudad: string,
  plan_slug: string,
  estado: NegocioPlataforma["estado"],
  altaHaceDias: number,
  venceEnDias: number,
  titular: [string, string, string],
  uso: [locales: number, profesionales: number, citas: number],
  accesoHaceDias: number | null
): NegocioPlataforma {
  return {
    id,
    nombre,
    slug: nombre
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, ""),
    categoria,
    ciudad,
    plan_slug,
    estado,
    alta_el: dia(-altaHaceDias),
    vence_el: dia(venceEnDias),
    titular: { nombre: titular[0], email: titular[1], telefono: titular[2] },
    locales: uso[0],
    profesionales: uso[1],
    citas_mes: uso[2],
    ultimo_acceso: accesoHaceDias === null ? null : dia(-accesoHaceDias),
  };
}

export const negociosIniciales: NegocioPlataforma[] = [
  negocio("uptbej5u", "Clínica El Rosal", "Clínica", "Piura", "premium", "activo", 3, 27, ["María Gonzales", "contacto@elrosal.pe", "976645666"], [2, 5, 48], 0),
  negocio("k2m9qx7a", "Barbería El Cairo", "Barbería", "Lima", "pro", "activo", 210, 11, ["Luis Paredes", "luis@elcairo.pe", "987441220"], [3, 12, 612], 0),
  negocio("p8w3nt4c", "Mademoiselle Spa", "Spa", "Lima", "premium", "activo", 160, 4, ["Carla Nuñez", "carla@mademoiselle.pe", "955210334"], [2, 5, 287], 1),
  negocio("r5d7hz2e", "Estética Brillo", "Estética", "Arequipa", "basico", "por_vencer", 95, 2, ["Rosa Quispe", "rosa@brillo.pe", "944781020"], [1, 2, 96], 3),
  negocio("t1v6mj8s", "Dental Sonrisa", "Clínica", "Trujillo", "premium", "activo", 300, 19, ["Dr. Jorge Vela", "jvela@dentalsonrisa.pe", "958332100"], [1, 4, 175], 0),
  negocio("y4b2kc9n", "Uñas & Co", "Manicure/Pedicure", "Lima", "basico", "activo", 60, 15, ["Paola Ríos", "paola@unasyco.pe", "912004500"], [1, 2, 130], 2),
  negocio("h3x8pl5q", "Peluquería Doña Tere", "Peluquería", "Chiclayo", "prueba", "prueba", 4, 3, ["Teresa Campos", "tere@gmail.com", "966120887"], [1, 1, 9], 0),
  negocio("f9s1gr6w", "Barber King", "Barbería", "Piura", "prueba", "prueba", 6, 1, ["Kevin Saldarriaga", "kevin@barberking.pe", "901223344"], [1, 3, 22], 1),
  negocio("m7c4dw2z", "Centro Fisio Vida", "Clínica", "Cusco", "pro", "activo", 420, 25, ["Ana Mamani", "ana@fisiovida.pe", "984556677"], [4, 14, 880], 0),
  negocio("q6n9va3k", "Glamour Studio", "Estética", "Lima", "premium", "suspendido", 230, -12, ["Mónica Torres", "monica@glamour.pe", "933118822"], [2, 5, 0], 15),
  negocio("w2e5ub7r", "Spa Zen Mancora", "Spa", "Máncora", "basico", "suspendido", 140, -30, ["Diego Arce", "diego@spazen.pe", "977665544"], [1, 2, 0], 34),
  negocio("z8k3ox1y", "Barbería Los Pibes", "Barbería", "Lima", "basico", "cancelado", 380, -90, ["Matías Vera", "matias@lospibes.pe", "988776655"], [1, 1, 0], 95),
  negocio("c5j7ef4t", "Podología Andina", "Clínica", "Huancayo", "basico", "por_vencer", 75, 5, ["Elsa Huamán", "elsa@podoandina.pe", "966554433"], [1, 2, 64], 4),
  negocio("n1h4ws9b", "Nails Lab", "Manicure/Pedicure", "Arequipa", "prueba", "prueba", 2, 5, ["Fiorella Lazo", "fio@nailslab.pe", "955443322"], [1, 2, 4], 0),
];

const precio = (slug: string) => planesIniciales.find((plan) => plan.slug === slug)!.precio_mensual;

export const pagosIniciales: PagoSuscripcion[] = negociosIniciales
  .filter((item) => item.plan_slug !== "prueba" && item.estado !== "cancelado")
  .flatMap((item, indice) => {
    const pagos: PagoSuscripcion[] = [];
    for (let mes = 0; mes < 3; mes++) {
      // Los suspendidos dejaron de pagar el último mes.
      if (item.estado === "suspendido" && mes === 0) continue;
      const fecha = new Date();
      fecha.setMonth(fecha.getMonth() - mes);
      fecha.setDate(Math.min(5 + indice, 28));
      pagos.push({
        id: 0,
        negocio_id: item.id,
        negocio_nombre: item.nombre,
        plan_slug: item.plan_slug,
        monto: precio(item.plan_slug),
        metodo: (["yape", "transferencia", "plin", "tarjeta"] as const)[indice % 4],
        periodo: fecha.toISOString().slice(0, 7),
        fecha: fecha.toISOString().slice(0, 10),
        // El pago más reciente de los "por vencer" llegó pero falta confirmarlo.
        confirmado: !(item.estado === "por_vencer" && mes === 0),
        nota: null,
      });
    }
    return pagos;
  })
  .sort((a, b) => b.fecha.localeCompare(a.fecha))
  .map((pago, indice) => ({ ...pago, id: indice + 1 }));

export const accionesIniciales: AccionPlataforma[] = [
  { id: 1, negocio_id: "q6n9va3k", fecha: new Date(Date.now() - 12 * 864e5).toISOString(), autor: "Sistema", descripcion: "Suspendido automáticamente: plan vencido sin pago." },
  { id: 2, negocio_id: "w2e5ub7r", fecha: new Date(Date.now() - 30 * 864e5).toISOString(), autor: "Sistema", descripcion: "Suspendido automáticamente: plan vencido sin pago." },
  { id: 3, negocio_id: "k2m9qx7a", fecha: new Date(Date.now() - 40 * 864e5).toISOString(), autor: "Admin Plataforma", descripcion: "Cambio de plan: Premium → Pro." },
];

const CLAVE = "mock:plataforma:v1";

interface Almacen {
  planes: PlanPlataforma[];
  negocios: NegocioPlataforma[];
  pagos: PagoSuscripcion[];
  acciones: AccionPlataforma[];
}

const inicial = (): Almacen => ({
  planes: planesIniciales,
  negocios: negociosIniciales,
  pagos: pagosIniciales,
  acciones: accionesIniciales,
});

export const almacenPlataforma = {
  leer(): Almacen {
    if (typeof window === "undefined") return inicial();
    try {
      const crudo = window.localStorage.getItem(CLAVE);
      return crudo ? (JSON.parse(crudo) as Almacen) : inicial();
    } catch {
      return inicial();
    }
  },
  guardar(datos: Almacen) {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(CLAVE, JSON.stringify(datos));
    } catch {
      // Almacenamiento bloqueado: el prototipo sigue, sin recordar el cambio.
    }
  },
  reiniciar() {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(CLAVE);
    } catch {
      // Nada que hacer.
    }
  },
};
