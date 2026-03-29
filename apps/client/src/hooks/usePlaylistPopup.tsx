import * as stylex from "@stylexjs/stylex";
import { useCallback, useEffect, useMemo, useState } from "react";

import { api } from "../api/spotifyApi";
import { Playlist, PlaylistContext } from "../api/types";
import { SegmentedControl } from "../components/segmentedControl";
import { Button } from "../components/designSystem/button";
import { spacing } from "../components/designSystem/designConstants.stylex";
import { Input } from "../components/designSystem/input";
import { Modal } from "../components/designSystem/modal";
import { Select } from "../components/designSystem/select";
import { Text } from "../components/designSystem/text";

type PlaylistPopupTab = "existing" | "create";

const DEFAULT_TAB: PlaylistPopupTab = "existing";

function parseItemCount(value: string): number | null {
  if (!/^[0-9]+$/.test(value)) return null;
  const parsedValue = Number(value);
  if (!Number.isInteger(parsedValue) || parsedValue < 1) return null;
  return parsedValue;
}

export function usePlaylistPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<PlaylistContext | null>(null);
  const [activeTab, setActiveTab] = useState<PlaylistPopupTab>(DEFAULT_TAB);
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selectedPlaylistId, setSelectedPlaylistId] = useState("");
  const [playlistName, setPlaylistName] = useState("");
  const [loadingPlaylists, setLoadingPlaylists] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [itemCount, setItemCount] = useState<string>("");

  const requiresItemCount = useMemo(() => Boolean(context && "nb" in context), [context]);
  const parsedItemCount = useMemo(() => parseItemCount(itemCount), [itemCount]);

  const open = useCallback((playlistContext: PlaylistContext) => {
    setContext(playlistContext);
    setIsOpen(true);
    setActiveTab(DEFAULT_TAB);
    setSelectedPlaylistId("");
    setPlaylistName("");
    setItemCount("nb" in playlistContext ? String(playlistContext.nb) : "");
    setErrorMessage(null);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
    setSubmitting(false);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    let isCancelled = false;

    async function loadPlaylists() {
      setLoadingPlaylists(true);
      try {
        const response = await api.getPlaylists();
        if (!isCancelled) {
          setPlaylists(response.data);
        }
      } catch (error) {
        if (!isCancelled) {
          setPlaylists([]);
          setErrorMessage("Failed to load playlists. Please try again.");
          console.error("Failed to load playlists", error);
        }
      } finally {
        if (!isCancelled) {
          setLoadingPlaylists(false);
        }
      }
    }

    loadPlaylists();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  const canSubmit = useMemo(() => {
    if (!context || submitting || loadingPlaylists) return false;
    if (requiresItemCount && parsedItemCount === null) return false;
    if (activeTab === "existing") return selectedPlaylistId.length > 0;
    return playlistName.trim().length > 0;
  }, [
    activeTab,
    context,
    loadingPlaylists,
    parsedItemCount,
    playlistName,
    requiresItemCount,
    selectedPlaylistId,
    submitting,
  ]);

  const handleConfirm = useCallback(async () => {
    if (!context || !canSubmit) return;

    const playlistContext: PlaylistContext =
      "nb" in context
        ? {
            ...context,
            nb: parsedItemCount as number,
          }
        : context;

    setSubmitting(true);
    setErrorMessage(null);
    try {
      if (activeTab === "existing") {
        await api.addToPlaylist(selectedPlaylistId, undefined, playlistContext);
      } else {
        await api.addToPlaylist(undefined, playlistName.trim(), playlistContext);
      }
      close();
    } catch (error) {
      setErrorMessage("Failed to update playlist. Please try again.");
      console.error("Failed to update playlist", error);
    } finally {
      setSubmitting(false);
    }
  }, [activeTab, canSubmit, close, context, parsedItemCount, playlistName, selectedPlaylistId]);

  const playlistOptions = playlists.map((playlist) => ({
    label: playlist.name,
    value: playlist.id,
    image: playlist.images?.[0]?.url,
  }));

  const popupNode = !isOpen ? null : (
    <Modal open={isOpen} onOpenChange={(openState) => !openState && close()} allowOverflow>
      <div {...stylex.props(styles.container)}>
        <div {...stylex.props(styles.header)}>
          <Text as="h2" size="xlarge" weight="bold">
            Add To Playlist
          </Text>
          <Text color="textSecondary" size="small">
            Select an existing playlist or create a new one.
          </Text>
        </div>

        <SegmentedControl.Root
          selectedIndex={activeTab === "existing" ? 0 : 1}
          onIndexChange={(index) => {
            setActiveTab(index === 0 ? "existing" : "create");
            setErrorMessage(null);
          }}
          id="playlist-popup-tabs"
          fullWidth={true}
        >
          <SegmentedControl.Item value="existing">
            {({ selected }) => (
              <Text
                size="small"
                weight={selected ? "bold" : "regular"}
                color={selected ? "background" : "textSecondary"}
              >
                Add to existing
              </Text>
            )}
          </SegmentedControl.Item>
          <SegmentedControl.Item value="create">
            {({ selected }) => (
              <Text
                size="small"
                weight={selected ? "bold" : "regular"}
                color={selected ? "background" : "textSecondary"}
              >
                Create new
              </Text>
            )}
          </SegmentedControl.Item>
        </SegmentedControl.Root>

        <div {...stylex.props(styles.content)}>
          {loadingPlaylists ? (
            <Text color="textSecondary" size="small">
              Loading playlists...
            </Text>
          ) : activeTab === "existing" ? (
            <>
              <Text size="small" weight="semiBold" color="textSecondary">
                Playlist
              </Text>
              <Select
                options={playlistOptions}
                value={selectedPlaylistId}
                onChange={setSelectedPlaylistId}
                placeholder={playlistOptions.length > 0 ? "Select a playlist" : "No playlists available"}
                darken
              />
            </>
          ) : (
            <>
              <Text size="small" weight="semiBold" color="textSecondary">
                Playlist name
              </Text>
              <Input
                placeholder="My playlist"
                value={playlistName}
                onChange={(event) => setPlaylistName(event.target.value)}
                darken
              />
            </>
          )}

          {requiresItemCount && (
            <>
              <Text size="small" weight="semiBold" color="textSecondary">
                Number of items
              </Text>
              <Input
                type="number"
                min={1}
                step={1}
                value={itemCount}
                onChange={(event) => setItemCount(event.target.value)}
                darken
                error={itemCount.length > 0 && parsedItemCount === null}
              />
            </>
          )}
        </div>

        {errorMessage && (
          <Text color="error" size="small">
            {errorMessage}
          </Text>
        )}

        <div {...stylex.props(styles.actions)}>
          <Button variant="ghost" onClick={close} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} disabled={!canSubmit}>
            {submitting ? "Saving..." : activeTab === "existing" ? "Add" : "Create"}
          </Button>
        </div>
      </div>
    </Modal>
  );

  return { open, popupNode };
}

const styles = stylex.create({
  container: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
    padding: spacing.xl,
  },
  header: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.xs,
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.sm,
    minHeight: "88px",
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: spacing.sm,
  },
});