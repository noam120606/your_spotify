import * as stylex from "@stylexjs/stylex";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

import { api, DEFAULT_ITEMS_TO_LOAD } from "../api/spotifyApi";
import { Artist } from "../api/types";
import { ArtistCell } from "../components/artistCell";
import { Card } from "../components/designSystem/card";
import { colors, spacing } from "../components/designSystem/designConstants.stylex";
import { Text } from "../components/designSystem/text";
import { PageHeader } from "../components/pageHeader";
import { Sidebar } from "../components/sidebar";
import { Table, TableColumn } from "../components/table";
import { useAuthStore } from "../store/authStore";
import { useIntervalStore } from "../store/intervalStore";

type BestArtist = {
  count: number;
  duration_ms: number;
  total_count: number;
  total_duration_ms: number;
  artist: Artist;
  differents: number;
};

export function TopArtists() {
  const { startDate, endDate } = useIntervalStore();
  const { user } = useAuthStore();
  const [artists, setArtists] = useState<BestArtist[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const offset = useRef(0);
  const [loading, setLoading] = useState(true);

  const fetchMoreData = async (reset: boolean = false) => {
    if (reset) {
      offset.current = 0;
    }
    try {
      const response = await api.getBestArtists(
        startDate || new Date(0),
        endDate || new Date(),
        DEFAULT_ITEMS_TO_LOAD,
        offset.current,
      );

      const newArtists = response.data;

      if (reset) {
        setArtists(newArtists);
      } else {
        setArtists((prev) => [...prev, ...newArtists]);
      }

      offset.current += newArtists.length;

      if (newArtists.length < DEFAULT_ITEMS_TO_LOAD) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error("Error fetching top artists:", error);
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

  const columns: TableColumn<BestArtist>[] = [
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
      id: "artist",
      header: "ARTIST",
      flex: 3,
      minWidth: 0,
      renderCell: (item) => (
        <ArtistCell
          coverImages={item.artist.images}
          artistName={
            <Link to={`/artist/${item.artist.id}`} {...stylex.props(styles.link)}>
              {item.artist.name}
            </Link>
          }
        />
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

  return (
    <div {...stylex.props(styles.container)}>
      <Sidebar />
      <main {...stylex.props(styles.mainContent)}>
        <PageHeader title="Top Artists" subtitle="Your most listened artists over time" />
        <div {...stylex.props(styles.content)}>
          <Card>
            {loading && artists.length === 0 ? (
              <div {...stylex.props(styles.center)}>
                <Text color="textSecondary">Loading top artists...</Text>
              </div>
            ) : (
              <Table
                data={artists}
                columns={columns}
                keyExtractor={(item, index) => `${item.artist.id}-${index}`}
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
  center: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 200,
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
