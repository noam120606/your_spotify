import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { colors, spacing, transitions } from "../../components/designSystem/designConstants.stylex";
import { Text } from "../../components/designSystem/text";
import { PageHeader } from "../../components/pageHeader";
import { SegmentedControl } from "../../components/segmentedControl";
import { useAuthStore } from "../../store/authStore";
import { AccountTab } from "./tabs/account";
import { AdminTab } from "./tabs/admin";
import { StatisticsTab } from "./tabs/statistics";

export function Settings() {
  const [activeTab, setActiveTab] = useState(0);
  const { user } = useAuthStore();

  const availableTabs = [
    { label: "Account", component: <AccountTab /> },
    { label: "Statistics", component: <StatisticsTab /> },
    ...(user?.admin ? [{ label: "Admin", component: <AdminTab /> }] : []),
  ];

  return (
    <main {...stylex.props(styles.mainContent)}>
      <PageHeader title="Settings" subtitle="Manage your Spotify preferences" />

      <div {...stylex.props(styles.tabsWrapper)}>
        <SegmentedControl.Root selectedIndex={activeTab} onIndexChange={setActiveTab}>
          {availableTabs.map((tab, idx) => (
            <SegmentedControl.Item key={tab.label} index={idx}>
              {({ selected }) => (
                <Text
                  as="span"
                  size="medium"
                  weight={selected ? "bold" : "medium"}
                  color={selected ? "background" : "textSecondary"}
                  xstyle={styles.tabText}
                >
                  {tab.label}
                </Text>
              )}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
      </div>

      <div {...stylex.props(styles.contentContainer)}>{availableTabs[activeTab]?.component}</div>
    </main>
  );
}

const styles = stylex.create({
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  tabsWrapper: {
    padding: `0 ${spacing.xl}`,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
    display: "flex",
  },
  tabText: {
    transition: transitions.default,
    zIndex: 2,
  },
  contentContainer: {
    padding: `0 ${spacing.xl}`,
    display: "flex",
    flexDirection: "column",
    flex: 1,
    paddingBottom: spacing.xxl,
  },
});
