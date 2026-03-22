"use client";

import { useEffect } from "react";

const shouldRegisterServiceWorker = process.env.NODE_ENV === "production";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (!shouldRegisterServiceWorker) return;
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    const register = async () => {
      try {
        await navigator.serviceWorker.register("/sw.js");
      } catch (error) {
        console.error("SW registration failed", error);
      }
    };

    void register();
  }, []);

  return null;
}
