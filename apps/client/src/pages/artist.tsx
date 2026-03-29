import * as stylex from "@stylexjs/stylex";
import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { api, ArtistStatsResponse } from "../api/spotifyApi";
import { Artist } from "../api/types";
import { BarChart } from "../components/designSystem/barChart";
import { Card } from "../components/designSystem/card";
import { colors, spacing, borderRadius } from "../components/designSystem/designConstants.stylex";
import { Text } from "../components/designSystem/text";
import { FullScreenLoader } from "../components/fullScreenLoader";
import { GenericRow } from "../components/genericRow";
import { NeighborCard } from "../components/neighborCard";
import { PageHeader } from "../components/pageHeader";
import { useDateFormat } from "../hooks/useDateFormat";
import { ImageUtils } from "../utils/imageUtils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function ArtistPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dateFormatter = useDateFormat();
  const [stats, setStats] = useState<ArtistStatsResponse | null>(null);
  const [rank, setRank] = useState<{
    index: number;
    isMax: boolean;
    isMin: boolean;
    results: { id: string; count: number }[];
  } | null>(null);
  const [prevArtist, setPrevArtist] = useState<{ artist: Artist; count: number } | null>(null);
  const [nextArtist, setNextArtist] = useState<{ artist: Artist; count: number } | null>(null);
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
      setPrevArtist(null);
      setNextArtist(null);

      try {
        const [statsRes, rankRes] = await Promise.all([
          api.getArtistStats(id),
          api.getArtistRank(id),
        ]);

        if (!isMounted) return;

        if ("code" in statsRes.data && statsRes.data.code === "NEVER_LISTENED") {
          setNeverListened(true);
          setLoading(false);
          return;
        }

        const rankData = rankRes.data;
        const currentIndex = rankData.results.findIndex((r) => r.id === id);
        const prevId = currentIndex > 0 ? rankData.results[currentIndex - 1]?.id : null;
        const nextId =
          currentIndex !== -1 && currentIndex < rankData.results.length - 1
            ? rankData.results[currentIndex + 1]?.id
            : null;

        const idsToFetch = [prevId, nextId].filter(Boolean) as string[];
        if (idsToFetch.length > 0) {
          const surroundingRes = await api.getArtists(idsToFetch);

          if (prevId) {
            const artist = surroundingRes.data.find((a) => a.id === prevId);
            const count = rankData.results.find((r) => r.id === prevId)?.count || 0;
            if (artist) setPrevArtist({ artist, count });
          }
          if (nextId) {
            const artist = surroundingRes.data.find((a) => a.id === nextId);
            const count = rankData.results.find((r) => r.id === nextId)?.count || 0;
            if (artist) setNextArtist({ artist, count });
          }
        }

        setStats(statsRes.data as ArtistStatsResponse);
        setRank(rankData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching artist stats", err);
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
      <main {...stylex.props(styles.mainContent)}>
        <FullScreenLoader isLoading={true} />
      </main>
    );
  }

  if (error || neverListened || !stats || !rank) {
    return (
      <main {...stylex.props(styles.mainContent)}>
        <div {...stylex.props(styles.center)}>
          <Text color="textSecondary">
            {neverListened ? "You have never listened to this artist." : "Error loading artist."}
          </Text>
        </div>
      </main>
    );
  }

  const { artist, firstLast, mostListened, albumMostListened, total, bestPeriod, dayRepartition } =
    stats;
  const coverUrl = ImageUtils.getOptimizedImage(artist.images, 300);

  // Normalize day repartition to 24 hours
  const hourlyData = Array.from({ length: 24 }).map((_, i) => ({
    hour: i,
    count: 0,
  }));
  dayRepartition.forEach((d) => {
    hourlyData[d._id] = { hour: d._id, count: d.count };
  });

  const topMonths = [...bestPeriod].sort((a, b) => b.count - a.count).slice(0, 2);

  return (
    <main {...stylex.props(styles.mainContent)}>
      <PageHeader title={artist.name} subtitle={artist.genres.join(", ") || "Various genres"} />

        <div {...stylex.props(styles.content)}>
          {rank && (
            <div {...stylex.props(styles.rankingHeader)}>
              {prevArtist && (
                <NeighborCard
                  position="before"
                  imageUrl={
                    prevArtist.artist.images?.[0]
                      ? ImageUtils.getOptimizedImage(prevArtist.artist.images, 64) || undefined
                      : undefined
                  }
                  rank={rank.index}
                  title={prevArtist.artist.name}
                  onClick={() => navigate(`/artist/${prevArtist.artist.id}`)}
                />
              )}

              <NeighborCard
                position="current"
                imageUrl={coverUrl || undefined}
                rank={rank.index + 1}
                title={artist.name}
              />

              {nextArtist && (
                <NeighborCard
                  position="after"
                  imageUrl={
                    nextArtist.artist.images?.[0]
                      ? ImageUtils.getOptimizedImage(nextArtist.artist.images, 64) || undefined
                      : undefined
                  }
                  rank={rank.index + 2}
                  title={nextArtist.artist.name}
                  onClick={() => navigate(`/artist/${nextArtist.artist.id}`)}
                />
              )}
            </div>
          )}

          <div {...stylex.props(styles.topRow)}>
            <div {...stylex.props(styles.topSection)}>
              {coverUrl ? (
                <img src={coverUrl} alt={artist.name} {...stylex.props(styles.coverImage)} />
              ) : (
                <div {...stylex.props(styles.coverPlaceholder)} />
              )}
              <div {...stylex.props(styles.topRightContent)}>
                <Text weight="bold" xstyle={styles.artistNameTitle}>
                  {artist.name}
                </Text>
                <div {...stylex.props(styles.statsRow)}>
                  <div {...stylex.props(styles.statBox)}>
                    <Text size="large" weight="bold">
                      #{rank.index + 1}
                    </Text>
                    <Text color="textSecondary" size="small">
                      Ranking
                    </Text>
                  </div>
                  <div {...stylex.props(styles.statBox)}>
                    <Text size="large" weight="bold">
                      {total.count.toLocaleString()}
                    </Text>
                    <Text color="textSecondary" size="small">
                      Total Plays
                    </Text>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div {...stylex.props(styles.gridContainer)}>
            <Card title="First & Last Listened">
              {firstLast?.first && (
                <GenericRow
                  imageUrl={ImageUtils.getOptimizedImage(firstLast.first.track.album?.images, 64)}
                  title="First Listened"
                  subtitle={
                    <span>
                      <Link
                        to={`/track/${firstLast.first.track.id}`}
                        {...stylex.props(styles.link)}
                      >
                        {firstLast.first.track.name}
                      </Link>
                      {" • "}
                      {firstLast.first.track.album ? (
                        <Link
                          to={`/album/${firstLast.first.track.album.id}`}
                          {...stylex.props(styles.link)}
                        >
                          {firstLast.first.track.album.name}
                        </Link>
                      ) : (
                        ""
                      )}
                    </span>
                  }
                  rightText={new Date(firstLast.first.played_at).toLocaleDateString()}
                />
              )}
              {firstLast?.last && (
                <GenericRow
                  imageUrl={ImageUtils.getOptimizedImage(firstLast.last.track.album?.images, 64)}
                  title="Last Listened"
                  subtitle={
                    <span>
                      <Link to={`/track/${firstLast.last.track.id}`} {...stylex.props(styles.link)}>
                        {firstLast.last.track.name}
                      </Link>
                      {" • "}
                      {firstLast.last.track.album ? (
                        <Link
                          to={`/album/${firstLast.last.track.album.id}`}
                          {...stylex.props(styles.link)}
                        >
                          {firstLast.last.track.album.name}
                        </Link>
                      ) : (
                        ""
                      )}
                    </span>
                  }
                  rightText={new Date(firstLast.last.played_at).toLocaleDateString()}
                />
              )}
            </Card>

            <Card title="Top Months">
              {topMonths.map((period, index) => (
                <GenericRow
                  key={String(period._id || index)}
                  imageUrl={null}
                  title={`${MONTHS[period.artist.month - 1]} ${period.artist.year}`}
                  subtitle={`${period.count} plays (${Math.round((period.count / total.count) * 100)}%)`}
                />
              ))}
            </Card>

            <Card title="Time of Day" fullWidth>
              <div {...stylex.props(styles.chartContainer, styles.paddedContent)}>
                <BarChart
                  data={hourlyData}
                  getX={(d) => dateFormatter.formatHour(d.hour)}
                  getY={(d) => d.count}
                  renderTooltip={(props: any) => {
                    if (props.active && props.payload && props.payload.length) {
                      const data = props.payload[0].payload;
                      const percentage = ((data.count / total.count) * 100).toFixed(1);

                      const timeRange = `${dateFormatter.formatHour(data.hour)} - ${dateFormatter.formatHour(data.hour + 1)}`;

                      return (
                        <div {...stylex.props(styles.tooltip)}>
                          <Text weight="bold" xstyle={styles.tooltipTitle}>
                            {timeRange}
                          </Text>
                          <Text color="textSecondary">
                            {data.count} plays ({percentage}%)
                          </Text>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </div>
            </Card>

            <Card title="Top Tracks">
              {mostListened.slice(0, 10).map((item, index) => (
                <GenericRow
                  key={item._id}
                  imageUrl={ImageUtils.getOptimizedImage(item.track.album?.images, 64)}
                  title={
                    <Link
                      to={`/track/${item.track.id}`}
                      {...stylex.props(styles.link)}
                    >{`${index + 1}. ${item.track.name}`}</Link>
                  }
                  subtitle={
                    item.track.album ? (
                      <Link
                        to={`/album/${item.track.album.id}`}
                        {...stylex.props(styles.link)}
                      >{`${item.count} plays - ${item.track.album.name}`}</Link>
                    ) : (
                      `${item.count} plays`
                    )
                  }
                />
              ))}
            </Card>

            <Card title="Top Albums">
              {albumMostListened.slice(0, 10).map((item, index) => (
                <GenericRow
                  key={item._id}
                  imageUrl={ImageUtils.getOptimizedImage(item.album.images, 64)}
                  title={
                    <Link
                      to={`/album/${item.album.id}`}
                      {...stylex.props(styles.link)}
                    >{`${index + 1}. ${item.album.name}`}</Link>
                  }
                  subtitle={`${item.count} plays`}
                />
              ))}
            </Card>
          </div>
        </div>
    </main>
  );
}

const styles = stylex.create({
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
  center: {
    flex: 1,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  topRow: {
    display: "flex",
    gap: spacing.xl,
    flexDirection: "row",
    flexWrap: "wrap",
  },
  rankingHeader: {
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "stretch",
    gap: spacing.xl,
    alignSelf: "flex-start",
  },
  topSection: {
    display: "flex",
    flex: 1,
    gap: spacing.xl,
    alignItems: "center",
    backgroundColor: colors.surfaceDark,
    padding: spacing.xl,
    borderRadius: borderRadius.xxl,
  },
  coverImage: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.xxl,
    objectFit: "cover",
    boxShadow: "0 8px 16px rgba(0,0,0,0.15)",
  },
  coverPlaceholder: {
    width: 160,
    height: 160,
    borderRadius: borderRadius.xxl,
    backgroundColor: colors.surfaceDarker,
  },
  topRightContent: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.lg,
    flex: 1,
  },
  artistNameTitle: {
    fontSize: 36,
    lineHeight: 1.2,
    margin: 0,
  },
  statsRow: {
    display: "flex",
    gap: spacing.md,
    flexWrap: "wrap",
  },
  statBox: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderRadius: borderRadius.xl,
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
    minWidth: 120,
  },
  gridContainer: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: spacing.xl,
  },
  link: {
    color: "inherit",
    textDecoration: "none",
    ":hover": {
      textDecoration: "underline",
    },
  },
  chartContainer: {
    width: "100%",
    height: 300,
  },
  paddedContent: {
    padding: `0 ${spacing.md}`,
  },
  tooltip: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.surfaceDarker}`,
  },
  tooltipTitle: {
    display: "block",
    marginBottom: spacing.xs,
  },
});
