"use client";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import Box from "@mui/material/Box";
import Checkbox from "@mui/material/Checkbox";
import Chip from "@mui/material/Chip";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { IconChevronDown } from "@tabler/icons-react";

import { ETIQUETAS_MODULO, GRUPOS_MODULOS } from "../modulos";
import type { MatrizPermisos as Matriz, NivelPermiso } from "../types";

interface Props {
  permisos: Matriz;
  /** La lista que manda el backend, fuera de `data`. */
  modulos: string[];
  onChange: (permisos: Matriz) => void;
  /** Los roles de sistema no editables se enseñan, no se tocan. */
  soloLectura?: boolean;
}

/**
 * Los permisos de un rol: un acordeón por bloque y, dentro, una tabla con una
 * casilla por nivel.
 *
 * Las dos casillas se leen así: **Ver** es «tiene acceso» y **Gestionar** es
 * «además puede escribir». Quitar Ver retira el módulo entero; quitar
 * Gestionar lo deja en solo lectura.
 *
 * **Dos columnas y no cuatro.** El backend guarda dos niveles por módulo —`ver`
 * y `gestionar`— y descartó los verbos CRUD a propósito: nadie en una barbería
 * quiere «puede crear clientes pero no borrarlos», y multiplica la matriz por
 * dos. Pintar Crear/Editar/Eliminar aquí sería inventar una distinción que no
 * se guarda: marcar solo «Crear» acabaría escribiendo `gestionar` y al reabrir
 * saldrían las tres marcadas.
 *
 * **`Gestionar` implica `Ver`** —es la regla del backend, donde `gestionar`
 * incluye `ver` y los listados se anotan una sola vez—, así que marcar
 * Gestionar marca también Ver. Pero Ver **no** se bloquea: quitarla retira el
 * módulo entero, que es lo que uno espera al desmarcar «tiene acceso».
 */
export default function MatrizPermisos({
  permisos,
  modulos,
  onChange,
  soloLectura = false,
}: Props) {
  const nivel = (modulo: string): NivelPermiso | null =>
    permisos[modulo] ?? null;

  const poner = (modulo: string, valor: NivelPermiso | null) =>
    onChange({ ...permisos, [modulo]: valor });

  /*
    Los módulos que el backend manda y no están en ningún bloque. No debería
    pasar, pero si el backend añade uno y aquí no se agrupa, es mejor que
    aparezca suelto al final que desaparecer de la pantalla sin que nadie lo
    note — un permiso invisible se queda sin repartir.
  */
  const agrupados = new Set(GRUPOS_MODULOS.flatMap((g) => g.modulos as string[]));
  const sueltos = modulos.filter((m) => !agrupados.has(m));

  const bloques = [
    ...GRUPOS_MODULOS.map((g) => ({
      titulo: g.titulo,
      descripcion: g.descripcion,
      // Solo los que el backend reconoce: si quita uno, deja de pintarse.
      modulos: g.modulos.filter((m) => modulos.includes(m)),
    })),
    ...(sueltos.length
      ? [{ titulo: "Otros", descripcion: "Módulos nuevos.", modulos: sueltos }]
      : []),
  ].filter((b) => b.modulos.length > 0);

  return (
    <Box>
      {bloques.map((bloque) => {
        const conAcceso = bloque.modulos.filter((m) => nivel(m) !== null).length;

        return (
          <Accordion
            key={bloque.titulo}
            disableGutters
            elevation={0}
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              mb: 1,
              "&::before": { display: "none" },
            }}
          >
            <AccordionSummary expandIcon={<IconChevronDown size={18} />}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ width: "100%", pr: 1 }}
              >
                <Box>
                  <Typography variant="body2" fontWeight={600}>
                    {bloque.titulo}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {bloque.descripcion}
                  </Typography>
                </Box>
                <Chip
                  size="small"
                  variant="outlined"
                  color={conAcceso ? "primary" : "default"}
                  label={
                    conAcceso
                      ? `${conAcceso} de ${bloque.modulos.length}`
                      : "Sin acceso"
                  }
                />
              </Stack>
            </AccordionSummary>

            <AccordionDetails sx={{ pt: 0 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <Typography variant="caption" fontWeight={600}>
                        Módulo
                      </Typography>
                    </TableCell>
                    <TableCell align="center" width={90}>
                      <Typography variant="caption" fontWeight={600}>
                        Ver
                      </Typography>
                    </TableCell>
                    <TableCell align="center" width={110}>
                      <Typography variant="caption" fontWeight={600}>
                        Gestionar
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {bloque.modulos.map((modulo) => {
                    const actual = nivel(modulo);
                    const gestiona = actual === "gestionar";

                    return (
                      <TableRow key={modulo}>
                        <TableCell>
                          <Typography variant="body2">
                            {ETIQUETAS_MODULO[modulo] ?? modulo}
                          </Typography>
                        </TableCell>

                        <TableCell align="center">
                          <Checkbox
                            size="small"
                            /*
                              «Ver» significa «tiene algo de acceso», así que
                              se marca también cuando gestiona — pero NO se
                              bloquea.

                              Bloquearla dejaba un callejón sin salida: para
                              quitarle un módulo del todo había que desmarcar
                              «Gestionar» y después «Ver», dos clics con un
                              momento en medio en que la casilla no responde.
                              Ahora quitarla retira el acceso entero, que es lo
                              que significa desmarcar «tiene acceso».
                            */
                            checked={actual !== null}
                            disabled={soloLectura}
                            onChange={(e) =>
                              poner(modulo, e.target.checked ? "ver" : null)
                            }
                            inputProps={{
                              "aria-label": `Ver ${ETIQUETAS_MODULO[modulo] ?? modulo}`,
                            }}
                          />
                        </TableCell>

                        <TableCell align="center">
                          <Checkbox
                            size="small"
                            checked={gestiona}
                            disabled={soloLectura}
                            onChange={(e) =>
                              // Al desmarcar queda en «ver», no en nada: quien
                              // gestionaba algo casi siempre sigue teniendo que
                              // verlo, y quitarlo del todo es otro clic.
                              poner(modulo, e.target.checked ? "gestionar" : "ver")
                            }
                            inputProps={{
                              "aria-label": `Gestionar ${ETIQUETAS_MODULO[modulo] ?? modulo}`,
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Box>
  );
}
