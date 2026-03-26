"use client";

import { UploadCloud } from "lucide-react";

import styles from "../recipes.module.css";

type PrimaryActionsProps = {
  onImport: () => void;
  onCreate: () => void;
};

export default function PrimaryActions({ onImport, onCreate }: PrimaryActionsProps) {
  return (
    <div className={styles.actions}>
      <button className={styles.ghostButton} onClick={onImport}>
        <UploadCloud size={18} aria-hidden="true" />
        <span>Importar receita</span>
      </button>
      <button className={styles.accentButton} onClick={onCreate}>
        <span>+ Nova Receita</span>
      </button>
    </div>
  );
}
