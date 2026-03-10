import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors, spacing, borderRadius } from './designConstants.stylex';
import { Text } from './text';

interface CardProps {
  title?: string;
  children: React.ReactNode;
  fullWidth?: boolean;
  variant?: 'default' | 'dark';
}

export function Card({ title, children, fullWidth, variant = 'default' }: CardProps) {
  return (
    <div {...stylex.props(styles.card, variant === 'dark' && styles.cardDark, fullWidth && styles.fullWidth)}>
      {title && <Text weight="bold" size="large" xstyle={styles.title}>{title}</Text>}
      <div {...stylex.props(styles.content)}>
        {children}
      </div>
    </div>
  );
}

const styles = stylex.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xxl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    paddingLeft: spacing.lg,
    paddingRight: spacing.lg,
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    height: '100%',
  },
  cardDark: {
    backgroundColor: colors.surfaceDark,
  },
  fullWidth: {
    gridColumn: '1 / -1',
  },
  title: {
    marginBottom: spacing.xs,
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  }
});
