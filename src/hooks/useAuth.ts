// src/hooks/useAuth.ts
'use client';

import { useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  User,
} from 'firebase/auth';
import { auth, provider } from '@/lib/firebase'; // Certifique-se de que o `provider` (ex: GoogleAuthProvider) esteja configurado

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Erro ao logar com Google:', err);
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  return { user, loading, loginWithGoogle, logout };
}
