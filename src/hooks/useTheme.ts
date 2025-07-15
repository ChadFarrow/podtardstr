import { type Theme } from "@/contexts/AppContext";
import { useAppContext } from "@/hooks/useAppContext";

/**
 * Hook to get the active theme (dark mode only)
 * @returns Theme context with theme
 */
export function useTheme(): { theme: Theme } {
  const { config } = useAppContext();

  return {
    theme: config.theme,
  }
}