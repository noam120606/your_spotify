import {
  useFloating,
  useDismiss,
  useRole,
  useInteractions,
  FloatingFocusManager,
  FloatingOverlay,
  FloatingPortal,
  useTransitionStyles,
} from "@floating-ui/react";
import * as stylex from "@stylexjs/stylex";
import React, { useId } from "react";

import { useDarkMode } from "../../hooks/useDarkMode";
import { colors, borderRadius, darkTheme, lightTheme } from "./designConstants.stylex";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  closeOnOutsideClick?: boolean;
}

export function Modal({ open, onOpenChange, children, closeOnOutsideClick = true }: ModalProps) {
  const { mode } = useDarkMode();

  const { refs, context } = useFloating({
    open,
    onOpenChange,
  });

  const dismiss = useDismiss(context, {
    enabled: closeOnOutsideClick,
  });
  const role = useRole(context);

  const { getFloatingProps } = useInteractions([dismiss, role]);

  const { isMounted, styles: transitionStyles } = useTransitionStyles(context, {
    duration: 200,
    initial: {
      opacity: 0,
      transform: "scale(0.95)",
    },
    open: {
      opacity: 1,
      transform: "scale(1)",
    },
    close: {
      opacity: 0,
      transform: "scale(0.95)",
    },
  });

  const headingId = useId();
  const descriptionId = useId();

  if (!isMounted) return null;

  return (
    <FloatingPortal>
      <FloatingOverlay
        lockScroll
        {...stylex.props(styles.overlay)}
        style={{
          opacity: transitionStyles.opacity as any,
          transition: "opacity 200ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        <FloatingFocusManager context={context}>
          <div
            {...getFloatingProps({
              ref: refs.setFloating,
              "aria-labelledby": headingId,
              "aria-describedby": descriptionId,
              className: stylex.props(styles.modal, mode === "dark" ? darkTheme : lightTheme)
                .className,
              style: {
                ...stylex.props(styles.modal, mode === "dark" ? darkTheme : lightTheme).style,
                ...transitionStyles,
                transition:
                  "opacity 200ms cubic-bezier(0.16, 1, 0.3, 1), transform 200ms cubic-bezier(0.16, 1, 0.3, 1)",
              } as any,
            })}
          >
            {children}
          </div>
        </FloatingFocusManager>
      </FloatingOverlay>
    </FloatingPortal>
  );
}

const styles = stylex.create({
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    backdropFilter: "blur(4px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "10vh",
    zIndex: 1000,
  },
  modal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    width: "100%",
    maxWidth: 600,
    maxHeight: "80vh",
    display: "flex",
    flexDirection: "column",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    overflow: "hidden",
  },
});
