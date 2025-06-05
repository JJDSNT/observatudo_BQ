//src/components/ComboBoxLocalidades.tsx
"use client";

import { useState, useEffect } from "react";
import type { PaisDropdown } from "@/types/location-selector";
import localidadesJson from "@/data/localidades_dropdown.json";
import { useUserPreferences } from "@/store/useUserPreferences";

const brasil: PaisDropdown = localidadesJson[0];
const estados = brasil.children;

interface ComboBoxLocalidadesProps {
  onChange: (municipioId: string) => void;
}

export default function ComboBoxLocalidades({
  onChange,
}: Readonly<ComboBoxLocalidadesProps>) {
  const { preferences, setPreferences } = useUserPreferences();

  const [ufSelecionado, setUfSelecionado] = useState<string>(
    preferences.estadoSelecionado ?? ""
  );

  const [cidadeSelecionada, setCidadeSelecionada] = useState<string>(
    preferences.cidadeSelecionada ?? ""
  );

  const estadoAtual = estados.find((e) => e.value === ufSelecionado);
  const cidades = estadoAtual?.children || [];

  useEffect(() => {
    if (cidadeSelecionada) {
      onChange(cidadeSelecionada);
      setPreferences({ cidadeSelecionada });
    }
  }, [cidadeSelecionada, onChange, setPreferences]);

  const handleSelecionarUF = (uf: string) => {
    setUfSelecionado(uf);
    const estado = estados.find((e) => e.value === uf);
    const cidadeDefault = estado?.default || "";
    setCidadeSelecionada(cidadeDefault);
    setPreferences({
      estadoSelecionado: uf,
      cidadeSelecionada: cidadeDefault,
    });
  };

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
      <div className="flex flex-row flex-wrap gap-4 items-end">
        <div className="flex flex-col">
          <label htmlFor="select-uf" className="text-sm font-medium mb-1">
            Estado (UF)
          </label>
          <select
            id="select-uf"
            value={ufSelecionado}
            onChange={(e) => handleSelecionarUF(e.target.value)}
            className="border p-2 rounded w-24"
          >
            <option value="">UF</option>
            {estados.map((estado) => (
              <option key={estado.value} value={estado.value}>
                {estado.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col flex-1 min-w-[200px]">
          <label htmlFor="select-cidade" className="text-sm font-medium mb-1">
            Cidade
          </label>
          <select
            id="select-cidade"
            value={cidadeSelecionada}
            onChange={(e) => setCidadeSelecionada(e.target.value)}
            disabled={!ufSelecionado}
            className="border p-2 rounded w-full"
          >
            <option value="">
              {ufSelecionado ? "Selecione uma cidade" : "Selecione um estado"}
            </option>
            {cidades.map((cidade) => (
              <option key={cidade.value} value={cidade.value}>
                {cidade.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
