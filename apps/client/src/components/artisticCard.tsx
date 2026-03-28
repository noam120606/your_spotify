import * as stylex from "@stylexjs/stylex";
import React from "react";

import { colors, spacing, borderRadius } from "./designSystem/designConstants.stylex";
import { Text } from "./designSystem/text";

export interface ArtisticCardProps {
  title: string;
  loading?: boolean;
  backgroundImageUrl?: string | null;
  emphasizedText?: React.ReactNode;
  detailsText?: React.ReactNode;
  onClick?: () => void;
}

export function ArtisticCard({
  title,
  loading,
  backgroundImageUrl,
  emphasizedText,
  detailsText,
  onClick,
}: ArtisticCardProps) {
  return (
    <div {...stylex.props(styles.container, onClick && styles.clickable)} onClick={onClick}>
      {backgroundImageUrl && (
        <img
          src={backgroundImageUrl}
          alt={typeof emphasizedText === "string" ? emphasizedText : title}
          {...stylex.props(styles.backgroundImage)}
        />
      )}
      <div {...stylex.props(styles.overlay)} />

      <Text
        size="small"
        weight="bold"
        style={{ color: "rgba(255,255,255,0.7)" }}
        xstyle={styles.title}
      >
        {title}
      </Text>

      {loading && !emphasizedText && !detailsText ? (
        <div {...stylex.props(styles.contentContainer)}>
          <Text color="textSecondary">Loading...</Text>
        </div>
      ) : emphasizedText || detailsText ? (
        <div {...stylex.props(styles.contentContainer)}>
          {emphasizedText && (
            <Text
              size="xxlarge"
              weight="bold"
              style={{ color: "#fff" }}
              xstyle={styles.emphasizedText}
            >
              {emphasizedText}
            </Text>
          )}
          {detailsText && (
            <Text
              size="medium"
              style={{ color: "rgba(255,255,255,0.7)" }}
              xstyle={styles.detailsText}
            >
              {detailsText}
            </Text>
          )}
        </div>
      ) : (
        <div {...stylex.props(styles.contentContainer)}>
          <Text color="textSecondary">No data available</Text>
        </div>
      )}
    </div>
  );
}

const styles = stylex.create({
  container: {
    position: "relative",
    backgroundColor: colors.surfaceDarker,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: "300px",
    overflow: "hidden",
    boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
    transition: "transform 0.2s",
  },
  clickable: {
    cursor: "pointer",
    ":hover": {
      transform: "scale(1.02)",
    },
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 0,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.9) 100%)",
    zIndex: 1,
  },
  title: {
    position: "relative",
    zIndex: 2,
    marginBottom: "auto",
    textTransform: "uppercase",
    letterSpacing: "1px",
  },
  contentContainer: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-end",
    gap: spacing.xs,
  },
  emphasizedText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "-webkit-box",
    WebkitLineClamp: 2,
    WebkitBoxOrient: "vertical",
    textShadow: "0 2px 4px rgba(0,0,0,0.5)",
  },
  detailsText: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    width: "100%",
  },
});
