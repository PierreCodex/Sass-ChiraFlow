import type { Anuncio, NegocioResumen, TicketSuperadmin } from "./types";

/**
 * Los mismos 10 negocios que ya existen en el panel superadmin de Laravel
 * (SAAS_LIENA-BEN, `localhost:8080/superadmin/negocios`) — copiados 1:1 de
 * esa tabla para que ambos paneles muestren exactamente lo mismo. Orden:
 * más reciente primero, igual que `Negocio::latest()`.
 */
export const negociosMock: NegocioResumen[] = [
  { id: 10, nombre: "Negocio Prueba 007", slug: "negocio-prueba-007", plan: "Pro", categoria: "Barbería", estado: "prueba", suscripcion_vence_el: "2026-08-21" },
  { id: 9, nombre: "ENGLOSSA", slug: "englossa", plan: "Pro", categoria: "Estética", estado: "prueba", suscripcion_vence_el: "2026-08-18" },
  { id: 8, nombre: "EL ADMIN", slug: "el-admin", plan: "Pro", categoria: "Otros", estado: "activa", suscripcion_vence_el: "2026-08-18" },
  { id: 7, nombre: "GABINOOOOO", slug: "gabinooooo", plan: "Pro", categoria: "Estética", estado: "prueba", suscripcion_vence_el: "2026-08-15" },
  { id: 6, nombre: "CLINICA EL ROSAL", slug: "clinica-el-rosal", plan: "Premium", categoria: "Clínica", estado: "prueba", suscripcion_vence_el: "2026-08-14" },
  { id: 5, nombre: "PIERCODEX", slug: "piercodex", plan: "Pro", categoria: "Clínica", estado: "activa", suscripcion_vence_el: "2026-08-10" },
  { id: 4, nombre: "ENGLOBOR", slug: "englobor", plan: "Pro", categoria: "SERVICOS", estado: "activa", suscripcion_vence_el: "2026-07-31" },
  { id: 3, nombre: "barber shof", slug: "barber-shof", plan: "Pro", categoria: "Barbería", estado: "prueba", suscripcion_vence_el: "2026-08-09" },
  { id: 2, nombre: "MAJUUU", slug: "maria-julia-domingues-pena", plan: "Pro", categoria: "Manicure/Pedicure", estado: "activa", suscripcion_vence_el: "2026-07-27" },
  { id: 1, nombre: "Aster Hair Salon", slug: "aster-hair-salon", plan: "Premium", categoria: "Barbería", estado: "activa", suscripcion_vence_el: "2026-09-26" },
];

/** Tickets de soporte abiertos: solo la cuenta, para la tarjeta del dashboard. */
export const ticketsAbiertosMock = 4;

/** Ingresos del mes en curso (pagos con estado "pagado"). */
export const ingresosMesMock = 0;

/** Mismo anuncio que ya está publicado en `superadmin/anuncios` de Laravel. */
export const anunciosMock: Anuncio[] = [
  {
    id: 1,
    titulo: "HOLAAA",
    cuerpo: "ASDASDSAASDASD",
    autor: "Super Administrador",
    creado_en: "2026-07-31T00:00:00",
  },
];

/**
 * Mismos 7 tickets que ya existen en `superadmin/soporte` de Laravel — el
 * conteo de "abiertos" (no cerrados) da 4, igual que la tarjeta del dashboard.
 */
export const ticketsSuperadminMock: TicketSuperadmin[] = [
  {
    id: 7,
    negocio: "CLINICA EL ROSAL",
    asunto: "Solicitud de cambio de plan: Premium",
    prioridad: "media",
    estado: "cerrado",
    respuesta: null,
    respondido_por: null,
  },
  {
    id: 6,
    negocio: "EL ADMIN",
    asunto: "Solicitud de cambio de plan: Premium",
    prioridad: "media",
    estado: "en_proceso",
    respuesta: "YA ESTÁ A",
    respondido_por: "Super Administrador",
  },
  {
    id: 5,
    negocio: "EL ADMIN",
    asunto: "Solicitud de cambio de plan: Premium",
    prioridad: "media",
    estado: "en_proceso",
    respuesta: "YA ESTÁ A",
    respondido_por: "Super Administrador",
  },
  {
    id: 4,
    negocio: "CLINICA EL ROSAL",
    asunto: "Solicitud de cambio de plan: Premium",
    prioridad: "media",
    estado: "abierto",
    respuesta: null,
    respondido_por: null,
  },
  {
    id: 3,
    negocio: "CLINICA EL ROSAL",
    asunto: "Solicitud de cambio de plan: Premium",
    prioridad: "media",
    estado: "abierto",
    respuesta: null,
    respondido_por: null,
  },
  {
    id: 2,
    negocio: "PIERCODEX",
    asunto: "cambiar contraseña",
    prioridad: "media",
    estado: "cerrado",
    respuesta: null,
    respondido_por: null,
  },
  {
    id: 1,
    negocio: "MAJUUU",
    asunto: "cambiar contraseña",
    prioridad: "media",
    estado: "cerrado",
    respuesta: "atendido..",
    respondido_por: "Super Administrador",
  },
];
