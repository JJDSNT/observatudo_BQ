"use client";
import { useState, useEffect } from "react";
import localidadesJson from "@/data/localidades_dropdown.json";
import type {
  CidadeDropdown,
  EstadoDropdown,
  LocalidadesMap,
} from '@/types/localidadesDropdown.types';

const localidades = localidadesJson as LocalidadesMap;

interface ComboBoxLocalidadesProps {
  onChange: (municipioId: string) => void;
}

export default function ComboBoxLocalidades({ onChange }: Readonly<ComboBoxLocalidadesProps>) {
  const [ufSelecionado, setUfSelecionado] = useState<string>("");
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string>("");

  const estados = Object.entries(localidades) as [string, EstadoDropdown][];
  const cidades = ufSelecionado ? localidades[ufSelecionado].cidades : [];

  useEffect(() => {
    console.log("🏙️ Cidade selecionada:", cidadeSelecionada);
    if (cidadeSelecionada) {
      onChange(cidadeSelecionada);
    }
  }, [cidadeSelecionada, onChange]);

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="select-uf" className="text-sm font-medium mb-1">Estado (UF)</label>
          <select
            id="select-uf"
            value={ufSelecionado}
            onChange={(e) => {
              setUfSelecionado(e.target.value);
              setCidadeSelecionada("");
            }}
            className="border p-2 rounded w-full"
          >
            <option value="">Selecione um estado</option>
            {estados.map(([uf, estado]) => (
              <option key={uf} value={uf}>
                {estado.nome} ({uf})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="select-cidade" className="text-sm font-medium mb-1">Cidade</label>
          <select
            id="select-cidade"
            value={cidadeSelecionada}
            onChange={(e) => setCidadeSelecionada(e.target.value)}
            disabled={!ufSelecionado}
            className="border p-2 rounded w-full"
          >
            <option value="">Selecione uma cidade</option>
            {cidades.map((cidade: CidadeDropdown) => (
              <option key={cidade.id} value={cidade.id}>
                {cidade.nome} {cidade.é_capital ? "(Capital)" : ""}
              </option>
            ))}
          </select>
        </div>
      </div>

      {cidadeSelecionada && (
        <div className="text-sm text-gray-600">
          Selecionado: <strong>{cidadeSelecionada}</strong>
        </div>
      )}
    </div>
  );
}