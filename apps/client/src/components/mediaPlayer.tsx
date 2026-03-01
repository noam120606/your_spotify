import * as stylex from '@stylexjs/stylex';
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react';
import { Text } from './designSystem/text';
import { colors, spacing, borderRadius, transitions } from './designSystem/designConstants.stylex';
import { MarqueeText } from './marqueeText';

const MOCK_PLAYBACK = {
  isPlaying: true,
  track: {
    title: 'Bohemian Rhapsody',
    artist: 'Queen',
    coverUrl: 'https://picsum.photos/48/48' // Real placeholder
  }
};

export function MediaPlayer() {
  if (!MOCK_PLAYBACK.track) return null;

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.trackRow)}>
        <img
          src={MOCK_PLAYBACK.track.coverUrl}
          alt="Track Cover"
          {...stylex.props(styles.trackCover)}
        />
        <div {...stylex.props(styles.trackInfo)}>
          <MarqueeText text={MOCK_PLAYBACK.track.title} />
          <Text size="small" color="textSecondary" {...stylex.props(styles.truncateText, styles.artistName)}>
            {MOCK_PLAYBACK.track.artist}
          </Text>
        </div>
      </div>

      <div {...stylex.props(styles.controls)}>
        <button {...stylex.props(styles.controlButton)}>
          <SkipBack size={18} fill="currentColor" />
        </button>
        <button {...stylex.props(styles.controlButton, styles.playButton)}>
          {MOCK_PLAYBACK.isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </button>
        <button {...stylex.props(styles.controlButton)}>
          <SkipForward size={18} fill="currentColor" />
        </button>
      </div>
    </div>
  );
}

const styles = stylex.create({
  container: {
    display: 'flex',
    flexDirection: 'column',
    padding: spacing.md,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.md,
    marginBottom: spacing.md,
  },
  trackRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.sm,
  },
  trackCover: {
    width: '48px',
    height: '48px',
    borderRadius: borderRadius.md,
    objectFit: 'cover',
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
});
