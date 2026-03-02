import { useEffect } from 'react';
import * as stylex from '@stylexjs/stylex';
import { lightTheme, darkTheme, colors } from './components/designSystem/designConstants.stylex';
import { useSettingsStore } from './store/settingsStore';
import { useAuthStore } from './store/authStore';
import { AppRouter } from './router';
import { FullScreenLoader } from './components/fullScreenLoader';

export function App() {
  const { isDarkMode } = useSettingsStore();
  const { checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(function () {
    checkAuth();
  }, [checkAuth]);

  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.themeContainer, isDarkMode ? darkTheme : lightTheme)}>
        <FullScreenLoader isLoading={isCheckingAuth} />
        <AppRouter />
      </div>
    </div>
  );
}

const styles = stylex.create({
  page: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
  },
  themeContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    backgroundColor: colors.background,
    color: colors.text,
    transition: 'background-color 0.5s ease, color 0.5s ease',
  },
});
