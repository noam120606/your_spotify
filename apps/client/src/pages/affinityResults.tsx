import * as stylex from "@stylexjs/stylex";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { api } from "../api/spotifyApi";
import { PlaylistContext } from "../api/types";
import { Album, Artist, CollaborativeMode, Track } from "../api/types";
import { Button } from "../components/designSystem/button";
import { colors, spacing } from "../components/designSystem/designConstants.stylex";
import { Loader } from "../components/designSystem/loader";
import { PageCard } from "../components/designSystem/pageCard";
import { Text } from "../components/designSystem/text";
import { PageHeader } from "../components/pageHeader";
import { useApi } from "../hooks/useApi";
import { usePlaylistPopup } from "../hooks/usePlaylistPopup";
import { useAuthStore } from "../store/authStore";

type AffinityType = "songs" | "albums" | "artists";

interface AffinitySongsItem {
  track: Track;
  album: Album;
  artist: Artist;
  [userId: string]: any;
}

interface AffinityAlbumsItem {
  album: Album;
  artist: Artist;
  [userId: string]: any;
}

interface AffinityArtistsItem {
  artist: Artist;
  [userId: string]: any;
}

type AffinityItem = AffinitySongsItem | AffinityAlbumsItem | AffinityArtistsItem;

interface ParsedParams {
  type: AffinityType;
  mode: CollaborativeMode;
  userIds: string[];
  start: Date;
  end: Date;
}

const AFFINITY_TYPES = new Set<AffinityType>(["songs", "albums", "artists"]);
const AFFINITY_MODES = new Set<CollaborativeMode>([
  CollaborativeMode.AVERAGE,
  CollaborativeMode.MINIMA,
]);

function parseParams(searchParams: URLSearchParams): ParsedParams | null {
  const typeValue = searchParams.get("type");
  const modeValue = searchParams.get("mode");
  const userIdsValue = searchParams.get("userIds");
  const startValue = searchParams.get("start");
  const endValue = searchParams.get("end");

  if (!typeValue || !modeValue || !userIdsValue || !startValue || !endValue) {
    return null;
  }

  if (!AFFINITY_TYPES.has(typeValue as AffinityType)) {
    return null;
  }

  if (!AFFINITY_MODES.has(modeValue as CollaborativeMode)) {
    return null;
  }

  const userIds = userIdsValue
    .split(",")
    .map((id) => id.trim())
    .filter((id) => id.length > 0);

  if (userIds.length === 0) {
    return null;
  }

  const start = new Date(startValue);
  const end = new Date(endValue);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || start > end) {
    return null;
  }

  return {
    type: typeValue as AffinityType,
    mode: modeValue as CollaborativeMode,
    userIds,
    start,
    end,
  };
}

