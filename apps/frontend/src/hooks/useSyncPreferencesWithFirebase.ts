// src/hooks/useSyncPreferencesWithFirebase.ts
import { useEffect, useRef } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from './useAuth';
import { CATEGORIAS_DEFAULT } from '@/data/categoriasIndicadores';
import type { UserPreferences } from '@/types';
import { usePreferencesStore } from '@/store/preferencesStore';

/**
 * 🔄 Sincroniza automaticamente as preferências locais com o Firebase.
 * - Após login: carrega preferências do usuário.
 * - Após alteração local: salva preferências no Firestore.
 */
export function useSyncPreferencesWithFirebase() {
  const { user } = useAuth();

  const setTema = usePreferencesStore((s) => s.setTema);
  const setDebug = usePreferencesStore((s) => s.setDebug);
  const setCategorias = usePreferencesStore((s) => s.setCategoriasIndicadores);
  const setSelecionado = usePreferencesStore((s) => s.setSelecionado);

  const tema = usePreferencesStore((s) => s.tema);
  const debug = usePreferencesStore((s) => s.debug);
  const categoriasIndicadores = usePreferencesStore((s) => s.categoriasIndicadores);
  const selecionado = usePreferencesStore((s) => s.selecionado);

  const syncedRef = useRef(false);

  // 🔽 Carrega preferências do Firebase uma única vez após login
  useEffect(() => {
    if (!user || syncedRef.current) return;

    const loadPreferences = async () => {
      const ref = doc(db, 'users', user.uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const prefs = snap.data() as Partial<UserPreferences>;
        if (prefs.tema) setTema(prefs.tema);
        if (prefs.selecionado) setSelecionado(prefs.selecionado);
        if (prefs.debug) setDebug(prefs.debug);
        if (prefs.categoriasIndicadores) setCategorias(prefs.categoriasIndicadores);
      } else {
        setCategorias(CATEGORIAS_DEFAULT);
        await setDoc(ref, { categoriasIndicadores: CATEGORIAS_DEFAULT });
      }

      syncedRef.current = true;
    };

    loadPreferences();
  }, [user, setTema, setDebug, setCategorias, setSelecionado]);

  // ☁️ Salva alterações locais no Firestore após sync inicial
  useEffect(() => {
    if (!user || !syncedRef.current) return;

    const savePreferences = async () => {
      const ref = doc(db, 'users', user.uid);
      const data: UserPreferences = {
        tema,
        debug,
        categoriasIndicadores,
        selecionado,
        _meta: {
          version: 1,
          createdAt: Date.now(),
          lastUpdated: Date.now(),
        },
      };
      await setDoc(ref, data, { merge: true });
    };

    savePreferences();
  }, [user, tema, debug, categoriasIndicadores, selecionado]);
}
