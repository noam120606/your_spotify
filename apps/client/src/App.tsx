import * as stylex from "@stylexjs/stylex";
import { useEffect } from "react";

import { api } from "./api/spotifyApi";
import {
  lightTheme,
  darkTheme,
  colors,
  spacing,
} from "./components/designSystem/designConstants.stylex";
import { Button } from "./components/designSystem/button";
import { Text } from "./components/designSystem/text";
import { FullScreenLoader } from "./components/fullScreenLoader";
import { useDarkMode } from "./hooks/useDarkMode";
import { AppRouter } from "./router";
import { useAuthStore } from "./store/authStore";

export function App() {
  const { checkAuth, isCheckingAuth, isGuestSession, user } = useAuthStore();
  const { mode } = useDarkMode();

  useEffect(
    function () {
      const url = new URL(window.location.href);
      const tokenFromQuery = url.searchParams.get("token");
      if (tokenFromQuery) {
        api.publicToken = tokenFromQuery;
        url.searchParams.delete("token");
        const cleanUrl = `${url.pathname}${url.search}${url.hash}`;
        window.history.replaceState(window.history.state, "", cleanUrl);
      }
      checkAuth();
    },
    [checkAuth],
  );

  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.themeContainer, mode === "dark" ? darkTheme : lightTheme)}>
        {isGuestSession && user?.username && (
          <div {...stylex.props(styles.guestBanner)}>
            <div {...stylex.props(styles.guestBannerContent)}>
              <Text
                size="small"
                weight="semiBold"
                color="warning"
                align="center"
                xstyle={styles.guestBannerText}
              >
                {`Currently navigating in guest mode the account of ${user.username}`}
              </Text>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.location.reload()}
                {...stylex.props(styles.exitButton)}
              >
                Exit
              </Button>
            </div>
          </div>
        )}
        <FullScreenLoader isLoading={isCheckingAuth} />
        <AppRouter />
      </div>
    </div>
  );
}

const styles = stylex.create({
  page: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
  },
  themeContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: colors.background,
    color: colors.text,
    transition: "background-color 0.5s ease, color 0.5s ease",
  },
  guestBanner: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    width: "100%",
    boxSizing: "border-box",
    display: "flex",
    justifyContent: "center",
    paddingTop: spacing.xs,
    paddingBottom: spacing.xs,
    paddingLeft: spacing.xl,
    paddingRight: spacing.xl,
  },
  guestBannerContent: {
    width: "100%",
    display: "grid",
    gridTemplateColumns: "1fr auto 1fr",
    alignItems: "center",
  },
  guestBannerText: {
    gridColumn: "2",
  },
  exitButton: {
    gridColumn: "3",
    justifySelf: "end",
    color: colors.warning,
  },
});
