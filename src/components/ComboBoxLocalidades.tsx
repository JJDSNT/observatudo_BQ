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
      <div className="flex flex-wrap gap-4">
        <div className="flex flex-col w-full sm:w-1/2">
          <label className="text-sm font-medium mb-1">Estado (UF)</label>
          <select
            value={ufSelecionado}
            onChange={(e) => {
              setUfSelecionado(e.target.value)
              setCidadeSelecionada('')
            }}
            className="border p-2 rounded"
          >
            <option value="">Selecione um estado</option>
            {estados.map(([uf, estado]) => (
              <option key={uf} value={uf}>
                {estado.nome} ({uf})
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col w-full sm:w-1/2">
          <label className="text-sm font-medium mb-1">Cidade</label>
          <select
            value={cidadeSelecionada}
            onChange={(e) => setCidadeSelecionada(e.target.value)}
            disabled={!ufSelecionado}
            className="border p-2 rounded"
          >
            <option value="">Selecione uma cidade</option>
            {cidades.map((cidade) => (
              <option key={cidade.id} value={cidade.id}>
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
