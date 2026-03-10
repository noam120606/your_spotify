import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import { ConnectedIntervalSelector } from './intervalSelector';
import { spacing, colors } from './designSystem/designConstants.stylex';
import { Text } from './designSystem/text';
import { Button } from './designSystem/button';
import { Sun, Moon, Search } from 'lucide-react';
import { useSettingsStore } from '../store/settingsStore';
import { SearchModal } from './searchModal';

interface PageHeaderProps {
  title: string | React.ReactNode;
  subtitle?: string | React.ReactNode;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  const { isDarkMode, toggleDarkMode } = useSettingsStore();
  const [isSearchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <header {...stylex.props(styles.header)}>
        <div {...stylex.props(styles.welcomeSection)}>
          <Text size="xlarge" weight="bold" color="text">
            {title}
          </Text>
          <Text size="medium" color="textSecondary" {...stylex.props(styles.subtitle)}>
            {subtitle}
          </Text>
        </div>
        <div {...stylex.props(styles.actions)}>
          <ConnectedIntervalSelector />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSearchOpen(true)}
            aria-label="Search"
            {...stylex.props(styles.iconButton)}
          >
            <Search size={20} color="currentColor" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDarkMode}
            aria-label="Toggle theme"
            {...stylex.props(styles.iconButton, isDarkMode ? styles.iconRotateDark : styles.iconRotateLight)}
          >
            {isDarkMode ? <Sun size={20} color="currentColor" /> : <Moon size={20} color="currentColor" />}
          </Button>
        </div>
      </header>
      <SearchModal isOpen={isSearchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}

const styles = stylex.create({
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.xl,
  },
  welcomeSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.xs,
  },
  subtitle: {
    marginTop: spacing.xs,
    opacity: 0.7,
    fontSize: '0.9rem',
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  iconButton: {
    padding: spacing.xs,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    color: colors.text,
    transition: 'transform 0.5s ease, color 0.5s ease, background-color 0.2s',
  },
  iconRotateDark: {
    transform: 'rotate(0deg)',
  },
  iconRotateLight: {
    transform: 'rotate(-180deg)',
  },
});
