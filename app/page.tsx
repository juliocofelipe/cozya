"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Trash2 } from "lucide-react";

import type { Recipe, RecipePayload } from "@/types/recipe";
import styles from "./page.module.css";

type RecipeFormState = {
  id?: string;
  name: string;
  ingredientsText: string;
  preparo: string;
  finalizacao: string;
  favorite: boolean;
};

const emptyFormState = (): RecipeFormState => ({
  name: "",
  ingredientsText: "",
  preparo: "",
  finalizacao: "",
  favorite: false
});

const toFormState = (recipe?: Recipe): RecipeFormState =>
  recipe
    ? {
        id: recipe.id,
        name: recipe.name,
        ingredientsText: recipe.ingredients.join("\n"),
        preparo: recipe.preparo,
        finalizacao: recipe.finalizacao,
        favorite: Boolean(recipe.favorite)
      }
    : emptyFormState();

const normalizeLines = (text: string) =>
  text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const recipePayloadFromForm = (state: RecipeFormState): RecipePayload => ({
  name: state.name.trim(),
  ingredients: normalizeLines(state.ingredientsText),
  preparo: state.preparo.trim(),
  finalizacao: state.finalizacao.trim(),
  favorite: state.favorite
});

const jsonRequest = async <T,>(url: string, init?: RequestInit): Promise<T> => {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {})
    }
  });

  if (!response.ok) {
    let message = "Erro ao comunicar com o servidor";
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload?.error) {
        message = payload.error;
      }
    } catch {
      // Mantém mensagem padrão
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
};

const upsertRecipe = (items: Recipe[], updated: Recipe): Recipe[] => {
  const exists = items.some((item) => item.id === updated.id);
  return exists
    ? items.map((item) => (item.id === updated.id ? updated : item))
    : [...items, updated];
};

type ImportedRecipeJson = {
  name?: string;
  title?: string;
  ingredients?: string[] | string;
  preparo?: string;
  preparation?: string;
  instructions?: string;
  finalizacao?: string;
  finalization?: string;
  finish?: string;
};

const parseJsonRecipe = (raw: string): RecipeFormState | null => {
  let data: ImportedRecipeJson | null = null;
  try {
    data = JSON.parse(raw) as ImportedRecipeJson;
  } catch {
    return null;
  }

  if (!data || typeof data !== "object") return null;

  const name = (data.name || data.title || "").trim();
  if (!name) return null;

  const ingredientsArray = Array.isArray(data.ingredients)
    ? data.ingredients.map((item) => String(item))
    : typeof data.ingredients === "string"
    ? normalizeLines(data.ingredients.replace(/[,;]/g, "\n"))
    : [];

  const normalizedIngredients = ingredientsArray
    .map((item) => String(item).trim())
    .filter(Boolean);

  const preparo =
    data.preparo || data.preparation || data.instructions || "";
  const finalizacao =
    data.finalizacao || data.finalization || data.finish || "";

  return {
    name,
    ingredientsText: normalizedIngredients.join("\n"),
    preparo: (preparo || "").trim(),
    finalizacao: (finalizacao || "").trim(),
    favorite: false
  };
};

const stripDiacritics = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const sectionFromLabel = (
  label: string
): "ingredients" | "preparo" | "finalizacao" | null => {
  const normalized = stripDiacritics(label);
  const match = (keys: string[]) => keys.some((key) => normalized.includes(key));

  if (match(["ingrediente", "ingredientes", "ingred", "ing"])) {
    return "ingredients";
  }
  if (match(["preparo", "modo", "preparar", "passo", "modo de preparo"])) {
    return "preparo";
  }
  if (match(["final", "finalizacao", "finalizar", "servir", "acabamento"])) {
    return "finalizacao";
  }
  return null;
};

