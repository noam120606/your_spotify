import React, { forwardRef } from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors, spacing, borderRadius, fontSize, transitions } from './designConstants.stylex';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  darken?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, darken, ...props }, ref) => {
    return (
      <div {...stylex.props(styles.wrapper)}>
        <input
          ref={ref}
          {...stylex.props(
            styles.input,
            darken && styles.darken,
            error && styles.error
          )}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = 'Input';

const styles = stylex.create({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    padding: `${spacing.sm} ${spacing.md}`,
    fontSize: fontSize.medium,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: borderRadius.md,
    outline: 'none',
    transition: transitions.default,
    '::placeholder': {
      color: colors.textSecondary,
    },
    ':hover': {
      backgroundColor: colors.surfaceHover,
    },
    ':focus': {
      backgroundColor: colors.background,
      borderColor: colors.primary,
      boxShadow: `0 0 0 2px rgba(28, 215, 96, 0.2)`,
    },
  },
  error: {
    borderColor: colors.error,
    ':focus': {
      borderColor: colors.error,
      boxShadow: `0 0 0 2px rgba(211, 47, 47, 0.2)`,
    },
  },
  darken: {
    backgroundColor: colors.surfaceDark,
    ':hover': {
      backgroundColor: colors.surfaceDarker,
    },
  },
});
