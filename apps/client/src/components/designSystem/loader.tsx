import * as stylex from "@stylexjs/stylex";

import { colors } from "./designConstants.stylex";

export function Loader() {
  return (
    <div {...stylex.props(styles.container)}>
      <div {...stylex.props(styles.bar, styles.bar1)} />
      <div {...stylex.props(styles.bar, styles.bar2)} />
      <div {...stylex.props(styles.bar, styles.bar3)} />
      <div {...stylex.props(styles.bar, styles.bar4)} />
    </div>
  );
}

const bounce = stylex.keyframes({
  "0%, 100%": { transform: "scaleY(0.4)" },
  "50%": { transform: "scaleY(1)" },
});

const styles = stylex.create({
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "4px",
    height: "40px",
  },
  bar: {
    width: "6px",
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: "3px",
    animationName: bounce,
    animationDuration: "1.2s",
    animationTimingFunction: "ease-in-out",
    animationIterationCount: "infinite",
  },
  bar1: {
    animationDelay: "-1.2s",
  },
  bar2: {
    animationDelay: "-1.1s",
  },
  bar3: {
    animationDelay: "-1.0s",
  },
  bar4: {
    animationDelay: "-0.9s",
  },
});
