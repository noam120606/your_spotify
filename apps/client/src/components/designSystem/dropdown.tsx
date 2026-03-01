import { useState, useRef, useEffect } from 'react';
import * as stylex from '@stylexjs/stylex';
import { colors, spacing, borderRadius, transitions } from './designConstants.stylex';
import { Text } from './text';

export interface DropdownOption {
  label: string;
  value: string;
}

export interface DropdownProps {
  options: DropdownOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  error?: boolean;
}

export function Dropdown({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  error,
}: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} {...stylex.props(styles.container)}>
      <button
        type="button"
        {...stylex.props(
          styles.trigger,
          isOpen && styles.triggerOpen,
          error && styles.error
        )}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Text color={selectedOption ? 'text' : 'textSecondary'} weight="semiBold">
          {selectedOption ? selectedOption.label : placeholder}
        </Text>
        <span {...stylex.props(styles.chevron, isOpen && styles.chevronOpen)}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div {...stylex.props(styles.dropdownMenu)}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              {...stylex.props(
                styles.option,
                option.value === value && styles.optionSelected
              )}
              onClick={() => {
                onChange?.(option.value);
                setIsOpen(false);
              }}
            >
              <Text color={option.value === value ? 'primary' : 'text'} weight="medium">
                {option.label}
              </Text>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = stylex.create({
  container: {
    position: 'relative',
    width: '100%',
  },
  trigger: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: `${spacing.sm} ${spacing.md}`,
    backgroundColor: colors.surface,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: 'transparent',
    borderRadius: borderRadius.md,
    cursor: 'pointer',
    transition: transitions.default,
    ':hover': {
      backgroundColor: colors.surfaceHover,
    },
    ':focus': {
      outline: 'none',
      borderColor: colors.primary,
      backgroundColor: colors.background,
      boxShadow: `0 0 0 2px rgba(28, 215, 96, 0.2)`,
    },
  },
  triggerOpen: {
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  error: {
    borderColor: colors.error,
  },
  chevron: {
    fontSize: '10px',
    color: colors.textSecondary,
    transition: 'transform 0.2s ease',
  },
  chevronOpen: {
    transform: 'rotate(180deg)',
  },
  dropdownMenu: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    maxHeight: '240px',
    overflowY: 'auto',
    zIndex: 10,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    padding: spacing.xs,
    boxSizing: 'border-box',
  },
  option: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    padding: `${spacing.sm} ${spacing.sm}`,
    backgroundColor: 'transparent',
    borderWidth: 0,
    cursor: 'pointer',
    textAlign: 'left',
    borderRadius: borderRadius.sm,
    transition: transitions.default,
    ':hover': {
      backgroundColor: colors.background,
    },
  },
  optionSelected: {
    backgroundColor: colors.background,
  },
});
