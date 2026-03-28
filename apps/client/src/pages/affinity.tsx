import * as stylex from "@stylexjs/stylex";
import { Calendar } from "lucide-react";
import { useState } from "react";

import { api } from "../api/spotifyApi";
import { CollaborativeMode, Track, Album, Artist } from "../api/types";
import { CalendarIntervalPicker } from "../components/calendarIntervalPicker";
import { Button } from "../components/designSystem/button";
import { colors, spacing } from "../components/designSystem/designConstants.stylex";
import { Loader } from "../components/designSystem/loader";
import { PageCard } from "../components/designSystem/pageCard";
import { Popover } from "../components/designSystem/popover";
import { Select } from "../components/designSystem/select";
import { Text } from "../components/designSystem/text";
import { PageHeader } from "../components/pageHeader";
import { Sidebar } from "../components/sidebar";
import { useApi } from "../hooks/useApi";
import { useAuthStore } from "../store/authStore";

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

export function Affinity() {
  const { user: currentUser } = useAuthStore();
  const { data: accountsRaw } = useApi(api.getAccounts);

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });
  const [endDate, setEndDate] = useState<Date | null>(new Date());
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AffinityItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [affinityMode, setAffinityMode] = useState<CollaborativeMode>(CollaborativeMode.AVERAGE);
  const [affinityType, setAffinityType] = useState<"songs" | "albums" | "artists">("songs");

  const accounts = accountsRaw ? accountsRaw.filter((a) => a.id !== currentUser?.id) : [];

  const userOptions = accounts.map((a) => ({ label: a.username, value: a.id }));

  const handleCompute = async () => {
    if (selectedUserIds.length === 0 || !startDate || !endDate) return;

    setLoading(true);
    setHasSearched(true);
    try {
      let res;
      if (affinityType === "songs") {
        res = await api.collaborativeBestSongs(selectedUserIds, startDate, endDate, affinityMode);
      } else if (affinityType === "albums") {
        res = await api.collaborativeBestAlbums(selectedUserIds, startDate, endDate, affinityMode);
      } else {
        res = await api.collaborativeBestArtists(selectedUserIds, startDate, endDate, affinityMode);
      }
      setResults(res.data as AffinityItem[]);
    } catch (error) {
      console.error("Failed to compute affinity", error);
    } finally {
      setLoading(false);
    }
  };

  function getMostLikedBy(item: AffinityItem) {
    let maxCount = -1;
    let mostLikedUserId = "";

    const allUserIds = [currentUser?.id, ...selectedUserIds];

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

  const formatDate = (date: Date | null) => {
    if (!date) return "Select date";
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div {...stylex.props(styles.container)}>
      <Sidebar />
      <main {...stylex.props(styles.mainContent)}>
        <PageHeader title="Affinity" subtitle="Compare your music taste with other users" />

        <div {...stylex.props(styles.content)}>
          <PageCard title="Selection">
            <div {...stylex.props(styles.controls)}>
              <div {...stylex.props(styles.controlGroup)}>
                <Text weight="bold" size="small" color="textSecondary">
                  Users
                </Text>
                <Select
                  multiple
                  options={userOptions}
                  value={selectedUserIds}
                  onChange={setSelectedUserIds}
                  placeholder="Select users to compare..."
                  darken
                />
              </div>

              <div {...stylex.props(styles.row)}>
                <div {...stylex.props(styles.controlGroup, styles.flexible)}>
                  <Text weight="bold" size="small" color="textSecondary">
                    Type
                  </Text>
                  <Select
                    options={[
                      { label: "Songs", value: "songs" },
                      { label: "Albums", value: "albums" },
                      { label: "Artists", value: "artists" },
                    ]}
                    value={affinityType}
                    onChange={(val) => setAffinityType(val as any)}
                    darken
                  />
                </div>

                <div {...stylex.props(styles.controlGroup, styles.flexible)}>
                  <Text weight="bold" size="small" color="textSecondary">
                    Mode
                  </Text>
                  <Select
                    options={[
                      { label: "Average", value: CollaborativeMode.AVERAGE },
                      { label: "Minima", value: CollaborativeMode.MINIMA },
                    ]}
                    value={affinityMode}
                    onChange={(val) => setAffinityMode(val as any)}
                    darken
                  />
                </div>
              </div>

              <div {...stylex.props(styles.controlGroup)}>
                <Text weight="bold" size="small" color="textSecondary">
                  Interval
                </Text>
                <Popover.Root onOpenChange={setIsPopoverOpen} open={isPopoverOpen}>
                  <Popover.Trigger>
                    {({ ...props }) => (
                      <Button variant="outline" fullWidth {...props}>
                        <div {...stylex.props(styles.dateTrigger)}>
                          <Calendar size={16} />
                          <Text size="small" weight="medium">
                            {formatDate(startDate)} - {formatDate(endDate)}
                          </Text>
                        </div>
                      </Button>
                    )}
                  </Popover.Trigger>
                  <Popover.Content>
                    <div {...stylex.props(styles.calendarContainer)}>
                      <CalendarIntervalPicker
                        startDate={startDate}
                        endDate={endDate}
                        onApply={(s, e) => {
                          setStartDate(s);
                          setEndDate(e);
                          setIsPopoverOpen(false);
                        }}
                      />
                    </div>
                  </Popover.Content>
                </Popover.Root>
              </div>

              <Button
                variant="primary"
                onClick={handleCompute}
                disabled={loading || selectedUserIds.length === 0}
                fullWidth
              >
                Compute Affinity
              </Button>
            </div>
          </PageCard>

          <div {...stylex.props(styles.resultsContainer)}>
            {loading ? (
              <div {...stylex.props(styles.loaderContainer)}>
                <Loader />
                <Text color="textSecondary">Computing affinity metrics...</Text>
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
                      ? `${item.artist.name} — ${item.album.name}`
                      : "album" in item
                        ? item.artist.name
                        : null;

                  return (
                    <PageCard key={`${key}-${index}`}>
                      <div {...stylex.props(styles.trackItem)}>
                        {image && (
                          <img src={image} alt={title} {...stylex.props(styles.albumArt)} />
                        )}
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
            ) : hasSearched ? (
              <div {...stylex.props(styles.emptyState)}>
                <Text color="textSecondary">
                  No common {affinityType} found for the selected criteria.
                </Text>
              </div>
            ) : (
              <div {...stylex.props(styles.emptyState)}>
                <Text color="textSecondary">Select users and an interval to start.</Text>
              </div>
            )}
          </div>
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
  controls: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
  },
  row: {
    display: "flex",
    gap: spacing.md,
  },
  flexible: {
    flex: 1,
  },
  controlGroup: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  dateTrigger: {
    display: "flex",
    alignItems: "center",
    gap: spacing.sm,
  },
  calendarContainer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: "12px",
    width: "320px",
  },
  resultsContainer: {
    marginTop: spacing.md,
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
