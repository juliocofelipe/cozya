"use client";

import { Share2, X } from "lucide-react";

import type { Recipe } from "@/types/recipe";

import styles from "../recipes.module.css";

type RecipePanelProps = {
  recipe: Recipe;
  onClose: () => void;
};

export default function RecipePanel({ recipe, onClose }: RecipePanelProps) {
  const shareMessage = [
    `Cozya – ${recipe.name}`,
    `Ingredientes: ${(Array.isArray(recipe.ingredients) ? recipe.ingredients : []).join(", ")}`,
    `Preparo: ${recipe.preparo}`,
    `Finalização: ${recipe.finalizacao}`
  ].join("\n");
  const shareUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  return (
    <div className={styles.recipePanel} role="dialog" aria-modal="true">
      <div className={styles.panelContent}>
        <div className={styles.panelHeader}>
          <h2 className={styles.panelTitle}>{recipe.name}</h2>
          <div className={styles.panelActions}>
            <a
              href={shareUrl}
              className={styles.shareIconButton}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Compartilhar receita no WhatsApp"
            >
              <Share2 size={16} aria-hidden="true" />
            </a>
            <button className={styles.closeButton} onClick={onClose} aria-label="Fechar painel">
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div>
          <div className={styles.sectionTitle}>INGREDIENTES</div>
          <ul style={{ paddingLeft: "1.2rem", marginTop: 8 }}>
            {(Array.isArray(recipe.ingredients) ? recipe.ingredients : []).map((item) => (
              <li key={item} className={styles.paragraph}>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <div className={styles.sectionTitle}>PREPARO</div>
          <p className={styles.paragraph}>{recipe.preparo}</p>
        </div>
        <div>
          <div className={styles.sectionTitle}>FINALIZAÇÃO</div>
          <p className={styles.paragraph}>{recipe.finalizacao}</p>
        </div>
      </div>
    </div>
  );
}
