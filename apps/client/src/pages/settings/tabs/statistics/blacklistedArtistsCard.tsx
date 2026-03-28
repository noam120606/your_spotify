import * as stylex from "@stylexjs/stylex";
import { useState, useEffect } from "react";

import { api } from "../../../../api/spotifyApi";
import { Artist } from "../../../../api/types";
import { Card } from "../../../../components/designSystem/card";
import {
  colors,
  spacing,
  borderRadius,
  transitions,
} from "../../../../components/designSystem/designConstants.stylex";
import { Text } from "../../../../components/designSystem/text";
import { useConfirmation } from "../../../../hooks/useConfirmation";
import { useAuthStore } from "../../../../store/authStore";

export function BlacklistedArtistsCard() {
  const { user, unblacklistArtist } = useAuthStore();
  const { confirm, ConfirmationModal } = useConfirmation();
  const [blacklistedArtists, setBlacklistedArtists] = useState<Artist[]>([]);

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
        console.error("Failed to fetch blacklisted artists:", error);
      }
    };

    fetchBlacklisted();
  }, [user?.settings?.blacklistedArtists]);

  const handleUnblacklist = async (artist: Artist) => {
    const confirmed = await confirm({
      title: "Un-blacklist Artist",
      description: `Are you sure you want to remove ${artist.name} from your blacklist?`,
      confirmText: "Remove",
      cancelText: "Cancel",
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
    <>
      <ConfirmationModal />
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
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    {...stylex.props(styles.crossIcon)}
                  >
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
    </>
  );
}

const styles = stylex.create({
  blacklistedList: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
  },
  blacklistedItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: spacing.md,
    backgroundColor: colors.surfaceDarker,
    borderRadius: borderRadius.md,
  },
  blacklistedItemLeft: {
    display: "flex",
    alignItems: "center",
    gap: spacing.md,
  },
  artistImage: {
    width: "40px",
    height: "40px",
    borderRadius: borderRadius.full,
    objectFit: "cover",
    backgroundColor: colors.surfaceDarker,
  },
  crossButton: {
    background: "none",
    border: "none",
    color: colors.textSecondary,
    cursor: "pointer",
    padding: spacing.xs,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: borderRadius.full,
    transition: transitions.default,
    ":hover": {
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      color: colors.error,
    },
  },
  crossIcon: {
    width: "20px",
    height: "20px",
  },
  emptyText: {
    textAlign: "center",
    padding: spacing.xl,
  },
});
