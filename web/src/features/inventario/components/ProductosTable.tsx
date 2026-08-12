"use client";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Stack from "@mui/material/Stack";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { IconPencil, IconTransfer, IconTrash } from "@tabler/icons-react";

import DataTable, { type Columna } from "@/components/shared/DataTable";
import BuscadorTabla from "@/components/shared/BuscadorTabla";
import { usePaginacion } from "@/hooks/usePaginacion";
import { formatMoneda } from "@/lib/format";
import { useProductos } from "../hooks/useProductos";
import { stockBajo, type Producto } from "../types";

interface Props {
  onEditar: (producto: Producto) => void;
  onMovimiento: (producto: Producto) => void;
  onEliminar: (producto: Producto) => void;
}

const ProductosTable = ({ onEditar, onMovimiento, onEliminar }: Props) => {
  const { page, perPage, search, setPage, setPerPage, buscar, params } =
    usePaginacion();
  const { data, isPending, error } = useProductos(params);

  const columnas: Columna<Producto>[] = [
    {
      id: "nombre",
      label: "Producto",
      render: (producto) => (
        <>
          <Typography variant="subtitle2" fontWeight={600}>
            {producto.nombre}
          </Typography>
          {producto.descripcion ? (
            <Typography variant="body2" color="textSecondary">
              {producto.descripcion}
            </Typography>
          ) : null}
        </>
      ),
    },
    {
      id: "stock",
      label: "Stock",
      align: "center",
      // El umbral existe en la base pero el listado actual no lo aprovecha:
      // aquí se marca en cuanto el producto llega o baja de su mínimo.
      render: (producto) => {
        const agotado = producto.stock === 0;
        const bajo = stockBajo(producto);

        return (
          <Stack spacing={0.5} alignItems="center">
            <Typography
              variant="subtitle2"
              fontWeight={700}
              color={bajo ? "error.main" : "text.primary"}
            >
              {producto.stock}
            </Typography>
            {agotado ? (
              <Chip size="small" color="error" label="Agotado" />
            ) : bajo ? (
              <Chip size="small" color="warning" label="Stock bajo" />
            ) : null}
          </Stack>
        );
      },
    },
    {
      id: "minimo",
      label: "Mínimo",
      align: "center",
      render: (producto) => (
        <Typography variant="body2" color="textSecondary">
          {producto.stock_minimo}
        </Typography>
      ),
    },
    {
      id: "compra",
      label: "Compra",
      align: "right",
      render: (producto) => (
        <Typography variant="body2" color="textSecondary" noWrap>
          {formatMoneda(producto.precio_compra)}
        </Typography>
      ),
    },
    {
      id: "venta",
      label: "Venta",
      align: "right",
      render: (producto) => (
        <Typography variant="subtitle2" fontWeight={600} noWrap>
          {formatMoneda(producto.precio_venta)}
        </Typography>
      ),
    },
    {
      id: "acciones",
      label: "Acciones",
      align: "right",
      render: (producto) => (
        <Stack direction="row" spacing={0.5} justifyContent="flex-end">
          <Tooltip title="Registrar movimiento">
            <IconButton
              size="small"
              color="primary"
              onClick={() => onMovimiento(producto)}
            >
              <IconTransfer size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Editar">
            <IconButton size="small" onClick={() => onEditar(producto)}>
              <IconPencil size={18} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              color="error"
              onClick={() => onEliminar(producto)}
            >
              <IconTrash size={18} />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
  ];

  return (
    <>
      <Stack direction="row" justifyContent="flex-end" mb={2}>
        <BuscadorTabla
          valor={search}
          onChange={buscar}
          placeholder="Buscar producto…"
        />
      </Stack>

      <DataTable
        columnas={columnas}
        datos={data}
        cargando={isPending}
        error={error}
        page={page}
        perPage={perPage}
        onPageChange={setPage}
        onPerPageChange={setPerPage}
        mensajeVacio="Todavía no has registrado productos."
        minWidth={860}
      />
    </>
  );
};

export default ProductosTable;
