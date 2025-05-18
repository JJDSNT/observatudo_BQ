with source as (

    select
        *
    from {{ source('dados', 'raw_cidades_sustentaveis') }}

)

select
    cast(codigo_ibge as string)            as codigo_ibge,
    cast(nome_cidade as string)            as nome_cidade,
    cast(uf as string)                     as uf,
    cast(estado_nome as string)            as estado_nome,
    cast(eixo as string)                   as eixo,
    cast(indicador_id as string)           as indicador_id,
    cast(nome as string)                   as nome,
    cast(formula as string)                as formula,
    cast(meta_ods as string)               as meta_ods,
    cast(numero_ods as string)             as numero_ods,
    cast(nome_ods as string)               as nome_ods,
    cast(descricao as string)              as descricao,
    cast(ano as integer)                   as ano,
    cast(valor as float64)                 as valor,
    cast(justificativa as string)          as justificativa,
    cast(eixo_ia as string)                as eixo_ia,
    cast(data_processamento as timestamp)  as data_processamento,
    'cidades_sustentaveis'                 as fonte
from source
where indicador_id is not null
