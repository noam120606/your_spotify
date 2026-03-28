import * as stylex from "@stylexjs/stylex";

import { useIntervalStats } from "../hooks/useIntervalStats";
import { Card } from "./designSystem/card";
import { colors, spacing, borderRadius } from "./designSystem/designConstants.stylex";
import { Text } from "./designSystem/text";

export interface StatsCardProps {
  startDate: Date | null;
  endDate: Date | null;
}

export function StatsCard({ startDate, endDate }: StatsCardProps) {
  const { data, prevData, loading } = useIntervalStats(startDate, endDate);

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    return `${minutes.toLocaleString()} min`;
  };

  const calculateProgress = (current: number, previous: number) => {
    const progressRatio = previous === 0 ? 0 : (current - previous) / previous;
    return Math.round(progressRatio * 100);
  };

  const getProgressColor = (percent: number) => {
    return percent >= 0 ? colors.primary : colors.error;
  };

  const isPositive = (percent: number) => percent >= 0;

  return (
    <Card title="Interval Stats">
      {loading && (!data || !prevData) ? (
        <div {...stylex.props(styles.contentContainer)}>
          <Text color="textSecondary">Loading...</Text>
        </div>
      ) : data && prevData ? (
        <div {...stylex.props(styles.statsContainer)}>
          {/* Artists Stat */}
          <div {...stylex.props(styles.statRow)}>
            <div {...stylex.props(styles.statInfo)}>
              <Text size="small" color="textSecondary">
                Different Artists
              </Text>
              <Text size="xlarge" weight="bold" color="text">
                {data.differentArtists.toLocaleString()}
              </Text>
            </div>
            {prevData &&
              (() => {
                const diffPercent = calculateProgress(
                  data.differentArtists,
                  prevData.differentArtists,
                );
                const isPos = isPositive(diffPercent);
                return (
                  <div {...stylex.props(styles.progressContainer)}>
                    <Text
                      size="small"
                      weight="bold"
                      style={{ color: getProgressColor(diffPercent) as unknown as string }}
                    >
                      {isPos ? "+" : ""}
                      {diffPercent}%
                    </Text>
                  </div>
                );
              })()}
          </div>

          <div {...stylex.props(styles.divider)} />

          {/* Duration Stat */}
          <div {...stylex.props(styles.statRow)}>
            <div {...stylex.props(styles.statInfo)}>
              <Text size="small" color="textSecondary">
                Time Listened
              </Text>
              <Text size="xlarge" weight="bold" color="text">
                {formatDuration(data.totalDurationMs)}
              </Text>
            </div>
            {prevData &&
              (() => {
                const diffPercent = calculateProgress(
                  data.totalDurationMs,
                  prevData.totalDurationMs,
                );
                const isPos = isPositive(diffPercent);
                return (
                  <div {...stylex.props(styles.progressContainer)}>
                    <Text
                      size="small"
                      weight="bold"
                      style={{ color: getProgressColor(diffPercent) as unknown as string }}
                    >
                      {isPos ? "+" : ""}
                      {diffPercent}%
                    </Text>
                  </div>
                );
              })()}
          </div>
        </div>
      ) : (
        <div {...stylex.props(styles.contentContainer)}>
          <Text color="textSecondary">No data available</Text>
        </div>
      )}
    </Card>
  );
}

const styles = stylex.create({
  contentContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  statsContainer: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    flex: 1,
    gap: spacing.md,
  },
  statRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  statInfo: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  progressContainer: {
    padding: `${spacing.xs} ${spacing.sm}`,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surfaceHover,
  },
  divider: {
    height: "1px",
    width: "100%",
    backgroundColor: colors.border,
    margin: `${spacing.sm} 0`,
  },
});
