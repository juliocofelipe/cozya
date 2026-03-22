import { NextResponse } from "next/server";

import {
  RecipeValidationError,
  deleteRecipeRecord,
  normalizeIncomingPayload,
  touchRecipeRecord,
  updateRecipeRecord
} from "@/lib/recipes";

type RouteContext = { params: { id: string } };

const notFound = NextResponse.json({ error: "Receita não encontrada" }, { status: 404 });

const errorResponse = (error: unknown) => {
  if (error instanceof RecipeValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  console.error("/api/recipes/[id]", error);
  return NextResponse.json({ error: "Erro inesperado" }, { status: 500 });
};

const isTouchPayload = (payload: unknown) =>
  Boolean(payload && typeof payload === "object" && (payload as { touch?: boolean }).touch);

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    let rawBody: unknown = null;
    try {
      rawBody = await request.json();
    } catch {
      rawBody = null;
    }

    if (isTouchPayload(rawBody)) {
      const recipe = await touchRecipeRecord(params.id);
      return recipe ? NextResponse.json(recipe) : notFound;
    }

    const payload = normalizeIncomingPayload(rawBody ?? {});
    const recipe = await updateRecipeRecord(params.id, payload);
    return recipe ? NextResponse.json(recipe) : notFound;
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(_: Request, { params }: RouteContext) {
  try {
    const deleted = await deleteRecipeRecord(params.id);
    if (!deleted) {
      return notFound;
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return errorResponse(error);
  }
}
