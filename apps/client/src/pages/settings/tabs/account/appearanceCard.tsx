import * as stylex from "@stylexjs/stylex";

import { Card } from "../../../../components/designSystem/card";
import {
  spacing,
  fontSize,
  fontWeight,
} from "../../../../components/designSystem/designConstants.stylex";
import { Select } from "../../../../components/designSystem/select";
import { Text } from "../../../../components/designSystem/text";
import { SegmentedControl } from "../../../../components/segmentedControl";
import { useAuthStore } from "../../../../store/authStore";
import { dateFormats } from "./dateFormats";

const dateFormatOptions = [
  { label: "Auto (browser default)", value: "" },
  ...dateFormats.map((format) => ({ label: format.name, value: format.code })),
];

const timezones = Intl.supportedValuesOf("timeZone");

const timezoneOptions = [
  { label: "Auto (server default)", value: "" },
  ...timezones.map(function formatTimezone(tz) {
    return { label: tz.replace(/_/g, " "), value: tz };
  }),
];

export function AppearanceCard() {
  const { user, updateSetting } = useAuthStore();

  const handleThemeChange = (mode: "light" | "dark" | "follow") => {
    updateSetting("darkMode", mode);
  };

  const themeMode = user?.settings.darkMode ?? "follow";

  return (
    <Card title="Appearance">
      <div {...stylex.props(styles.appearanceRow)}>
        <div {...stylex.props(styles.appearanceInfo)}>
          <Text as="span" size="medium" weight="regular" color="text">
            Theme Mode
          </Text>
          <Text as="span" size="small" color="textSecondary" align="left">
            Choose how YourSpotify looks to you
          </Text>
        </div>
        <div {...stylex.props(styles.controlWrapper)}>
          <SegmentedControl.Root
            selectedIndex={themeMode === "light" ? 0 : themeMode === "dark" ? 1 : 2}
            onIndexChange={(idx) =>
              handleThemeChange(idx === 0 ? "light" : idx === 1 ? "dark" : "follow")
            }
            fullWidth
          >
            <SegmentedControl.Item index={0}>
              {({ selected }) => (
                <Text
                  as="span"
                  size="small"
                  weight="semiBold"
                  color={selected ? "background" : "textSecondary"}
                  xstyle={styles.themeSegmentText}
                >
                  Light
                </Text>
              )}
            </SegmentedControl.Item>
            <SegmentedControl.Item index={1}>
              {({ selected }) => (
                <Text
                  as="span"
                  size="small"
                  weight="semiBold"
                  color={selected ? "background" : "textSecondary"}
                  xstyle={styles.themeSegmentText}
                >
                  Dark
                </Text>
              )}
            </SegmentedControl.Item>
            <SegmentedControl.Item index={2}>
              {({ selected }) => (
                <Text
                  as="span"
                  size="small"
                  weight="semiBold"
                  color={selected ? "background" : "textSecondary"}
                  xstyle={styles.themeSegmentText}
                >
                  System
                </Text>
              )}
            </SegmentedControl.Item>
          </SegmentedControl.Root>
        </div>
      </div>

      <div {...stylex.props(styles.appearanceRow)}>
        <div {...stylex.props(styles.appearanceInfo)}>
          <Text as="span" size="medium" weight="regular" color="text">
            Date Format
          </Text>
          <Text as="span" size="small" color="textSecondary" align="left">
            Choose how dates are displayed
          </Text>
        </div>
        <div {...stylex.props(styles.controlWrapper)}>
          <Select
            options={dateFormatOptions}
            value={user?.settings?.dateFormat || ""}
            onChange={(val) => updateSetting("dateFormat", val)}
            darken
          />
        </div>
      </div>

      <div {...stylex.props(styles.appearanceRow)}>
        <div {...stylex.props(styles.appearanceInfo)}>
          <Text as="span" size="medium" weight="regular" color="text">
            Timezone
          </Text>
          <Text as="span" size="small" color="textSecondary" align="left">
            Determine your stats computation period
          </Text>
        </div>
        <div {...stylex.props(styles.controlWrapper)}>
          <Select
            options={timezoneOptions}
            value={user?.settings?.timezone ?? ""}
            onChange={(val) => updateSetting("timezone", val || null)}
            darken
          />
        </div>
      </div>
    </Card>
  );
}

const styles = stylex.create({
  appearanceRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${spacing.md} 0`,
  },
  appearanceInfo: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  controlWrapper: {
    width: "300px",
  },
  themeSegmentText: {
    fontSize: fontSize.small,
    fontWeight: fontWeight.semiBold,
    zIndex: 2,
  },
});
