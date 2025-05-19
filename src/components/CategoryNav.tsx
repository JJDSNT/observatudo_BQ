// src/components/CategoryNav.tsx
import React from "react";

type Categoria = {
  id: number;
  nome: string;
};

type CategoryNavProps = {
  categorias: Categoria[];
  categoriaSelecionada: number;
  onCategoriaChange: (id: number) => void;
};

export default function CategoryNav({ categorias, categoriaSelecionada, onCategoriaChange }: Readonly<CategoryNavProps>) {
  return (
    <nav className="flex gap-4 mb-4">
      {categorias.map(cat => (
        <button
          key={cat.id}
          onClick={() => onCategoriaChange(cat.id)}
          className={`px-3 py-1 rounded ${
            cat.id === categoriaSelecionada
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          {cat.nome}
        </button>
      ))}
    </nav>
  );
}
