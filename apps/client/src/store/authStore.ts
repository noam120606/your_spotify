import { create } from "zustand";

import { api, getSpotifyLogUrl } from "../api/spotifyApi";
import { User, SpotifyMe } from "../api/types";

interface AuthState {
  isAuthenticated: boolean;
  isGuestSession: boolean;
  isCheckingAuth: boolean;
  user: User | null;
  spotify: SpotifyMe | null;
  checkAuth: () => Promise<void>;
  login: () => void;
  logout: () => Promise<void>;
  blacklistArtist: (artistId: string) => Promise<void>;
  unblacklistArtist: (artistId: string) => Promise<void>;
  updateSetting: <T extends keyof User["settings"]>(
    key: T,
    value: User["settings"][T],
  ) => Promise<void>;
}

export const useAuthStore = create<AuthState>(function (set, get) {
  return {
    isAuthenticated: false,
    isGuestSession: false,
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
        if ("status" in response.data && response.data.status) {
          set({
            isAuthenticated: true,
            // Guest session means we authenticated via a public token link.
            isGuestSession: Boolean(api.publicToken) || Boolean(response.data.user.isGuest),
            user: response.data.user,
            spotify: response.data.spotify,
            isCheckingAuth: false,
          });
        } else {
          set({
            isAuthenticated: false,
            isGuestSession: false,
            user: null,
            spotify: null,
            isCheckingAuth: false,
          });
        }
      } catch {
        set({
          isAuthenticated: false,
          isGuestSession: false,
          user: null,
          spotify: null,
          isCheckingAuth: false,
        });
      }
    },
    login: function () {
      window.location.href = getSpotifyLogUrl();
    },
    logout: async function () {
      try {
        await api.logout();
        api.publicToken = null;
        set({ isAuthenticated: false, isGuestSession: false, user: null, spotify: null });
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
    updateSetting: async <T extends keyof User["settings"]>(key: T, value: User["settings"][T]) => {
      try {
        const { user } = get();
        if (user) {
          user.settings[key] = value;
          set({ user });
        }
        await api.setSetting(key, value);
      } catch (error) {
        console.error(`Failed to update setting ${key}`, error);
        throw error;
      }
    },
  };
});
