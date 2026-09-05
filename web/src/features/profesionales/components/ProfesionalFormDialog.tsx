"use client";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";

import Alert from "@mui/material/Alert";
import Badge from "@mui/material/Badge";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Divider from "@mui/material/Divider";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import Switch from "@mui/material/Switch";
import Tab from "@mui/material/Tab";
import Tabs from "@mui/material/Tabs";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";

import CustomFormLabel from "@/components/forms/theme-elements/CustomFormLabel";
import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import CampoImagenes from "@/components/shared/CampoImagenes";
import { dialogoResponsive, formularioCompacto } from "@/components/shared/estilos-formulario";
import { toApiError } from "@/lib/api/client";
import { normalizarTelefono, PREFIJO_TELEFONO, soloDigitos } from "@/features/auth/types";
import { useRoles } from "@/features/roles/hooks/useRoles";
import {
  PAGO_INCLUYE_COMISION,
  PAGO_INCLUYE_SUELDO,
  PERIODOS_PAGO,
  TIPOS_PAGO,
  horarioParaFormulario,
  horarioPorDefecto,
} from "../constants";
import {
  useActualizarProfesional,
  useCrearProfesional,
} from "../hooks/useProfesionales";
import {
  CAMPOS_POR_PESTANA,
  crearProfesionalSchema,
  valoresIniciales,
  type ProfesionalFormValues,
} from "../schemas/profesional.schema";
import type { Profesional, ProfesionalPayload } from "../types";
import HorarioTab from "./HorarioTab";

interface Props {
  abierto: boolean;
  profesional?: Profesional | null;
  onCerrar: () => void;
}

const PESTANAS = ["Datos", "Pago", "Horario"];

/**
 * Los tres interruptores de la pestaña Datos van en recuadro y no sueltos:
 * cada uno decide algo con consecuencias —el cupo del plan, la tienda
 * pública, una credencial nueva— y una casilla a pelo no da sitio para
 * explicarlo.
 */
const recuadro = (conError: boolean) => ({
  p: 2,
  borderRadius: 1,
  border: "1px solid",
  borderColor: conError ? "error.main" : "divider",
});

