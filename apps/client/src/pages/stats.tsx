import * as stylex from '@stylexjs/stylex';
import { useState, useEffect } from 'react';
import { Sidebar } from '../components/sidebar';
import { PageHeader } from '../components/pageHeader';
import { colors, spacing, borderRadius } from '../components/designSystem/designConstants.stylex';
import { useIntervalStore } from '../store/intervalStore';
import { api } from '../api/spotifyApi';
import { Card } from '../components/designSystem/card';
import { BarChart } from '../components/designSystem/barChart';
import { DateUtils } from '../utils/dateUtils';
import { Text } from '../components/designSystem/text';
import { Loader } from '../components/designSystem/loader';
import { useAlbumDateRatio } from '../hooks/useAlbumDateRatio';
import { useDifferentArtistsPer } from '../hooks/useDifferentArtistsPer';
import { useFeatRatio } from '../hooks/useFeatRatio';
import { LineChart } from '../components/designSystem/lineChart';

export function Stats() {
  const { startDate, endDate } = useIntervalStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [data, setData] = useState<{ _id: number; count: number }[]>([]);

  const { data: albumData, loading: albumLoading, error: albumError } = useAlbumDateRatio(startDate, endDate);
  const { data: artistsData, loading: artistsLoading, error: artistsError } = useDifferentArtistsPer(startDate, endDate);
  const { data: featsData, loading: featsLoading, error: featsError } = useFeatRatio(startDate, endDate);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      let start = startDate;
      const end = endDate || new Date();
      if (!start) {
        start = new Date(end);
        start.setDate(start.getDate() - 30);
      }

      setLoading(true);
      setError(false);
      try {
        const res = await api.timePerHourOfDay(start, end);
        if (isMounted) {
          setData(res.data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error fetching time per hour stats:', err);
        if (isMounted) {
          setError(true);
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, [startDate, endDate]);

  const hourlyData = Array.from({ length: 24 }).map((_, i) => ({
    hour: i,
    count: 0,
  }));

  let totalCount = 0;
  data.forEach(d => {
    hourlyData[d._id] = { hour: d._id, count: d.count };
    totalCount += d.count;
  });

  return (
    <div {...stylex.props(styles.container)}>
      <Sidebar />
      <main {...stylex.props(styles.mainContent)}>
        <PageHeader
          title="All Stats"
          subtitle="Explore your Spotify listening stats in detail"
        />
        <div {...stylex.props(styles.content)}>
          {loading ? (
            <div {...stylex.props(styles.center)}>
              <Loader />
            </div>
          ) : error ? (
            <div {...stylex.props(styles.center)}>
              <Text color="textSecondary">Error loading stats.</Text>
            </div>
          ) : (
            <div {...stylex.props(styles.gridContainer)}>
              <Card title="Time of Day">
                <div {...stylex.props(styles.chartContainer)}>
                  <BarChart
                    data={hourlyData}
                    getX={(d) => DateUtils.formatHour(d.hour)}
                    getY={(d) => d.count}
                    height={200}
                    renderTooltip={(props: any) => {
                      if (props.active && props.payload && props.payload.length) {
                        const payloadData = props.payload[0].payload;
                        const percentage = totalCount > 0 ? ((payloadData.count / totalCount) * 100).toFixed(1) : '0.0';
                        const timeRange = `${DateUtils.formatHour(payloadData.hour)} - ${DateUtils.formatHour(payloadData.hour + 1)}`;
                        return (
                          <div {...stylex.props(styles.tooltip)}>
                            <Text weight="bold" xstyle={styles.tooltipTitle}>{timeRange}</Text>
                            <Text color="textSecondary">{payloadData.count} plays ({percentage}%)</Text>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </div>
              </Card>

              <Card title="Average Album Release Year">
                <div {...stylex.props(styles.chartContainer)}>
                  {albumLoading ? (
                    <div {...stylex.props(styles.center)}>
                      <Loader />
                    </div>
                  ) : albumError ? (
                    <div {...stylex.props(styles.center)}>
                      <Text color="textSecondary">Error loading album release year data.</Text>
                    </div>
                  ) : albumData.length === 0 ? (
                    <div {...stylex.props(styles.center)}>
                      <Text color="textSecondary">No data available for this period.</Text>
                    </div>
                  ) : (
                    <LineChart
                      data={albumData}
                      getX={(d) => d.dateLabel}
                      getY={(d) => Math.floor(d.averageYear)}
                      height={200}
                      yAxisDomain={['dataMin', 'dataMax']}
                      yAxisAllowDecimals={false}
                      renderTooltip={(props: any) => {
                        if (props.active && props.payload && props.payload.length) {
                          const payloadData = props.payload[0].payload;
                          return (
                            <div {...stylex.props(styles.tooltip)}>
                              <Text weight="bold" xstyle={styles.tooltipTitle}>{payloadData.dateLabel}</Text>
                              <Text color="textSecondary">Year: {Math.floor(payloadData.averageYear)}</Text>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  )}
                </div>
              </Card>

              <Card title="Different Artists Listened">
                <div {...stylex.props(styles.chartContainer)}>
                  {artistsLoading ? (
                    <div {...stylex.props(styles.center)}>
                      <Loader />
                    </div>
                  ) : artistsError ? (
                    <div {...stylex.props(styles.center)}>
                      <Text color="textSecondary">Error loading different artists data.</Text>
                    </div>
                  ) : (
                    <LineChart
                      data={artistsData}
                      getX={(d) => d.dateLabel}
                      getY={(d) => d.count}
                      height={200}
                      renderTooltip={(props: any) => {
                        if (props.active && props.payload && props.payload.length) {
                          const payloadData = props.payload[0].payload;
                          return (
                            <div {...stylex.props(styles.tooltip)}>
                              <Text weight="bold" xstyle={styles.tooltipTitle}>{payloadData.dateLabel}</Text>
                              <Text color="textSecondary">{payloadData.count} different artists</Text>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  )}
                </div>
              </Card>

              <Card title="Average Featurings per Track">
                <div {...stylex.props(styles.chartContainer)}>
                  {featsLoading ? (
                    <div {...stylex.props(styles.center)}>
                      <Loader />
                    </div>
                  ) : featsError ? (
                    <div {...stylex.props(styles.center)}>
                      <Text color="textSecondary">Error loading featurings data.</Text>
                    </div>
                  ) : featsData.length === 0 ? (
                    <div {...stylex.props(styles.center)}>
                      <Text color="textSecondary">No data available for this period.</Text>
                    </div>
                  ) : (
                    <LineChart
                      data={featsData}
                      getX={(d) => d.dateLabel}
                      getY={(d) => d.averageFeats}
                      height={200}
                      yAxisAllowDecimals={true}
                      renderTooltip={(props: any) => {
                        if (props.active && props.payload && props.payload.length) {
                          const payloadData = props.payload[0].payload;
                          return (
                            <div {...stylex.props(styles.tooltip)}>
                              <Text weight="bold" xstyle={styles.tooltipTitle}>{payloadData.dateLabel}</Text>
                              <Text color="textSecondary">{payloadData.averageFeats} feats on average</Text>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  )}
                </div>
              </Card>
            </div>
          )}
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
  center: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 300,
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: spacing.xl,
  },
  chartContainer: {
    width: '100%',
    height: 200,
  },
  tooltip: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.surfaceDarker}`,
  },
  tooltipTitle: {
    display: 'block',
    marginBottom: spacing.xs,
  }
});
