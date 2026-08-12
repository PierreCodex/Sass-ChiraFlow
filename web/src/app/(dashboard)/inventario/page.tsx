"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import { IconPlus } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import Breadcrumb from "@/layout/shared/breadcrumb/Breadcrumb";
import DashboardCard from "@/components/shared/DashboardCard";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import ProductosTable from "@/features/inventario/components/ProductosTable";
import ProductoFormDialog from "@/features/inventario/components/ProductoFormDialog";
import MovimientoDialog from "@/features/inventario/components/MovimientoDialog";
import { useEliminarProducto } from "@/features/inventario/hooks/useProductos";
import type { Producto } from "@/features/inventario/types";
import { toApiError } from "@/lib/api/client";

const BCrumb = [{ to: "/", title: "Inicio" }, { title: "Inventario" }];

export default function InventarioPage() {
  const [formAbierto, setFormAbierto] = useState(false);
  const [productoEditando, setProductoEditando] = useState<Producto | null>(null);
  const [productoMovimiento, setProductoMovimiento] = useState<Producto | null>(null);
  const [productoAEliminar, setProductoAEliminar] = useState<Producto | null>(null);

  const eliminar = useEliminarProducto();

  const abrirNuevo = () => {
    setProductoEditando(null);
    setFormAbierto(true);
  };

  const abrirEdicion = (producto: Producto) => {
    setProductoEditando(producto);
    setFormAbierto(true);
  };

  const confirmarEliminacion = () => {
    if (!productoAEliminar) return;
    eliminar.mutate(productoAEliminar.id, {
      onSuccess: () => setProductoAEliminar(null),
    });
  };

  return (
    <PageContainer title="Inventario" description="Productos y stock">
      <Breadcrumb title="Inventario" items={BCrumb} />
      <DashboardCard
        title="Inventario"
        subtitle="Productos, stock y movimientos"
        action={
          <Button
            variant="contained"
            startIcon={<IconPlus size={18} />}
            onClick={abrirNuevo}
          >
            Nuevo producto
          </Button>
        }
      >
        <ProductosTable
          onEditar={abrirEdicion}
          onMovimiento={setProductoMovimiento}
          onEliminar={setProductoAEliminar}
        />
      </DashboardCard>

      <ProductoFormDialog
        abierto={formAbierto}
        producto={productoEditando}
        onCerrar={() => setFormAbierto(false)}
      />

      <MovimientoDialog
        producto={productoMovimiento}
        onCerrar={() => setProductoMovimiento(null)}
      />

      <ConfirmDialog
        abierto={!!productoAEliminar}
        titulo="Eliminar producto"
        mensaje={
          <>
            ¿Seguro que quieres eliminar{" "}
            <strong>{productoAEliminar?.nombre}</strong>? Se perderá también su
            historial de movimientos.
          </>
        }
        textoConfirmar="Eliminar"
        cargando={eliminar.isPending}
        error={eliminar.isError ? toApiError(eliminar.error).message : null}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setProductoAEliminar(null)}
      />
    </PageContainer>
  );
}
