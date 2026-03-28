import * as stylex from "@stylexjs/stylex";
import React from "react";

import { colors, spacing, borderRadius } from "./designSystem/designConstants.stylex";
import { Text } from "./designSystem/text";

export interface GenericRowProps {
  imageUrl?: string | null;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  rightText?: React.ReactNode;
  onClick?: () => void;
  xstyle?: stylex.StyleXStyles;
}

export function GenericRow({
  imageUrl,
  title,
  subtitle,
  rightText,
  onClick,
  xstyle,
}: GenericRowProps) {
  return (
    <div
      {...stylex.props(styles.container, onClick && styles.clickable, xstyle)}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={typeof title === "string" ? title : "Image"}
          {...stylex.props(styles.image)}
        />
      ) : (
        <div {...stylex.props(styles.imagePlaceholder)} />
      )}
      <div {...stylex.props(styles.middleContent)}>
        <Text color="text" weight="bold" xstyle={styles.truncate}>
          {title}
        </Text>
        {subtitle && (
          <Text color="textSecondary" size="small" xstyle={styles.truncate}>
            {subtitle}
          </Text>
        )}
      </div>
      {rightText && (
        <div {...stylex.props(styles.rightContent)}>
          <Text color="textSecondary" size="small" xstyle={styles.truncateRight}>
            {rightText}
          </Text>
        </div>
      )}
    </div>
  );
}

const styles = stylex.create({
  container: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    padding: `${spacing.sm} ${spacing.md}`,
    minWidth: 0,
    borderRadius: borderRadius.sm,
    transition: "background-color 0.2s ease",
  },
  clickable: {
    cursor: "pointer",
    ":hover": {
      backgroundColor: colors.surfaceHover,
    },
  },
  image: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    objectFit: "cover",
    flexShrink: 0,
  },
  imagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceDarker,
    flexShrink: 0,
  },
  middleContent: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    flex: 1,
  },
  rightContent: {
    display: "flex",
    alignItems: "center",
    marginLeft: "auto",
    flexShrink: 0,
    maxWidth: "30%",
  },
  truncate: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "block",
  },
  truncateRight: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "block",
    textAlign: "right",
  },
});
