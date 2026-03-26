import type { RecipePayload } from "@/types/recipe";

export type NormalizedRecipePayload = RecipePayload & { favorite: boolean };

export class RecipeValidationError extends Error {}

const sanitizePayload = (input: Partial<RecipePayload>): NormalizedRecipePayload => {
  const name = typeof input.name === "string" ? input.name.trim() : "";
  const preparo = typeof input.preparo === "string" ? input.preparo.trim() : "";
  const finalizacao = typeof input.finalizacao === "string" ? input.finalizacao.trim() : "";
  const ingredients = Array.isArray(input.ingredients)
    ? input.ingredients.map((item) => String(item).trim()).filter(Boolean)
    : [];

  if (!name) {
    throw new RecipeValidationError("Nome da receita é obrigatório");
  }
  if (!ingredients.length) {
    throw new RecipeValidationError("Inclua pelo menos um ingrediente");
  }
  if (!preparo) {
    throw new RecipeValidationError("Descreva o modo de preparo");
  }
  if (!finalizacao) {
    throw new RecipeValidationError("Descreva a finalização");
  }

  return {
    name,
    ingredients,
    preparo,
    finalizacao,
    favorite: Boolean(input.favorite)
  };
};

export const normalizeIncomingPayload = (payload: unknown): NormalizedRecipePayload => {
  if (!payload || typeof payload !== "object") {
    throw new RecipeValidationError("Estrutura inválida");
  }
  return sanitizePayload(payload as Partial<RecipePayload>);
};
