// src/components/ComboBoxLocalidades.tsx
'use client';

import { useEffect, useRef } from 'react';
import type { PaisDropdown } from '@/types/location';
import localidadesJson from '@/data/localidades_dropdown.json';
import { useSelecionado } from '@/store/hooks/useSelecionado';

const brasil: PaisDropdown = localidadesJson[0];
const estados = brasil.children;

interface ComboBoxLocalidadesProps {
  onChange: (municipioId: string) => void;
}

export default function ComboBoxLocalidades({
  onChange,
}: Readonly<ComboBoxLocalidadesProps>) {
  const [selecionado, setSelecionado] = useSelecionado();

  const mounted = useRef(false);

  const ufSelecionado = selecionado.estado?.trim() || '';
  const cidadeSelecionada = selecionado.cidade?.trim() || '';

  const estadoAtual = estados.find((e) => e.value.trim() === ufSelecionado);
  const cidades = estadoAtual?.children ?? [];

  // Atualiza store quando cidade muda (após montagem inicial)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    if (ufSelecionado && cidadeSelecionada) {
      setSelecionado({
        ...selecionado,
        pais: selecionado.pais || 'BR',
        estado: ufSelecionado,
        cidade: cidadeSelecionada,
      });

      onChange(cidadeSelecionada);
    }
  }, [cidadeSelecionada, ufSelecionado]);

  const handleChangeEstado = (uf: string) => {
    const estado = estados.find((e) => e.value.trim() === uf);
    const cidadeDefault = estado?.default?.trim() ?? '';

    setSelecionado({
      ...selecionado,
      pais: selecionado.pais || 'BR',
      estado: uf.trim(),
      cidade: cidadeDefault,
    });

    if (cidadeDefault) {
      onChange(cidadeDefault);
    }
  };

  const handleChangeCidade = (cidadeId: string) => {
    setSelecionado({
      ...selecionado,
      cidade: cidadeId.trim(),
    });

    onChange(cidadeId.trim());
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
            onChange={(e) => handleChangeEstado(e.target.value)}
            className="border p-2 rounded w-24"
          >
            <option value="">UF</option>
            {estados.map((estado) => (
              <option key={estado.value.trim()} value={estado.value.trim()}>
                {estado.label.trim()}
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
            onChange={(e) => handleChangeCidade(e.target.value)}
            disabled={!ufSelecionado}
            className="border p-2 rounded w-full"
          >
            <option value="">
              {ufSelecionado ? 'Selecione uma cidade' : 'Selecione um estado'}
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
