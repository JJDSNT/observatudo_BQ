// src/hooks/useAuth.ts
'use client';

import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { auth, provider } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const setAuthStoreUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setAuthStoreUser(firebaseUser); // 🧠 sincroniza Zustand
      setLoading(false);
    });
    return () => unsubscribe();
  }, [setAuthStoreUser]);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Erro ao logar com Google:', err);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setAuthStoreUser(null); // 🧹 limpa também no Zustand
  };

  return { user, loading, loginWithGoogle, logout };
}
