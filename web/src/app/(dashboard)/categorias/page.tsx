"use client";
import { useState } from "react";
import Button from "@mui/material/Button";
import { IconPlus } from "@tabler/icons-react";

import PageContainer from "@/components/container/PageContainer";
import EncabezadoPagina from "@/components/shared/EncabezadoPagina";
import DashboardCard from "@/components/shared/DashboardCard";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import CategoriasTable from "@/features/categorias/components/CategoriasTable";
import CategoriaFormDialog from "@/features/categorias/components/CategoriaFormDialog";
import { useEliminarCategoria } from "@/features/categorias/hooks/useCategorias";
import type { Categoria } from "@/features/categorias/types";
import { toApiError } from "@/lib/api/client";


export default function CategoriasPage() {
  const [formAbierto, setFormAbierto] = useState(false);
  const [categoriaEditando, setCategoriaEditando] = useState<Categoria | null>(null);
  const [categoriaAEliminar, setCategoriaAEliminar] = useState<Categoria | null>(null);

  const eliminar = useEliminarCategoria();

  const abrirNueva = () => {
    setCategoriaEditando(null);
    setFormAbierto(true);
  };

  const abrirEdicion = (categoria: Categoria) => {
    setCategoriaEditando(categoria);
    setFormAbierto(true);
  };

  const confirmarEliminacion = () => {
    if (!categoriaAEliminar) return;
    eliminar.mutate(categoriaAEliminar.id, {
      onSuccess: () => setCategoriaAEliminar(null),
    });
  };

  return (
    <PageContainer title="Categorías" description="Categorías de servicios">
      <EncabezadoPagina
        titulo="Categorías"
        descripcion="Cómo se agrupan tus servicios"
        acciones={
        <Button
          variant="contained"
          startIcon={<IconPlus size={18} />}
          onClick={abrirNueva}
        >
          Nueva categoría
        </Button>
        }
      />
      <DashboardCard>
        <CategoriasTable
          onEditar={abrirEdicion}
          onEliminar={setCategoriaAEliminar}
        />
      </DashboardCard>

      <CategoriaFormDialog
        abierto={formAbierto}
        categoria={categoriaEditando}
        onCerrar={() => setFormAbierto(false)}
      />

      <ConfirmDialog
        abierto={!!categoriaAEliminar}
        titulo="Eliminar categoría"
        /* El aviso lo pinta el `servicios_count` del listado: el DELETE
           responde 204 sin cuerpo. Y los servicios NO se borran — la FK es
           `nullOnDelete`, así que se quedan sin categoría. */
        mensaje={
          <>
            ¿Seguro que quieres eliminar{" "}
            <strong>{categoriaAEliminar?.nombre}</strong>?
            {categoriaAEliminar?.servicios_count
              ? ` ${categoriaAEliminar.servicios_count} ${
                  categoriaAEliminar.servicios_count === 1
                    ? "servicio quedará"
                    : "servicios quedarán"
                } sin categoría.`
              : ""}{" "}
            Esta acción no se puede deshacer.
          </>
        }
        textoConfirmar="Eliminar"
        cargando={eliminar.isPending}
        error={eliminar.isError ? toApiError(eliminar.error).message : null}
        onConfirmar={confirmarEliminacion}
        onCancelar={() => setCategoriaAEliminar(null)}
      />
    </PageContainer>
  );
}