const parseRecipeText = (raw: string): RecipeFormState => {
  if (!raw.trim()) {
    throw new Error("Cole o texto da receita para importar");
  }

  const jsonParsed = parseJsonRecipe(raw);
  if (jsonParsed) {
    return jsonParsed;
  }

  const lines = raw.split(/\r?\n/);
  let name = "";
  const ingredients: string[] = [];
  let preparo = "";
  let finalizacao = "";
  let section: "guess" | "ingredients" | "preparo" | "finalizacao" = "guess";

  const pushIngredientsFromText = (value: string) => {
    const cleaned = value.replace(/^[-•\u2022]\s?/, "").trim();
    if (!cleaned) return;
    const fragments = cleaned
      .split(/[;,]/)
      .map((fragment) => fragment.trim())
      .filter(Boolean);
    if (fragments.length) {
      ingredients.push(...fragments);
    } else {
      ingredients.push(cleaned);
    }
  };

  const appendText = (current: string, addition: string) =>
    [current, addition].filter(Boolean).join(current ? " " : "");

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed) return;
    const normalized = stripDiacritics(trimmed);

    if (normalized.startsWith("nome:")) {
      name = trimmed.slice(trimmed.indexOf(":") + 1).trim() || name;
      return;
    }

    const colonIndex = trimmed.indexOf(":");
    if (colonIndex !== -1) {
      const label = trimmed.slice(0, colonIndex);
      const remainder = trimmed.slice(colonIndex + 1).trim();
      const possibleSection = sectionFromLabel(label);
      if (possibleSection) {
        section = possibleSection;
        if (remainder) {
          if (section === "ingredients") {
            pushIngredientsFromText(remainder);
          } else if (section === "preparo") {
            preparo = appendText(preparo, remainder);
          } else if (section === "finalizacao") {
            finalizacao = remainder;
          }
        }
        return;
      }
    }

    const headerSection = sectionFromLabel(trimmed);
    if (headerSection) {
      section = headerSection;
      return;
    }

    if (!name) {
      name = trimmed;
      return;
    }

    if (section === "ingredients" || /^[-•\u2022]/.test(trimmed)) {
      pushIngredientsFromText(trimmed);
      return;
    }

    if (section === "preparo") {
      preparo = appendText(preparo, trimmed);
      return;
    }

    if (section === "finalizacao") {
      finalizacao = trimmed;
      return;
    }

    if (!ingredients.length) {
      pushIngredientsFromText(trimmed);
      return;
    }

    if (!preparo) {
      preparo = trimmed;
      return;
    }

    if (!finalizacao) {
      finalizacao = trimmed;
      return;
    }

    preparo = appendText(preparo, trimmed);
  });

  if (!name.trim()) {
    throw new Error("Não foi possível identificar o nome da receita");
  }

  if (!ingredients.length && preparo) {
    ingredients.push("Descreva os ingredientes em linhas separadas");
  }

  return {
    name: name.trim(),
    ingredientsText: ingredients.join("\n"),
    preparo: preparo.trim(),
    finalizacao: finalizacao.trim(),
    favorite: false
  };
};

