import * as stylex from "@stylexjs/stylex";
import type { ReactNode } from "react";

import { colors } from "./designSystem/designConstants.stylex";
import { Sidebar } from "./sidebar";

type MainLayoutProps = {
  children: ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div {...stylex.props(styles.container)}>
      <Sidebar />
      <div {...stylex.props(styles.content)}>{children}</div>
    </div>
  );
}

const styles = stylex.create({
  container: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
});