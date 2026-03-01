import { create } from 'zustand';

interface AuthState {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>(function (set) {
  return {
    isAuthenticated: false,
    login: function () {
      set({ isAuthenticated: true });
    },
    logout: function () {
      set({ isAuthenticated: false });
    },
  };
});
