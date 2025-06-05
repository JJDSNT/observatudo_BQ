import { useEffect } from 'react';
import { useUserPreferences } from '@/store/useUserPreferences';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from './useAuth'; // assume que retorna { user }

export function useSyncPreferencesWithFirebase() {
  const { user } = useAuth();
  const { preferences, setPreferences } = useUserPreferences();

  // 🔄 Puxar do Firebase quando logar
  useEffect(() => {
    if (!user) return;

    const sync = async () => {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const prefsFromFirebase = snap.data();
        setPreferences(prefsFromFirebase);
      }
    };

    sync();
  }, [user]);

  // ☁️ Salvar mudanças no Firestore
  useEffect(() => {
    if (!user) return;

    const ref = doc(db, 'users', user.uid);
    setDoc(ref, preferences, { merge: true });
  }, [preferences, user]);
}