function formatDate(date: Date) {
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AffinityResults() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const paramsKey = searchParams.toString();
  const parsedParams = useMemo(() => parseParams(searchParams), [paramsKey]);

  const { user: currentUser } = useAuthStore();
  const { data: accountsRaw } = useApi(api.getAccounts);
  const { open: openPlaylistPopup, popupNode } = usePlaylistPopup();

  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AffinityItem[]>([]);
  const [error, setError] = useState<string | null>(null);

  const accounts = accountsRaw ? accountsRaw.filter((a) => a.id !== currentUser?.id) : [];

  useEffect(() => {
    if (parsedParams) return;
    navigate("/affinity", { replace: true });
  }, [navigate, parsedParams]);

  useEffect(() => {
    if (!parsedParams) return;
    const params = parsedParams;

    let isCancelled = false;

    async function loadResults() {
      setLoading(true);
      setError(null);
      setResults([]);

      try {
        let response;
        if (params.type === "songs") {
          response = await api.collaborativeBestSongs(
            params.userIds,
            params.start,
            params.end,
            params.mode,
          );
        } else if (params.type === "albums") {
          response = await api.collaborativeBestAlbums(
            params.userIds,
            params.start,
            params.end,
            params.mode,
          );
        } else {
          response = await api.collaborativeBestArtists(
            params.userIds,
            params.start,
            params.end,
            params.mode,
          );
        }

        if (!isCancelled) {
          setResults(response.data as AffinityItem[]);
        }
      } catch (loadError) {
        if (!isCancelled) {
          setError("Failed to compute affinity metrics. Please try again.");
          console.error("Failed to load affinity results", loadError);
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    }

    loadResults();

    return () => {
      isCancelled = true;
    };
  }, [parsedParams]);

  function getMostLikedBy(item: AffinityItem) {
    if (!parsedParams) return "Unknown";

    let maxCount = -1;
    let mostLikedUserId = "";

    const allUserIds = [currentUser?.id, ...parsedParams.userIds];

    allUserIds.forEach((id) => {
      if (!id) return;
      const count = (item as any)[id] || 0;
      if (count > maxCount) {
        maxCount = count;
        mostLikedUserId = id;
      }
    });

    if (mostLikedUserId === currentUser?.id) return "You";
    const user = accounts.find((a) => a.id === mostLikedUserId);
    return user ? user.username : "Unknown";
  }

  const openCreatePlaylistPopup = () => {
    if (!parsedParams) return;

    const userIds = currentUser?.id
      ? Array.from(new Set([currentUser.id, ...parsedParams.userIds]))
      : parsedParams.userIds;

    const playlistContext: PlaylistContext = {
      type: "affinity",
      userIds,
      nb: 50,
      interval: {
        start: parsedParams.start.getTime(),
        end: parsedParams.end.getTime(),
      },
      mode: parsedParams.mode,
    };

    openPlaylistPopup(playlistContext);
  };

  return (
    <>
      <main {...stylex.props(styles.mainContent)}>
        <PageHeader
          title="Affinity Results"
          subtitle={
            parsedParams
              ? `${formatDate(parsedParams.start)} - ${formatDate(parsedParams.end)}`
              : "Loading selection"
          }
        />

        <div {...stylex.props(styles.content)}>
          <div {...stylex.props(styles.actionRow)}>
            <Button
              variant="secondary"
              onClick={openCreatePlaylistPopup}
              disabled={!parsedParams || loading}
            >
              Add to playlist
            </Button>
          </div>

          {loading ? (
            <div {...stylex.props(styles.loaderContainer)}>
              <Loader />
              <Text color="textSecondary">Computing affinity metrics...</Text>
            </div>
          ) : error ? (
            <div {...stylex.props(styles.emptyState)}>
              <Text color="textSecondary">{error}</Text>
            </div>
          ) : results.length > 0 ? (
            <div {...stylex.props(styles.resultsGrid)}>
              {results.map((item, index) => {
                const key =
                  "track" in item
                    ? item.track.id
                    : "album" in item
                      ? item.album.id
                      : item.artist.id;

                const image =
                  "track" in item
                    ? item.album.images[0]?.url
                    : "album" in item
                      ? item.album.images[0]?.url
                      : item.artist.images[0]?.url;

                const title =
                  "track" in item
                    ? item.track.name
                    : "album" in item
                      ? item.album.name
                      : item.artist.name;

                const subtitle =
                  "track" in item
                    ? `${item.artist.name} - ${item.album.name}`
                    : "album" in item
                      ? item.artist.name
                      : null;

                return (
                  <PageCard key={`${key}-${index}`}>
                    <div {...stylex.props(styles.trackItem)}>
                      {image && <img src={image} alt={title} {...stylex.props(styles.albumArt)} />}
                      <div {...stylex.props(styles.trackInfo)}>
                        <Text weight="bold" size="large">
                          {title}
                        </Text>
                        {subtitle && <Text color="textSecondary">{subtitle}</Text>}
                        <div {...stylex.props(styles.affinityBadge)}>
                          <Text size="small" weight="bold">
                            Most liked by: {getMostLikedBy(item)}
                          </Text>
                        </div>
                      </div>
                    </div>
                  </PageCard>
                );
              })}
            </div>
          ) : (
            <div {...stylex.props(styles.emptyState)}>
              <Text color="textSecondary">
                No common {parsedParams?.type || "items"} found for the selected criteria.
              </Text>
            </div>
          )}
        </div>
      </main>
      {popupNode}
    </>
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
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
  },
  loaderContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xxl,
  },
  resultsGrid: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
  },
  trackItem: {
    display: "flex",
    gap: spacing.md,
    alignItems: "center",
  },
  albumArt: {
    width: "64px",
    height: "64px",
    borderRadius: "4px",
    objectFit: "cover",
  },
  trackInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  affinityBadge: {
    marginTop: "4px",
    padding: "2px 8px",
    backgroundColor: colors.primary,
    borderRadius: "4px",
    width: "fit-content",
    color: colors.background,
  },
  emptyState: {
    display: "flex",
    justifyContent: "center",
    padding: spacing.xxl,
    opacity: 0.6,
  },
});