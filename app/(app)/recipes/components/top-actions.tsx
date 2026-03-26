"use client";

import { LogOut } from "lucide-react";

import styles from "../recipes.module.css";

type TopActionsProps = {
  onLogout: () => Promise<void> | void;
};

export default function TopActions({ onLogout }: TopActionsProps) {
  return (
    <div className={styles.topActions}>
      <button className={styles.logoutIconButton} onClick={() => void onLogout()} aria-label="Sair">
        <LogOut size={18} aria-hidden="true" />
      </button>
    </div>
  );
}
