---
id: ISSUE-0025
title: "Suporte a dark theming em todos os componentes"
status: backlog
priority: medium
type: feature
owner: agent
created_at: 2026-06-26
updated_at: 2026-06-26
tags:
  - frontend
  - theming
  - ux
related_files:
  - apps/frontend/src/components/Theme/ThemeApplier.tsx
  - apps/frontend/src/components/Theme/ThemeToggle.tsx
  - apps/frontend/src/app/globals.css
  - apps/frontend/src/store/preferencesStore.ts
  - apps/frontend/src/components/MetricCard/MetricCard.tsx
  - apps/frontend/src/components/Dashboard.tsx
  - apps/frontend/src/components/Navbar.tsx
  - apps/frontend/src/app/appshell.tsx
---

# Resumo

A infraestrutura de dark mode existe: `ThemeApplier` adiciona/remove a
classe `dark` no `<html>` com base na preferência do Zustand store; `ThemeToggle`
expõe o controle ao usuário; `globals.css` define `--background`/`--foreground`
para dark via `@media (prefers-color-scheme: dark)`. Porém, a grande maioria
dos componentes usa cores Tailwind hardcoded para light mode (`bg-white`,
`border-gray-200`, `text-gray-900` etc.) sem variantes `dark:`, então trocar
o tema produz uma aparência quebrada — fundo escuro do `<body>` mas painéis e
cards com fundo branco.

# Problema

O `tailwind.config.ts` precisa ter `darkMode: 'class'` para que as variantes
`dark:` funcionem via classe no `<html>` (como o `ThemeApplier` faz). Sem
isso, o Tailwind ignora todas as variantes `dark:` definidas nos componentes.

Além disso, mesmo que a config esteja correta, os componentes principais não
têm nenhuma variante `dark:` definida:
- `MetricCard` — `bg-white`, `border-gray-200`, cores de texto e tendência
  todas hardcoded (ver `ISSUE-0024`).
- `Dashboard` — fundo e grid provavelmente claros.
- `Navbar` — sem `dark:` variants.
- `AppShell` — wrapper global, sem suporte dark.
- Páginas individuais (`/`, `/indicadores`, `/world`, `/configuracoes`) —
  backgrounds e tipografia não adaptados.
- Componentes de formulário / combobox (`ComboBoxLocalidades`,
  `IndicadorSearch`) — inputs e dropdowns sem dark mode.

# Objetivo

Ativar dark mode funcional end-to-end: quando o usuário alterna o tema (via
`ThemeToggle`) ou o OS está em dark, todos os componentes renderizam com
paleta escura adequada — sem branco piscando, sem texto ilegível.

# O que foi feito

- `ThemeApplier` + `ThemeToggle` implementados e integrados no AppShell.
- Store de preferências (`preferencesStore`) persistindo `tema` ('claro' |
  'escuro').
- `globals.css` com variáveis CSS base para dark via media query do OS.

# O que falta fazer

- [ ] Verificar e garantir `darkMode: 'class'` em `tailwind.config.ts`
      (sem isso as variantes `dark:` Tailwind são ignoradas — verificar antes
      de qualquer outro passo).
- [ ] Definir paleta de tokens de cor no `globals.css` como variáveis CSS
      (ex.: `--card-bg`, `--card-border`, `--text-primary`, `--text-secondary`)
      com valores para `:root` e para `.dark`, em vez de depender de classes
      Tailwind inline em cada componente. Isso facilita manutenção futura.
- [ ] Auditar e atualizar `MetricCard` com variantes `dark:` (ou variáveis
      CSS). Ver `ISSUE-0024`.
- [ ] Auditar `Navbar`, `AppShell`, `Dashboard`, e páginas principais.
- [ ] Auditar componentes de input (`ComboBoxLocalidades`, `IndicadorSearch`,
      `CategoriaSelector`, `IconSelector`).
- [ ] Garantir que `ThemeApplier` também respeite `prefers-color-scheme`
      como fallback quando o usuário nunca interagiu com `ThemeToggle`
      (hoje o store inicia em `'claro'` independente do OS).
- [ ] Testar visualmente em dark mode com o GapminderChart (canvas/svg) —
      eixos e legendas do Recharts não respondem a `dark:` automaticamente,
      precisam de prop de cor explícita.

# Decisões tomadas

- Abordagem escolhida: classe `dark` no `<html>` (JIT class strategy),
  não `@media prefers-color-scheme` puro — permite override manual do
  usuário. Isso já está implementado no `ThemeApplier`.

# Critérios de aceite

- [ ] `darkMode: 'class'` confirmado em `tailwind.config.ts`.
- [ ] Alternar `ThemeToggle` não produz nenhum componente com fundo branco
      visível no tema escuro.
- [ ] Texto legível (contraste WCAG AA) em dark em todos os componentes
      principais.
- [ ] GapminderChart / Recharts visível em dark mode (eixos e legendas
      com cores adaptadas).
- [ ] `prefers-color-scheme: dark` no OS sem interação prévia → store
      inicia em `'escuro'`.

# Observações

O `globals.css` já tem `@media (prefers-color-scheme: dark)` para as
variáveis `--background`/`--foreground`, mas isso só afeta o `<body>` via
`var(--color-background)`. Os componentes com classes `bg-white` explícitas
ignoram essas variáveis — daí o comportamento inconsistente.

# Log de execução

(ainda não iniciada)
