"use client";

import Image from "next/image";

import styles from "../recipes.module.css";

export default function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className={styles.brand}>
        <div className={styles.logoWrapper}>
          <Image src="/images/cozya-logo.png" fill sizes="220px" alt="Logo do Cozya" priority />
        </div>
        <p className={styles.tagline}>Receitas rápidas sempre visíveis.</p>
      </div>
    </section>
  );
}
