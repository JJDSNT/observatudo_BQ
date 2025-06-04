'use client';

import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';

export default function LoginPage() {
  const { user, loading, logout } = useAuth();

  const handleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('✅ Login bem-sucedido:', {
        nome: user.displayName,
        email: user.email,
        foto: user.photoURL,
      });
    } catch (err) {
      console.error('❌ Erro no login:', err);
    }
  };

  if (loading) return null; // ou spinner

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Login</h2>

      {!user ? (
        <>
          <p className="text-sm text-gray-600">Entre com sua conta Google</p>
          <button
            onClick={handleLogin}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Entrar com Google
          </button>
        </>
      ) : (
        <>
          <p className="text-sm text-green-700">
            Logado como: <strong>{user.displayName}</strong> ({user.email})
          </p>
          <img src={user.photoURL ?? ''} alt="Avatar" className="w-10 h-10 rounded-full" />
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Sair
          </button>
        </>
      )}
    </section>
  );
}
