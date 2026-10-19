"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import InputAdornment from "@mui/material/InputAdornment";
import MenuItem from "@mui/material/MenuItem";
import Skeleton from "@mui/material/Skeleton";
import Stack from "@mui/material/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import { IconSearch } from "@tabler/icons-react";

import CustomTextField from "@/components/forms/theme-elements/CustomTextField";
import DashboardCard from "@/components/shared/DashboardCard";
import { formatFecha } from "@/lib/format";

import {
  useNegociosPlataforma,
  usePlanesPlataforma,
} from "@/features/plataforma/hooks/usePlataforma";
import {
  COLOR_ESTADO,
  ETIQUETA_ESTADO,
  type EstadoNegocio,
} from "@/features/plataforma/types";

/** Story 8.5: todos los negocios con búsqueda y filtros. */
export default function NegociosPlataformaPage() {
  const { data: negocios, isPending } = useNegociosPlataforma();
  const { data: planes } = usePlanesPlataforma();
  const [busqueda, setBusqueda] = useState("");
  const [estado, setEstado] = useState<EstadoNegocio | "todos">("todos");
  const [plan, setPlan] = useState("todos");

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    return (negocios ?? []).filter(
      (item) =>
        (estado === "todos" || item.estado === estado) &&
        (plan === "todos" || item.plan_slug === plan) &&
        (!texto ||
          [item.nombre, item.slug, item.titular.nombre, item.titular.email, item.ciudad]
            .join(" ")
            .toLowerCase()
            .includes(texto))
    );
  }, [negocios, busqueda, estado, plan]);

  const nombrePlan = (slug: string) => planes?.find((item) => item.slug === slug)?.nombre ?? slug;
  const limitePlan = (slug: string) =>
    planes?.find((item) => item.slug === slug)?.max_profesionales ?? 0;

  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h3" fontWeight={700}>
          Negocios
        </Typography>
        <Typography color="textSecondary">
          {negocios ? `${negocios.length} negocios registrados en la plataforma.` : " "}
        </Typography>
      </Box>

      <DashboardCard>
        <>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
            <CustomTextField
              placeholder="Buscar por nombre, titular, correo o ciudad"
              size="small"
              fullWidth
              value={busqueda}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBusqueda(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IconSearch size={18} />
                  </InputAdornment>
                ),
              }}
            />
            <CustomTextField
              select
              size="small"
              value={estado}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setEstado(e.target.value as EstadoNegocio | "todos")
              }
              sx={{ minWidth: 170 }}
            >
              <MenuItem value="todos">Todos los estados</MenuItem>
              {(Object.keys(ETIQUETA_ESTADO) as EstadoNegocio[]).map((clave) => (
                <MenuItem key={clave} value={clave}>
                  {ETIQUETA_ESTADO[clave]}
                </MenuItem>
              ))}
            </CustomTextField>
            <CustomTextField
              select
              size="small"
              value={plan}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPlan(e.target.value)}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="todos">Todos los planes</MenuItem>
              {(planes ?? []).map((item) => (
                <MenuItem key={item.slug} value={item.slug}>
                  {item.nombre}
                </MenuItem>
              ))}
            </CustomTextField>
          </Stack>

          {isPending ? (
            <Skeleton variant="rounded" height={320} />
          ) : visibles.length === 0 ? (
            <Typography color="textSecondary" textAlign="center" py={6}>
              Ningún negocio coincide con la búsqueda.
            </Typography>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Negocio</TableCell>
                    <TableCell>Titular</TableCell>
                    <TableCell>Plan</TableCell>
                    <TableCell align="center">Locales</TableCell>
                    <TableCell align="center">Profesionales</TableCell>
                    <TableCell>Vence</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibles.map((item) => (
                    <TableRow
                      key={item.id}
                      hover
                      component={Link}
                      href={`/plataforma/negocios/${item.id}`}
                      sx={{ textDecoration: "none", cursor: "pointer" }}
                    >
                      <TableCell>
                        <Typography fontWeight={600}>{item.nombre}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {item.categoria} · {item.ciudad}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">{item.titular.nombre}</Typography>
                        <Typography variant="caption" color="textSecondary">
                          {item.titular.email}
                        </Typography>
                      </TableCell>
                      <TableCell>{nombrePlan(item.plan_slug)}</TableCell>
                      <TableCell align="center">{item.locales}</TableCell>
                      <TableCell align="center">
                        {item.profesionales}/{limitePlan(item.plan_slug)}
                      </TableCell>
                      <TableCell>{formatFecha(item.vence_el)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={ETIQUETA_ESTADO[item.estado]}
                          color={COLOR_ESTADO[item.estado]}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </>
      </DashboardCard>
    </Stack>
  );
}
