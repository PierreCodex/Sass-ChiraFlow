/** Mismas categorías del seeder de Laravel (`BusinessCategory`). */
export const categoriasNegocioMock = [
  { id: 1, nombre: "Barbería", slug: "barberia" },
  { id: 2, nombre: "Estética", slug: "estetica" },
  { id: 3, nombre: "Spa", slug: "spa" },
  { id: 4, nombre: "Clínica", slug: "clinica" },
  { id: 5, nombre: "Peluquería", slug: "peluqueria" },
  { id: 6, nombre: "Manicure/Pedicure", slug: "manicure" },
  { id: 7, nombre: "Otros", slug: "otros" },
];

/** Mismas opciones que el `<select name="cantidad_profesionales">` del Blade. */
export const CANTIDAD_PROFESIONALES = [
  { value: 1, label: "Soy profesional independiente" },
  { value: 2, label: "2" },
  { value: 5, label: "3 - 5" },
  { value: 15, label: "6 - 15" },
  { value: 16, label: "+16" },
];

/** Mismos países del selector de teléfono del Blade. */
export const PAISES_TELEFONO = [
  { code: "+51", flag: "🇵🇪", label: "Perú" },
  { code: "+56", flag: "🇨🇱", label: "Chile" },
  { code: "+52", flag: "🇲🇽", label: "México" },
  { code: "+54", flag: "🇦🇷", label: "Argentina" },
  { code: "+57", flag: "🇨🇴", label: "Colombia" },
  { code: "+593", flag: "🇪🇨", label: "Ecuador" },
  { code: "+591", flag: "🇧🇴", label: "Bolivia" },
  { code: "+34", flag: "🇪🇸", label: "España" },
  { code: "+1", flag: "🇺🇸", label: "Estados Unidos" },
];
