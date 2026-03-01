import * as stylex from '@stylexjs/stylex';

const DARK = '@media (prefers-color-scheme: dark)';

export const colors = stylex.defineVars({
  primary: '#1CD760',
  primaryHover: '#1ed760',
  primaryActive: '#1aa34a',
  background: { default: '#FFFFFF', [DARK]: '#121212' },
  surface: { default: '#F5F5F5', [DARK]: '#282828' },
  surfaceHover: { default: '#EBEBEB', [DARK]: '#3E3E3E' },
  text: { default: '#121212', [DARK]: '#FFFFFF' },
  textSecondary: { default: '#666666', [DARK]: '#B3B3B3' },
  border: { default: '#E0E0E0', [DARK]: '#3E3E3E' },
  borderHover: { default: '#BDBDBD', [DARK]: '#555555' },
  error: { default: '#D32F2F', [DARK]: '#CF6679' },
});

export const fontSize = stylex.defineVars({
  small: '0.875rem',
  medium: '1rem',
  large: '1.25rem',
  xlarge: '1.5rem',
  xxlarge: '2rem',
});

export const fontWeight = stylex.defineVars({
  regular: '400',
  medium: '500',
  semiBold: '600',
  bold: '700',
});

export const spacing = stylex.defineVars({
  xs: '0.25rem',
  sm: '0.5rem',
  md: '1rem',
  lg: '1.5rem',
  xl: '2rem',
  xxl: '3rem',
});

export const borderRadius = stylex.defineVars({
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
});

export const transitions = stylex.defineVars({
  default: '0.2s ease-in-out',
});

export const lightTheme = stylex.createTheme(colors, {
  primary: '#1CD760',
  primaryHover: '#1ed760',
  primaryActive: '#1aa34a',
  background: '#FFFFFF',
  surface: '#F5F5F5',
  surfaceHover: '#EBEBEB',
  text: '#121212',
  textSecondary: '#666666',
  border: '#E0E0E0',
  borderHover: '#BDBDBD',
  error: '#D32F2F',
});

export const darkTheme = stylex.createTheme(colors, {
  primary: '#1CD760',
  primaryHover: '#1ed760',
  primaryActive: '#1aa34a',
  background: '#121212',
  surface: '#282828',
  surfaceHover: '#3E3E3E',
  text: '#FFFFFF',
  textSecondary: '#B3B3B3',
  border: '#3E3E3E',
  borderHover: '#555555',
  error: '#CF6679',
});
