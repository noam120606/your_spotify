import * as stylex from "@stylexjs/stylex";

import { SpotifyImage } from "../api/types";
import { ImageUtils } from "../utils/imageUtils";
import { colors, spacing, borderRadius } from "./designSystem/designConstants.stylex";
import { Text } from "./designSystem/text";

export interface AlbumCellProps {
  coverImages: SpotifyImage[];
  albumName: string;
  artistName: React.ReactNode;
  onClick?: () => void;
}

export function AlbumCell({ coverImages, albumName, artistName, onClick }: AlbumCellProps) {
  const coverUrl = ImageUtils.getOptimizedImage(coverImages, 48);

  return (
    <div {...stylex.props(styles.container)}>
      {coverUrl ? (
        <img src={coverUrl} alt={albumName} {...stylex.props(styles.coverImage)} />
      ) : (
        <div {...stylex.props(styles.coverPlaceholder)} />
      )}
      <div {...stylex.props(styles.textContainer)}>
        <Text
          color="text"
          weight="bold"
          xstyle={[styles.truncate, !!onClick && styles.clickableTitle]}
          onClick={onClick}
          role={onClick ? "link" : undefined}
          tabIndex={onClick ? 0 : undefined}
        >
          {albumName}
        </Text>
        <Text color="textSecondary" size="small" xstyle={styles.truncate}>
          {artistName}
        </Text>
      </div>
    </div>
  );
}

const styles = stylex.create({
  container: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    minWidth: 0,
  },
  clickableTitle: {
    cursor: "pointer",
    ":hover": {
      textDecoration: "underline",
    },
  },
  coverImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    objectFit: "cover",
    flexShrink: 0,
  },
  coverPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceDarker,
    flexShrink: 0,
  },
  textContainer: {
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    flex: 1,
  },
  truncate: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "block",
  },
});
