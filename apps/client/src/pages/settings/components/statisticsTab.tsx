import { useState, useEffect, useRef } from 'react';
import * as stylex from '@stylexjs/stylex';
import { Text } from '../../../components/designSystem/text';
import { Input } from '../../../components/designSystem/input';
import { Dropdown } from '../../../components/designSystem/dropdown';
import { Card } from '../../../components/designSystem/card';
import { SettingTabContent } from './settingTabContent';
import { useAuthStore } from '../../../store/authStore';
import { useConfirmation } from '../../../hooks/useConfirmation';
import { api } from '../../../api/spotifyApi';
import { Artist } from '../../../api/types';
import {
  colors,
  spacing,
  borderRadius,
  transitions,
} from '../../../components/designSystem/designConstants.stylex';

export function StatisticsTab() {
  const { user, blacklistArtist, unblacklistArtist, updateSetting } = useAuthStore();
  const { confirm, ConfirmationModal } = useConfirmation();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [blacklistedArtists, setBlacklistedArtists] = useState<Artist[]>([]);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced Search implementation
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await api.search(searchQuery);
        setSearchResults(response.data.artists);
        setShowResults(true);
      } catch (error) {
        console.error('Failed to search artists:', error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  // Fetch blacklisted artists details
  useEffect(() => {
    const fetchBlacklisted = async () => {
      const ids = user?.settings?.blacklistedArtists || [];
      if (ids.length === 0) {
        setBlacklistedArtists([]);
        return;
      }

      try {
        const response = await api.getArtists(ids);
        setBlacklistedArtists(response.data);
      } catch (error) {
        console.error('Failed to fetch blacklisted artists:', error);
      }
    };

    fetchBlacklisted();
  }, [user?.settings?.blacklistedArtists]);

  const handleBlacklist = async (artist: Artist) => {
    const confirmed = await confirm({
      title: 'Blacklist Artist',
      description: `Are you sure you want to blacklist ${artist.name}? Their songs will no longer appear in your statistics.`,
      confirmText: 'Blacklist',
      cancelText: 'Cancel',
      isDestructive: true,
    });

    if (confirmed) {
      try {
        await blacklistArtist(artist.id);
        setSearchQuery('');
        setSearchResults([]);
        setShowResults(false);
      } catch {
        // Error handled in store
      }
    }
  };

  const handleUnblacklist = async (artist: Artist) => {
    const confirmed = await confirm({
      title: 'Un-blacklist Artist',
      description: `Are you sure you want to remove ${artist.name} from your blacklist?`,
      confirmText: 'Remove',
      cancelText: 'Cancel',
      isDestructive: false,
    });

    if (confirmed) {
      try {
        await unblacklistArtist(artist.id);
      } catch {
        // Error handled in store
      }
    }
  };

  return (
    <SettingTabContent>
      <ConfirmationModal />

      <Card title="Stat Measurement">
        <Text as="p" size="small" color="textSecondary" xstyle={styles.descriptionText}>
          Choose whether your top statistics are computed by play count or listening duration.
        </Text>
        <Dropdown
          options={[
            { label: 'Count', value: 'number' },
            { label: 'Duration', value: 'duration' },
          ]}
          value={user?.settings?.metricUsed || 'number'}
          onChange={(val) => updateSetting('metricUsed', val)}
          darken
        />
      </Card>

      <Card title="Blacklist Artists">
        <Text as="p" size="small" color="textSecondary" xstyle={styles.descriptionText}>
          Search for artists you want to exclude from your statistics.
        </Text>

        <div {...stylex.props(styles.searchSection)} ref={searchContainerRef}>
          <Input
            placeholder="Search for an artist..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowResults(true);
            }}
            onFocus={() => {
              if (searchQuery.trim().length > 0) {
                setShowResults(true);
              }
            }}
            darken
          />

          {showResults && searchQuery && (
            <div {...stylex.props(styles.searchResultsContainer)}>
              {isSearching ? (
                <Text as="span" size="small" color="textSecondary" xstyle={styles.searchingText}>
                  Searching...
                </Text>
              ) : searchResults.length > 0 ? (
                <div {...stylex.props(styles.resultsList)}>
                  {searchResults.map((artist) => {
                    const isAlreadyBlacklisted = user?.settings?.blacklistedArtists?.includes(artist.id);
                    return (
                      <div
                        key={artist.id}
                        {...stylex.props(styles.artistItem, isAlreadyBlacklisted && styles.artistItemDisabled)}
                        onClick={() => !isAlreadyBlacklisted && handleBlacklist(artist)}
                      >
                        <img
                          src={artist.images?.[0]?.url || '/placeholder.png'} // Add a default placeholder if needed
                          alt={artist.name}
                          {...stylex.props(styles.artistImage)}
                        />
                        <div {...stylex.props(styles.artistInfo)}>
                          <Text as="span" size="medium" weight="semiBold" color="text">
                            {artist.name}
                          </Text>
                          {isAlreadyBlacklisted && (
                            <Text as="span" size="small" color="textSecondary">
                              Already blacklisted
                            </Text>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <Text as="span" size="small" color="textSecondary" xstyle={styles.searchingText}>
                  No artists found.
                </Text>
              )}
            </div>
          )}
        </div>
      </Card>

      <Card title="Your Blacklisted Artists">
        {blacklistedArtists.length > 0 ? (
          <div {...stylex.props(styles.blacklistedList)}>
            {blacklistedArtists.map((artist) => (
              <div key={artist.id} {...stylex.props(styles.blacklistedItem)}>
                <div {...stylex.props(styles.blacklistedItemLeft)}>
                  <img
                    src={artist.images?.[0]?.url}
                    alt={artist.name}
                    {...stylex.props(styles.artistImage)}
                  />
                  <Text as="span" size="medium" weight="semiBold" color="text">
                    {artist.name}
                  </Text>
                </div>
                <button
                  onClick={() => handleUnblacklist(artist)}
                  {...stylex.props(styles.crossButton)}
                  aria-label={`Un-blacklist ${artist.name}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...stylex.props(styles.crossIcon)}>
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))}
          </div>
        ) : (
          <Text as="p" size="medium" color="textSecondary" xstyle={styles.emptyText}>
            You haven&apos;t blacklisted any artists yet.
          </Text>
        )}
      </Card>
    </SettingTabContent>
  );
}

const styles = stylex.create({
  descriptionText: {
    marginBottom: spacing.md,
  },
  searchSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
    position: 'relative',
  },
  searchResultsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: spacing.xs,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.border}`,
    maxHeight: '300px',
    overflowY: 'auto',
    zIndex: 10,
    boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
  },
  searchingText: {
    display: 'block',
    padding: spacing.md,
    textAlign: 'center',
  },
  resultsList: {
    display: 'flex',
    flexDirection: 'column',
  },
  artistItem: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    cursor: 'pointer',
    transition: transitions.default,
    ':hover': {
      backgroundColor: colors.surfaceDarker,
    },
  },
  artistItemDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
    ':hover': {
      backgroundColor: 'transparent',
    },
  },
  artistImage: {
    width: '40px',
    height: '40px',
    borderRadius: borderRadius.full,
    objectFit: 'cover',
    backgroundColor: colors.surfaceDarker,
  },
  artistInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  blacklistedList: {
    display: 'flex',
    flexDirection: 'column',
    gap: spacing.sm,
  },
  blacklistedItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.surfaceDarker,
    borderRadius: borderRadius.md,
  },
  blacklistedItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: spacing.md,
  },
  crossButton: {
    background: 'none',
    border: 'none',
    color: colors.textSecondary,
    cursor: 'pointer',
    padding: spacing.xs,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: borderRadius.full,
    transition: transitions.default,
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.1)',
      color: colors.error,
    },
  },
  crossIcon: {
    width: '20px',
    height: '20px',
  },
  emptyText: {
    textAlign: 'center',
    padding: spacing.xl,
  },
});
