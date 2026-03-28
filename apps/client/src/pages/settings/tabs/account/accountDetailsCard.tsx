import * as stylex from "@stylexjs/stylex";

import { Card } from "../../../../components/designSystem/card";
import {
  colors,
  spacing,
  fontSize,
  fontWeight,
} from "../../../../components/designSystem/designConstants.stylex";
import { Text } from "../../../../components/designSystem/text";
import { useAuthStore } from "../../../../store/authStore";

export function AccountDetailsCard() {
  const { user, spotify } = useAuthStore();

  const accountInfo = [
    { label: "Spotify Account Name", value: spotify?.display_name },
    { label: "Spotify Email", value: spotify?.email },
    { label: "Spotify Account ID", value: spotify?.id },
    { label: "Internal Account ID", value: user?._id },
    { label: "Product Type", value: spotify?.product },
  ];

  return (
    <Card title="Account Details">
      <div {...stylex.props(styles.detailsListContainer)}>
        {accountInfo.map((info, i) => (
          <div
            key={i}
            {...stylex.props(
              styles.detailRow,
              i !== accountInfo.length - 1 && styles.detailRowBorder,
            )}
          >
            <Text
              as="span"
              size="small"
              weight="medium"
              transform="uppercase"
              color="textSecondary"
              xstyle={styles.infoLabel}
            >
              {info.label}
            </Text>
            <Text
              as="span"
              size="medium"
              weight="semiBold"
              color="text"
              align="right"
              xstyle={styles.infoValue}
            >
              {info.value || "N/A"}
            </Text>
          </div>
        ))}
      </div>
    </Card>
  );
}

const styles = stylex.create({
  detailsListContainer: {
    display: "flex",
    flexDirection: "column",
  },
  detailRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${spacing.md} 0`,
  },
  detailRowBorder: {
    borderBottom: `1px solid ${colors.border}`,
  },
  infoLabel: {
    fontSize: fontSize.small,
    color: colors.textSecondary,
    fontWeight: fontWeight.medium,
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  infoValue: {
    fontSize: fontSize.medium,
    color: colors.text,
    fontWeight: fontWeight.semiBold,
    wordBreak: "break-all",
    textAlign: "right",
    maxWidth: "60%",
  },
});
