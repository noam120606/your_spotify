import * as stylex from "@stylexjs/stylex";

import { Card } from "./designSystem/card";
import { colors, spacing, borderRadius } from "./designSystem/designConstants.stylex";
import { Text } from "./designSystem/text";

export interface ProgressCardProps {
  currentTotal: number;
  previousTotal: number;
  metricUsedId: string;
}

export function ProgressCard({ currentTotal, previousTotal, metricUsedId }: ProgressCardProps) {
  const metricName = metricUsedId === "duration" ? "ms" : "listens";

  const progressRatio = previousTotal === 0 ? 0 : (currentTotal - previousTotal) / previousTotal;
  const progressPercent = Math.round(progressRatio * 100);

  // Bar width logic: Cap at 100% just for visualization of the bar. Actual text shows raw math.
  const cappedProgress =
    previousTotal === 0
      ? currentTotal > 0
        ? 100
        : 0
      : Math.min(100, Math.max(0, (currentTotal / previousTotal) * 100));

  const isPositive = progressPercent >= 0;
  const progressColor = isPositive ? colors.primary : colors.error;

  return (
    <div {...stylex.props(styles.wrapper)}>
      <Card variant="dark" fullHeight>
        <div {...stylex.props(styles.container)}>
          <Text size="small" color="textSecondary" xstyle={styles.title}>
            Total {metricName === "ms" ? "Duration" : "Listens"}
          </Text>

          <div {...stylex.props(styles.totalContainer)}>
            <Text size="xxlarge" weight="bold" color="text">
              {currentTotal.toLocaleString()}
            </Text>
          </div>

          <div {...stylex.props(styles.progressSection)}>
            <div {...stylex.props(styles.progressLabelRow)}>
              <Text size="small" color="textSecondary">
                Compared to previous interval
              </Text>
              <Text
                size="small"
                weight="bold"
                style={{ color: progressColor as unknown as string }}
              >
                {isPositive ? "+" : ""}
                {progressPercent}%
              </Text>
            </div>

            <div {...stylex.props(styles.progressBarBackground)}>
              <div
                {...stylex.props(styles.progressBarFill)}
                style={{
                  width: `${cappedProgress}%`,
                  backgroundColor: progressColor as unknown as string,
                }}
              />
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

const styles = stylex.create({
  wrapper: {
    display: "flex",
    flexDirection: "column",
    height: "calc(100% + 42px)",
    width: "32%",
    marginTop: "-42px",
    marginRight: "-8px",
  },
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "center",
  },
  title: {
    marginBottom: spacing.xs,
  },
  totalContainer: {
    display: "flex",
    alignItems: "baseline",
    gap: spacing.xs,
    marginBottom: spacing.xl,
  },
  metricLabel: {
    opacity: 0.8,
  },
  progressSection: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
  },
  progressLabelRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.xs,
  },
  progressBarBackground: {
    width: "100%",
    height: "4px",
    backgroundColor: colors.border,
    borderRadius: borderRadius.full,
    overflow: "hidden",
  },
  progressBarFill: {
    height: "100%",
    borderRadius: borderRadius.full,
    transition: "width 0.5s ease-in-out, background-color 0.5s ease-in-out",
  },
});
