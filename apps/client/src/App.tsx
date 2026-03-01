import * as stylex from '@stylexjs/stylex';
import { lightTheme, darkTheme, colors } from './components/designSystem/designConstants.stylex';
import { useSettingsStore } from './store/settingsStore';
import { AppRouter } from './router';

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
    transition: 'background-color 0.3s ease, color 0.3s ease',
  },
});

export function App() {
  const { isDarkMode } = useSettingsStore();

  return (
    <div {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.themeContainer, isDarkMode ? darkTheme : lightTheme)}>
        <AppRouter />
      </div>
    </div>
  );
}