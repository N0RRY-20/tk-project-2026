"use client";

import * as React from "react";

export function PWARegister() {
  React.useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator
    ) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.register("/sw.js").catch(() => {
          // SW registration failed — silently ignore
        });
      });
    }
  }, []);

  return null;
}
