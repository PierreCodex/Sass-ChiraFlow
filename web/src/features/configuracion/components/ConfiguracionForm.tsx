"use client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import Alert from "@mui/material/Alert";
import Autocomplete from "@mui/material/Autocomplete";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import CardContent from "@mui/material/CardContent";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import {
  IconBuildingStore,
  IconClock,
  IconPalette,
  IconWorld,
} from "@tabler/icons-react";

import BlankCard from "@/components/shared/BlankCard";
import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import CampoImagenes from "@/components/shared/CampoImagenes";
import { formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";

import { opcionesDeZonas } from "../zonas";
import BarraGuardado from "./BarraGuardado";
import EnlaceTienda from "./EnlaceTienda";
import SeccionCampos from "./SeccionCampos";
import {
  useConfiguracion,
  useGuardarConfiguracion,
} from "../hooks/useConfiguracion";
import {
  CAMPOS_POR_PESTANA,
  configuracionSchema,
  type ConfiguracionFormValues,
} from "../schemas/configuracion.schema";
import type { Configuracion, ConfiguracionPayload } from "../types";
import AvisoError from "@/components/shared/AvisoError";

const PESTANAS = [
  { titulo: "Negocio", Icono: IconBuildingStore },
  { titulo: "Agenda", Icono: IconClock },
  { titulo: "Marca", Icono: IconPalette },
  { titulo: "Sitio público", Icono: IconWorld },
];

/** Campo de color con la misma pinta que en el resto de formularios. */
const CampoColor = ({ id, value, onChange }: any) => (
  <Box
    component="input"
    type="color"
    id={id}
    // El de la columna de `tenants`. El #7c3aed de antes era del Laravel
    // anterior y ya no lo devuelve nadie.
    value={value ?? "#4f46e5"}
    onChange={onChange}
    sx={{
      width: "100%",
      height: 41,
      p: 0.5,
      cursor: "pointer",
      borderRadius: 1,
      border: "1px solid",
      borderColor: "divider",
      bgcolor: "background.paper",
    }}
  />
);

/**
 * Lo que viene de la API, con la forma que espera el formulario.
 *
 * `slug`, `logo_url` y `cover_url` se quedan fuera: son de solo lectura y no
 * hay campo que los edite. `zona_horaria` cae a `America/Lima` si llegara
 * vacía, porque el select no admite un valor que no esté en la lista.
 */
function valoresDesde(configuracion: Configuracion) {
  const { slug, logo_url, cover_url, agenda, zona_horaria, ...resto } =
    configuracion;

  return {
    ...resto,
    zona_horaria: zona_horaria ?? "America/Lima",
    logo: logo_url ? [{ url: logo_url }] : [],
    cover: cover_url ? [{ url: cover_url }] : [],
    modo_intervalo: agenda.modo_intervalo,
    intervalo_min: agenda.intervalo_min,
  };
}

const ConfiguracionForm = () => {
  const [pestana, setPestana] = useState(0);
  const { data, isPending, error } = useConfiguracion();
  const configuracion = data?.configuracion;

  // Las 419 zonas del backend, con su rótulo y su desfase. El cálculo del
  // desfase pasa por `Intl` una vez por zona, así que no se repite por render.
  const zonas = useMemo(
    () => opcionesDeZonas(data?.zonasHorarias ?? []),
    [data?.zonasHorarias]
  );
  const guardar = useGuardarConfiguracion();

  const theme = useTheme();
  // Las pestañas verticales solo tienen sentido cuando hay ancho para una
  // columna aparte; por debajo vuelven a la fila de siempre.
  const columnaLateral = useMediaQuery(theme.breakpoints.up("md"));

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<ConfiguracionFormValues>({
    resolver: yupResolver(configuracionSchema),
  });

  const modoIntervalo = useWatch({ control, name: "modo_intervalo" });

  const pestanasConError = useMemo(() => {
    const conError = new Set<number>();
    Object.entries(CAMPOS_POR_PESTANA).forEach(([indice, campos]) => {
      if (campos.some((campo) => campo in errors)) conError.add(Number(indice));
    });
    return conError;
  }, [errors]);

  // Los valores llegan por red: hay que rellenar el formulario al recibirlos.
  useEffect(() => {
    if (!configuracion) return;
    reset(valoresDesde(configuracion));
  }, [configuracion, reset]);

  const descartar = useCallback(() => {
    if (configuracion) reset(valoresDesde(configuracion));
  }, [configuracion, reset]);

  const onSubmit = handleSubmit(
    (valores) => {
      const { logo, cover, modo_intervalo, intervalo_min, ...campos } = valores;

      const payload: ConfiguracionPayload = {
        ...campos,
        /*
          Los dos campos de agenda viajan JUNTOS: la regla del intervalo se
          apoya en el modo para saber si aplica, así que mandar el intervalo
          solo no hace nada.
        */
        agenda: { modo_intervalo, intervalo_min },
        /*
          El archivo solo si es nuevo. No mandarlo significa «déjalo como
          está», así que quitarlo necesita su bandera: sin ella, vaciar el
          campo no borraría nada y la imagen volvería al recargar.
        */
        logo: logo[0]?.file ?? undefined,
        logo_eliminar: !!configuracion?.logo_url && logo.length === 0,
        cover: cover[0]?.file ?? undefined,
        cover_eliminar: !!configuracion?.cover_url && cover.length === 0,
      };

      guardar.mutate(payload, {
        onError: (err) => {
          const apiError = toApiError(err);
          if (apiError.errors) {
            Object.entries(apiError.errors).forEach(([campo, mensajes]) => {
              setError(campo as keyof ConfiguracionFormValues, {
                message: mensajes[0],
              });
            });
          }
        },
      });
    },
    (erroresValidacion) => {
      const primera = Object.entries(CAMPOS_POR_PESTANA).find(([, campos]) =>
        campos.some((campo) => campo in erroresValidacion),
      );
      if (primera) setPestana(Number(primera[0]));
    },
  );

  if (isPending) {
    return <Skeleton variant="rounded" height={520} />;
  }

  if (error) {
    return <AvisoError error={error} />;
  }

  const errorGeneral = guardar.isError ? toApiError(guardar.error) : null;

  const campoTexto = (
    name: keyof ConfiguracionFormValues,
    label: string,
    extra: Record<string, unknown> = {},
  ) => (
    <>
      <CustomFormLabel htmlFor={name}>{label}</CustomFormLabel>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <CustomTextField
            {...field}
            value={(field.value as string) ?? ""}
            id={name}
            fullWidth
            error={!!errors[name]}
            helperText={errors[name]?.message as string}
            {...extra}
          />
        )}
      />
    </>
  );

  return (
    // El formulario envuelve a la tarjeta, no al revés: la barra de guardado
    // es `position: sticky` y `Card` de MUI lleva `overflow: hidden`, que
    // convierte a la tarjeta en su contenedor de scroll y deja la barra
    // colgada 241 px por debajo de la pantalla en vez de pegada abajo.
    <Box component="form" onSubmit={onSubmit} noValidate>
      <BlankCard>
        <Grid container>
          {/* Navegación de secciones. Vertical en escritorio: escala cuando
              una sección crece, que es donde las pestañas horizontales se
              rompen. */}
          <Grid
            size={{ xs: 12, md: 3 }}
            sx={{
              borderRight: { md: "1px solid" },
              borderBottom: { xs: "1px solid", md: "none" },
              borderColor: { xs: "divider", md: "divider" },
            }}
          >
            <Tabs
              orientation={columnaLateral ? "vertical" : "horizontal"}
              value={pestana}
              onChange={(_, valor) => setPestana(valor)}
              variant={columnaLateral ? "standard" : "scrollable"}
              scrollButtons="auto"
              sx={{
                py: { md: 2 },
                "& .MuiTabs-indicator": {
                  left: { md: 0 },
                  right: { md: "auto" },
                  width: { md: 3 },
                },
                "& .MuiTab-root": {
                  textTransform: "none",
                  minHeight: 48,
                  justifyContent: { md: "flex-start" },
                  alignItems: { md: "center" },
                  px: 3,
                },
              }}
            >
              {PESTANAS.map(({ titulo, Icono }, indice) => (
                <Tab
                  key={titulo}
                  iconPosition="start"
                  icon={<Icono size={19} stroke={1.6} />}
                  label={
                    <Badge
                      color="error"
                      variant="dot"
                      invisible={!pestanasConError.has(indice)}
                      sx={{ "& .MuiBadge-badge": { right: -8, top: 2 } }}
                    >
                      {titulo}
                    </Badge>
                  }
                />
              ))}
            </Tabs>
          </Grid>

          <Grid size={{ xs: 12, md: 9 }}>
            <CardContent sx={{ ...formularioCompacto, p: 3, minHeight: 420 }}>
              {errorGeneral && !errorGeneral.errors ? (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {errorGeneral.message}
                </Alert>
              ) : null}

              {/* ---------------------------------------------- Negocio */}
              <Box hidden={pestana !== 0}>
                <SeccionCampos
                  titulo="Identidad"
                  descripcion="El nombre y la descripción que ven tus clientes en la página de reservas."
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 7 }}>
                      {campoTexto("nombre", "Nombre del negocio")}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 5 }}>
                      <CustomFormLabel htmlFor="zona_horaria">
                        Zona horaria
                      </CustomFormLabel>
                      {/*
                        Con búsqueda y no un `select` plano: son 419 opciones y
                        recorrerlas con la rueda no es navegar. El desfase va en
                        el rótulo porque «America/Lima» no le dice nada a quien
                        no conoce la nomenclatura IANA, y «GMT-5» sí.
                      */}
                      <Controller
                        name="zona_horaria"
                        control={control}
                        render={({ field }) => (
                          <Autocomplete
                            /*
                              El `id` va aquí y no en el CustomTextField: el
                              Autocomplete genera el suyo para su input y pisa
                              el que le pongas al campo, así que la etiqueta
                              apuntaría a un id que no existe.
                            */
                            id="zona_horaria"
                            options={zonas}
                            groupBy={(o) => o.region}
                            getOptionLabel={(o) =>
                              o.desfase ? `${o.etiqueta} (${o.desfase})` : o.etiqueta
                            }
                            isOptionEqualToValue={(o, v) => o.valor === v.valor}
                            value={
                              zonas.find((o) => o.valor === field.value) ?? null
                            }
                            onChange={(_, opcion) =>
                              field.onChange(opcion?.valor ?? "")
                            }
                            disabled={zonas.length === 0}
                            renderInput={(params) => (
                              <CustomTextField
                                {...params}
                                error={!!errors.zona_horaria}
                                helperText={errors.zona_horaria?.message}
                              />
                            )}
                          />
                        )}
                      />
                    </Grid>
                    <Grid size={12}>
                      {campoTexto("descripcion", "Descripción", {
                        multiline: true,
                        rows: 3,
                        helperText:
                          errors.descripcion?.message ??
                          "Se muestra en la página pública de reservas.",
                      })}
                    </Grid>
                  </Grid>
                </SeccionCampos>

                <SeccionCampos
                  titulo="Contacto"
                  descripcion="Cómo te escriben tus clientes. El WhatsApp es por donde salen los recordatorios."
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {campoTexto("email", "Email", { type: "email" })}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {campoTexto("telefono", "Teléfono")}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {campoTexto("whatsapp", "WhatsApp")}
                    </Grid>
                  </Grid>
                </SeccionCampos>

                <SeccionCampos
                  titulo="Ubicación"
                  descripcion="Dónde te encuentran. Las coordenadas sitúan el mapa de la tienda."
                  sinSeparador
                >
                  <Grid container spacing={2}>
                    <Grid size={12}>
                      {campoTexto("direccion", "Dirección")}
                    </Grid>
                    <Grid size={12}>
                      {campoTexto(
                        "informacion_adicional",
                        "Información adicional",
                      )}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {campoTexto("latitud", "Latitud", { type: "number" })}
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      {campoTexto("longitud", "Longitud", { type: "number" })}
                    </Grid>
                  </Grid>
                </SeccionCampos>
              </Box>

              {/* ---------------------------------------------- Agenda */}
              <Box hidden={pestana !== 1}>
                <SeccionCampos
                  titulo="Horario de atención"
                  descripcion="Se aplica a los profesionales que no tienen horario propio."
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 5 }}>
                      {campoTexto("horario_apertura", "Apertura", {
                        type: "time",
                      })}
                    </Grid>
                    <Grid size={{ xs: 6, sm: 5 }}>
                      {campoTexto("horario_cierre", "Cierre", { type: "time" })}
                    </Grid>
                  </Grid>
                </SeccionCampos>

                <SeccionCampos
                  titulo="Huecos de reserva"
                  descripcion="Cada cuánto se le ofrece un turno al cliente en la tienda."
                  sinSeparador
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 7 }}>
                      <CustomFormLabel htmlFor="modo_intervalo">
                        Cada cuánto se ofrece un turno
                      </CustomFormLabel>
                      <Controller
                        name="modo_intervalo"
                        control={control}
                        render={({ field }) => (
                          <CustomTextField
                            {...field}
                            value={field.value ?? "duracion_servicio"}
                            select
                            id="modo_intervalo"
                            fullWidth
                          >
                            <MenuItem value="duracion_servicio">
                              Según la duración del servicio
                            </MenuItem>
                            <MenuItem value="fijo">Cada N minutos</MenuItem>
                          </CustomTextField>
                        )}
                      />
                    </Grid>

                    {modoIntervalo === "fijo" ? (
                      <Grid size={{ xs: 12, sm: 5 }}>
                        {campoTexto("intervalo_min", "Intervalo (min)", {
                          type: "number",
                        })}
                      </Grid>
                    ) : null}

                    <Grid size={12}>
                      <Alert severity="info" variant="outlined">
                        {modoIntervalo === "fijo"
                          ? "Rejilla fija: más opciones para el cliente, pero puede dejar huecos que nadie llene."
                          : "Los turnos se encadenan con la duración de cada servicio, para no dejar huecos muertos."}
                      </Alert>
                    </Grid>
                  </Grid>
                </SeccionCampos>
              </Box>

              {/* ---------------------------------------------- Marca */}
              <Box hidden={pestana !== 2}>
                <SeccionCampos
                  titulo="Imágenes"
                  descripcion="El logo y la cabecera de tu página pública."
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CustomFormLabel htmlFor="logo">Logo</CustomFormLabel>
                      <Controller
                        name="logo"
                        control={control}
                        render={({ field }) => (
                          <CampoImagenes
                            valor={field.value ?? []}
                            onChange={field.onChange}
                            max={1}
                            ayuda="Máx. 2 MB. Admite SVG."
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 12, sm: 6 }}>
                      <CustomFormLabel htmlFor="cover">Portada</CustomFormLabel>
                      <Controller
                        name="cover"
                        control={control}
                        render={({ field }) => (
                          <CampoImagenes
                            valor={field.value ?? []}
                            onChange={field.onChange}
                            max={1}
                            ayuda="Máx. 4 MB. Cabecera de la página pública."
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </SeccionCampos>

                <SeccionCampos
                  titulo="Colores"
                  descripcion="Se usan en la página pública de reservas, no en este panel."
                  sinSeparador
                >
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6, sm: 4 }}>
                      <CustomFormLabel htmlFor="color_primario">
                        Primario
                      </CustomFormLabel>
                      <Controller
                        name="color_primario"
                        control={control}
                        render={({ field }) => (
                          <CampoColor
                            id="color_primario"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </Grid>

                    <Grid size={{ xs: 6, sm: 4 }}>
                      <CustomFormLabel htmlFor="color_secundario">
                        Secundario
                      </CustomFormLabel>
                      <Controller
                        name="color_secundario"
                        control={control}
                        render={({ field }) => (
                          <CampoColor
                            id="color_secundario"
                            value={field.value}
                            onChange={field.onChange}
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </SeccionCampos>
              </Box>

              {/* ---------------------------------------- Sitio público */}
              <Box hidden={pestana !== 3}>
                <SeccionCampos
                  titulo="Tu enlace"
                  descripcion="La dirección que repartes. Vive aquí y no encima de todas las pestañas: solo hace falta cuando vienes a esto."
                >
                  <EnlaceTienda
                    slug={configuracion!.slug}
                    nombreNegocio={configuracion!.nombre}
                    variante="compacto"
                  />
                </SeccionCampos>

                <SeccionCampos
                  titulo="Visibilidad"
                  descripcion="Si apagas la página, el enlace deja de responder para tus clientes."
                >
                  <Stack spacing={1}>
                    <Controller
                      name="sitio_publico_activo"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={!!field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="Página pública de reservas activa"
                        />
                      )}
                    />

                    <Controller
                      name="mostrar_en_marketplace"
                      control={control}
                      render={({ field }) => (
                        <FormControlLabel
                          control={
                            <Switch
                              checked={!!field.value}
                              onChange={(e) => field.onChange(e.target.checked)}
                            />
                          }
                          label="Aparecer en el marketplace"
                        />
                      )}
                    />
                  </Stack>
                </SeccionCampos>

                <SeccionCampos
                  titulo="Términos del servicio"
                  descripcion="Tus condiciones de reserva y cancelación, tal como las verá el cliente."
                  sinSeparador
                >
                  {campoTexto("terminos_servicio", "Texto", {
                    multiline: true,
                    rows: 6,
                  })}
                </SeccionCampos>
              </Box>
            </CardContent>
          </Grid>
        </Grid>
      </BlankCard>

      <BarraGuardado
        visible={isDirty}
        guardando={guardar.isPending}
        onDescartar={descartar}
      />
    </Box>
  );
};

export default ConfiguracionForm;
