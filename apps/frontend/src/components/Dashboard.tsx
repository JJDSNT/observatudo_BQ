// src/components/Dashboard.tsx
"use client";

import React, { useMemo, useCallback } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  rectSortingStrategy,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import type {
  Indicador,
  CategoriaResultado,
  SubeixoResultado,
  IndicadoresPayload,
  Categoria,
  Subeixo,
} from "@/types";
import type { ComparacaoGeo } from "./MetricCard/MetricCard";
import { MetricCard } from "./MetricCard/MetricCard";
import { usePreferencesStore } from "@/store/preferencesStore";

// ─── helpers ─────────────────────────────────────────────────────────────────

function ultimoValor(
  nivelCats: CategoriaResultado[],
  categoriaId: number,
  subeixoId: string,
  indicadorId: string
): number | null {
  const cat = nivelCats.find((c) => c.id === categoriaId);
  const sub = cat?.subeixos.find((s) => s.id === subeixoId);
  const ind = sub?.indicadores.find((i) => i.id === indicadorId);
  const serie = ind?.serie.filter((p) => p.valor !== null) ?? [];
  return serie.at(-1)?.valor ?? null;
}

function sortByIds<T extends { id: string | number }>(
  items: T[],
  ids: (string | number)[]
): T[] {
  return [...items].sort((a, b) => {
    const ai = ids.indexOf(a.id);
    const bi = ids.indexOf(b.id);
    return (ai === -1 ? 9999 : ai) - (bi === -1 ? 9999 : bi);
  });
}

function temDados(ind: Indicador): boolean {
  return ind.serie.some(
    (p) => p.valor !== null || (p.nota != null && p.nota !== "")
  );
}

// ─── SortableIndicadorCard ────────────────────────────────────────────────────

function SortableIndicadorCard({
  indicador,
  cor,
  comparacao,
}: {
  indicador: Indicador;
  cor: string;
  comparacao?: ComparacaoGeo;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: indicador.id });

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 10 : undefined,
      }}
    >
      <MetricCard
        indicador={indicador}
        cor={cor}
        comparacao={comparacao}
        dragHandleProps={{ ...listeners, ...attributes }}
      />
    </div>
  );
}

// ─── SubeixoBloco (estático, para País e Estado) ──────────────────────────────

