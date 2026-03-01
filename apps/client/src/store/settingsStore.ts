import { create } from 'zustand';

interface SettingsState {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
}

export const useSettingsStore = create<SettingsState>(function (set) {
  return {
    isDarkMode: true,
    toggleDarkMode: function () {
      set(function (state) {
        return { isDarkMode: !state.isDarkMode };
      });
    },
    setDarkMode: function (isDark: boolean) {
      set({ isDarkMode: isDark });
    },
  };
});
