import * as stylex from '@stylexjs/stylex';
import { Sidebar } from '../components/sidebar';
import { ConnectedIntervalSelector } from '../components/intervalSelector';
import { colors, spacing } from '../components/designSystem/designConstants.stylex';

export function Home() {
  return (
    <div {...stylex.props(styles.container)}>
      <Sidebar />
      <main {...stylex.props(styles.mainContent)}>
        <header {...stylex.props(styles.header)}>
          <ConnectedIntervalSelector />
        </header>
      </main>
    </div>
  );
}

const styles = stylex.create({
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: colors.background,
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: spacing.xl,
  },
});
