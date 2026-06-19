'use client';
import { useAuth } from '@/hooks/useAuth';
import CategoriasEditor from '@/components/CategoriasEditor';

export default function CategoriasPage() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (!user) return <p>Você precisa estar logado para editar as categorias.</p>;

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-8">
      <CategoriasEditor />
    </main>
  );
}
