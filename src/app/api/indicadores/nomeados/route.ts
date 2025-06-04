// src/app/api/indicadores/nomeados/route.ts
import { nomesIndicadores } from "@/lib/analytics/indicadores";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { ids } = await req.json();

    if (!Array.isArray(ids)) {
      return NextResponse.json({ error: "IDs inválidos" }, { status: 400 });
    }

    const dados = await nomesIndicadores(ids);

    return NextResponse.json(dados);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erro interno.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

