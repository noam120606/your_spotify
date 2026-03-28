import { useAuthStore } from "../store/authStore";
import { useMediaQuery } from "./useMediaQuery";

export function useDarkMode() {
  const { user, updateSetting } = useAuthStore();

  const systemIsDarkMode = useMediaQuery("(prefers-color-scheme: dark)");

  const userThemeMode = user?.settings.darkMode ?? "follow";
  const themeMode =
    userThemeMode === "follow" ? (systemIsDarkMode ? "dark" : "light") : userThemeMode;

  return {
    mode: themeMode,
    toggleDarkMode: () => updateSetting("darkMode", themeMode === "light" ? "dark" : "light"),
  };
}
