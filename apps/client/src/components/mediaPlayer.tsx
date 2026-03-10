import { useEffect, useState } from 'react';
import * as stylex from '@stylexjs/stylex';
import { Play, Pause, SkipBack, SkipForward, Music } from 'lucide-react';
import { Text } from './designSystem/text';
import { colors, spacing, borderRadius, transitions } from './designSystem/designConstants.stylex';
import { MarqueeText } from './marqueeText';
import { useAuthStore } from '../store/authStore';
import { SpotifyPlaybackState } from '../api/types';
import { api } from '../api/spotifyApi';
import { OptimisticProgressBar } from './designSystem/optimisticProgressBar';

export function MediaPlayer() {
  const { user } = useAuthStore();
  const [playbackState, setPlaybackState] = useState<SpotifyPlaybackState | null>(null);

  useEffect(() => {
    if (!user) return;

    const fetchPlaybackState = async () => {
      try {
        const response = await api.getPlaybackState();
        if (response.data) {
          setPlaybackState(response.data);
        } else {
          setPlaybackState(null);
        }
      } catch (error) {
        console.error('Error fetching playback state:', error);
      }
    };

    fetchPlaybackState();
    const playbackInterval = setInterval(fetchPlaybackState, 5000);

    return () => clearInterval(playbackInterval);
  }, [user]);

  const currentTrack = playbackState?.item;
  const isPlaying = playbackState?.is_playing || false;
  const hasTrack = !!currentTrack;

  const handleCommand = async (command: 'play' | 'pause' | 'next' | 'previous') => {
    if (!hasTrack) return;
    try {
      if (command === 'play') {
        await api.resume();
        setPlaybackState((prev) => prev ? { ...prev, is_playing: true } : prev);
      } else if (command === 'pause') {
        await api.pause();
        setPlaybackState((prev) => prev ? { ...prev, is_playing: false } : prev);
      } else if (command === 'next') {
        await api.next();
      } else if (command === 'previous') {
        await api.previous();
      }
    } catch (error) {
      console.error(`Error executing command ${command}:`, error);
    }
  };

  const coverUrl = currentTrack?.album?.images?.[0]?.url;
  const title = currentTrack?.name || 'No track playing';
  const artist = currentTrack?.artists?.map((a: any) => a.name).join(', ') || '';
  const progress = playbackState?.progress_ms || 0;
  const duration = currentTrack?.duration_ms || 0;

  return (
    <div {...stylex.props(styles.container, !hasTrack && styles.disabledContainer)}>
      <div {...stylex.props(styles.trackRow)}>
        {coverUrl ? (
          <img
            src={coverUrl}
            alt="Track Cover"
            {...stylex.props(styles.trackCover)}
          />
        ) : (
          <div {...stylex.props(styles.trackCover, styles.emptyCover)}>
            <Music size={24} color={colors.textSecondary} />
          </div>
        )}
        <div {...stylex.props(styles.trackInfo)}>
          {hasTrack ? (
            <MarqueeText text={title} />
          ) : (
            <Text size="medium">{title}</Text>
          )}
          {artist && (
            <Text size="small" color="textSecondary" xstyle={[styles.truncateText, styles.artistName]}>
              {artist}
            </Text>
          )}
        </div>
      </div>

      <div {...stylex.props(styles.controls)}>
        <button
          {...stylex.props(styles.controlButton, !hasTrack && styles.disabledButton)}
          onClick={() => handleCommand('previous')}
          disabled={!hasTrack}
        >
          <SkipBack size={18} fill="currentColor" />
        </button>
        <button
          {...stylex.props(styles.controlButton, styles.playButton, !hasTrack && styles.disabledButton)}
          onClick={() => handleCommand(isPlaying ? 'pause' : 'play')}
          disabled={!hasTrack}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </button>
        <button
          {...stylex.props(styles.controlButton, !hasTrack && styles.disabledButton)}
          onClick={() => handleCommand('next')}
          disabled={!hasTrack}
        >
          <SkipForward size={18} fill="currentColor" />
        </button>
      </div>

      <div {...stylex.props(styles.progressContainer)}>
        <OptimisticProgressBar progress={progress} total={duration} isPlaying={isPlaying} />
      </div>
    </div>
  );
}

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: spacing.md,
    backgroundColor: colors.surfaceDark,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
    transition: transitions.default,
  },
  disabledContainer: {
    opacity: 0.6,
  },
  trackRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trackCover: {
    width: '48px',
    height: '48px',
    minWidth: '48px',
    minHeight: '48px',
    aspectRatio: '1 / 1',
    flexShrink: 0,
    borderRadius: borderRadius.md,
    objectFit: 'cover',
  },
  emptyCover: {
    backgroundColor: colors.surfaceHover,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackInfo: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    overflow: 'hidden',
  },
  artistName: {
    opacity: 0.6,
  },
  truncateText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.md,
    width: '100%',
  },
  controlButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    border: 'none',
    color: colors.textSecondary,
    cursor: 'pointer',
    padding: spacing.xs,
    borderRadius: borderRadius.full,
    transition: transitions.default,
    ':hover': {
      color: colors.text,
      backgroundColor: colors.border,
    },
  },
  playButton: {
    color: colors.background,
    backgroundColor: colors.text,
    padding: spacing.sm,
    ':hover': {
      transform: 'scale(1.05)',
      backgroundColor: colors.text,
      color: colors.background,
    },
  },
  disabledButton: {
    cursor: 'not-allowed',
    opacity: 0.5,
    ':hover': {
      color: colors.textSecondary,
      backgroundColor: 'transparent',
      transform: 'none',
    },
  },
  progressContainer: {
    marginTop: spacing.md,
    width: '100%',
  },
});
