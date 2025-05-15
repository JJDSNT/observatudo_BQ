"use client"
import { useState } from 'react'
import localidades from '@/data/localidades_dropdown.json'

interface Cidade {
  id: string
  nome: string
  é_capital: boolean
}

interface Estado {
  nome: string
  capital_id: string
  cidades: Cidade[]
}

export default function ComboBoxLocalidades() {
  const [ufSelecionado, setUfSelecionado] = useState<string>('')
  const [cidadeSelecionada, setCidadeSelecionada] = useState<string>('')

  const estados = Object.entries(localidades) as [string, Estado][]
  const cidades = ufSelecionado ? localidades[ufSelecionado].cidades : []

  return (
    <div className="flex flex-col gap-4 max-w-4xl mx-auto">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1">Estado (UF)</label>
          <select
            value={ufSelecionado}
            onChange={(e) => {
              setUfSelecionado(e.target.value)
              setCidadeSelecionada('')
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
          <label className="text-sm font-medium mb-1">Cidade</label>
          <select
            value={cidadeSelecionada}
            onChange={(e) => setCidadeSelecionada(e.target.value)}
            disabled={!ufSelecionado}
            className="border p-2 rounded w-full"
          >
            <option value="">Selecione uma cidade</option>
            {cidades.map((cidade, index) => (
              <option key={`${cidade.id}-${index}`} value={cidade.id}>
                {cidade.nome} {cidade.é_capital ? '(Capital)' : ''}
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
  )
}
