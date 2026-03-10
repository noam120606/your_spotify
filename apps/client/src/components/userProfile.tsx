import * as stylex from '@stylexjs/stylex';
import { Text } from './designSystem/text';
import { colors, spacing, borderRadius } from './designSystem/designConstants.stylex';

import { useAuthStore } from '../store/authStore';

export function UserProfile() {
  const { user, spotify } = useAuthStore();

  const username = spotify?.display_name || user?.username || 'Guest';
  const avatarUrl = spotify?.images?.[0]?.url || 'https://picsum.photos/100/100';
  const subscriptionTheme = spotify?.product || 'free';
  const isPremium = subscriptionTheme === 'premium';

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.profileRow)}>
        <img
          src={avatarUrl}
          alt="Avatar"
          {...stylex.props(styles.avatar)}
        />
        <div {...stylex.props(styles.userInfo)}>
          <Text weight="bold" size="medium" xstyle={styles.truncateText}>
            {username}
          </Text>
          <Text xstyle={[styles.tierBadge, isPremium && styles.premiumBadge]}>
            {subscriptionTheme.toUpperCase()}
          </Text>
        </div>
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
  },
  // Profile
  profileRow: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: '42px',
    height: '42px',
    borderRadius: borderRadius.full,
    objectFit: 'cover',
    borderWidth: '2px',
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    flex: 1,
  },
  tierBadge: {
    fontSize: '0.7rem',
    fontWeight: '700',
    letterSpacing: '0.05em',
    color: colors.textSecondary,
    marginTop: '2px',
  },
  premiumBadge: {
    color: 'transparent',
    backgroundImage: 'linear-gradient(45deg, #1CD760, #1ed760)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
  },
  truncateText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
  },
});
