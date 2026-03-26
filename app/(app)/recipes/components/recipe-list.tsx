"use client";

import { Pencil, Star, Trash2 } from "lucide-react";

import type { Recipe } from "@/types/recipe";

import styles from "../recipes.module.css";

type RecipeListProps = {
  recipes: Recipe[];
  loading: boolean;
  emptyMessage: string;
  onSelect: (recipe: Recipe) => void;
  onToggleFavorite: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (recipe: Recipe) => void;
};

export default function RecipeList({
  recipes,
  loading,
  emptyMessage,
  onSelect,
  onToggleFavorite,
  onEdit,
  onDelete
}: RecipeListProps) {
  return (
    <section className={styles.list}>
      {loading && <p className={styles.emptyState}>Carregando receitas...</p>}
      {!loading && recipes.length === 0 && <p className={styles.emptyState}>{emptyMessage}</p>}
      {!loading &&
        recipes.map((recipe) => {
          const ingredientCount = recipe.ingredients?.length ?? 0;
          return (
            <article key={recipe.id} className={styles.card}>
              <div onClick={() => onSelect(recipe)} style={{ flex: 1 }}>
                <div className={styles.cardTitle}>{recipe.name}</div>
                <small className={styles.cardMeta}>
                  {ingredientCount} {ingredientCount === 1 ? "ingrediente" : "ingredientes"}
                </small>
              </div>
              <button
                aria-label="Marcar favorito"
                className={`${styles.starButton} ${recipe.favorite ? styles.favorite : ""}`}
                onClick={() => onToggleFavorite(recipe)}
              >
                <Star
                  size={18}
                  aria-hidden="true"
                  fill={recipe.favorite ? "currentColor" : "none"}
                  stroke="currentColor"
                />
              </button>
              <button className={styles.starButton} onClick={() => onEdit(recipe)} aria-label="Editar">
                <Pencil size={16} aria-hidden="true" />
              </button>
              <button
                className={`${styles.starButton} ${styles.deleteButton}`}
                aria-label="Excluir"
                onClick={() => onDelete(recipe)}
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </article>
          );
        })}
    </section>
  );
}
