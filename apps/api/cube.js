module.exports = {
  // O driver BigQuery é configurado só via variáveis de ambiente
  // (CUBEJS_DB_BQ_*, ver .env.example) — não há nada de schema/dataset
  // aqui porque cada cubo já referencia `gold.<tabela>` explicitamente
  // (ver model/cubes/*.js). O acesso real restrito a `gold` é garantido
  // pelo IAM da service account de produção (decisão de deploy ainda
  // aberta, ver docs/external/cubejs.md); em dev local usa as
  // Application Default Credentials da própria máquina, mesma auth do
  // resto do projeto (Python, Terraform).
};
