import * as stylex from "@stylexjs/stylex";

import { Card } from "../../../../components/designSystem/card";
import { spacing } from "../../../../components/designSystem/designConstants.stylex";
import { Select } from "../../../../components/designSystem/select";
import { Text } from "../../../../components/designSystem/text";
import { useAuthStore } from "../../../../store/authStore";

export function StatMeasurementCard() {
  const { user, updateSetting } = useAuthStore();

  return (
    <Card title="Stat Measurement">
      <div {...stylex.props(styles.container)}>
        <div {...stylex.props(styles.info)}>
          <Text as="p" size="small" color="textSecondary">
            Choose whether your top statistics are computed by play count or listening duration.
          </Text>
        </div>
        <div {...stylex.props(styles.controlWrapper)}>
          <Select
            options={[
              { label: "Count", value: "number" },
              { label: "Duration", value: "duration" },
            ]}
            value={user?.settings?.metricUsed || "number"}
            onChange={(val) => updateSetting("metricUsed", val as any)}
            darken
          />
        </div>
      </div>
    </Card>
  );
}

const styles = stylex.create({
  container: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${spacing.md} 0`,
  },
  info: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  controlWrapper: {
    width: "300px",
  },
});
