"use client";

import { useState, useEffect } from "react";
import { LogIn, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function ModalLogin() {
  const [aberto, setAberto] = useState(false);
  const { user, loginWithGoogle, loading } = useAuth();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error("Erro ao fazer login:", err);
    }
  };

  // Fecha automaticamente após login
  useEffect(() => {
    if (user) setAberto(false);
  }, [user]);

  return (
    <>
      <button
        onClick={() => setAberto(true)}
        className="flex items-center gap-2 border rounded px-3 py-1 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
      >
        <LogIn size={16} />
        Entrar
      </button>

      {aberto && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl shadow-xl max-w-sm w-full space-y-4 relative">
            <button
              onClick={() => setAberto(false)}
              className="absolute top-2 right-3 text-zinc-400 hover:text-zinc-700 dark:hover:text-white"
            >
              ×
            </button>

            <h2 className="text-lg font-semibold text-center">
              Login com Google
            </h2>

            <p className="text-sm text-center text-zinc-500 dark:text-zinc-400">
              Acesse sua conta para personalizar sua experiência.
            </p>

            <button
              onClick={handleLogin}
              disabled={loading}
              className={`flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-2 rounded 
  hover:bg-blue-700 disabled:opacity-50 ${
    loading ? "cursor-not-allowed" : "cursor-pointer"
  }`}
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Entrando...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Entrar com Google
                </>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
