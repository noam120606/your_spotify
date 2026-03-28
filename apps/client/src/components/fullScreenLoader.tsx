import * as stylex from "@stylexjs/stylex";
import { useEffect, useState } from "react";

import { colors } from "./designSystem/designConstants.stylex";
import { Loader } from "./designSystem/loader";

interface FullScreenLoaderProps {
  isLoading: boolean;
}

export function FullScreenLoader({ isLoading }: FullScreenLoaderProps) {
  const [renderDelay, setRenderDelay] = useState(isLoading);

  useEffect(
    function () {
      if (!isLoading) {
        const timeout = setTimeout(function () {
          setRenderDelay(false);
        }, 500);
        return function () {
          clearTimeout(timeout);
        };
      } else {
        const timeout = setTimeout(function () {
          setRenderDelay(true);
        }, 0);
        return function () {
          clearTimeout(timeout);
        };
      }
    },
    [isLoading],
  );

  const shouldRender = isLoading || renderDelay;

  if (!shouldRender) {
    return null;
  }

  return (
    <div {...stylex.props(styles.overlay, !isLoading && styles.fadeOut)}>
      <Loader />
    </div>
  );
}

const styles = stylex.create({
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: colors.background,
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
    opacity: 1,
    transition: "opacity 0.5s ease-in-out",
    backdropFilter: "blur(10px)",
  },
  fadeOut: {
    opacity: 0,
    pointerEvents: "none",
  },
});
