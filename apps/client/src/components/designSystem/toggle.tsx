import * as stylex from '@stylexjs/stylex';
import { colors, borderRadius, transitions } from './designConstants.stylex';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, disabled = false }: ToggleProps) {
  function handleClick() {
    if (!disabled) {
      onChange(!checked);
    }
  }

  return (
    <div
      role="switch"
      aria-checked={checked}
      onClick={handleClick}
      {...stylex.props(styles.container, disabled && styles.disabled)}
    >
      <div {...stylex.props(styles.track, checked && styles.trackChecked)}>
        <div {...stylex.props(styles.thumb, checked && styles.thumbChecked)} />
      </div>
    </div>
  );
}

const styles = stylex.create({
  container: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
  },
  track: {
    display: 'flex',
    alignItems: 'center',
    width: '44px',
    height: '24px',
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.full,
    transition: transitions.default,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
  },
  trackChecked: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  thumb: {
    position: 'absolute',
    left: '2px',
    width: '18px',
    height: '18px',
    backgroundColor: '#FFFFFF',
    borderRadius: borderRadius.full,
    transition: 'transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
  },
  thumbChecked: {
    transform: 'translateX(20px)',
  },
  disabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
});
