import React from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors, fontSize, fontWeight } from './designConstants.stylex';

export interface TextProps extends Omit<React.HTMLAttributes<HTMLElement>, 'color'> {
  children: React.ReactNode;
  color?: 'primary' | 'primaryHover' | 'primaryActive' | 'background' | 'surface' | 'surfaceHover' | 'text' | 'textSecondary' | 'border' | 'borderHover' | 'error';
  size?: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';
  weight?: 'regular' | 'medium' | 'semiBold' | 'bold';
  as?: React.ElementType;
}

export function Text({
  children,
  color = 'text',
  size = 'medium',
  weight = 'regular',
  as: Component = 'span',
  ...rest
}: TextProps) {
  return (
    <Component
      {...stylex.props(
        styles.text,
        colorStyles[color],
        sizeStyles[size],
        weightStyles[weight]
      )}
      {...rest}
    >
      {children}
    </Component>
  );
}

const styles = stylex.create({
  text: {
    margin: 0,
    fontFamily: '"Plus Jakarta Sans", system-ui, -apple-system, sans-serif',
    transition: 'color 0.2s ease',
  },
});

const colorStyles = stylex.create({
  primary: { color: colors.primary },
  primaryHover: { color: colors.primaryHover },
  primaryActive: { color: colors.primaryActive },
  background: { color: colors.background },
  surface: { color: colors.surface },
  surfaceHover: { color: colors.surfaceHover },
  text: { color: colors.text },
  textSecondary: { color: colors.textSecondary },
  border: { color: colors.border },
  borderHover: { color: colors.borderHover },
  error: { color: colors.error },
});

const sizeStyles = stylex.create({
  small: { fontSize: fontSize.small },
  medium: { fontSize: fontSize.medium },
  large: { fontSize: fontSize.large },
  xlarge: { fontSize: fontSize.xlarge },
  xxlarge: { fontSize: fontSize.xxlarge },
});

const weightStyles = stylex.create({
  regular: { fontWeight: fontWeight.regular },
  medium: { fontWeight: fontWeight.medium },
  semiBold: { fontWeight: fontWeight.semiBold },
  bold: { fontWeight: fontWeight.bold },
});
