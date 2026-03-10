import { useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { Sidebar } from '../../components/sidebar';
import { PageHeader } from '../../components/pageHeader';
import { SegmentedControl } from '../../components/segmentedControl';
import { Text } from '../../components/designSystem/text';
import { AccountTab } from './components/accountTab';
import { StatisticsTab } from './components/statisticsTab';
import { AdminTab } from './components/adminTab';
import { useAuthStore } from '../../store/authStore';
import {
  colors,
  spacing,
  transitions,
} from '../../components/designSystem/designConstants.stylex';

export function Settings() {
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useAuthStore();

  const availableTabs = [
    { label: 'Account', component: <AccountTab /> },
    { label: 'Statistics', component: <StatisticsTab /> },
    ...(user?.admin ? [{ label: 'Admin', component: <AdminTab /> }] : []),
  ];

  return (
    <div {...stylex.props(styles.container)}>
      <Sidebar />
      <main {...stylex.props(styles.mainContent)}>
        <PageHeader
          title="Settings"
          subtitle="Manage your Spotify preferences"
        />

        <div {...stylex.props(styles.tabsWrapper)}>
          <SegmentedControl.Root selectedIndex={activeTab} onIndexChange={setActiveTab}>
            {availableTabs.map((tab, idx) => (
              <SegmentedControl.Item key={tab.label} index={idx}>
                {({ selected }) => (
                  <Text
                    as="span"
                    size="medium"
                    weight={selected ? 'bold' : 'medium'}
                    color={selected ? 'background' : 'textSecondary'}
                    xstyle={styles.tabText}
                  >
                    {tab.label}
                  </Text>
                )}
              </SegmentedControl.Item>
            ))}
          </SegmentedControl.Root>
        </div>

        <div {...stylex.props(styles.contentContainer)}>
          {availableTabs[activeTab]?.component}
        </div>
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
    overflowY: 'auto',
  },
  tabsWrapper: {
    padding: `0 ${spacing.xl}`,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    display: 'flex',
  },
  tabText: {
    transition: transitions.default,
    zIndex: 2,
  },
  contentContainer: {
    padding: `0 ${spacing.xl}`,
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    paddingBottom: spacing.xxl,
  },
});
