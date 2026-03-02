import * as stylex from '@stylexjs/stylex';
import { Text } from './designSystem/text';
import { colors, spacing, borderRadius } from './designSystem/designConstants.stylex';
import { useFavoriteArtist } from '../hooks/useFavoriteArtist';

export interface FavoriteArtistCardProps {
  startDate: Date | null;
  endDate: Date | null;
}

export function FavoriteArtistCard({ startDate, endDate }: FavoriteArtistCardProps) {
  const { data, loading } = useFavoriteArtist(startDate, endDate);

  return (
    <div {...stylex.props(styles.container)}>
      {data && data.artist.images && data.artist.images.length > 0 && data.artist.images[0] && (
        <img
          src={data.artist.images[0].url}
          alt={data.artist.name}
          {...stylex.props(styles.backgroundImage)}
        />
      )}
      <div {...stylex.props(styles.overlay)} />

      <Text size="small" weight="bold" style={{ color: 'rgba(255,255,255,0.7)' }} xstyle={styles.title}>
        Top Artist
      </Text>

      {loading ? (
        <div {...stylex.props(styles.contentContainer)}>
          <Text color="textSecondary">Loading...</Text>
        </div>
      ) : data ? (
        <div {...stylex.props(styles.contentContainer)}>
          <Text size="xxlarge" weight="bold" style={{ color: '#fff' }} xstyle={styles.name}>
            {data.artist.name}
          </Text>
          <Text size="medium" style={{ color: 'rgba(255,255,255,0.7)' }}>
            {data.count} Listens
          </Text>
        </div>
      ) : (
        <div {...stylex.props(styles.contentContainer)}>
          <Text color="textSecondary">No data available</Text>
        </div>
      )}
    </div>
  );
}

const styles = stylex.create({
  container: {
    position: 'relative',
    backgroundColor: colors.surfaceDarker,
    borderRadius: borderRadius.xl,
    padding: spacing.xl,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '200px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  backgroundImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    zIndex: 0,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(to bottom, rgba(0, 0, 0, 0.2) 0%, rgba(0, 0, 0, 0.9) 100%)',
    zIndex: 1,
  },
  title: {
    position: 'relative',
    zIndex: 2,
    marginBottom: 'auto',
    textTransform: 'uppercase',
    letterSpacing: '1px',
  },
  contentContainer: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    gap: spacing.xs,
  },
  name: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    textShadow: '0 2px 4px rgba(0,0,0,0.5)',
  }
});
