import * as stylex from "@stylexjs/stylex";
import { useState } from "react";

import { api } from "../api/spotifyApi";
import { Button } from "../components/designSystem/button";
import { Card } from "../components/designSystem/card";
import { colors, spacing } from "../components/designSystem/designConstants.stylex";
import { Input } from "../components/designSystem/input";
import { Text } from "../components/designSystem/text";
import { Toggle } from "../components/designSystem/toggle";
import { PageHeader } from "../components/pageHeader";
import { useAuthStore } from "../store/authStore";

export function Share() {
  const { user, checkAuth } = useAuthStore();
  const [isPending, setIsPending] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const hasPublicToken = Boolean(user?.publicToken);
  const publicUrl = user?.publicToken
    ? (() => {
        const url = new URL(window.location.href);
        url.searchParams.set("token", user.publicToken);
        return url.toString();
      })()
    : "";

  async function refreshUserState() {
    await checkAuth();
  }

  async function handleToggle(nextChecked: boolean) {
    setIsPending(true);
    setStatus(null);
    try {
      if (nextChecked) {
        await api.generatePublicToken();
        setStatus({
          type: "success",
          message: "Public link enabled. You can now share your account with a tokenized URL.",
        });
      } else {
        await api.deletePublicToken();
        setStatus({
          type: "success",
          message: "Public link disabled. Existing public links no longer work.",
        });
      }
      await refreshUserState();
    } catch (error) {
      console.error("Failed to update public token status", error);
      setStatus({
        type: "error",
        message: "Unable to update sharing status. Please try again.",
      });
    } finally {
      setIsPending(false);
    }
  }

  async function handleResetLink() {
    setIsPending(true);
    setStatus(null);
    try {
      await api.generatePublicToken();
      await refreshUserState();
      setStatus({
        type: "success",
        message: "Public link has been reset. Old links no longer work.",
      });
    } catch (error) {
      console.error("Failed to reset public token", error);
      setStatus({
        type: "error",
        message: "Unable to reset public link. Please try again.",
      });
    } finally {
      setIsPending(false);
    }
  }

  async function handleCopyLink() {
    if (!user?.publicToken) {
      return;
    }

    setStatus(null);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set("token", user.publicToken);
      await navigator.clipboard.writeText(url.toString());
      setStatus({
        type: "success",
        message: "Public link copied to clipboard.",
      });
    } catch (error) {
      console.error("Failed to copy public link", error);
      setStatus({
        type: "error",
        message: "Unable to copy link. Please copy it manually from your browser URL.",
      });
    }
  }

  return (
    <main {...stylex.props(styles.mainContent)}>
      <PageHeader title="Share" subtitle="Share your listening statistics with others" />
      <div {...stylex.props(styles.content)}>
        <Card title="Public Sharing" fullWidth>
            <div {...stylex.props(styles.section)}>
              <Text as="h2" size="large" weight="bold" color="text">
                What this page is for
              </Text>
              <Text as="p" size="medium" color="textSecondary" align="left">
                Enable a public tokenized link so other people can view your listening statistics.
                You can disable it at any time to instantly revoke access.
              </Text>
            </div>

            <div {...stylex.props(styles.toggleRow)}>
              <div {...stylex.props(styles.toggleText)}>
                <Text as="span" size="medium" weight="semiBold" color="text">
                  Public link
                </Text>
                <Text as="span" size="small" color="textSecondary" align="left">
                  {hasPublicToken
                    ? "Enabled: your account can be accessed through a tokenized URL."
                    : "Disabled: no public URL is currently active."}
                </Text>
              </div>
              <Toggle checked={hasPublicToken} onChange={handleToggle} disabled={isPending} />
            </div>

            {hasPublicToken && (
              <div {...stylex.props(styles.actions)}>
                <div {...stylex.props(styles.linkField)}>
                  <Text as="label" size="small" weight="semiBold" color="text" align="left">
                    Tokenized URL
                  </Text>
                  <Input
                    value={publicUrl}
                    readOnly
                    onFocus={(event) => event.currentTarget.select()}
                    aria-label="Tokenized URL"
                    darken
                  />
                </div>
                <div {...stylex.props(styles.buttonRow)}>
                  <Button variant="outline" onClick={handleResetLink} disabled={isPending}>
                    Reset link
                  </Button>
                  <Button onClick={handleCopyLink} disabled={isPending}>
                    Copy a link to my account
                  </Button>
                </div>
              </div>
            )}

            {status && (
              <Text
                as="span"
                size="small"
                weight="semiBold"
                color={status.type === "error" ? "error" : "primary"}
                align={status.type === "success" ? "right" : "left"}
                xstyle={styles.statusText}
              >
                {status.message}
              </Text>
            )}
        </Card>
      </div>
    </main>
  );
}

const styles = stylex.create({
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
  },
  content: {
    display: "flex",
    flexDirection: "column",
    gap: spacing.lg,
    maxWidth: "800px",
    padding: `0 ${spacing.xl}`,
    paddingBottom: spacing.xxl,
  },
  section: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginBottom: "20px",
  },
  toggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    paddingTop: "8px",
    paddingBottom: "8px",
  },
  toggleText: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    marginTop: "16px",
    marginBottom: "12px",
  },
  linkField: {
    width: "100%",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  buttonRow: {
    display: "flex",
    justifyContent: "flex-end",
    alignItems: "center",
    gap: "12px",
    width: "100%",
    flexWrap: "nowrap",
  },
  statusText: {
    width: "100%",
    display: "block",
  },
});
