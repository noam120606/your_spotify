import * as stylex from "@stylexjs/stylex";

import { Card } from "../../../../components/designSystem/card";
import {
  colors,
  spacing,
  borderRadius,
  fontSize,
  fontWeight,
} from "../../../../components/designSystem/designConstants.stylex";
import { Text } from "../../../../components/designSystem/text";
import { useAuthStore } from "../../../../store/authStore";

export function ProfileHeaderCard() {
  const { spotify } = useAuthStore();
  return (
    <Card>
      <div {...stylex.props(styles.profileHeader)}>
        {spotify?.images?.[0]?.url ? (
          <img
            src={spotify.images[1]?.url || spotify.images[0].url}
            alt="Profile Avatar"
            {...stylex.props(styles.avatar)}
          />
        ) : (
          <div {...stylex.props(styles.avatarPlaceholder)}>
            {spotify?.display_name?.[0]?.toUpperCase() || "U"}
          </div>
        )}

        <div {...stylex.props(styles.profileInfo)}>
          <Text as="h2" size="xxlarge" weight="bold" color="text">
            {spotify?.display_name || "Spotify User"}
          </Text>
          <div {...stylex.props(styles.badgeWrapper)}>
            <Text
              as="span"
              size="small"
              weight="bold"
              transform="uppercase"
              color={spotify?.product === "premium" ? "background" : "textSecondary"}
              xstyle={[
                styles.productBadge,
                spotify?.product === "premium" && styles.productBadgePremium,
              ]}
            >
              {spotify?.product ? spotify.product : "UNKNOWN"}
            </Text>
          </div>
        </div>
      </div>
    </Card>
  );
}

const styles = stylex.create({
  profileHeader: {
    display: "flex",
    alignItems: "center",
    gap: spacing.xl,
  },
  avatar: {
    width: "100px",
    height: "100px",
    borderRadius: borderRadius.full,
    objectFit: "cover",
    boxShadow: `0 4px 12px rgba(0,0,0,0.1)`,
  },
  avatarPlaceholder: {
    width: "100px",
    height: "100px",
    borderRadius: borderRadius.full,
    backgroundColor: colors.surfaceDarker,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: fontSize.xxlarge,
    fontWeight: fontWeight.bold,
    color: colors.textSecondary,
    boxShadow: `0 4px 12px rgba(0,0,0,0.1)`,
  },
  profileInfo: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
  },
  badgeWrapper: {
    display: "flex",
  },
  productBadge: {
    padding: `${spacing.xs} ${spacing.md}`,
    borderRadius: borderRadius.full,
    fontSize: fontSize.small,
    fontWeight: fontWeight.bold,
    backgroundColor: colors.surfaceDarker,
    color: colors.textSecondary,
    textTransform: "uppercase",
    letterSpacing: "1px",
    display: "inline-flex",
    alignItems: "center",
  },
  productBadgePremium: {
    backgroundColor: colors.primary,
    color: "#000000",
  },
});
