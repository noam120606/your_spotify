import * as stylex from '@stylexjs/stylex';
import { useState, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { api, DEFAULT_ITEMS_TO_LOAD } from '../api/spotifyApi';
import { TrackInfoWithFullArtistAlbum } from '../api/types';
import { Text } from './designSystem/text';
import { colors, spacing, borderRadius } from './designSystem/designConstants.stylex';
import { useIntervalStore } from '../store/intervalStore';
import { ImageUtils } from '../utils/imageUtils';

interface ListenHistoryProps { }

export function ListenHistory({ }: ListenHistoryProps) {
  const { startDate, endDate } = useIntervalStore();
  const [tracks, setTracks] = useState<TrackInfoWithFullArtistAlbum[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchMoreData = async (reset: boolean = false) => {
    const currentOffset = reset ? 0 : offset;
    try {
      const response = await api.getTracks(
        startDate || new Date(0), // Fallback if no start date, though API usually handles optional
        endDate || new Date(),
        DEFAULT_ITEMS_TO_LOAD,
        currentOffset
      );

      const newTracks = response.data;

      if (reset) {
        setTracks(newTracks);
      } else {
        setTracks((prev) => [...prev, ...newTracks]);
      }

      setOffset(currentOffset + DEFAULT_ITEMS_TO_LOAD);

      if (newTracks.length < DEFAULT_ITEMS_TO_LOAD) {
        setHasMore(false);
      } else {
        setHasMore(true);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setTracks([]);
    fetchMoreData(true);
  }, [startDate, endDate]);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

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

  if (loading && tracks.length === 0) {
    return (
      <div {...stylex.props(styles.container, styles.center)}>
        <Text color="textSecondary">Loading history...</Text>
      </div>
    );
  }

  return (
    <div {...stylex.props(styles.container)}>
      <Text size="large" weight="bold" color="text" xstyle={styles.title}>
        Listening History
      </Text>

      <div {...stylex.props(styles.tableHeader)}>
        <div {...stylex.props(styles.colCover)}></div>
        <div {...stylex.props(styles.colTrack)}><Text color="textSecondary" size="small">TRACK</Text></div>
        <div {...stylex.props(styles.colArtist)}><Text color="textSecondary" size="small">ARTIST</Text></div>
        <div {...stylex.props(styles.colAlbum)}><Text color="textSecondary" size="small">ALBUM</Text></div>
        <div {...stylex.props(styles.colDate)}><Text color="textSecondary" size="small">DATE</Text></div>
        <div {...stylex.props(styles.colDuration)}><Text color="textSecondary" size="small">TIME</Text></div>
      </div>

      <InfiniteScroll
        dataLength={tracks.length}
        next={() => fetchMoreData()}
        hasMore={hasMore}
        loader={<div {...stylex.props(styles.loader)}><Text color="textSecondary">Loading more...</Text></div>}
        scrollThreshold={0.9}
        style={{ overflow: 'visible' }} // Important for layout
      >
        <div {...stylex.props(styles.list)}>
          {tracks.map((item, index) => {
            const track = item.track;
            const coverUrl = ImageUtils.getOptimizedImage(track.full_album.images, 48);

            return (
              <div key={`${item._id}-${index}`} {...stylex.props(styles.row)}>
                <div {...stylex.props(styles.colCover)}>
                  {coverUrl ? (
                    <img src={coverUrl} alt={track.name} {...stylex.props(styles.coverImage)} />
                  ) : (
                    <div {...stylex.props(styles.coverPlaceholder)} />
                  )}
                </div>
                <div {...stylex.props(styles.colTrack)}>
                  <Text color="text" weight="bold" xstyle={styles.truncate}>{track.name}</Text>
                </div>
                <div {...stylex.props(styles.colArtist)}>
                  <Text color="textSecondary" xstyle={styles.truncate}>
                    {track.full_artists.map(a => a.name).join(', ')}
                  </Text>
                </div>
                <div {...stylex.props(styles.colAlbum)}>
                  <Text color="textSecondary" xstyle={styles.truncate}>{track.full_album.name}</Text>
                </div>
                <div {...stylex.props(styles.colDate)}>
                  <Text color="textSecondary">{formatDate(item.played_at)}</Text>
                </div>
                <div {...stylex.props(styles.colDuration)}>
                  <Text color="textSecondary">{formatDuration(item.durationMs)}</Text>
                </div>
              </div>
            );
          })}
        </div>
      </InfiniteScroll>
    </div>
  );
}

const styles = stylex.create({
  container: {
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.xxl,
    padding: spacing.xl,
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  center: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 200,
  },
  title: {
    marginBottom: spacing.lg,
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
  },
  tableHeader: {
    display: 'flex',
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomStyle: 'solid',
    borderBottomColor: colors.border,
    marginBottom: spacing.md,
    paddingRight: spacing.sm, // Account for scrollbar if any
    paddingLeft: spacing.sm,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    padding: spacing.sm,
    borderRadius: borderRadius.md,
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: colors.surfaceDarker,
    },
  },
  colCover: {
    width: 60,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
  },
  colTrack: {
    flex: 2,
    minWidth: 0, // important for enabling text truncation
    paddingRight: spacing.md,
  },
  colArtist: {
    flex: 2,
    minWidth: 0,
    paddingRight: spacing.md,
  },
  colAlbum: {
    flex: 2,
    minWidth: 0,
    paddingRight: spacing.md,
    display: {
      default: 'block',
      '@media (max-width: 768px)': 'none', // hide on smaller screens
    }
  },
  colDate: {
    flex: 1.5,
    minWidth: 0,
    paddingRight: spacing.md,
    display: {
      default: 'block',
      '@media (max-width: 1024px)': 'none',
    }
  },
  colDuration: {
    width: 60,
    flexShrink: 0,
    textAlign: 'right',
  },
  coverImage: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    objectFit: 'cover',
  },
  coverPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surfaceDarker,
  },
  truncate: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
  },
  loader: {
    padding: spacing.md,
    textAlign: 'center',
    marginTop: spacing.md,
  }
});