function SubeixoBloco({
  subeixo,
  storeIndicadorIds,
  cor,
  categoriaId,
  payload,
}: {
  subeixo: SubeixoResultado;
  storeIndicadorIds: string[];
  cor: string;
  categoriaId: number;
  payload: IndicadoresPayload;
}) {
  const indicadores = useMemo(
    () => sortByIds(subeixo.indicadores, storeIndicadorIds).filter(temDados),
    [subeixo.indicadores, storeIndicadorIds]
  );

  if (indicadores.length === 0) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
        {subeixo.nome}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {indicadores.map((ind) => (
          <MetricCard
            key={ind.id}
            indicador={ind}
            cor={cor}
            comparacao={{
              municipio: ultimoValor(
                payload.niveis.municipio, categoriaId, subeixo.id, ind.id
              ),
              estado: ultimoValor(
                payload.niveis.estado, categoriaId, subeixo.id, ind.id
              ),
              pais: ultimoValor(
                payload.niveis.pais, categoriaId, subeixo.id, ind.id
              ),
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── SortableSubeixoBloco (com DnD, para Município) ──────────────────────────

function SortableSubeixoBloco({
  subeixo,
  storeIndicadorIds,
  cor,
  categoriaId,
  payload,
  onIndicadorReorder,
}: {
  subeixo: SubeixoResultado;
  storeIndicadorIds: string[];
  cor: string;
  categoriaId: number;
  payload: IndicadoresPayload;
  onIndicadorReorder: (subeixoId: string, newIds: string[]) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subeixo.id });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const indicadores = useMemo(
    () => sortByIds(subeixo.indicadores, storeIndicadorIds).filter(temDados),
    [subeixo.indicadores, storeIndicadorIds]
  );

  function handleIndicadorDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = indicadores.findIndex((i) => i.id === active.id);
    const newIdx = indicadores.findIndex((i) => i.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    onIndicadorReorder(
      subeixo.id,
      arrayMove(indicadores, oldIdx, newIdx).map((i) => i.id)
    );
  }

  if (indicadores.length === 0) return null;

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
      }}
    >
      <div className="flex items-center gap-2 mb-3" {...attributes}>
        <button
          {...listeners}
          className="p-1 rounded text-gray-300 hover:text-gray-500 dark:text-gray-600 dark:hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none"
          aria-label={`Arrastar subeixo ${subeixo.nome}`}
        >
          <GripVertical className="w-4 h-4" />
        </button>
        <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">
          {subeixo.nome}
        </h3>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleIndicadorDragEnd}
      >
        <SortableContext
          items={indicadores.map((i) => i.id)}
          strategy={rectSortingStrategy}
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ml-6">
            {indicadores.map((ind) => (
              <SortableIndicadorCard
                key={ind.id}
                indicador={ind}
                cor={cor}
                comparacao={{
                  municipio: ultimoValor(
                    payload.niveis.municipio, categoriaId, subeixo.id, ind.id
                  ),
                  estado: ultimoValor(
                    payload.niveis.estado, categoriaId, subeixo.id, ind.id
                  ),
                  pais: ultimoValor(
                    payload.niveis.pais, categoriaId, subeixo.id, ind.id
                  ),
                }}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

type DashboardProps = { payload: IndicadoresPayload };

export const Dashboard: React.FC<DashboardProps> = ({ payload }) => {
  const categoriaId = usePreferencesStore((s) => s.selecionado.categoriaId);
  const categoriasIndicadores = usePreferencesStore((s) => s.categoriasIndicadores);
  const setCategoriasIndicadores = usePreferencesStore((s) => s.setCategoriasIndicadores);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const municipioCat = useMemo(
    () => payload.niveis.municipio.find((c) => c.id === categoriaId),
    [payload.niveis.municipio, categoriaId]
  );
  const estadoCat = useMemo(
    () => payload.niveis.estado.find((c) => c.id === categoriaId),
    [payload.niveis.estado, categoriaId]
  );
  const paisCat = useMemo(
    () => payload.niveis.pais.find((c) => c.id === categoriaId),
    [payload.niveis.pais, categoriaId]
  );

  const storeCategoria = useMemo(
    () => categoriasIndicadores.find((c) => c.id === categoriaId),
    [categoriasIndicadores, categoriaId]
  );

  const cor =
    municipioCat?.cor ?? estadoCat?.cor ?? paisCat?.cor ?? "#6b7280";

  // Subeixos do município ordenados pelo store (DnD escreve aqui)
  const sortedMunicipioSubeixos = useMemo(() => {
    if (!municipioCat) return [];
    const storeIds = storeCategoria?.subeixos.map((s) => s.id) ?? [];
    return sortByIds(municipioCat.subeixos, storeIds);
  }, [municipioCat, storeCategoria]);

  const updateStore = useCallback(
    (updater: (cats: Categoria[]) => Categoria[]) =>
      setCategoriasIndicadores(updater(categoriasIndicadores)),
    [categoriasIndicadores, setCategoriasIndicadores]
  );

  const handleSubeixoDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id || !categoriaId) return;
      const oldIdx = sortedMunicipioSubeixos.findIndex((s) => s.id === active.id);
      const newIdx = sortedMunicipioSubeixos.findIndex((s) => s.id === over.id);
      if (oldIdx === -1 || newIdx === -1) return;
      const newOrder = arrayMove(sortedMunicipioSubeixos, oldIdx, newIdx).map(
        (s) => s.id
      );
      updateStore((cats) =>
        cats.map((c) => {
          if (c.id !== categoriaId) return c;
          const reordered = newOrder
            .map((id) => c.subeixos.find((s) => s.id === id))
            .filter((s): s is Subeixo => !!s);
          const rest = c.subeixos.filter((s) => !newOrder.includes(s.id));
          return { ...c, subeixos: [...reordered, ...rest] };
        })
      );
    },
    [sortedMunicipioSubeixos, categoriaId, updateStore]
  );

  const handleIndicadorReorder = useCallback(
    (subeixoId: string, newIds: string[]) => {
      if (!categoriaId) return;
      updateStore((cats) =>
        cats.map((c) => {
          if (c.id !== categoriaId) return c;
          return {
            ...c,
            subeixos: c.subeixos.map((s) =>
              s.id === subeixoId ? { ...s, indicadores: newIds } : s
            ),
          };
        })
      );
    },
    [categoriaId, updateStore]
  );

  if (!categoriaId) return null;

  const storeSubeixoIds = storeCategoria?.subeixos.map((s) => s.id) ?? [];

  const storeIndicadorIds = (subeixoId: string) =>
    storeCategoria?.subeixos.find((s) => s.id === subeixoId)?.indicadores ?? [];

  // Cada seção só aparece se tiver ao menos um indicador com dados
  const hasDados = (cat: CategoriaResultado | undefined) =>
    cat?.subeixos.some((s) => s.indicadores.some(temDados)) ?? false;

  const secoes = [
    { label: "País",      cat: paisCat,      sortable: false },
    { label: "Estado",    cat: estadoCat,    sortable: false },
    { label: "Município", cat: municipioCat, sortable: true  },
  ].filter(({ cat }) => hasDados(cat));

  if (secoes.length === 0) return null;

  return (
    <div className="max-w-5xl mx-auto px-2 py-6 space-y-10">
      {secoes.map(({ label, cat, sortable }) => {
        if (!cat) return null;

        const subeixosOrdenados = sortByIds(cat.subeixos, storeSubeixoIds);

        return (
          <section key={label}>
            <h2 className="text-base font-bold text-gray-800 dark:text-gray-100 mb-5 pb-2 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
              <span
                className="inline-block w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: cor }}
              />
              {label}
            </h2>

            {sortable ? (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleSubeixoDragEnd}
              >
                <SortableContext
                  items={sortedMunicipioSubeixos.map((s) => s.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-8">
                    {sortedMunicipioSubeixos.map((subeixo) => (
                      <SortableSubeixoBloco
                        key={subeixo.id}
                        subeixo={subeixo}
                        storeIndicadorIds={storeIndicadorIds(subeixo.id)}
                        cor={cor}
                        categoriaId={categoriaId}
                        payload={payload}
                        onIndicadorReorder={handleIndicadorReorder}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            ) : (
              <div className="space-y-8">
                {subeixosOrdenados.map((subeixo) => (
                  <SubeixoBloco
                    key={subeixo.id}
                    subeixo={subeixo}
                    storeIndicadorIds={storeIndicadorIds(subeixo.id)}
                    cor={cor}
                    categoriaId={categoriaId}
                    payload={payload}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
};

export default Dashboard;
