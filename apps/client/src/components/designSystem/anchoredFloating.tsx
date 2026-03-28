import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useClick,
  useDismiss,
  useRole,
  useInteractions,
  useTransitionStyles,
  FloatingFocusManager,
  Placement,
} from "@floating-ui/react";
import * as stylex from "@stylexjs/stylex";
import React, { useId } from "react";

import { useDarkMode } from "../../hooks/useDarkMode";
import { darkTheme, lightTheme } from "./designConstants.stylex";

export interface AnchoredFloatingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  renderAnchor: (props: Record<string, any>) => React.ReactNode;
  children: React.ReactNode;
  placement?: Placement;
  modal?: boolean;
}

export function AnchoredFloating({
  open,
  onOpenChange,
  renderAnchor,
  children,
  placement = "bottom",
  modal = true,
}: AnchoredFloatingProps) {
  const { mode } = useDarkMode();
  const data = useFloating({
    placement,
    open,
    onOpenChange,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(10),
      flip({
        crossAxis: placement.includes("-"),
        fallbackAxisSideDirection: "end",
        padding: 5,
      }),
      shift({ padding: 5 }),
    ],
  });

  const { context } = data;

  const click = useClick(context);
  const dismiss = useDismiss(context);
  const role = useRole(context);

  const interactions = useInteractions([click, dismiss, role]);

  const transition = useTransitionStyles(context, {
    duration: 200,
    initial: {
      opacity: 0,
      marginTop: "-10px",
    },
    open: {
      opacity: 1,
      marginTop: "0px",
    },
    close: {
      opacity: 0,
      marginTop: "-10px",
    },
  });

  const labelId = useId();
  const descriptionId = useId();

  const themeProps = stylex.props(mode ? darkTheme : lightTheme);

  return (
    <>
      {renderAnchor({
        ref: data.refs.setReference,
        "data-state": open ? "open" : "closed",
        ...interactions.getReferenceProps(),
      })}
      {(context.open || transition.isMounted) && (
        <FloatingFocusManager context={context} modal={modal}>
          <div
            ref={data.refs.setFloating}
            aria-labelledby={labelId}
            aria-describedby={descriptionId}
            {...interactions.getFloatingProps({
              className: themeProps.className,
              style: {
                ...themeProps.style,
                ...context.floatingStyles,
                ...transition.styles,
              },
            })}
          >
            {children}
          </div>
        </FloatingFocusManager>
      )}
    </>
  );
}
