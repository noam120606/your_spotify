import * as stylex from '@stylexjs/stylex';
import { Sidebar } from '../components/sidebar';
import { PageHeader } from '../components/pageHeader';
import { useAuthStore } from '../store/authStore';
import { colors, spacing, borderRadius } from '../components/designSystem/designConstants.stylex';
import { LineChart } from '../components/designSystem/lineChart';
import { useIntervalStore } from '../store/intervalStore';
import { useListenedTo } from '../hooks/useListenedTo';
import { Text } from '../components/designSystem/text';
import { ProgressCard } from '../components/progressCard';
import { ListenHistory } from '../components/listenHistory';
import { FavoriteArtistCard } from '../components/favoriteArtistCard';
import { FavoriteTrackCard } from '../components/favoriteTrackCard';

export function Home() {
  const { user } = useAuthStore();
  const { startDate, endDate } = useIntervalStore();
  const { data, currentTotal, previousTotal, loading } = useListenedTo(startDate, endDate);

  return (
    <div {...stylex.props(styles.container)}>
      <Sidebar />
      <main {...stylex.props(styles.mainContent)}>
        <PageHeader
          title={`Welcome, ${user?.username || 'Guest'}`}
          subtitle="Explore your Spotify listening stats"
        />
        <div {...stylex.props(styles.content)}>

          <div {...stylex.props(styles.dashboardContainer)}>
            {/* Chart Area */}
            <div {...stylex.props(styles.chartContainer)}>
              <Text size="large" weight="bold" color="text" xstyle={styles.chartTitle}>
                Listening History
              </Text>
              {loading ? (
                <div {...stylex.props(styles.loadingContainer)}>
                  <Text color="textSecondary">Loading...</Text>
                </div>
              ) : (
                <LineChart
                  data={data}
                  getX={(d) => d.dateLabel}
                  getY={(d) => d.count}
                  hideYAxis={true}
                  height={200}
                  renderTooltip={(props: any) => {
                    if (props.active && props.payload && props.payload.length) {
                      return (
                        <div {...stylex.props(styles.tooltip)}>
                          <Text size="medium" weight="bold" color="text">
                            {props.label}
                          </Text>
                          <Text size="small" color="textSecondary">
                            {props.payload[0].value} {user?.settings?.metricUsed === 'duration' ? 'ms' : 'listens'}
                          </Text>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              )}
            </div>

            {/* Total Area */}
            <div {...stylex.props(styles.totalArea)}>
              <ProgressCard
                currentTotal={currentTotal}
                previousTotal={previousTotal}
                metricUsedId={user?.settings?.metricUsed || 'number'}
              />
            </div>
          </div>

          <div {...stylex.props(styles.cardsContainer)}>
            <FavoriteArtistCard startDate={startDate} endDate={endDate} />
            <FavoriteTrackCard startDate={startDate} endDate={endDate} />
          </div>

          <ListenHistory />
        </div>
      </main>
    </div>
  );
}

const styles = stylex.create({
  container: {
    display: 'flex',
    minHeight: '100vh',
    width: '100%',
    backgroundColor: colors.background,
  },
  mainContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  content: {
    padding: `0 ${spacing.xl}`,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xl,
    flex: 1,
    marginBottom: spacing.xxl,
  },
  dashboardContainer: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
    gap: spacing.lg,
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
  },
  chartContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.md,
  },
  totalArea: {
    display: 'flex',
    flexDirection: 'column',
  },
  chartTitle: {
    marginBottom: spacing.sm,
  },
  loadingContainer: {
    height: 200,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltip: {
    backgroundColor: colors.surfaceDarker,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.borderHover,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  cardsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: spacing.lg,
  }
});
