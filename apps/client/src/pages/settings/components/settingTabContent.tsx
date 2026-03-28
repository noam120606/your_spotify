import * as stylex from "@stylexjs/stylex";
import React from "react";

import { spacing } from "../../../components/designSystem/designConstants.stylex";

export function SettingTabContent({ children }: { children: React.ReactNode }) {
  return <div {...stylex.props(styles.container)}>{children}</div>;
}

const styles = stylex.create({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.lg,
    maxWidth: "800px",
  },
});
