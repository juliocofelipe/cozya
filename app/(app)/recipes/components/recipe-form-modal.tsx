"use client";

import { Check, X } from "lucide-react";
import type { Dispatch, SetStateAction } from "react";

import type { RecipeFormState } from "../types";
import styles from "../recipes.module.css";

type RecipeFormModalProps = {
  open: boolean;
  formState: RecipeFormState;
  setFormState: Dispatch<SetStateAction<RecipeFormState>>;
  saving: boolean;
  onClose: () => void;
  onSave: () => void;
};

export default function RecipeFormModal({
  open,
  formState,
  setFormState,
  saving,
  onClose,
  onSave
}: RecipeFormModalProps) {
  if (!open) return null;

  return (
    <div className={styles.modalOverlay} role="dialog" aria-modal="true">
      <div className={styles.modal}>
        <h2 className={styles.modalTitle}>{formState.id ? "Editar receita" : "Nova receita"}</h2>

        <label className={styles.fieldGroup}>
          <span className={styles.label}>Nome</span>
          <input
            className={styles.input}
            value={formState.name}
            onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
          />
        </label>

        <label className={styles.fieldGroup}>
          <span className={styles.label}>Ingredientes (um por linha)</span>
          <textarea
            className={styles.textarea}
            value={formState.ingredientsText}
            onChange={(event) => setFormState((prev) => ({ ...prev, ingredientsText: event.target.value }))}
          />
        </label>

        <label className={styles.fieldGroup}>
          <span className={styles.label}>Preparo</span>
          <textarea
            className={styles.textarea}
            value={formState.preparo}
            onChange={(event) => setFormState((prev) => ({ ...prev, preparo: event.target.value }))}
          />
        </label>

        <label className={styles.fieldGroup}>
          <span className={styles.label}>Finalização</span>
          <input
            className={styles.input}
            value={formState.finalizacao}
            onChange={(event) => setFormState((prev) => ({ ...prev, finalizacao: event.target.value }))}
          />
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            type="checkbox"
            checked={formState.favorite}
            onChange={(event) => setFormState((prev) => ({ ...prev, favorite: event.target.checked }))}
          />
          <span className={styles.label}>Favorito</span>
        </label>

        <div className={styles.buttonsRow}>
          <button className={styles.secondaryBtn} onClick={onClose}>
            <X size={16} aria-hidden="true" />
            <span>Cancelar</span>
          </button>
          <button className={styles.primaryBtn} onClick={onSave} disabled={saving}>
            <Check size={16} aria-hidden="true" />
            <span>{saving ? "Salvando..." : "Salvar"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
