import * as stylex from '@stylexjs/stylex';
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { api, DEFAULT_ITEMS_TO_LOAD } from '../api/spotifyApi';
import { TrackInfoWithFullArtistAlbum } from '../api/types';
import { Text } from './designSystem/text';
import { Card } from './designSystem/card';
import { colors, spacing, borderRadius } from './designSystem/designConstants.stylex';
import { useIntervalStore } from '../store/intervalStore';
import { Table, TableColumn } from './table';
import { TrackCell } from './trackCell';

export function ListenHistory() {
  const { startDate, endDate } = useIntervalStore();
  const [tracks, setTracks] = useState<TrackInfoWithFullArtistAlbum[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const offset = useRef(0)
  const [loading, setLoading] = useState(true);

  const fetchMoreData = async (reset: boolean = false) => {
    if (reset) {
      offset.current = 0;
    }
    try {
      const response = await api.getTracks(
        startDate || new Date(0), // Fallback if no start date, though API usually handles optional
        endDate || new Date(),
        DEFAULT_ITEMS_TO_LOAD,
        offset.current
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const columns: TableColumn<TrackInfoWithFullArtistAlbum>[] = [
    {
      id: 'track',
      header: 'TRACK',
      flex: 3,
      minWidth: 0,
      renderCell: (item) => (
        <TrackCell
          coverImages={item.track.full_album.images}
          trackName={item.track.name}
          artistName={
            <>
              {item.track.full_artists.map((a, i) => (
                <React.Fragment key={a.id}>
                  <Link to={`/artist/${a.id}`} {...stylex.props(styles.link)}>{a.name}</Link>
                  {i < item.track.full_artists.length - 1 ? ', ' : ''}
                </React.Fragment>
              ))}
            </>
          }
          trackId={item.track.id}
        />
      )
    },
    {
      id: 'album',
      header: 'ALBUM',
      flex: 1.5,
      minWidth: 0,
      hideOnMobile: true,
      renderCell: (item) => (
        <Text color="textSecondary" xstyle={styles.truncate}>
          <Link to={`/album/${item.track.full_album.id}`} {...stylex.props(styles.link)}>{item.track.full_album.name}</Link>
        </Text>
      )
    },
    {
      id: 'date',
      header: 'DATE',
      flex: 1,
      minWidth: 0,
      hideOnTablet: true,
      renderCell: (item) => (
        <Text color="textSecondary">{formatDate(item.played_at)}</Text>
      )
    },
    {
      id: 'duration',
      header: 'TIME',
      width: 60,
      align: 'right',
      noPadding: true,
      renderCell: (item) => (
        <Text color="textSecondary">{formatDuration(item.durationMs)}</Text>
      )
    }
  ];

  if (loading && tracks.length === 0) {
    return (
      <Card>
        <div {...stylex.props(styles.center)}>
          <Text color="textSecondary">Loading history...</Text>
        </div>
      </Card>
    );
  }

  return (
    <Card title="Listening History">
      <Table
        data={tracks}
        columns={columns}
        keyExtractor={(item, index) => `${item._id}-${index}`}
        infiniteScroll={{
          hasMore: hasMore,
          next: fetchMoreData,
          loader: <div {...stylex.props(styles.loader)}><Text color="textSecondary">Loading more...</Text></div>
        }}
      />
    </Card>
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
  },
  link: {
    color: 'inherit',
    textDecoration: 'none',
    ':hover': {
      textDecoration: 'underline',
    }
  }
});
