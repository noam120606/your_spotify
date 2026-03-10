import { create } from 'zustand';
import { User, SpotifyMe } from '../api/types';
import { api } from '../api/spotifyApi';

interface AuthState {
  isAuthenticated: boolean;
  isCheckingAuth: boolean;
  user: Partial<User> | null;
  spotify: SpotifyMe | null;
  checkAuth: () => Promise<void>;
  login: () => void;
  logout: () => Promise<void>;
  blacklistArtist: (artistId: string) => Promise<void>;
  unblacklistArtist: (artistId: string) => Promise<void>;
  updateSetting: (key: keyof User['settings'], value: any) => Promise<void>;
}

export const useAuthStore = create<AuthState>(function (set, get) {
  return {
    isAuthenticated: false,
    isCheckingAuth: true,
    user: null,
    spotify: null,
    checkAuth: async function () {
      try {
        const [response] = await Promise.all([
          api.me(),
          new Promise(function (resolve) {
            setTimeout(resolve, 700);
          }),
        ]);
        if ('status' in response.data && response.data.status) {
          set({ isAuthenticated: true, user: response.data.user, spotify: response.data.spotify, isCheckingAuth: false });
        } else {
          set({ isAuthenticated: false, user: null, spotify: null, isCheckingAuth: false });
        }
      } catch {
        set({ isAuthenticated: false, user: null, spotify: null, isCheckingAuth: false });
      }
    },
    login: function () {
      set({ isAuthenticated: true, user: { username: 'YourSpotifyUser' }, spotify: null });
    },
    logout: async function () {
      try {
        await api.logout();
        set({ isAuthenticated: false, user: null, spotify: null });
        window.location.pathname = "/login";
      } catch (error) {
        console.error(error);
      }
    },
    blacklistArtist: async function (artistId: string) {
      try {
        await api.blacklistArtist(artistId);
        const { checkAuth } = get();
        await checkAuth(); // Re-fetch user to get updated settings
      } catch (error) {
        console.error("Failed to blacklist artist", error);
        throw error;
      }
    },
    unblacklistArtist: async function (artistId: string) {
      try {
        await api.unblacklistArtist(artistId);
        const { checkAuth } = get();
        await checkAuth(); // Re-fetch user to get updated settings
      } catch (error) {
        console.error("Failed to unblacklist artist", error);
        throw error;
      }
    },
    updateSetting: async function (key: keyof User['settings'], value: any) {
      try {
        await api.setSetting(key, value);
        const { checkAuth } = get();
        await checkAuth(); // Re-fetch user to get updated settings
      } catch (error) {
        console.error(`Failed to update setting ${key}`, error);
        throw error;
      }
    },
  };
});
