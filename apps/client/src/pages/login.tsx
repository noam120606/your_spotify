import { useEffect } from 'react';
import * as stylex from '@stylexjs/stylex';
import { Text } from '../components/designSystem/text';
import { colors, spacing } from '../components/designSystem/designConstants.stylex';
import { getSpotifyLogUrl } from '../api/spotifyApi';
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export function Login() {
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();

  useEffect(function () {
    if (isAuthenticated) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.card)}>
        <Text as="h1" xstyle={styles.title}>
          YourSpotify
        </Text>
        <Text as="p" xstyle={styles.subtitle}>
          Relive your musical journey. Connect to explore your top tracks, artists, and listening history with stunning visualizations.
        </Text>
        <div
          {...stylex.props(styles.loginButtonWrapper)}
          onClick={function () {
            window.location.href = getSpotifyLogUrl();
          }}
        >
          <button {...stylex.props(styles.loginButtonInner)}>
            Sign In with Spotify
          </button>
        </div>
      </div>

      <div {...stylex.props(styles.decoration, styles.decoration1)} />
      <div {...stylex.props(styles.decoration, styles.decoration2)} />
      <div {...stylex.props(styles.decoration, styles.decoration3)} />
    </div>
  );
}

const float = stylex.keyframes({
  '0%': { transform: 'translateY(0) scale(1)' },
  '50%': { transform: 'translateY(-20px) scale(1.05)' },
  '100%': { transform: 'translateY(0) scale(1)' },
});

const floatSlow = stylex.keyframes({
  '0%': { transform: 'translateY(0) scale(1)' },
  '50%': { transform: 'translateY(30px) scale(1.1)' },
  '100%': { transform: 'translateY(0) scale(1)' },
});

const loginButtonGlow = stylex.keyframes({
  '0%': { backgroundPosition: '0% 50%' },
  '50%': { backgroundPosition: '100% 50%' },
  '100%': { backgroundPosition: '0% 50%' },
});

const styles = stylex.create({
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    overflow: 'hidden',
    position: 'relative',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    maxWidth: '500px',
    padding: spacing.xxl,
    backgroundColor: colors.surface,
    border: `1px solid ${colors.border}`,
    borderRadius: '24px',
    zIndex: 10,
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    backdropFilter: 'blur(10px)',
  },
  title: {
    marginBottom: spacing.md,
    background: `linear-gradient(135deg, ${colors.primary} 0%, #17a64b 100%)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    fontSize: '3rem',
    textShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
  subtitle: {
    marginBottom: spacing.xxl,
    lineHeight: 1.6,
    color: colors.textSecondary,
    fontSize: '1.25rem',
  },
  loginButtonWrapper: {
    position: 'relative',
    padding: '3px',
    borderRadius: '9999px',
    background: `linear-gradient(90deg, #1CD760, #00b09b, #1CD760, #1ed760, #1CD760)`,
    backgroundSize: '400% 400%',
    animationName: loginButtonGlow,
    animationDuration: '6s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'linear',
    cursor: 'pointer',
    transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), filter 0.3s',
    display: 'flex',
    ':hover': {
      transform: 'scale(1.05)',
      filter: 'drop-shadow(0 0 15px rgba(28, 215, 96, 0.6))',
    },
    ':active': {
      transform: 'scale(0.95)',
    },
  },
  loginButtonInner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#121212',
    color: '#FFFFFF',
    padding: `${spacing.lg} ${spacing.xxl}`,
    borderRadius: '9999px',
    fontSize: '1.25rem',
    fontWeight: 'bold',
    border: 'none',
    width: '100%',
    height: '100%',
    outline: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.3s, color 0.3s',
    ':hover': {
      backgroundColor: '#181818',
    },
  },
  decoration: {
    position: 'absolute',
    borderRadius: '50%',
    filter: 'blur(80px)',
    opacity: 0.15,
    zIndex: 1,
  },
  decoration1: {
    width: '400px',
    height: '400px',
    backgroundColor: colors.primary,
    top: '-100px',
    left: '-100px',
    animationName: float,
    animationDuration: '8s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  },
  decoration2: {
    width: '500px',
    height: '500px',
    backgroundColor: '#00b09b',
    bottom: '-200px',
    right: '-100px',
    animationName: floatSlow,
    animationDuration: '12s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
  },
  decoration3: {
    width: '300px',
    height: '300px',
    backgroundColor: colors.primary,
    bottom: '20%',
    left: '20%',
    animationName: float,
    animationDuration: '10s',
    animationIterationCount: 'infinite',
    animationTimingFunction: 'ease-in-out',
    animationDelay: '-5s',
  }
});
