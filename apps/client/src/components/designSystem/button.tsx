import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors, spacing, borderRadius, fontSize, fontWeight, transitions } from './designConstants.stylex';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  darken?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  darken,
  ...props
}: ButtonProps) {
  return (
    <button
      {...stylex.props(
        styles.base,
        variantStyles[variant],
        darken && styles.darken,
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        props.disabled && styles.disabled
      )}
      {...props}
    >
      {children}
    </button>
  );
}

const styles = stylex.create({
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap',
    borderWidth: 0,
    borderStyle: 'solid',
    fontFamily: 'inherit',
    cursor: 'pointer',
    transition: transitions.default,
    ':active': {
      transform: 'scale(0.98)',
    },
  },
  fullWidth: {
    width: '100%',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    pointerEvents: 'none',
  },
  darken: {
    backgroundColor: colors.surfaceDark,
    ':hover': {
      backgroundColor: colors.surfaceDarker,
    },
  },
});

const variantStyles = stylex.create({
  primary: {
    backgroundColor: colors.primary,
    color: '#121212',
    fontWeight: fontWeight.bold,
    borderRadius: borderRadius.md,
    ':hover': {
      backgroundColor: colors.primaryHover,
    },
    ':active': {
      backgroundColor: colors.primaryActive,
    },
  },
  secondary: {
    backgroundColor: colors.surface,
    color: colors.text,
    fontWeight: fontWeight.bold,
    borderRadius: borderRadius.md,
    ':hover': {
      backgroundColor: colors.surfaceHover,
    },
  },
  outline: {
    backgroundColor: 'transparent',
    color: colors.text,
    borderColor: colors.border,
    borderWidth: '1px',
    fontWeight: fontWeight.bold,
    borderRadius: borderRadius.md,
    ':hover': {
      borderColor: colors.borderHover,
      backgroundColor: colors.surface,
    },
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.textSecondary,
    fontWeight: fontWeight.semiBold,
    borderRadius: borderRadius.md,
    ':hover': {
      color: colors.text,
      backgroundColor: colors.surfaceHover,
    },
  },
  destructive: {
    backgroundColor: colors.surface,
    color: colors.error,
    fontWeight: fontWeight.bold,
    borderRadius: borderRadius.md,
    ':hover': {
      backgroundColor: colors.surfaceHover,
    },
  },
});

const sizeStyles = stylex.create({
  sm: {
    fontSize: fontSize.small,
    padding: `0 ${spacing.sm}`,
    height: '28px',
  },
  md: {
    fontSize: fontSize.small,
    padding: `0 ${spacing.md}`,
    height: '36px',
  },
  lg: {
    fontSize: fontSize.medium,
    padding: `0 ${spacing.lg}`,
    height: '44px',
  },
});
