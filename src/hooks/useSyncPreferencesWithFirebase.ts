// src/hooks/useSyncPreferencesWithFirebase.ts
import { useEffect, useRef } from 'react';
import { useUserPreferences } from '@/store/useUserPreferences';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './useAuth';
import { CATEGORIAS_DEFAULT } from '@/data/categoriasIndicadores';

export function useSyncPreferencesWithFirebase() {
  const { user } = useAuth();
  const { preferences, setPreferences } = useUserPreferences();

  // Evita sobrescrever store local com dados antigos do Firebase
  const syncedRef = useRef(false);

  // 🔄 Carrega preferências do Firebase após login
  useEffect(() => {
    if (!user || syncedRef.current) return;

    const load = async () => {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const prefsFromFirebase = snap.data();
        setPreferences(prefsFromFirebase);
      } else {
        // Se for o primeiro login, salva as categorias padrão
        setPreferences({ categoriasIndicadores: CATEGORIAS_DEFAULT });
        await setDoc(ref, { categoriasIndicadores: CATEGORIAS_DEFAULT });
      }

      syncedRef.current = true;
    };

    load();
  }, [user, setPreferences]);

  // ☁️ Salva preferências locais no Firebase após alteração
  useEffect(() => {
    if (!user || !syncedRef.current) return;

    const save = async () => {
      const ref = doc(db, 'users', user.uid);
      await setDoc(ref, preferences, { merge: true });
    };

    save();
  }, [preferences, user]);
}
