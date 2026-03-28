import * as stylex from "@stylexjs/stylex";

import { colors, spacing, borderRadius } from "./designSystem/designConstants.stylex";
import { Text } from "./designSystem/text";

interface NeighborCardProps {
  imageUrl?: string;
  rank: number;
  title: string;
  position: "before" | "current" | "after";
  onClick?: () => void;
}

export function NeighborCard({ imageUrl, rank, title, position, onClick }: NeighborCardProps) {
  return (
    <div
      {...stylex.props(
        position === "current" ? styles.rankingCurrent : styles.rankingNeighbor,
        onClick && styles.clickable,
      )}
      onClick={onClick}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={title} {...stylex.props(styles.neighborImage)} />
      ) : (
        <div {...stylex.props(styles.neighborImagePlaceholder)} />
      )}
      <div {...stylex.props(styles.neighborInfo)}>
        <Text
          weight="bold"
          xstyle={
            position === "before"
              ? styles.neighborRankUp
              : position === "after"
                ? styles.neighborRankDown
                : styles.currentRank
          }
        >
          #{rank}
        </Text>
        <Text weight={position === "current" ? "bold" : "regular"} xstyle={styles.neighborName}>
          {title}
        </Text>
      </div>
    </div>
  );
}

const styles = stylex.create({
  rankingNeighbor: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    width: 250,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.xxl,
    transition: "background-color 0.2s",
  },
  rankingCurrent: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    width: 250,
    backgroundColor: colors.surfaceDark,
    padding: spacing.md,
    borderRadius: borderRadius.xxl,
  },
  clickable: {
    cursor: "pointer",
    ":hover": {
      backgroundColor: colors.surfaceHover,
    },
  },
  neighborImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    objectFit: "cover",
    backgroundColor: colors.surfaceDarker,
  },
  neighborImagePlaceholder: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceDarker,
  },
  neighborInfo: {
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },
  neighborName: {
    fontSize: 14,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    width: "100%",
  },
  neighborRankUp: {
    color: "#1CD760",
  },
  neighborRankDown: {
    color: colors.error,
  },
  currentRank: {
    color: colors.text,
  },
});
