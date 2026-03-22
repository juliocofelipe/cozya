export type Recipe = {
  id: string;
  name: string;
  ingredients: string[];
  preparo: string;
  finalizacao: string;
  favorite?: boolean;
  updatedAt: number;
};

export type RecipePayload = {
  name: string;
  ingredients: string[];
  preparo: string;
  finalizacao: string;
  favorite?: boolean;
};
