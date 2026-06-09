"use client";

import { useTheme } from "next-themes";

export function useAppearance() {
  const { resolvedTheme, setTheme } = useTheme();

  return {
    appearance: resolvedTheme ?? "light",
    updateAppearance: (theme: string) => setTheme(theme),
  };
}
