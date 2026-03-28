import * as stylex from "@stylexjs/stylex";
import { useState, useEffect, useRef } from "react";

import { api } from "../../../../api/spotifyApi";
import { Artist } from "../../../../api/types";
import { Card } from "../../../../components/designSystem/card";
import {
  colors,
  spacing,
  borderRadius,
  transitions,
} from "../../../../components/designSystem/designConstants.stylex";
import { Input } from "../../../../components/designSystem/input";
import { Text } from "../../../../components/designSystem/text";
import { useConfirmation } from "../../../../hooks/useConfirmation";
import { useAuthStore } from "../../../../store/authStore";

export function BlacklistArtistsSearchCard() {
  const { user, blacklistArtist } = useAuthStore();
  const { confirm, ConfirmationModal } = useConfirmation();

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Artist[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
        console.error("Failed to search artists:", error);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => {
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    };
  }, [searchQuery]);

  const handleBlacklist = async (artist: Artist) => {
    const confirmed = await confirm({
      title: "Blacklist Artist",
      description: `Are you sure you want to blacklist ${artist.name}? Their songs will no longer appear in your statistics.`,
      confirmText: "Blacklist",
      cancelText: "Cancel",
      isDestructive: true,
    });

    if (confirmed) {
      try {
        await blacklistArtist(artist.id);
        setSearchQuery("");
        setSearchResults([]);
        setShowResults(false);
      } catch {
        // Error handled in store
      }
    }
  };

  return (
    <>
      <ConfirmationModal />
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
                    const isAlreadyBlacklisted = user?.settings?.blacklistedArtists?.includes(
                      artist.id,
                    );
                    return (
                      <div
                        key={artist.id}
                        {...stylex.props(
                          styles.artistItem,
                          isAlreadyBlacklisted && styles.artistItemDisabled,
                        )}
                        onClick={() => !isAlreadyBlacklisted && handleBlacklist(artist)}
                      >
                        <img
                          src={artist.images?.[0]?.url || "/placeholder.png"}
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
    </>
  );
}

const styles = stylex.create({
  descriptionText: {
    marginBottom: spacing.md,
  },
  searchSection: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
    position: "relative",
  },
  searchResultsContainer: {
    position: "absolute",
    top: "100%",
    left: 0,
    right: 0,
    marginTop: spacing.xs,
    backgroundColor: colors.surfaceHover,
    borderRadius: borderRadius.md,
    border: `1px solid ${colors.border}`,
    maxHeight: "300px",
    overflowY: "auto",
    zIndex: 10,
    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
  },
  searchingText: {
    display: "block",
    padding: spacing.md,
    textAlign: "center",
  },
  resultsList: {
    display: "flex",
    flexDirection: "column",
  },
  artistItem: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
    padding: spacing.md,
    cursor: "pointer",
    transition: transitions.default,
    ":hover": {
      backgroundColor: colors.surfaceDarker,
    },
  },
  artistItemDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
    ":hover": {
      backgroundColor: "transparent",
    },
  },
  artistImage: {
    width: "40px",
    height: "40px",
    borderRadius: borderRadius.full,
    objectFit: "cover",
    backgroundColor: colors.surfaceDarker,
  },
  artistInfo: {
    display: "flex",
    flexDirection: "column",
  },
});
