"use client";

import { Mic } from "lucide-react";

import styles from "../recipes.module.css";

type SearchBarProps = {
  query: string;
  onQueryChange: (value: string) => void;
  speechActive: boolean;
  onSpeechStart: () => void;
  onSpeechStop: () => void;
};

export default function SearchBar({
  query,
  onQueryChange,
  speechActive,
  onSpeechStart,
  onSpeechStop
}: SearchBarProps) {
  return (
    <div className={styles.searchCard}>
      <input
        aria-label="Buscar receitas"
        className={styles.searchInput}
        placeholder="O que vamos fazer?"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        autoComplete="off"
      />
      <button
        type="button"
        className={styles.searchIconButton}
        aria-label={speechActive ? "Parar ditado" : "Buscar com voz"}
        onClick={() => (speechActive ? onSpeechStop() : onSpeechStart())}
      >
        <Mic size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
