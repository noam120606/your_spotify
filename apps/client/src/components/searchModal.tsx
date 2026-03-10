import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as stylex from '@stylexjs/stylex';
import { api } from '../api/spotifyApi';
import { Artist, AlbumWithFullArtist, TrackWithFullArtistAlbum } from '../api/types';
import { useDebounce } from '../hooks/useDebounce';
import { GenericRow } from './genericRow';
import { Input } from './designSystem/input';
import { SegmentedControl } from './segmentedControl';
import { Text } from './designSystem/text';
import { colors, spacing, borderRadius } from './designSystem/designConstants.stylex';
import { ImageUtils } from '../utils/imageUtils';
import { Modal } from './designSystem/modal';

export interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ViewType = 'Artist' | 'Album' | 'Track';

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [activeViewIndex, setActiveViewIndex] = useState(0);
  const [artists, setArtists] = useState<Artist[]>([]);
  const [albums, setAlbums] = useState<AlbumWithFullArtist[]>([]);
  const [tracks, setTracks] = useState<TrackWithFullArtistAlbum[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 500);
  const inputRef = useRef<HTMLInputElement>(null);

  const views: ViewType[] = ['Artist', 'Album', 'Track'];

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Handle search
  useEffect(() => {
    if (debouncedQuery.trim().length < 3) {
      setTimeout(() => {
        setArtists([]);
        setAlbums([]);
        setTracks([]);
      }, 0);
      return;
    }

    let isMountedLocal = true;
    setTimeout(() => setIsLoading(true), 0);

    api.search(debouncedQuery)
      .then(res => {
        if (isMountedLocal) {
          setArtists(res.data.artists);
          setAlbums(res.data.albums);
          setTracks(res.data.tracks);
          setIsLoading(false);
        }
      })
      .catch(err => {
        console.error('Search failed', err);
        if (isMountedLocal) setIsLoading(false);
      });

    return () => {
      isMountedLocal = false;
    };
  }, [debouncedQuery]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div {...stylex.props(styles.centerContent)}>
          <Text color="textSecondary">Searching...</Text>
        </div>
      );
    }

    const activeView = views[activeViewIndex];

    if (activeView === 'Artist') {
      if (artists.length === 0 && debouncedQuery.length >= 3) {
        return <div {...stylex.props(styles.centerContent)}><Text color="textSecondary">No artists found.</Text></div>;
      }
      return (
        <div {...stylex.props(styles.resultsList)}>
          {artists.map(artist => (
            <GenericRow
              key={artist.id}
              imageUrl={ImageUtils.getOptimizedImage(artist.images, 48)}
              title={artist.name}
              onClick={() => {
                onClose();
                navigate(`/artist/${artist.id}`);
              }}
              xstyle={styles.row}
            />
          ))}
        </div>
      );
    }

    if (activeView === 'Album') {
      if (albums.length === 0 && debouncedQuery.length >= 3) {
        return <div {...stylex.props(styles.centerContent)}><Text color="textSecondary">No albums found.</Text></div>;
      }
      return (
        <div {...stylex.props(styles.resultsList)}>
          {albums.map(album => (
            <GenericRow
              key={album.id}
              imageUrl={ImageUtils.getOptimizedImage(album.images, 48)}
              title={album.name}
              subtitle={album.full_artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
              onClick={() => {
                onClose();
                navigate(`/album/${album.id}`);
              }}
              xstyle={styles.row}
            />
          ))}
        </div>
      );
    }

    if (activeView === 'Track') {
      if (tracks.length === 0 && debouncedQuery.length >= 3) {
        return <div {...stylex.props(styles.centerContent)}><Text color="textSecondary">No tracks found.</Text></div>;
      }
      return (
        <div {...stylex.props(styles.resultsList)}>
          {tracks.map(track => (
            <GenericRow
              key={track.id}
              imageUrl={ImageUtils.getOptimizedImage(track.full_album?.images, 48)}
              title={track.name}
              subtitle={track.full_artists?.map(a => a.name).join(', ') || 'Unknown Artist'}
              rightText={track.full_album?.name || 'Unknown Album'}
              onClick={() => {
                onClose();
                navigate(`/track/${track.id}`);
              }}
              xstyle={styles.row}
            />
          ))}
        </div>
      );
    }

    return null;
  };

  return (
    <Modal open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <div {...stylex.props(styles.header)}>
        <Input
          ref={inputRef}
          placeholder="Search for artists, albums, or tracks..."
          value={query}
          onChange={e => setQuery(e.target.value)}
        />
      </div>

      <div {...stylex.props(styles.controls)}>
        <SegmentedControl.Root
          selectedIndex={activeViewIndex}
          onIndexChange={setActiveViewIndex}
          id="search-view-tabs"
          fullWidth={true}
        >
          {views.map((view) => (
            <SegmentedControl.Item key={view} value={view}>
              {({ selected }) => (
                <Text
                  size="small"
                  weight={selected ? 'bold' : 'regular'}
                  color={selected ? 'background' : 'textSecondary'}
                  xstyle={styles.segmentText}
                >
                  {view}
                </Text>
              )}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
      </div>

      <div {...stylex.props(styles.scrollArea)}>
        {renderContent()}
      </div>
    </Modal>
  );
}

const styles = stylex.create({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: '10vh',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    width: '100%',
    maxWidth: 600,
    maxHeight: '80vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
    overflow: 'hidden',
  },
  header: {
    padding: spacing.xl,
    paddingBottom: spacing.md,
    borderBottom: `1px solid ${colors.surfaceDarker}`,
  },
  controls: {
    padding: `${spacing.xs} ${spacing.xl}`,
    display: 'flex',
    justifyContent: 'center',
    borderBottom: `1px solid ${colors.surfaceDarker}`,
  },
  scrollArea: {
    flex: 1,
    overflowY: 'auto',
    padding: `${spacing.sm} 0`,
    minHeight: 200,
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 0,
  },
  centerContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 100,
  },
  segmentText: {
    zIndex: 2,
  },
  row: {
    paddingLeft: spacing.xl,
    paddingRight: spacing.xl,
  },
});