const ProfesionalFormDialog = ({ abierto, profesional, onCerrar }: Props) => {
  const [pestana, setPestana] = useState(0);

  const esEdicion = !!profesional;

  /*
    A quien YA tiene cuenta no se le toca desde aquí: cambiarle el correo o el
    rol se hace en /usuarios, y el backend ignora el objeto `usuario` en ese
    caso. Ofrecerlo sería un formulario que acepta cambios y no los guarda.
  */
  const tieneCuenta = !!profesional?.usuario;

  // El select de rol es dinámico: el negocio tiene los tres de sistema más los
  // que cree el dueño, y sin la lista no se le puede asignar ninguno.
  const {
    data: roles,
    isPending: rolesCargando,
    isError: rolesFallaron,
  } = useRoles();
  const crear = useCrearProfesional();
  const actualizar = useActualizarProfesional();
  const mutacion = esEdicion ? actualizar : crear;

  const schema = useMemo(
    () => crearProfesionalSchema(tieneCuenta),
    [tieneCuenta]
  );

  const {
    control,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<ProfesionalFormValues>({
    resolver: yupResolver(schema),
    defaultValues: valoresIniciales,
  });

  const tipoPago = useWatch({ control, name: "tipo_pago" });
  const darAcceso = useWatch({ control, name: "dar_acceso" });
  const muestraComision = PAGO_INCLUYE_COMISION.includes(tipoPago);
  const muestraSueldo = PAGO_INCLUYE_SUELDO.includes(tipoPago);

  /**
   * En qué pestaña vive un campo. `-1` si no está en ninguna.
   *
   * Se usa para saltar a la pestaña del primer error, y hace falta tanto para
   * los de yup como para los 422 del servidor.
   */
  const pestanaDelCampo = (campo: string) =>
    Number(
      Object.entries(CAMPOS_POR_PESTANA).find(([, campos]) =>
        campos.includes(campo)
      )?.[0] ?? -1
    );

  /** Pestañas que tienen algún error, para marcarlas con un punto. */
  const pestanasConError = useMemo(() => {
    const conError = new Set<number>();
    Object.entries(CAMPOS_POR_PESTANA).forEach(([indice, campos]) => {
      if (campos.some((campo) => campo in errors)) conError.add(Number(indice));
    });
    return conError;
  }, [errors]);

  useEffect(() => {
    if (!abierto) return;

    crear.reset();
    actualizar.reset();
    setPestana(0);

    reset(
      profesional
        ? {
            nombre: profesional.nombre,
            foto: profesional.foto_url ? [{ url: profesional.foto_url }] : [],
            // Se guarda como `+51987654321` y se teclea en 9 dígitos.
            telefono: profesional.telefono
              ? soloDigitos(profesional.telefono).slice(-9)
              : null,
            cargo: profesional.cargo,
            activo: profesional.activo,
            atiende: profesional.atiende,
            // La casilla arranca apagada también al editar: es una acción que
            // se toma hoy, no un estado de la ficha.
            dar_acceso: false,
            acceso_email: null,
            acceso_rol_id: 0,
            tipo_pago: profesional.tipo_pago,
            comision_porcentaje: profesional.comision_porcentaje,
            monto_sueldo: profesional.monto_sueldo,
            periodo_pago: profesional.periodo_pago,
            horario: profesional.horario?.length
              ? horarioParaFormulario(profesional.horario)
              : horarioPorDefecto(),
            excepciones: profesional.excepciones ?? [],
          }
        : valoresIniciales
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierto, profesional, reset]);

  const onSubmit = handleSubmit(
    (valores) => {
      const payload: ProfesionalPayload = {
        nombre: valores.nombre,
        foto: valores.foto[0]?.file ?? null,
        // No mandar el archivo significa "déjala como está", así que quitarla
        // necesita bandera propia.
        foto_eliminar:
          esEdicion && !!profesional.foto_url && valores.foto.length === 0,
        telefono: valores.telefono ? normalizarTelefono(valores.telefono) : null,
        cargo: valores.cargo,
        activo: valores.activo,
        atiende: valores.atiende,
        tipo_pago: valores.tipo_pago,
        comision_porcentaje: valores.comision_porcentaje,
        // Solo se envían si el tipo de pago los usa.
        monto_sueldo: muestraSueldo ? valores.monto_sueldo : null,
        periodo_pago: muestraSueldo ? valores.periodo_pago : null,
        horario: valores.horario as ProfesionalPayload["horario"],
        excepciones: valores.excepciones as ProfesionalPayload["excepciones"],
      };

      /*
        La casilla «darle acceso al panel». Viaja SOLO cuando está marcada: si
        se mandara siempre, aunque fuera vacía, el backend intentaría crear una
        cuenta sin correo en cada guardado.
      */
      if (!tieneCuenta && valores.dar_acceso && valores.acceso_email) {
        payload.usuario = {
          email: valores.acceso_email,
          rol_id: valores.acceso_rol_id,
        };
      }

      const alTerminar = {
        onSuccess: () => onCerrar(),
        onError: (error: unknown) => {
          const apiError = toApiError(error);
          if (apiError.errors) {
            /*
              A qué pestaña saltar. Se calcula con las claves que manda el
              servidor y no leyendo `errors` después, porque el 422 llega de
              forma asíncrona: cuando esto corre, `formState` todavía no se ha
              propagado a este render.

              Sin esto el diálogo se quedaba abierto sin decir nada cuando el
              error caía en una pestaña que no estabas mirando — el caso del
              422 del cupo del plan, que cae en «Está de alta».
            */
            let saltarA = Infinity;

            Object.entries(apiError.errors).forEach(([campo, mensajes]) => {
              /*
                El backend valida el objeto anidado y devuelve `usuario.email`
                y `usuario.rol_id`; en pantalla esos campos se llaman
                `acceso_*`. Sin esta traducción, el 422 del correo repetido
                —el más probable de los dos— no se pintaría en ninguna parte.
              */
              const destino =
                campo === "usuario.email"
                  ? "acceso_email"
                  : campo === "usuario.rol_id"
                    ? "acceso_rol_id"
                    : campo;

              setError(destino as keyof ProfesionalFormValues, {
                message: mensajes[0],
              });

              const pestanaDelError = pestanaDelCampo(destino);
              if (pestanaDelError >= 0 && pestanaDelError < saltarA) {
                saltarA = pestanaDelError;
              }
            });

            if (Number.isFinite(saltarA)) setPestana(saltarA);
          }
        },
      };

      if (esEdicion) {
        actualizar.mutate({ id: profesional.id, payload }, alTerminar);
      } else {
        crear.mutate(payload, alTerminar);
      }
    },
    (erroresValidacion) => {
      // Saltar a la primera pestaña con errores, para que no queden ocultos.
      const pestanas = Object.keys(erroresValidacion)
        .map(pestanaDelCampo)
        .filter((indice) => indice >= 0);

      if (pestanas.length > 0) setPestana(Math.min(...pestanas));
    }
  );

  const errorGeneral = mutacion.isError ? toApiError(mutacion.error) : null;

  return (
    <Dialog
      sx={dialogoResponsive}
      open={abierto}
      onClose={mutacion.isPending ? undefined : onCerrar}
      fullWidth
      maxWidth="md"
    >
      <Box
        component="form"
        onSubmit={onSubmit}
        noValidate
        sx={{
          display: "flex",
          flexDirection: "column",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
        }}
      >
        <DialogTitle component="div" sx={{ pb: 0 }}>
          <Typography variant="h5" fontWeight={600}>
            {esEdicion ? "Editar profesional" : "Nuevo profesional"}
          </Typography>

          <Tabs
            value={pestana}
            onChange={(_, valor) => setPestana(valor)}
            sx={{ mt: 1 }}
          >
            {PESTANAS.map((titulo, indice) => (
              <Tab
                key={titulo}
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
        </DialogTitle>

        <Divider />

        {/* minHeight: sin esto el diálogo encoge al pasar a "Pago" (que tiene
            pocos campos) y los botones saltan bajo el cursor. */}
        <DialogContent sx={{ ...formularioCompacto, minHeight: 600 }}>
          {errorGeneral && !errorGeneral.errors ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorGeneral.message}
            </Alert>
          ) : null}

          {/* ---------------------------------------------- Datos */}
          <Box hidden={pestana !== 0}>
            <Grid container spacing={2}>
              <Grid size={12}>
                <CustomFormLabel htmlFor="nombre" sx={{ mt: 0 }}>
                  Nombre
                </CustomFormLabel>
                <Controller
                  name="nombre"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      id="nombre"
                      fullWidth
                      error={!!errors.nombre}
                      helperText={errors.nombre?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={12}>
                <CustomFormLabel htmlFor="foto">
                  Foto del profesional
                </CustomFormLabel>
                <Controller
                  name="foto"
                  control={control}
                  render={({ field }) => (
                    <CampoImagenes
                      valor={field.value}
                      onChange={field.onChange}
                      max={1}
                      textoBoton="Elegir foto"
                      ayuda="Haz clic para seleccionar una foto desde tu computadora."
                      error={errors.foto?.message}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel htmlFor="telefono">Teléfono</CustomFormLabel>
                <Controller
                  name="telefono"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      value={field.value ?? ""}
                      id="telefono"
                      fullWidth
                      placeholder="987 654 321"
                      error={!!errors.telefono}
                      helperText={errors.telefono?.message}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              {PREFIJO_TELEFONO}
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  )}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel htmlFor="cargo">Cargo</CustomFormLabel>
                <Controller
                  name="cargo"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField
                      {...field}
                      value={field.value ?? ""}
                      id="cargo"
                      fullWidth
                    />
                  )}
                />
              </Grid>

              {/*
                «Atiende» ya NO habla del plan. Desde que usuarios y
                profesionales son cosas distintas, este interruptor solo decide
                si la persona sale en la tienda pública: un barbero al que solo
                le reservan por teléfono cuesta lo mismo que uno que recibe
                reservas por la web. El cupo lo consume estar de alta, y por eso
                el 422 del tope cae abajo, en «Está de alta».
              */}
              <Grid size={12}>
                <Box sx={recuadro(false)}>
                  <Controller
                    name="atiende"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        sx={{ m: 0 }}
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label="Se puede reservar con esta persona por internet"
                      />
                    )}
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
                    Aparece en tu tienda pública y tus clientes pueden elegirla
                    al reservar. Apagado sigue teniendo agenda: solo que las
                    citas se las creas tú.
                  </Typography>
                </Box>
              </Grid>

              {/*
                Aquí cae el 422 del cupo del plan: el cupo cuenta fichas
                ACTIVAS, sin mirar roles ni `atiende`. Por eso el interruptor
                lleva recuadro propio y el mensaje de error se pinta debajo, en
                vez de esconderse en un `helperText` de casilla.
              */}
              <Grid size={12}>
                <Box sx={recuadro(!!errors.activo)}>
                  <Controller
                    name="activo"
                    control={control}
                    render={({ field }) => (
                      <FormControlLabel
                        sx={{ m: 0 }}
                        control={
                          <Switch
                            checked={field.value}
                            onChange={(e) => field.onChange(e.target.checked)}
                          />
                        }
                        label="Está de alta"
                      />
                    )}
                  />
                  <Typography
                    variant="body2"
                    color={errors.activo ? "error" : "textSecondary"}
                    sx={{ mt: 0.5 }}
                  >
                    {errors.activo?.message ??
                      "Ocupa una plaza de tu plan. Quien solo entra al panel —recepción, administración— no aparece en esta lista y no ocupa ninguna."}
                  </Typography>
                </Box>
              </Grid>

              {/* ------------------------------- Acceso al panel */}
              <Grid size={12}>
                <Box sx={recuadro(!!errors.acceso_email || !!errors.acceso_rol_id)}>
                  {tieneCuenta ? (
                    /*
                      Ya entra al sistema. No se le edita desde aquí —el
                      backend ignora el objeto `usuario` en ese caso—, así que
                      se dice qué correo usa y dónde se cambia. Un formulario
                      que acepta cambios y no los guarda es peor que uno que no
                      los ofrece.
                    */
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle2" fontWeight={600}>
                        Entra al panel como {profesional!.usuario!.email}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        Su rol es «{profesional!.usuario!.rol?.nombre ?? "—"}».
                        Para cambiarle el correo, el rol o quitarle el acceso,
                        ve a Usuarios.
                      </Typography>
                    </Stack>
                  ) : (
                    <>
                      <Controller
                        name="dar_acceso"
                        control={control}
                        render={({ field }) => (
                          <FormControlLabel
                            sx={{ m: 0 }}
                            control={
                              <Checkbox
                                checked={field.value}
                                onChange={(e) =>
                                  field.onChange(e.target.checked)
                                }
                              />
                            }
                            label="Darle acceso al panel"
                          />
                        )}
                      />
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ mt: 0.5 }}
                      >
                        Opcional. La mayoría de los profesionales no entran al
                        sistema; márcalo solo si esta persona va a ver su agenda
                        o trabajar en el panel.
                      </Typography>

                      {darAcceso ? (
                        <Grid container spacing={2} sx={{ mt: 0.5 }}>
                          <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomFormLabel htmlFor="acceso_email" sx={{ mt: 0 }}>
                              Correo
                            </CustomFormLabel>
                            <Controller
                              name="acceso_email"
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  {...field}
                                  value={field.value ?? ""}
                                  id="acceso_email"
                                  type="email"
                                  fullWidth
                                  autoComplete="off"
                                  error={!!errors.acceso_email}
                                  helperText={
                                    errors.acceso_email?.message ??
                                    "Le llegará una invitación para crear su contraseña."
                                  }
                                />
                              )}
                            />
                          </Grid>

                          <Grid size={{ xs: 12, sm: 6 }}>
                            <CustomFormLabel htmlFor="acceso_rol_id" sx={{ mt: 0 }}>
                              Rol
                            </CustomFormLabel>
                            <Controller
                              name="acceso_rol_id"
                              control={control}
                              render={({ field }) => (
                                <CustomTextField
                                  {...field}
                                  select
                                  id="acceso_rol_id"
                                  fullWidth
                                  disabled={rolesCargando || rolesFallaron}
                                  error={!!errors.acceso_rol_id || rolesFallaron}
                                  helperText={
                                    rolesFallaron
                                      ? "No se pudieron cargar los roles. Recarga la página o inténtalo en un momento."
                                      : errors.acceso_rol_id?.message
                                  }
                                  slotProps={{ select: { displayEmpty: true } }}
                                >
                                  {/* Los roles los define el negocio: los tres
                                      de sistema más los que cree el dueño. */}
                                  <MenuItem value={0}>
                                    {rolesCargando
                                      ? "Cargando roles…"
                                      : rolesFallaron
                                        ? "Sin roles disponibles"
                                        : "Elige un rol"}
                                  </MenuItem>
                                  {(roles ?? []).map((rol) => (
                                    <MenuItem key={rol.id} value={rol.id}>
                                      {rol.nombre}
                                    </MenuItem>
                                  ))}
                                </CustomTextField>
                              )}
                            />
                          </Grid>
                        </Grid>
                      ) : null}
                    </>
                  )}
                </Box>
              </Grid>

            </Grid>
          </Box>

          {/* ---------------------------------------------- Pago */}
          <Box hidden={pestana !== 1}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              Pago / comisión
            </Typography>

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <CustomFormLabel htmlFor="tipo_pago" sx={{ mt: 0 }}>
                  Tipo de pago
                </CustomFormLabel>
                <Controller
                  name="tipo_pago"
                  control={control}
                  render={({ field }) => (
                    <CustomTextField {...field} select id="tipo_pago" fullWidth>
                      {Object.entries(TIPOS_PAGO).map(([valor, label]) => (
                        <MenuItem key={valor} value={valor}>
                          {label}
                        </MenuItem>
                      ))}
                    </CustomTextField>
                  )}
                />
              </Grid>

              {muestraComision ? (
                <Grid size={{ xs: 12, sm: 6 }}>
                  <CustomFormLabel htmlFor="comision_porcentaje" sx={{ mt: 0 }}>
                    % comisión
                  </CustomFormLabel>
                  <Controller
                    name="comision_porcentaje"
                    control={control}
                    render={({ field }) => (
                      <CustomTextField
                        {...field}
                        id="comision_porcentaje"
                        type="number"
                        fullWidth
                        error={!!errors.comision_porcentaje}
                        helperText={errors.comision_porcentaje?.message}
                        slotProps={{
                          input: {
                            endAdornment: (
                              <InputAdornment position="end">%</InputAdornment>
                            ),
                          },
                        }}
                      />
                    )}
                  />
                </Grid>
              ) : null}

              {muestraSueldo ? (
                <>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="monto_sueldo">
                      Monto sueldo
                    </CustomFormLabel>
                    <Controller
                      name="monto_sueldo"
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          value={field.value ?? ""}
                          id="monto_sueldo"
                          type="number"
                          fullWidth
                          error={!!errors.monto_sueldo}
                          helperText={errors.monto_sueldo?.message}
                          slotProps={{
                            input: {
                              startAdornment: (
                                <InputAdornment position="start">
                                  S/
                                </InputAdornment>
                              ),
                            },
                          }}
                        />
                      )}
                    />
                  </Grid>

                  <Grid size={{ xs: 12, sm: 6 }}>
                    <CustomFormLabel htmlFor="periodo_pago">
                      Período
                    </CustomFormLabel>
                    <Controller
                      name="periodo_pago"
                      control={control}
                      render={({ field }) => (
                        <CustomTextField
                          {...field}
                          value={field.value ?? ""}
                          select
                          id="periodo_pago"
                          fullWidth
                          error={!!errors.periodo_pago}
                          helperText={errors.periodo_pago?.message}
                          slotProps={{ select: { displayEmpty: true } }}
                        >
                          <MenuItem value="">Elige un período</MenuItem>
                          {Object.entries(PERIODOS_PAGO).map(
                            ([valor, label]) => (
                              <MenuItem key={valor} value={valor}>
                                {label}
                              </MenuItem>
                            )
                          )}
                        </CustomTextField>
                      )}
                    />
                  </Grid>
                </>
              ) : null}
            </Grid>
          </Box>

          {/* ---------------------------------------------- Horario */}
          <Box hidden={pestana !== 2}>
            <HorarioTab control={control} errors={errors} />
          </Box>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 3 }}>
          <Stack direction="row" spacing={1}>
            <Button
              type="submit"
              variant="contained"
              disabled={mutacion.isPending}
            >
              {mutacion.isPending
                ? "Guardando…"
                : esEdicion
                  ? "Actualizar"
                  : "Guardar"}
            </Button>
            <Button
              onClick={onCerrar}
              color="inherit"
              disabled={mutacion.isPending}
            >
              Cancelar
            </Button>
          </Stack>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default ProfesionalFormDialog;
