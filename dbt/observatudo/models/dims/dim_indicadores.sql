with source as (
    select
        indicador_id,
        nome,
        descricao,
        eixo,         -- Eixo original do dataset
        eixo_ia,      -- Eixo IA, sempre presente após nossos ajustes!
        formula,
        meta_ods,
        numero_ods,
        nome_ods
    from {{ ref('stg_cidades_sustentaveis') }}
)

select
    indicador_id,
    any_value(nome) as nome,
    any_value(descricao) as descricao,
    any_value(eixo) as eixo,
    any_value(eixo_ia) as eixo_ia,
    any_value(eixo_ia) as categoria,         -- renomeando para downstream
    'ia' as categoria_origem,                 -- indicando origem da categoria
    any_value(formula) as formula,
    any_value(meta_ods) as meta_ods,
    any_value(numero_ods) as numero_ods,
    any_value(nome_ods) as nome_ods
from source
group by indicador_id
