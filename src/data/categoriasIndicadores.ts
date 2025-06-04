// src/data/categoriasIndicadores.ts
import { CategoriaIndicador } from '@/types/categorias';
import { LucideIconName } from '@/components/IconSelector';

export const CATEGORIAS_INDICADORES: CategoriaIndicador[] = [
  {
    id: 1,
    cor: '#2563eb',
    icone: 'GraduationCap' as LucideIconName,
    subeixos: [
      {
        id: 'educacao',
        nome: 'Educação',
        indicadores: ['24', '55', '73', '4016', '4148', '5155'],
      },
    ],
  },
  {
    id: 2,
    cor: '#dc2626',
    icone: 'HeartPulse' as LucideIconName,
    subeixos: [
      {
        id: 'saude',
        nome: 'Saúde',
        indicadores: ['14', '88', '4009', '3982', '4008', '3905'],
      },
    ],
  },
  {
    id: 3,
    cor: '#f59e0b',
    icone: 'HandHeart' as LucideIconName,
    subeixos: [
      {
        id: 'assistencia-social',
        nome: 'Assistência social',
        indicadores: ['3965', '3985', '4686', '4043', '4065', '4384'],
      },
    ],
  },
  {
    id: 4,
    cor: '#4b5563',
    icone: 'ShieldCheck' as LucideIconName,
    subeixos: [
      {
        id: 'seguranca',
        nome: 'Segurança',
        indicadores: ['3900', '3897', '155', '159', '3891', '3864'],
      },
    ],
  },
  {
    id: 5,
    cor: '#16a34a',
    icone: 'Globe' as LucideIconName,
    subeixos: [
      {
        id: 'meio-ambiente',
        nome: 'Meio Ambiente',
        indicadores: ['125', '5140'],
      },
      {
        id: 'urbanizacao',
        nome: 'Urbanização',
        indicadores: ['127', '4032'],
      },
      {
        id: 'mobilidade',
        nome: 'Mobilidade',
        indicadores: ['3959', '5159'],
      },
    ],
  },
  {
    id: 6,
    cor: '#7c3aed',
    icone: 'BarChart2' as LucideIconName,
    subeixos: [
      {
        id: 'economia',
        nome: 'Economia',
        indicadores: ['23', '137', '3952'],
      },
      {
        id: 'financas',
        nome: 'Finanças',
        indicadores: ['144', '4030', '3946'],
      },
    ],
  },
];
