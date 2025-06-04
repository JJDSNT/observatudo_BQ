'use client';

import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { UserPreferences } from '@/types/user-preferences';

export function useUserPreferences() {
  const { user } = useAuth();
  const [preferencias, setPreferencias] = useState<UserPreferences>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setPreferencias({});
      setLoading(false);
      return;
    }

    const fetch = async () => {
      setLoading(true);
      try {
        const ref = doc(db, 'users', user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setPreferencias(snap.data().preferencias ?? {});
        } else {
          setPreferencias({});
        }
      } catch (err: unknown) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Erro desconhecido');
        }
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user]);

  const updatePreferencias = async (newPrefs: Partial<UserPreferences>) => {
    if (!user) return;
    const ref = doc(db, 'users', user.uid);
    const mergedPrefs: UserPreferences = { ...preferencias, ...newPrefs };
    await setDoc(ref, { preferencias: mergedPrefs }, { merge: true });
    setPreferencias(mergedPrefs);
  };

  return { preferencias, updatePreferencias, loading, error };
}
