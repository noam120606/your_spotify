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
  useId,
  useMergeRefs,
  Placement,
} from "@floating-ui/react";
import * as stylex from "@stylexjs/stylex";
import * as React from "react";

import { useDarkMode } from "../../hooks/useDarkMode";
import { darkTheme, lightTheme } from "./designConstants.stylex";

// --- Context ---
interface PopoverOptions {
  initialOpen?: boolean;
  placement?: Placement;
  modal?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function usePopover({
  initialOpen = false,
  placement = "bottom",
  modal = true,
  open: controlledOpen,
  onOpenChange: setControlledOpen,
}: PopoverOptions = {}) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(initialOpen);
  const labelId = useId();
  const descriptionId = useId();

  const open = controlledOpen ?? uncontrolledOpen;
  const setOpen = setControlledOpen ?? setUncontrolledOpen;

  const data = useFloating({
    placement,
    open,
    onOpenChange: setOpen,
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

  const context = data.context;

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

  return {
    open,
    setOpen,
    ...interactions,
    ...data,
    modal,
    labelId,
    descriptionId,
    transition,
  };
}

type ContextType = ReturnType<typeof usePopover> | null;

const PopoverContext = React.createContext<ContextType>(null);

export const usePopoverContext = () => {
  const context = React.useContext(PopoverContext);

  if (context == null) {
    throw new Error("Popover components must be wrapped in <Popover.Root />");
  }

  return context;
};

// --- Components ---

// 1. Root
export function Root({
  children,
  modal = true,
  ...restOptions
}: {
  children: React.ReactNode;
} & PopoverOptions) {
  const popover = usePopover({ modal, ...restOptions });
  return <PopoverContext.Provider value={popover}>{children}</PopoverContext.Provider>;
}

export interface PopoverTriggerProps extends Omit<
  React.HTMLProps<HTMLElement>,
  "children" | "ref"
> {
  ref?: React.Ref<HTMLElement>;
  children?: (props: Record<string, any>) => React.ReactNode;
}

// 2. Trigger
export function Trigger({ children, ref, ...props }: PopoverTriggerProps) {
  const context = usePopoverContext();

  const mergedRef = useMergeRefs([context.refs.setReference, ref]);

  if (typeof children === "function") {
    return children(
      context.getReferenceProps({
        ...props,
        ref: mergedRef,
        "data-state": context.open ? "open" : "closed",
      } as any),
    );
  }

  return (
    <button
      ref={mergedRef}
      data-state={context.open ? "open" : "closed"}
      {...context.getReferenceProps(props)}
    >
      {children}
    </button>
  );
}

// 3. Content
export function Content({
  style,
  className,
  ref,
  ...props
}: React.HTMLProps<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> }) {
  const { context: floatingContext, ...context } = usePopoverContext();
  const mergedRef = useMergeRefs([context.refs.setFloating, ref]);
  const { mode } = useDarkMode();

  if (!floatingContext.open && !context.transition.isMounted) return null;

  const themeProps = stylex.props(mode === "dark" ? darkTheme : lightTheme);

  return (
    <FloatingFocusManager context={floatingContext} modal={context.modal}>
      <div
        ref={mergedRef}
        aria-labelledby={context.labelId}
        aria-describedby={context.descriptionId}
        {...context.getFloatingProps({
          ...props,
          className: `${themeProps.className || ""} ${className || ""}`.trim(),
          style: {
            ...themeProps.style,
            ...context.floatingStyles,
            ...context.transition.styles,
            ...style,
            zIndex: 1,
          },
        })}
      >
        {props.children}
      </div>
    </FloatingFocusManager>
  );
}

// 4. Close
export function Close({
  ref,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { ref?: React.Ref<HTMLButtonElement> }) {
  const { setOpen } = usePopoverContext();
  return (
    <button
      type="button"
      ref={ref as any}
      {...props}
      onClick={(event) => {
        props.onClick?.(event);
        setOpen(false);
      }}
    />
  );
}

export const Popover = {
  Root,
  Trigger,
  Content,
  Close,
};
