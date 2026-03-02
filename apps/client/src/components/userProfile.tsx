import * as stylex from '@stylexjs/stylex';
import { Text } from './designSystem/text';
import { colors, spacing, borderRadius } from './designSystem/designConstants.stylex';

// Hardcoded Data
const MOCK_USER = {
  username: 'Timothée',
  avatarUrl: 'https://picsum.photos/100/100', // Real placeholder
  subscriptionTheme: 'premium' // 'premium' | 'light'
};

export function UserProfile() {
  const isPremium = MOCK_USER.subscriptionTheme === 'premium';

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.profileRow)}>
        <img
          src={MOCK_USER.avatarUrl}
          alt="Avatar"
          {...stylex.props(styles.avatar)}
        />
        <div {...stylex.props(styles.userInfo)}>
          <Text weight="bold" size="medium" xstyle={styles.truncateText}>
            {MOCK_USER.username}
          </Text>
          <Text xstyle={[styles.tierBadge, isPremium && styles.premiumBadge]}>
            {MOCK_USER.subscriptionTheme.toUpperCase()}
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
    backgroundColor: colors.surfaceHover,
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
