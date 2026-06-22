# Fix — CAPAG estadual ausente na área do estado

CAPAG (estadual e municipal) passa a aparecer corretamente na área do
estado do dashboard. Causa raiz dupla — formato de `localidade_id`
inconsistente na camada de dados, e um bug separado no frontend que
descartava dados de estado/país já retornados pela API. Issue promovida —
log de execução completo recuperável via
`git log -p -- AI_context/issues/ISSUE-0008.md`.

# Motivação

Resolve a decisão aberta deixada pela Fase 6 (`ISSUE-0007`) sobre formato
de `localidade_id`, e o item correspondente em "ideias futuras" do antigo
`REFACTOR_CONTEXT.md`.

# Solução adotada

Novo módulo `observatudo/localidades.py` formaliza a resolução de
`localidade_id` (antes feita ad-hoc por cada transformer) a partir das
fontes canônicas do IBGE; `dim_localidades` ganha campos de cruzamento
separados (`codigo_ibge`/`codigo_iso`) em vez de um campo único ambíguo;
`localidade_id` passa a ser tratado como id interno (surrogate), não como
chave natural de uma autoridade externa — desenho pensado para já
acomodar um resolver internacional (ISO) futuro, lado a lado, sem
substituir o resolver Brasil/IBGE. Bug separado no frontend
(`fetchIndicadores.ts` descartando dados de estado/país) corrigido na
mesma sessão, depois de testar o fluxo completo no navegador.

# Arquivos alterados

`apps/datawarehouse/src/observatudo/localidades.py` (novo),
`apps/datawarehouse/scripts/carregar_localidades_ibge.py`,
`apps/datawarehouse/src/observatudo/transformers/capag.py`,
`apps/datawarehouse/sql/silver/capag_agregado.sql`,
`apps/api/model/cubes/dim_localidades.js`,
`apps/datawarehouse/scripts/gerar_dropdown_json.py`,
`apps/frontend/src/services/fetchIndicadores.ts`,
`apps/frontend/src/lib/analytics/localidadeUtils.ts`.

# Impacto arquitetural

Estabelece o padrão de resolução de `localidade_id` (id interno +
campos de cruzamento `codigo_ibge`/`codigo_iso`) que `ISSUE-0019`
(indicadores internacionais) deve estender, não redesenhar.

# Documentações atualizadas

Nenhuma fora do `AI_context`.

# Próximos passos

Deploy do Cube.js com o cube `dim_localidades.js` atualizado
(`codigo_ibge`/`codigo_iso`) ainda pendente — não bloqueia o fix em si.
