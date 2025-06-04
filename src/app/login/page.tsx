//transformar isso em um componente embutido na própria navbar, com modal ou dropdown

import { signInWithPopup, signInWithRedirect, getRedirectResult } from 'firebase/auth';
import { auth, provider } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { useEffect } from 'react';

export default function LoginPage() {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Tenta recuperar resultado de redirecionamento
    getRedirectResult(auth).then((result) => {
      if (result?.user) {
        console.log('✅ Login com redirect bem-sucedido:', result.user);
      }
    }).catch((err) => {
      console.error('❌ Erro no redirect login:', err);
    });
  }, []);

  const isMobile = typeof window !== 'undefined' && /Mobi|Android/i.test(navigator.userAgent);

  const handleLogin = async () => {
    try {
      if (isMobile) {
        await signInWithRedirect(auth, provider);
      } else {
        const result = await signInWithPopup(auth, provider);
        console.log('✅ Login com popup bem-sucedido:', result.user);
      }
    } catch (err) {
      console.error('❌ Erro no login:', err);
    }
  };

  if (loading) return null;

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Login</h2>

      {!user ? (
        <>
          <p className="text-sm text-gray-600">Entre com sua conta Google</p>
          <button onClick={handleLogin} className="px-4 py-2 bg-cyan-600 text-white rounded">
            Entrar com Google
          </button>
        </>
      ) : (
        <p>Você já está logado!</p>
      )}
    </section>
  );
}
