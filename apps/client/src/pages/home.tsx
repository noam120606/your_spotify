import * as stylex from "@stylexjs/stylex";

import { Card } from "../components/designSystem/card";
import { colors, spacing, borderRadius } from "../components/designSystem/designConstants.stylex";
import { LineChart } from "../components/designSystem/lineChart";
import { Text } from "../components/designSystem/text";
import { FavoriteArtistCard } from "../components/favoriteArtistCard";
import { FavoriteTrackCard } from "../components/favoriteTrackCard";
import { ListenHistory } from "../components/listenHistory";
import { PageHeader } from "../components/pageHeader";
import { ProgressCard } from "../components/progressCard";
import { Sidebar } from "../components/sidebar";
import { StatsCard } from "../components/statsCard";
import { useListenedTo } from "../hooks/useListenedTo";
import { useAuthStore } from "../store/authStore";
import { useIntervalStore } from "../store/intervalStore";

export function Home() {
  const { user } = useAuthStore();
  const { startDate, endDate } = useIntervalStore();
  const { data, currentTotal, previousTotal, loading } = useListenedTo(startDate, endDate);

  return (
    <div {...stylex.props(styles.container)}>
      <Sidebar />
      <main {...stylex.props(styles.mainContent)}>
        <PageHeader
          title={`Welcome, ${user?.username || "Guest"}`}
          subtitle="Explore your Spotify listening stats"
        />
        <div {...stylex.props(styles.content)}>
          <Card title="Listening History">
            <div {...stylex.props(styles.chartWrapper)}>
              <div {...stylex.props(styles.chartContainer)}>
                {loading && data.length === 0 ? (
                  <div {...stylex.props(styles.loadingContainer)}>
                    <Text color="textSecondary">Loading...</Text>
                  </div>
                ) : (
                  <LineChart
                    data={data}
                    getX={(d) => d.dateLabel}
                    getY={(d) => d.count}
                    hideYAxis={true}
                    height={250}
                    renderTooltip={(props: any) => {
                      if (props.active && props.payload && props.payload.length) {
                        return (
                          <div {...stylex.props(styles.tooltip)}>
                            <Text size="medium" weight="bold" color="text">
                              {props.label}
                            </Text>
                            <Text size="small" color="textSecondary">
                              {props.payload[0].value}{" "}
                              {user?.settings?.metricUsed === "duration" ? "ms" : "listens"}
                            </Text>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                )}
              </div>
              <ProgressCard
                currentTotal={currentTotal}
                previousTotal={previousTotal}
                metricUsedId={user?.settings?.metricUsed || "number"}
              />
            </div>
          </Card>

          <div {...stylex.props(styles.cardsContainer)}>
            <FavoriteArtistCard startDate={startDate} endDate={endDate} />
            <FavoriteTrackCard startDate={startDate} endDate={endDate} />
            <StatsCard startDate={startDate} endDate={endDate} />
          </div>

          <ListenHistory />
        </div>
      </main>
    </div>
  );
}

const styles = stylex.create({
  container: {
    display: "flex",
    minHeight: "100vh",
    width: "100%",
    backgroundColor: colors.background,
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  content: {
    padding: `0 ${spacing.xl}`,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xl,
    flex: 1,
    marginBottom: spacing.xxl,
  },
  dashboardContainer: {
    display: "grid",
    gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)",
    gap: spacing.lg,
  },
  chartWrapper: {
    display: "flex",
    flexDirection: "row",
    gap: spacing.md,
  },
  chartContainer: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
    flexShrink: 0,
    flexGrow: 1,
  },
  chartTitle: {
    marginBottom: spacing.sm,
  },
  loadingContainer: {
    height: 350,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tooltip: {
    backgroundColor: colors.surfaceDarker,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: colors.borderHover,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  cardsContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
    gap: spacing.lg,
  },
});
