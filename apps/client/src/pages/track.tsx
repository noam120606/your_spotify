import * as stylex from '@stylexjs/stylex';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Sidebar } from '../components/sidebar';
import { PageHeader } from '../components/pageHeader';
import { colors, spacing, borderRadius } from '../components/designSystem/designConstants.stylex';
import { api, TrackStatsResponse } from '../api/spotifyApi';
import { Track } from '../api/types';
import { Text } from '../components/designSystem/text';
import { FullScreenLoader } from '../components/fullScreenLoader';
import { ImageUtils } from '../utils/imageUtils';
import { GenericRow } from '../components/genericRow';
import { DateUtils } from '../utils/dateUtils';
import { Card } from '../components/designSystem/card';
import { NeighborCard } from '../components/neighborCard';

export function TrackPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [stats, setStats] = useState<TrackStatsResponse | null>(null);
  const [rank, setRank] = useState<{ index: number; isMax: boolean; isMin: boolean; results: { id: string; count: number }[] } | null>(null);
  const [prevTrack, setPrevTrack] = useState<{ track: any, count: number } | null>(null);
  const [nextTrack, setNextTrack] = useState<{ track: any, count: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [neverListened, setNeverListened] = useState(false);

  useEffect(() => {
    if (!id) return;

    let isMounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError(false);
      setNeverListened(false);
      setPrevTrack(null);
      setNextTrack(null);

      try {
        const [statsRes, rankRes] = await Promise.all([
          api.getTrackStats(id),
          api.getTrackRank(id)
        ]);

        if (!isMounted) return;

        if ('code' in statsRes.data && statsRes.data.code === 'NEVER_LISTENED') {
          setNeverListened(true);
          setLoading(false);
          return;
        }

        const rankData = rankRes.data;
        const currentIndex = rankData.results.findIndex(r => r.id === id);
        const prevId = currentIndex > 0 ? rankData.results[currentIndex - 1]?.id : null;
        const nextId = currentIndex !== -1 && currentIndex < rankData.results.length - 1 ? rankData.results[currentIndex + 1]?.id : null;

        const idsToFetch = [prevId, nextId].filter(Boolean) as string[];
        if (idsToFetch.length > 0) {
          const surroundingRes = await api.getTrackDetails(idsToFetch);

          if (prevId) {
            const track = surroundingRes.data.find(t => t.id === prevId);
            const count = rankData.results.find(r => r.id === prevId)?.count || 0;
            if (track) setPrevTrack({ track, count });
          }
          if (nextId) {
            const track = surroundingRes.data.find(t => t.id === nextId);
            const count = rankData.results.find(r => r.id === nextId)?.count || 0;
            if (track) setNextTrack({ track, count });
          }
        }

        setStats(statsRes.data as TrackStatsResponse);
        setRank(rankData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching track stats", err);
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
  }, [id]);

  if (loading) {
    return (
      <div {...stylex.props(styles.container)}>
        <Sidebar />
        <main {...stylex.props(styles.mainContent)}>
          <FullScreenLoader isLoading={true} />
        </main>
      </div>
    );
  }

  if (error || neverListened || !stats || !rank) {
    return (
      <div {...stylex.props(styles.container)}>
        <Sidebar />
        <main {...stylex.props(styles.mainContent)}>
          <div {...stylex.props(styles.center)}>
            <Text color="textSecondary">
              {neverListened ? "You have never listened to this track." : "Error loading track."}
            </Text>
          </div>
        </main>
      </div>
    );
  }

  const { track, artist, album, firstLast, total, bestPeriod, recentHistory } = stats;
  const coverUrl = ImageUtils.getOptimizedImage(album.images, 300);
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMonthName = (month: number | undefined) => {
    if (month === undefined) return '';
    const date = new Date(2000, month - 1, 1);
    return date.toLocaleString('default', { month: 'long' });
  };

  const headerSubtitle = (
    <span>
      <Link to={`/artist/${artist.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>{artist.name}</Link>
    </span>
  );

  return (
    <div {...stylex.props(styles.container)}>
      <Sidebar />
      <main {...stylex.props(styles.mainContent)}>
        <PageHeader title={track.name} subtitle={headerSubtitle} />

        <div {...stylex.props(styles.content)}>
          {rank && (
            <div {...stylex.props(styles.rankingHeader)}>
              {prevTrack && (
                <NeighborCard
                  position="before"
                  imageUrl={prevTrack.track.album?.images?.[0] ? ImageUtils.getOptimizedImage(prevTrack.track.album.images, 64) || undefined : undefined}
                  rank={rank.index}
                  title={prevTrack.track.name}
                  onClick={() => navigate(`/track/${prevTrack.track.id}`)}
                />
              )}

              <NeighborCard
                position="current"
                imageUrl={coverUrl || undefined}
                rank={rank.index + 1}
                title={track.name}
              />

              {nextTrack && (
                <NeighborCard
                  position="after"
                  imageUrl={nextTrack.track.album?.images?.[0] ? ImageUtils.getOptimizedImage(nextTrack.track.album.images, 64) || undefined : undefined}
                  rank={rank.index + 2}
                  title={nextTrack.track.name}
                  onClick={() => navigate(`/track/${nextTrack.track.id}`)}
                />
              )}
            </div>
          )}

          <div {...stylex.props(styles.topRow)}>
            <div {...stylex.props(styles.topSection)}>
              {coverUrl ? (
                <img src={coverUrl} alt={track.name} {...stylex.props(styles.coverImage)} />
              ) : (
                <div {...stylex.props(styles.coverPlaceholder)} />
              )}
              <div {...stylex.props(styles.topRightContent)}>
                <div {...stylex.props(styles.titleWrapper)}>
                  <Text weight="bold" xstyle={styles.trackNameTitle}>{track.name}</Text>
                  <Text color="textSecondary" size="large">
                    <Link to={`/artist/${artist.id}`} {...stylex.props(styles.link)}>{artist.name}</Link>
                    {' • '}
                    <Link to={`/album/${album.id}`} {...stylex.props(styles.link)}>{album.name}</Link>
                  </Text>
                </div>

                <div {...stylex.props(styles.statsSectionsWrapper)}>
                  <div {...stylex.props(styles.statsSection)}>
                    <div {...stylex.props(styles.statsRow)}>
                      <div {...stylex.props(styles.statBox)}>
                        <Text size="large" weight="bold">#{rank.index + 1}</Text>
                        <Text color="textSecondary" size="small">Ranking</Text>
                      </div>
                      <div {...stylex.props(styles.statBox)}>
                        <Text size="large" weight="bold">{total.count.toLocaleString()}</Text>
                        <Text color="textSecondary" size="small">Plays</Text>
                      </div>
                      <div {...stylex.props(styles.statBox)}>
                        <Text size="large" weight="bold">{DateUtils.formatDurationMs(track.duration_ms * total.count)}</Text>
                        <Text color="textSecondary" size="small">Time Listened</Text>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div {...stylex.props(styles.gridContainer)}>
            <Card title="First & Last Listened">
              {firstLast?.first && (
                <GenericRow
                  imageUrl={ImageUtils.getOptimizedImage(album.images, 64)}
                  title="First Listened"
                  subtitle={formatDate(firstLast.first.played_at)}
                />
              )}
              {firstLast?.last && (
                <GenericRow
                  imageUrl={ImageUtils.getOptimizedImage(album.images, 64)}
                  title="Last Listened"
                  subtitle={formatDate(firstLast.last.played_at)}
                />
              )}
            </Card>

            <Card title="Top Months">
              {bestPeriod.map((item, index) => (
                <GenericRow
                  key={"bp_" + index}
                  title={`${getMonthName(item._id.month)} ${item._id.year}`}
                  subtitle={`${item.count} plays`}
                />
              ))}
              {bestPeriod.length === 0 && (
                <Text color="textSecondary">No data available.</Text>
              )}
            </Card>

            <Card title="Recent History">
              <div {...stylex.props(styles.historyWrapper)}>
                {recentHistory.map((item, index) => (
                  <div key={item._id} {...stylex.props(styles.historyRow)}>
                    <Text color="textSecondary">{formatDate(item.played_at)}</Text>
                  </div>
                ))}
              </div>
            </Card>
          </div>
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
  },
  topRow: {
    display: 'flex',
    gap: spacing.xl,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  rankingHeader: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    gap: spacing.xl,
    alignSelf: 'flex-start',
  },
  topSection: {
    display: 'flex',
    flex: '3 1 600px',
    gap: spacing.xl,
    alignItems: 'center',
    backgroundColor: colors.surfaceDark,
    padding: spacing.xl,
    borderRadius: borderRadius.xxl,
  },
  coverImage: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.xxl,
    objectFit: 'cover',
    boxShadow: '0 8px 16px rgba(0,0,0,0.15)',
  },
  coverPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.surfaceDarker,
  },
  topRightContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
    flex: 1,
  },
  trackNameTitle: {
    fontSize: 36,
    lineHeight: 1.2,
    margin: 0,
  },
  titleWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  statsSectionsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.lg,
  },
  statsSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  statsSectionTitle: {
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontSize: 12,
  },
  statsRow: {
    display: 'flex',
    gap: spacing.md,
    flexWrap: 'wrap',
  },
  statBox: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
    minWidth: 120,
  },
  gridContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: spacing.xl,
  },
  link: {
    color: 'inherit',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    }
  },
  historyWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  historyRow: {
    display: 'flex',
    alignItems: 'center',
    padding: spacing.sm,
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.md,
  }
});
