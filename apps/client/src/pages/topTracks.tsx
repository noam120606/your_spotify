import * as stylex from "@stylexjs/stylex";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { api, DEFAULT_ITEMS_TO_LOAD } from "../api/spotifyApi";
import { Track, Album, Artist, PlaylistContext } from "../api/types";
import { Button } from "../components/designSystem/button";
import { Card } from "../components/designSystem/card";
import { colors, spacing, borderRadius } from "../components/designSystem/designConstants.stylex";
import { Text } from "../components/designSystem/text";
import { usePlaylistPopup } from "../hooks/usePlaylistPopup";
import { PageHeader } from "../components/pageHeader";
import { Table, TableColumn } from "../components/table";
import { TrackCell } from "../components/trackCell";
import { useAuthStore } from "../store/authStore";
import { useIntervalStore } from "../store/intervalStore";

const DEFAULT_PLAYLIST_NB = 50;

type BestSong = {
  count: number;
  duration_ms: number;
  total_count: number;
  total_duration_ms: number;
  album: Album;
  artist: Artist;
  track: Track;
};

export function TopTracks() {
  const { startDate, endDate } = useIntervalStore();
  const { user } = useAuthStore();
  const { open: openPlaylistPopup, popupNode } = usePlaylistPopup();
  const [tracks, setTracks] = useState<BestSong[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const offset = useRef(0);
  const [loading, setLoading] = useState(true);

  const fetchMoreData = async (reset: boolean = false) => {
    if (reset) {
      offset.current = 0;
    }
    try {
      const response = await api.getBestSongs(
        startDate || new Date(0),
        endDate || new Date(),
        DEFAULT_ITEMS_TO_LOAD,
        offset.current,
      );

      const newTracks = response.data;

      if (reset) {
        setTracks(newTracks);
      } else {
        setTracks((prev) => [...prev, ...newTracks]);
      }

      offset.current += newTracks.length;

      if (newTracks.length < DEFAULT_ITEMS_TO_LOAD) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error("Error fetching top tracks:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchMoreData(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDate, endDate]);

  const columns: TableColumn<BestSong>[] = [
    {
      id: "rank",
      header: "#",
      width: 40,
      align: "center",
      renderCell: (_, index) => (
        <Text color="textSecondary" weight="bold">
          {index + 1}
        </Text>
      ),
    },
    {
      id: "track",
      header: "TRACK",
      flex: 3,
      minWidth: 0,
      renderCell: (item) => (
        <TrackCell
          coverImages={item.album.images}
          trackName={item.track.name}
          artistName={
            <Link to={`/artist/${item.artist.id}`} {...stylex.props(styles.link)}>
              {item.artist.name}
            </Link>
          }
          trackId={item.track.id}
        />
      ),
    },
    {
      id: "album",
      header: "ALBUM",
      flex: 1.5,
      minWidth: 0,
      hideOnMobile: true,
      renderCell: (item) => (
        <Text color="textSecondary" xstyle={styles.truncate}>
          <Link to={`/album/${item.album.id}`} {...stylex.props(styles.link)}>
            {item.album.name}
          </Link>
        </Text>
      ),
    },
    {
      id: "plays",
      header: user?.settings?.metricUsed === "duration" ? "TIME" : "PLAYS",
      width: 80,
      align: "right",
      renderCell: (item) => {
        if (user?.settings?.metricUsed === "duration") {
          const totalSeconds = Math.floor(item.duration_ms / 1000);
          const minutes = Math.floor(totalSeconds / 60);
          const seconds = totalSeconds % 60;
          return (
            <Text color="textSecondary">
              {minutes}:{seconds.toString().padStart(2, "0")}
            </Text>
          );
        }
        return <Text color="textSecondary">{item.count.toLocaleString()}</Text>;
      },
    },
  ];

  const openCreatePlaylistPopup = () => {
    const playlistContext: PlaylistContext = {
      type: "top",
      nb: DEFAULT_PLAYLIST_NB,
      interval: {
        start: (startDate || new Date(0)).getTime(),
        end: (endDate || new Date()).getTime(),
      },
    };

    openPlaylistPopup(playlistContext);
  };

  return (
    <>
      <main {...stylex.props(styles.mainContent)}>
        <PageHeader title="Top Tracks" subtitle="Your most listened tracks over time" />

        <div {...stylex.props(styles.actionRow)}>
          <Button variant="secondary" onClick={openCreatePlaylistPopup}>
            Add to playlist
          </Button>
        </div>

        <div {...stylex.props(styles.content)}>
          <Card>
            {loading && tracks.length === 0 ? (
              <div {...stylex.props(styles.center)}>
                <Text color="textSecondary">Loading top tracks...</Text>
              </div>
            ) : (
              <Table
                data={tracks}
                columns={columns}
                keyExtractor={(item, index) => `${item.track.id}-${index}`}
                infiniteScroll={{
                  hasMore: hasMore,
                  next: fetchMoreData,
                  loader: (
                    <div {...stylex.props(styles.loader)}>
                      <Text color="textSecondary">Loading more...</Text>
                    </div>
                  ),
                }}
              />
            )}
          </Card>
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
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    padding: `0 ${spacing.xl}`,
    marginBottom: spacing.lg,
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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
  },
  coverImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    objectFit: "cover",
  },
  coverPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceDarker,
  },
  truncate: {
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    display: "block",
  },
  loader: {
    padding: spacing.md,
    textAlign: "center",
    marginTop: spacing.md,
  },
  link: {
    color: "inherit",
    textDecoration: "none",
    ":hover": {
      textDecoration: "underline",
    },
  },
});
