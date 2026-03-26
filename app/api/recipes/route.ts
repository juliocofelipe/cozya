import { NextResponse } from "next/server";

import { createRecipeRecord, listRecipes } from "@/server/recipes/repository";
import { RecipeValidationError, normalizeIncomingPayload } from "@/server/recipes/validation";

const errorResponse = (error: unknown) => {
  if (error instanceof RecipeValidationError) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  console.error("/api/recipes", error);
  return NextResponse.json({ error: "Erro inesperado" }, { status: 500 });
};

export async function GET() {
  try {
    const recipes = await listRecipes();
    return NextResponse.json(recipes);
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  try {
    const payload = normalizeIncomingPayload(await request.json());
    const recipe = await createRecipeRecord(payload);
    return NextResponse.json(recipe, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
