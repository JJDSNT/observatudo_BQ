// src/lib/cubejs/client.ts
//
// ⚠️ Uso estritamente server-side (rotas de API): assina o JWT com
// CUBEJS_API_SECRET, que nunca deve chegar ao browser.

import cubejs from "@cubejs-client/core";
import jwt from "jsonwebtoken";

const apiUrl = process.env.CUBEJS_API_URL ?? "";
const apiSecret = process.env.CUBEJS_API_SECRET ?? "";

// Falha só no momento real de uso (assinatura do JWT), não na carga do
// módulo — mesma convenção de lib/analytics/client.ts (que também só
// resolve as envs em runtime, não no import), pra não quebrar o build
// caso as envs não estejam presentes nesse momento.
async function gerarToken(): Promise<string> {
  return jwt.sign({}, apiSecret, { expiresIn: "1h" });
}

export const cubejsApi = cubejs(gerarToken, {
  apiUrl: `${apiUrl}/cubejs-api/v1`,
});
