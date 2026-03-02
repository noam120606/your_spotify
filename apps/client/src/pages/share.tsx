import * as stylex from '@stylexjs/stylex';
import { Sidebar } from '../components/sidebar';
import { PageHeader } from '../components/pageHeader';
import { colors } from '../components/designSystem/designConstants.stylex';

export function Share() {
  return (
    <div {...stylex.props(styles.container)}>
      <Sidebar />
      <main {...stylex.props(styles.mainContent)}>
        <PageHeader
          title="Share"
          subtitle="Share your listening statistics with others"
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
