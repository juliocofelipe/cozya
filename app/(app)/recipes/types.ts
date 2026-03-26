import type { Recipe } from "@/types/recipe";

export type RecipeFormState = {
  id?: string;
  name: string;
  ingredientsText: string;
  preparo: string;
  finalizacao: string;
  favorite: boolean;
};

export const emptyFormState = (): RecipeFormState => ({
  name: "",
  ingredientsText: "",
  preparo: "",
  finalizacao: "",
  favorite: false
});

export const toFormState = (recipe?: Recipe): RecipeFormState =>
  recipe
    ? {
        id: recipe.id,
        name: recipe.name,
        ingredientsText: (Array.isArray(recipe.ingredients) ? recipe.ingredients : []).join("\n"),
        preparo: recipe.preparo,
        finalizacao: recipe.finalizacao,
        favorite: Boolean(recipe.favorite)
      }
    : emptyFormState();
