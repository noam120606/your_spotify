import * as stylex from '@stylexjs/stylex';
import { Sidebar } from '../components/sidebar';
import { PageHeader } from '../components/pageHeader';
import { colors } from '../components/designSystem/designConstants.stylex';

export function TopAlbums() {
  return (
    <div {...stylex.props(styles.container)}>
      <Sidebar />
      <main {...stylex.props(styles.mainContent)}>
        <PageHeader
          title="Top Albums"
          subtitle="Your most listened albums over time"
        />
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
});
