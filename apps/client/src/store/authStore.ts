import { create } from 'zustand';
import { User } from '../api/types';
import { api } from '../api/spotifyApi';

interface AuthState {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  user: Partial<User> | null;
  checkAuth: () => Promise<void>;
  login: () => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>(function (set) {
  return {
    isAuthenticated: false,
    isCheckingAuth: true,
    user: null,
    checkAuth: async function () {
      try {
        const [response] = await Promise.all([
          api.me(),
          new Promise(function (resolve) {
            setTimeout(resolve, 700);
          }),
        ]);
        if ('status' in response.data && response.data.status) {
          set({ isAuthenticated: true, user: response.data.user, isCheckingAuth: false });
        } else {
          set({ isAuthenticated: false, user: null, isCheckingAuth: false });
        }
      } catch (error) {
        set({ isAuthenticated: false, user: null, isCheckingAuth: false });
      }
    },
    login: function () {
      set({ isAuthenticated: true, user: { username: 'YourSpotifyUser' } });
    },
    logout: async function () {
      try {
        await api.logout();
        set({ isAuthenticated: false, user: null });
        window.location.pathname = "/login";
      } catch (error) {
        console.error(error);
      }
    },
  };
});
