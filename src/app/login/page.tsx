'use client';

import { signInWithPopup } from 'firebase/auth';
import { auth, provider } from '@/lib/firebase';

export default function LoginPage() {
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

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-semibold">Login</h2>
      <p className="text-sm text-gray-600">Entre com sua conta Google</p>
      <button
        onClick={handleLogin}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Entrar com Google
      </button>
    </section>
  );
}