export default function Home() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formState, setFormState] = useState<RecipeFormState>(emptyFormState);
  const [importOpen, setImportOpen] = useState(false);
  const [importText, setImportText] = useState("");
  const [importError, setImportError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRecipes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await jsonRequest<Recipe[]>("/api/recipes");
      setRecipes(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao carregar receitas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadRecipes();
  }, [loadRecipes]);

  const orderedRecipes = useMemo(() => {
    const term = query.trim().toLowerCase();
    return [...recipes]
      .filter((recipe) => recipe.name.toLowerCase().includes(term))
      .sort((a, b) => {
        if (Boolean(b.favorite) !== Boolean(a.favorite)) {
          return Number(b.favorite) - Number(a.favorite);
        }
        return b.updatedAt - a.updatedAt;
      });
  }, [recipes, query]);

  const selectedRecipe = selectedId
    ? recipes.find((recipe) => recipe.id === selectedId) ?? null
    : null;

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedId(recipe.id);
    void (async () => {
      try {
        const updated = await jsonRequest<Recipe>(`/api/recipes/${recipe.id}`, {
          method: "PATCH",
          body: JSON.stringify({ touch: true })
        });
        setRecipes((prev) => upsertRecipe(prev, updated));
      } catch (err) {
        console.error("Erro ao atualizar ordem", err);
      }
    })();
  };

  const openCreate = () => {
    setFormState(emptyFormState());
    setFormOpen(true);
  };

  const openEdit = (recipe: Recipe) => {
    setFormState(toFormState(recipe));
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setFormState(emptyFormState());
  };

  const closeImport = () => {
    setImportOpen(false);
    setImportText("");
    setImportError(null);
  };

  const openImport = () => {
    setImportText("");
    setImportError(null);
    setImportOpen(true);
  };

  const handleFavoriteToggle = async (recipe: Recipe) => {
    try {
      const updated = await jsonRequest<Recipe>(`/api/recipes/${recipe.id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: recipe.name,
          ingredients: recipe.ingredients,
          preparo: recipe.preparo,
          finalizacao: recipe.finalizacao,
          favorite: !recipe.favorite
        })
      });
      setRecipes((prev) => upsertRecipe(prev, updated));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível atualizar");
    }
  };

  const handleDeleteRecipe = async (recipe: Recipe) => {
    const confirmDelete =
      typeof window === "undefined"
        ? true
        : window.confirm(`Remover "${recipe.name}" da lista?`);
    if (!confirmDelete) return;

    try {
      await jsonRequest(`/api/recipes/${recipe.id}`, { method: "DELETE" });
      setRecipes((prev) => prev.filter((item) => item.id !== recipe.id));
      setSelectedId((prev) => (prev === recipe.id ? null : prev));
      if (formOpen && formState.id === recipe.id) {
        closeForm();
      } else if (formState.id === recipe.id) {
        setFormState(emptyFormState());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível excluir");
    }
  };

  const handleSaveRecipe = async () => {
    const trimmedName = formState.name.trim();
    if (!trimmedName) return;

    setSaving(true);
    setError(null);
    const payload = recipePayloadFromForm(formState);
    const isEditing = Boolean(formState.id);

    try {
      const recipe = await jsonRequest<Recipe>(
        isEditing ? `/api/recipes/${formState.id}` : "/api/recipes",
        {
          method: isEditing ? "PATCH" : "POST",
          body: JSON.stringify(payload)
        }
      );
      setRecipes((prev) => upsertRecipe(prev, recipe));
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Não foi possível salvar");
    } finally {
      setSaving(false);
    }
  };

  const handleImportApply = () => {
    try {
      const parsed = parseRecipeText(importText);
      setFormState(parsed);
      closeImport();
      setFormOpen(true);
    } catch (importProblem) {
      setImportError(
        importProblem instanceof Error ? importProblem.message : "Erro ao importar"
      );
    }
  };

  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <h1 className={styles.title}>Lanchinhos</h1>
        <p className={styles.tagline}>Receitas rápidas sempre visíveis.</p>
      </section>

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <input
        aria-label="Buscar receitas"
        className={styles.searchField}
        placeholder="O que vamos fazer?"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
      />

      <div className={styles.actions}>
        <button className={styles.ghostButton} onClick={openImport}>
          Importar receita
        </button>
        <button className={styles.accentButton} onClick={openCreate}>
          + Nova
        </button>
      </div>

      <section className={styles.list}>
        {loading && <p className={styles.emptyState}>Carregando receitas...</p>}
        {!loading && orderedRecipes.length === 0 && (
          <p className={styles.emptyState}>Nenhuma receita combina com a busca.</p>
        )}
        {!loading &&
          orderedRecipes.map((recipe) => (
            <article key={recipe.id} className={styles.card}>
              <div onClick={() => handleSelectRecipe(recipe)} style={{ flex: 1 }}>
                <div className={styles.cardTitle}>{recipe.name}</div>
                <small style={{ color: "#6b6b6b" }}>
                  {recipe.ingredients.length} ingrediente(s)
                </small>
              </div>
              <button
                aria-label="Marcar favorito"
                className={`${styles.starButton} ${recipe.favorite ? styles.favorite : ""}`}
                onClick={() => void handleFavoriteToggle(recipe)}
              >
                {recipe.favorite ? "⭐" : "☆"}
              </button>
              <button className={styles.starButton} onClick={() => openEdit(recipe)} aria-label="Editar">
                ✎
              </button>
              <button
                className={`${styles.starButton} ${styles.deleteButton}`}
                aria-label="Excluir"
                onClick={() => void handleDeleteRecipe(recipe)}
              >
                <Trash2 size={18} aria-hidden="true" />
              </button>
            </article>
          ))}
      </section>

      {selectedRecipe && (
        <div className={styles.recipePanel} role="dialog" aria-modal="true">
          <div className={styles.panelContent}>
            <div className={styles.panelHeader}>
              <h2 className={styles.panelTitle}>{selectedRecipe.name}</h2>
              <div className={styles.panelActions}>
                <button
                  className={styles.dangerButton}
                  onClick={() => void handleDeleteRecipe(selectedRecipe)}
                >
                  Excluir
                </button>
                <button className={styles.closeButton} onClick={() => setSelectedId(null)}>
                  Fechar
                </button>
              </div>
            </div>
            <div>
              <div className={styles.sectionTitle}>INGREDIENTES</div>
              <ul style={{ paddingLeft: "1.2rem", marginTop: 8 }}>
                {selectedRecipe.ingredients.map((item) => (
                  <li key={item} className={styles.paragraph}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <div className={styles.sectionTitle}>PREPARO</div>
              <p className={styles.paragraph}>{selectedRecipe.preparo}</p>
            </div>
            <div>
              <div className={styles.sectionTitle}>FINALIZAÇÃO</div>
              <p className={styles.paragraph}>{selectedRecipe.finalizacao}</p>
            </div>
          </div>
        </div>
      )}

      {formOpen && (
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
                className={`${styles.textarea}`}
                value={formState.ingredientsText}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, ingredientsText: event.target.value }))
                }
              />
            </label>

            <label className={styles.fieldGroup}>
              <span className={styles.label}>Preparo</span>
              <textarea
                className={`${styles.textarea}`}
                value={formState.preparo}
                onChange={(event) => setFormState((prev) => ({ ...prev, preparo: event.target.value }))}
              />
            </label>

            <label className={styles.fieldGroup}>
              <span className={styles.label}>Finalização</span>
              <input
                className={styles.input}
                value={formState.finalizacao}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, finalizacao: event.target.value }))
                }
              />
            </label>

            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={formState.favorite}
                onChange={(event) =>
                  setFormState((prev) => ({ ...prev, favorite: event.target.checked }))
                }
              />
              <span className={styles.label}>Favorito</span>
            </label>

            <div className={styles.buttonsRow}>
              <button className={styles.secondaryBtn} onClick={closeForm}>
                Cancelar
              </button>
              <button
                className={styles.primaryBtn}
                onClick={handleSaveRecipe}
                disabled={saving}
              >
                {saving ? "Salvando..." : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {importOpen && (
        <div className={styles.modalOverlay} role="dialog" aria-modal="true">
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Importar receita</h2>
            <label className={styles.fieldGroup}>
              <span className={styles.label}>Cole aqui o texto bruto</span>
              <textarea
                className={`${styles.textarea} ${styles.importArea}`}
                value={importText}
                onChange={(event) => {
                  setImportText(event.target.value);
                  setImportError(null);
                }}
              />
            </label>
            {importError && <p className={styles.error}>{importError}</p>}
            <div className={styles.buttonsRow}>
              <button className={styles.secondaryBtn} onClick={closeImport}>
                Fechar
              </button>
              <button className={styles.primaryBtn} onClick={handleImportApply}>
                Transformar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
