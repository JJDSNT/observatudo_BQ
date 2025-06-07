//src/app/configuracoes/page.tsx
"use client";

import { useEffect, useState } from "react";
import localidadesJson from "@/data/localidades_dropdown.json";
import { useAuth } from "@/hooks/useAuth";
import { formatarNomeCategoria } from "@/utils/categoriaUtils";
import type { PaisDropdown, DebugModules } from "@/types";
import { useSelecionado } from "@/store/hooks/useSelecionado";
import { useTema } from "@/store/hooks/useTema";
import { useCategorias } from "@/store/hooks/useCategorias";
import { useDebug } from "@/store/hooks/useDebug";
import { usePreferencesStore } from "@/store/preferencesStore";

const brasil: PaisDropdown = localidadesJson[0];
const estados = brasil.children;

export default function ConfiguracoesPage() {
  const { user, logout } = useAuth();

  const { tema, setTema } = useTema();
  const [selecionado, setSelecionado] = useSelecionado();
  const [categorias] = useCategorias();
  const [debug, , setDebugModule] = useDebug();
  const [infoHealthz, setInfoHealthz] = useState<string>("Carregando...");

  const handleChangeEstado = (uf: string) => {
    const estado = estados.find((e) => e.value === uf);
    const cidadePadrao = estado?.default ?? "";
    setSelecionado({ ...selecionado, estado: uf, cidade: cidadePadrao });
  };

  const handleChangeCidade = (cidadeId: string) => {
    setSelecionado({ ...selecionado, cidade: cidadeId });
  };

  const toggleTema = () => {
    const novoTema = tema === "escuro" ? "claro" : "escuro";
    setTema(novoTema);
  };

  useEffect(() => {
    fetch("/api/healthz")
      .then((res) => res.json())
      .then((data) => setInfoHealthz(JSON.stringify(data, null, 2)))
      .catch(() => setInfoHealthz("Erro ao carregar informações."));
  }, []);

  const estadoAtual = estados.find((e) => e.value === selecionado?.estado);
  const cidades = estadoAtual?.children ?? [];

  const eixoSelecionado = categorias.find(
    (e) => e.id === selecionado?.categoriaId
  );

  const nomeEixoSelecionado = eixoSelecionado
    ? formatarNomeCategoria(eixoSelecionado)
    : "Nenhuma";

  return (
    <section className="max-w-3xl mx-auto px-6 py-12 space-y-8 text-zinc-800 dark:text-zinc-200">
      <header>
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Personalize sua experiência com o ObservaTudo
        </p>
      </header>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Preferências Gerais</h2>

        <div className="flex items-center gap-4">
          <span className="text-sm">Tema atual:</span>
          <button
            onClick={toggleTema}
            className="px-3 py-1 rounded border hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
          >
            {tema === "escuro" ? "🌙 Escuro" : "☀️ Claro"}
          </button>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div>
            <label htmlFor="estado" className="block text-sm mb-1">
              Estado
            </label>
            <select
              id="estado"
              value={selecionado?.estado ?? ""}
              onChange={(e) => handleChangeEstado(e.target.value)}
              className="border p-2 rounded min-w-[150px]"
            >
              <option value="">Selecione</option>
              {estados.map((e) => (
                <option key={e.value} value={e.value}>
                  {e.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="cidade" className="block text-sm mb-1">
              Cidade
            </label>
            <select
              id="cidade"
              value={selecionado?.cidade ?? ""}
              onChange={(e) => handleChangeCidade(e.target.value)}
              disabled={!selecionado?.estado}
              className="border p-2 rounded min-w-[200px]"
            >
              <option value="">
                {selecionado?.estado ? "Selecione" : "Primeiro o estado"}
              </option>
              {cidades.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="categoriaSelecionada" className="block text-sm mb-1">
            Categoria selecionada
          </label>
          <input
            id="categoriaSelecionada"
            type="text"
            value={nomeEixoSelecionado}
            disabled
            className="border p-2 rounded bg-zinc-100 dark:bg-zinc-800 w-full"
          />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Painéis de Debug</h2>

        {(["latency", "zustand", "pwa"] as (keyof DebugModules)[]).map((mod) => (
          <label key={mod} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={debug.modules?.[mod] ?? false}
              onChange={(e) => setDebugModule(mod, e.target.checked)}
            />
            {`Exibir painel do ${mod}`}
          </label>
        ))}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Sistema</h2>
        <pre className="text-sm bg-zinc-100 dark:bg-zinc-900 p-3 rounded overflow-auto max-h-64">
          {infoHealthz}
        </pre>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => usePreferencesStore.persist?.clearStorage()}
          className="px-4 py-2 rounded border border-red-500 text-red-500 hover:bg-red-100 dark:hover:bg-red-900"
        >
          Resetar preferências
        </button>
        {user && (
          <button
            onClick={logout}
            className="px-4 py-2 rounded border border-gray-400 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          >
            Sair da conta
          </button>
        )}
      </div>
    </section>
  );
}
