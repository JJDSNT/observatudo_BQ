// src/components/ThemeApplier.tsx
'use client';

import { useEffect } from 'react';
import { useUserPreferences } from '@/store/useUserPreferences';

export function ThemeApplier() {
  const { preferences } = useUserPreferences();

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('dark', preferences.tema === 'escuro');
  }, [preferences.tema]);

  return null; // componente invisível, só gerencia efeito
}
