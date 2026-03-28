import * as stylex from "@stylexjs/stylex";
import { useState, useCallback } from "react";

import { colors, spacing } from "../components/designSystem/designConstants.stylex";
import { Modal } from "../components/designSystem/modal";
import { Text } from "../components/designSystem/text";

interface ConfirmationOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}

export function useConfirmation() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmationOptions | null>(null);
  const [resolver, setResolver] = useState<{ resolve: (value: boolean) => void } | null>(null);

  const confirm = useCallback((opts: ConfirmationOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolver({ resolve });
    });
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    if (resolver) {
      resolver.resolve(false);
    }
  }, [resolver]);

  const handleConfirm = useCallback(() => {
    setIsOpen(false);
    if (resolver) {
      resolver.resolve(true);
    }
  }, [resolver]);

  const ConfirmationModal = () => {
    if (!options) return null;

    return (
      <Modal open={isOpen} onOpenChange={handleClose}>
        <div {...stylex.props(styles.container)}>
          <Text as="h2" size="xlarge" weight="bold" color="text" xstyle={styles.title}>
            {options.title}
          </Text>
          <Text as="p" size="medium" color="textSecondary" xstyle={styles.description}>
            {options.description}
          </Text>
          <div {...stylex.props(styles.actions)}>
            <button onClick={handleClose} {...stylex.props(styles.button, styles.cancelButton)}>
              {options.cancelText || "Cancel"}
            </button>
            <button
              onClick={handleConfirm}
              {...stylex.props(
                styles.button,
                options.isDestructive ? styles.destructiveButton : styles.confirmButton,
              )}
            >
              {options.confirmText || "Confirm"}
            </button>
          </div>
        </div>
      </Modal>
    );
  };

  return { confirm, ConfirmationModal };
}

const styles = stylex.create({
  container: {
    padding: spacing.xl,
    display: "flex",
    flexDirection: "column",
    gap: spacing.md,
  },
  title: {
    marginBottom: spacing.xs,
  },
  description: {
    marginBottom: spacing.lg,
  },
  actions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: spacing.md,
    marginTop: spacing.md,
  },
  button: {
    padding: `${spacing.sm} ${spacing.lg}`,
    borderRadius: "4px", // Assuming standard border radius
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
    border: "none",
    transition: "background-color 0.2s, opacity 0.2s",
  },
  cancelButton: {
    backgroundColor: "transparent",
    color: colors.textSecondary,
    ":hover": {
      backgroundColor: colors.surfaceHover,
    },
  },
  confirmButton: {
    backgroundColor: colors.primary,
    color: "#000",
    ":hover": {
      opacity: 0.9,
    },
  },
  destructiveButton: {
    backgroundColor: colors.error,
    color: "#fff",
    ":hover": {
      opacity: 0.9,
    },
  },
});
