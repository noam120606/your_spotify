import * as stylex from "@stylexjs/stylex";
import React from "react";

import { Card } from "./card";
import { spacing } from "./designConstants.stylex";

interface PageCardProps {
  title?: string;
  children: React.ReactNode;
  variant?: "default" | "dark";
}

export function PageCard({ title, children, variant = "default" }: PageCardProps) {
  return (
    <div {...stylex.props(styles.container)}>
      <Card title={title} variant={variant} fullWidth>
        {children}
      </Card>
    </div>
  );
}

const styles = stylex.create({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.lg,
    maxWidth: "800px",
    width: "100%",
  },
});
