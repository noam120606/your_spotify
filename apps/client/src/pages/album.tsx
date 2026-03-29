import * as stylex from "@stylexjs/stylex";
import { Fragment, useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import { api, AlbumStatsResponse } from "../api/spotifyApi";
import { Album } from "../api/types";
import { Card } from "../components/designSystem/card";
import { colors, spacing, borderRadius } from "../components/designSystem/designConstants.stylex";
import { Text } from "../components/designSystem/text";
import { FullScreenLoader } from "../components/fullScreenLoader";
import { GenericRow } from "../components/genericRow";
import { NeighborCard } from "../components/neighborCard";
import { PageHeader } from "../components/pageHeader";
import { useDateFormat } from "../hooks/useDateFormat";
import { ImageUtils } from "../utils/imageUtils";

export function AlbumPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dateFormatter = useDateFormat();
  const [stats, setStats] = useState<AlbumStatsResponse | null>(null);
  const [rank, setRank] = useState<{
    index: number;
    isMax: boolean;
    isMin: boolean;
    results: { id: string; count: number }[];
  } | null>(null);
  const [prevAlbum, setPrevAlbum] = useState<{ album: Album; count: number } | null>(null);
  const [nextAlbum, setNextAlbum] = useState<{ album: Album; count: number } | null>(null);
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
      setPrevAlbum(null);
      setNextAlbum(null);

      try {
        const [statsRes, rankRes] = await Promise.all([
          api.getAlbumStats(id),
          api.getAlbumRank(id),
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
          const surroundingRes = await api.getAlbums(idsToFetch);

          if (prevId) {
            const album = surroundingRes.data.find((a) => a.id === prevId);
            const count = rankData.results.find((r) => r.id === prevId)?.count || 0;
            if (album) setPrevAlbum({ album, count });
          }
          if (nextId) {
            const album = surroundingRes.data.find((a) => a.id === nextId);
            const count = rankData.results.find((r) => r.id === nextId)?.count || 0;
            if (album) setNextAlbum({ album, count });
          }
        }

        setStats(statsRes.data as AlbumStatsResponse);
        setRank(rankData);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching album stats", err);
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
            {neverListened ? "You have never listened to this album." : "Error loading album."}
          </Text>
        </div>
      </main>
    );
  }

  const { album, artists, firstLast, tracks, total } = stats;
  const coverUrl = ImageUtils.getOptimizedImage(album.images, 300);

  const headerSubtitle = (
    <span>
      {artists.map((a, i) => (
        <Fragment key={a.id}>
          <Link to={`/artist/${a.id}`} style={{ color: "inherit", textDecoration: "none" }}>
            {a.name}
          </Link>
          {i < artists.length - 1 ? ", " : ""}
        </Fragment>
      ))}
    </span>
  );

  const totalDurationMs = tracks.reduce((acc, t) => acc + t.track.duration_ms * t.count, 0);

  return (
    <main {...stylex.props(styles.mainContent)}>
      <PageHeader title={album.name} subtitle={headerSubtitle} />

        <div {...stylex.props(styles.content)}>
          {rank && (
            <div {...stylex.props(styles.rankingHeader)}>
              {prevAlbum && (
                <NeighborCard
                  position="before"
                  imageUrl={
                    prevAlbum.album.images?.[0]
                      ? ImageUtils.getOptimizedImage(prevAlbum.album.images, 64) || undefined
                      : undefined
                  }
                  rank={rank.index}
                  title={prevAlbum.album.name}
                  onClick={() => navigate(`/album/${prevAlbum.album.id}`)}
                />
              )}

              <NeighborCard
                position="current"
                imageUrl={coverUrl || undefined}
                rank={rank.index + 1}
                title={album.name}
              />

              {nextAlbum && (
                <NeighborCard
                  position="after"
                  imageUrl={
                    nextAlbum.album.images?.[0]
                      ? ImageUtils.getOptimizedImage(nextAlbum.album.images, 64) || undefined
                      : undefined
                  }
                  rank={rank.index + 2}
                  title={nextAlbum.album.name}
                  onClick={() => navigate(`/album/${nextAlbum.album.id}`)}
                />
              )}
            </div>
          )}

          <div {...stylex.props(styles.topRow)}>
            <div {...stylex.props(styles.topSection)}>
              {coverUrl ? (
                <img src={coverUrl} alt={album.name} {...stylex.props(styles.coverImage)} />
              ) : (
                <div {...stylex.props(styles.coverPlaceholder)} />
              )}
              <div {...stylex.props(styles.topRightContent)}>
                <div {...stylex.props(styles.titleWrapper)}>
                  <Text weight="bold" xstyle={styles.albumNameTitle}>
                    {album.name}
                  </Text>
                  <Text color="textSecondary" size="large">
                    {artists.map((a, i) => (
                        <Fragment key={a.id}>
                        <Link to={`/artist/${a.id}`} {...stylex.props(styles.link)}>
                          {a.name}
                        </Link>
                        {i < artists.length - 1 ? ", " : ""}
                        </Fragment>
                    ))}
                  </Text>
                </div>

                <div {...stylex.props(styles.statsSectionsWrapper)}>
                  <div {...stylex.props(styles.statsSection)}>
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
                          Plays
                        </Text>
                      </div>
                      <div {...stylex.props(styles.statBox)}>
                        <Text size="large" weight="bold">
                          {dateFormatter.formatDurationMs(totalDurationMs)}
                        </Text>
                        <Text color="textSecondary" size="small">
                          Time Listened
                        </Text>
                      </div>
                      <div {...stylex.props(styles.statBox)}>
                        <Text size="large" weight="bold">
                          {tracks.length}
                        </Text>
                        <Text color="textSecondary" size="small">
                          Listened Tracks
                        </Text>
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
                  subtitle={firstLast.first.track.name}
                  rightText={new Date(firstLast.first.played_at).toLocaleDateString()}
                />
              )}
              {firstLast?.last && (
                <GenericRow
                  imageUrl={ImageUtils.getOptimizedImage(album.images, 64)}
                  title="Last Listened"
                  subtitle={firstLast.last.track.name}
                  rightText={new Date(firstLast.last.played_at).toLocaleDateString()}
                />
              )}
            </Card>

            <Card title="Most Listened Tracks">
              {tracks.slice(0, 10).map((item, index) => (
                <GenericRow
                  key={item.track._id}
                  imageUrl={ImageUtils.getOptimizedImage(album.images, 64)}
                  title={
                    <Link
                      to={`/track/${item.track.id}`}
                      {...stylex.props(styles.link)}
                    >{`${index + 1}. ${item.track.name}`}</Link>
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
    flex: "3 1 600px",
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
  albumNameTitle: {
    fontSize: 36,
    lineHeight: 1.2,
    margin: 0,
  },
  titleWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  statsSectionsWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.lg,
  },
  statsSection: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
  },
  statsSectionTitle: {
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    fontSize: 12,
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
});
