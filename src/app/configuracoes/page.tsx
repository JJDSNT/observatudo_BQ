// src/app/configuracoes/page.tsx
"use client";

import { useUserPreferences } from "@/store/useUserPreferences";
import { useEffect, useState } from "react";
import localidadesJson from "@/data/localidades_dropdown.json";
import type { PaisDropdown, CategoriaIndicador, LucideIconName } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import categoriasJson from "@/data/categoriasIndicadores.json";

const brasil: PaisDropdown = localidadesJson[0];
const estados = brasil.children;

// 🔄 Inicializar fora do componente para evitar redefinição a cada render
const categoriasDefault: CategoriaIndicador[] = categoriasJson.map((eixo) => ({
  ...eixo,
  icone: eixo.icone as LucideIconName,
}));

export default function ConfiguracoesPage() {
  const { user, logout } = useAuth();
  const { preferences, setPreferences, clearPreferences } =
    useUserPreferences();
  const [infoHealthz, setInfoHealthz] = useState<string>("Carregando...");

  const handleChangeEstado = (uf: string) => {
    const estado = estados.find((e) => e.value === uf);
    const cidadePadrao = estado?.default ?? "";
    setPreferences({
      estadoSelecionado: uf,
      cidadeSelecionada: cidadePadrao,
    });
  };

  const handleChangeCidade = (cidadeId: string) => {
    setPreferences({ cidadeSelecionada: cidadeId });
  };

  const toggleTema = () => {
    const novoTema = preferences.tema === "escuro" ? "claro" : "escuro";
    setPreferences({ tema: novoTema });
  };

  useEffect(() => {
    fetch("/api/healthz")
      .then((res) => res.json())
      .then((data) => setInfoHealthz(JSON.stringify(data, null, 2)))
      .catch(() => setInfoHealthz("Erro ao carregar informações."));
  }, []);

  const estadoAtual = estados.find(
    (e) => e.value === preferences.estadoSelecionado
  );
  const cidades = estadoAtual?.children ?? [];

  const eixosDisponiveis: CategoriaIndicador[] =
    (preferences.categoriasIndicadores ?? []).length > 0
      ? preferences.categoriasIndicadores!
      : categoriasDefault;

  const eixoSelecionado = eixosDisponiveis.find(
    (e) => e.id === preferences.eixoSelecionado
  );

  const nomeEixoSelecionado = eixoSelecionado
    ? eixoSelecionado.subeixos
        .map((s) => s.nome)
        .join(", ")
        .replace(/, ([^,]*)$/, " & $1")
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
            {preferences.tema === "escuro" ? "🌙 Escuro" : "☀️ Claro"}
          </button>
        </div>

        <div className="flex gap-4 flex-wrap">
          <div>
            <label htmlFor="estado" className="block text-sm mb-1">
              Estado
            </label>
            <select
              id="estado"
              value={preferences.estadoSelecionado ?? ""}
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
              value={preferences.cidadeSelecionada ?? ""}
              onChange={(e) => handleChangeCidade(e.target.value)}
              disabled={!preferences.estadoSelecionado}
              className="border p-2 rounded min-w-[200px]"
            >
              <option value="">
                {preferences.estadoSelecionado
                  ? "Selecione"
                  : "Primeiro o estado"}
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

      <div className="flex gap-4">
        <button
          onClick={clearPreferences}
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

      <div className="space-y-4 pt-6">
        <h2 className="text-xl font-semibold">
          Exportar / Importar Preferências
        </h2>

        <div className="flex gap-4 flex-wrap">
          <button
            onClick={() => {
              const blob = new Blob([JSON.stringify(preferences, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const link = document.createElement("a");
              link.href = url;
              link.download = "preferencias-observatudo.json";
              link.click();
            }}
            className="px-4 py-2 rounded border border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900"
          >
            Exportar Preferências
          </button>

          <label className="cursor-pointer px-4 py-2 rounded border border-blue-500 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900">
            Importar JSON
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = () => {
                  try {
                    const json = JSON.parse(reader.result as string);
                    setPreferences(json);
                    alert("Preferências importadas com sucesso!");
                  } catch {
                    alert("Erro ao importar o arquivo.");
                  }
                };
                reader.readAsText(file);
              }}
            />
          </label>
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-semibold">Painéis de Debug</h2>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={preferences.debugLatency ?? true}
            onChange={(e) => setPreferences({ debugLatency: e.target.checked })}
          />
          Ativar painel de latência
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={preferences.debugZustand ?? false}
            onChange={(e) => setPreferences({ debugZustand: e.target.checked })}
          />
          Exibir painel do Zustand
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={preferences.debugPwa ?? false}
            onChange={(e) => setPreferences({ debugPwa: e.target.checked })}
          />
          Exibir painel do PWA
        </label>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Sistema</h2>
        <pre className="text-sm bg-zinc-100 dark:bg-zinc-900 p-3 rounded overflow-auto max-h-64">
          {infoHealthz}
        </pre>
      </div>
    </section>
  );
}
